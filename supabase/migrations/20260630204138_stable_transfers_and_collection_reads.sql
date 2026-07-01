begin;

create index if not exists collections_created_id_idx
  on public.collections(created_at desc, id desc);
create index if not exists collections_user_created_id_idx
  on public.collections("user", created_at desc, id desc);
create index if not exists collections_channel_created_id_idx
  on public.collections(channel, created_at desc, id desc);
create index if not exists collections_poke_created_id_idx
  on public.collections(poke, created_at desc, id desc);

alter table public.trades
  add column if not exists sender_twitch_id text,
  add column if not exists recipient_twitch_id text;

update public.trades as t
set
  sender_twitch_id = offered.owner_twitch_id,
  recipient_twitch_id = requested.owner_twitch_id
from public.collections as offered,
     public.collections as requested
where offered.id = t.pokeid
  and requested.id = t.recipientpokeid;

with expanded as (
  select id as trade_id, pokeid as collection_id
  from public.trades
  union all
  select id, recipientpokeid
  from public.trades
), conflicted as (
  select collection_id
  from expanded
  group by collection_id
  having count(*) > 1
), rejected as (
  delete from public.trades as t
  where t.sender_twitch_id is null
    or t.recipient_twitch_id is null
    or t.sender_twitch_id = t.recipient_twitch_id
    or t.pokeid = t.recipientpokeid
    or t.pokeid in (select collection_id from conflicted)
    or t.recipientpokeid in (select collection_id from conflicted)
  returning t.*
)
insert into private.migration_rejects (
  source_table,
  source_id,
  reason,
  payload
)
select
  'public.trades',
  rejected.id::text,
  'Trade cannot be mapped to unique immutable owners and reservations',
  to_jsonb(rejected)
from rejected;

alter table public.trades
  alter column sender_twitch_id set not null,
  alter column recipient_twitch_id set not null;

create table if not exists public.trade_reservations (
  collection_id uuid primary key references public.collections(id) on delete cascade,
  trade_id uuid not null references public.trades(id) on delete cascade,
  reservation_role text not null check (reservation_role in ('offered', 'requested')),
  created_at timestamptz not null default now(),
  unique (trade_id, reservation_role)
);

insert into public.trade_reservations (
  collection_id,
  trade_id,
  reservation_role
)
select pokeid, id, 'offered'
from public.trades
union all
select recipientpokeid, id, 'requested'
from public.trades;

alter table public.trade_reservations enable row level security;

drop policy if exists "Trade participants can read offers" on public.trades;
create policy "Trade participants can read offers"
on public.trades for select
to authenticated
using (
  sender_twitch_id = (
    select a.twitch_id
    from public.accounts as a
    where a.user_id = (select auth.uid())
  )
  or recipient_twitch_id = (
    select a.twitch_id
    from public.accounts as a
    where a.user_id = (select auth.uid())
  )
);

create or replace function public.list_collectors(
  p_exclude_twitch_id text,
  p_query text default '',
  p_limit integer default 100
)
returns table (twitch_id text, username text)
language sql
stable
security definer
set search_path = ''
as $$
  select recent.owner_twitch_id, recent."user"
  from (
    select distinct on (c.owner_twitch_id)
      c.owner_twitch_id,
      c."user",
      c.created_at
    from public.collections as c
    where c.owner_twitch_id is not null
      and c.owner_twitch_id <> nullif(trim(p_exclude_twitch_id), '')
      and (
        nullif(trim(p_query), '') is null
        or c."user" like lower(trim(p_query)) || '%'
      )
    order by c.owner_twitch_id, c.created_at desc
  ) as recent
  order by recent.created_at desc
  limit least(greatest(coalesce(p_limit, 100), 1), 100);
$$;

drop function if exists public.gift_pokemon(uuid, text);
create function public.gift_pokemon(
  p_collection_id uuid,
  p_recipient_twitch_id text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_twitch_id text;
  recipient_twitch_id text := nullif(trim(p_recipient_twitch_id), '');
  recipient_username text;
  owned_row public.collections%rowtype;
begin
  select twitch_id
  into actor_twitch_id
  from public.accounts
  where user_id = auth.uid();

  if actor_twitch_id is null then
    raise exception 'Authentication required';
  end if;

  if recipient_twitch_id is null or recipient_twitch_id = actor_twitch_id then
    raise exception 'Invalid gift recipient';
  end if;

  select c."user"
  into recipient_username
  from public.collections as c
  where c.owner_twitch_id = recipient_twitch_id
  order by c.created_at desc
  limit 1;

  if recipient_username is null then
    raise exception 'Gift recipient was not found';
  end if;

  select *
  into owned_row
  from public.collections
  where id = p_collection_id
    and owner_twitch_id = actor_twitch_id
  for update;

  if not found then
    raise exception 'Pokemon is not owned by the current user';
  end if;

  if exists (
    select 1
    from public.trade_reservations
    where collection_id = p_collection_id
  ) then
    raise exception 'Pokemon is reserved in an open trade';
  end if;

  update public.collections
  set
    owner_twitch_id = recipient_twitch_id,
    "user" = recipient_username,
    updated_at = now()
  where id = p_collection_id;
end;
$$;

create or replace function public.create_trade_offer(
  p_offered_collection_id uuid,
  p_requested_collection_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_twitch_id text;
  actor_username text;
  offered public.collections%rowtype;
  requested public.collections%rowtype;
  new_trade_id uuid;
begin
  if p_offered_collection_id = p_requested_collection_id then
    raise exception 'A Pokemon cannot be traded for itself';
  end if;

  select twitch_id, channel
  into actor_twitch_id, actor_username
  from public.accounts
  where user_id = auth.uid();

  if actor_twitch_id is null then
    raise exception 'Authentication required';
  end if;

  perform 1
  from public.collections
  where id in (p_offered_collection_id, p_requested_collection_id)
  order by id
  for update;

  select *
  into offered
  from public.collections
  where id = p_offered_collection_id
    and owner_twitch_id = actor_twitch_id;

  if not found then
    raise exception 'Offered Pokemon is not owned by the current user';
  end if;

  select *
  into requested
  from public.collections
  where id = p_requested_collection_id
    and owner_twitch_id is not null
    and owner_twitch_id <> actor_twitch_id;

  if not found then
    raise exception 'Requested Pokemon is unavailable';
  end if;

  insert into public.trades (
    "user",
    poke,
    pokeid,
    recipient,
    recipientpoke,
    recipientpokeid,
    sender_twitch_id,
    recipient_twitch_id
  )
  values (
    actor_username,
    offered.poke,
    offered.id,
    requested."user",
    requested.poke,
    requested.id,
    actor_twitch_id,
    requested.owner_twitch_id
  )
  returning id into new_trade_id;

  begin
    insert into public.trade_reservations (
      collection_id,
      trade_id,
      reservation_role
    )
    values
      (offered.id, new_trade_id, 'offered'),
      (requested.id, new_trade_id, 'requested');
  exception
    when unique_violation then
      raise exception 'One of the Pokemon is reserved in another trade';
  end;

  return new_trade_id;
end;
$$;

create or replace function public.resolve_trade_offer(
  p_trade_id uuid,
  p_decision text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_twitch_id text;
  trade_row public.trades%rowtype;
  offered public.collections%rowtype;
  requested public.collections%rowtype;
begin
  select twitch_id
  into actor_twitch_id
  from public.accounts
  where user_id = auth.uid();

  if actor_twitch_id is null then
    raise exception 'Authentication required';
  end if;

  select *
  into trade_row
  from public.trades
  where id = p_trade_id
  for update;

  if not found then
    raise exception 'Trade offer not found';
  end if;

  if p_decision = 'cancel' then
    if trade_row.sender_twitch_id <> actor_twitch_id then
      raise exception 'Only the sender can cancel this offer';
    end if;
    delete from public.trades where id = p_trade_id;
    return;
  end if;

  if trade_row.recipient_twitch_id <> actor_twitch_id then
    raise exception 'Only the recipient can resolve this offer';
  end if;

  if p_decision = 'deny' then
    delete from public.trades where id = p_trade_id;
    return;
  end if;

  if p_decision <> 'accept' then
    raise exception 'Invalid trade decision';
  end if;

  perform 1
  from public.collections
  where id in (trade_row.pokeid, trade_row.recipientpokeid)
  order by id
  for update;

  select *
  into offered
  from public.collections
  where id = trade_row.pokeid
    and owner_twitch_id = trade_row.sender_twitch_id;

  select *
  into requested
  from public.collections
  where id = trade_row.recipientpokeid
    and owner_twitch_id = trade_row.recipient_twitch_id;

  if offered.id is null or requested.id is null then
    raise exception 'One of the Pokemon is no longer available';
  end if;

  update public.collections
  set
    owner_twitch_id = trade_row.recipient_twitch_id,
    "user" = trade_row.recipient,
    updated_at = now()
  where id = offered.id;

  update public.collections
  set
    owner_twitch_id = trade_row.sender_twitch_id,
    "user" = trade_row."user",
    updated_at = now()
  where id = requested.id;

  delete from public.trades where id = p_trade_id;
end;
$$;

revoke all on function public.list_collectors(text, text, integer)
  from public, anon;
revoke all on function public.gift_pokemon(uuid, text)
  from public, anon;
revoke all on function public.create_trade_offer(uuid, uuid)
  from public, anon;
revoke all on function public.resolve_trade_offer(uuid, text)
  from public, anon;

grant execute on function public.list_collectors(text, text, integer)
  to authenticated;
grant execute on function public.gift_pokemon(uuid, text)
  to authenticated;
grant execute on function public.create_trade_offer(uuid, uuid)
  to authenticated;
grant execute on function public.resolve_trade_offer(uuid, text)
  to authenticated;

commit;
