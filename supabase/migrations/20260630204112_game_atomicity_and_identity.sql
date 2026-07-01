begin;

alter table public.accounts
  alter column twitch_id set not null,
  alter column channel set not null,
  alter column user_id set not null;

alter table public.collections
  add column if not exists owner_twitch_id text;

update public.collections as c
set owner_twitch_id = a.twitch_id
from public.accounts as a
where c.owner_twitch_id is null
  and lower(c."user") = lower(a.channel);

create index if not exists collections_owner_created_id_idx
  on public.collections(owner_twitch_id, created_at desc, id desc);
create index if not exists collections_user_created_id_idx
  on public.collections(lower("user"), created_at desc, id desc);
create index if not exists collections_channel_created_id_idx
  on public.collections(lower(channel), created_at desc, id desc);
create index if not exists collections_poke_created_id_idx
  on public.collections(lower(poke), created_at desc, id desc);

create table if not exists public.welcome_pack_claims (
  twitch_id text not null,
  channel text not null,
  collection_id uuid not null references public.collections(id) on delete restrict,
  claimed_at timestamptz not null default now(),
  primary key (twitch_id, channel)
);

alter table public.welcome_pack_claims enable row level security;

create or replace function public.ensure_active_poke(
  p_channel text,
  p_poke text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  normalized_channel text := lower(nullif(trim(p_channel), ''));
  normalized_poke text := lower(nullif(trim(p_poke), ''));
begin
  if normalized_channel is null or normalized_poke is null then
    raise exception 'Channel and Pokemon are required'
      using errcode = '22023';
  end if;

  insert into public.active_pokes (channel, poke)
  values (normalized_channel, normalized_poke)
  on conflict (channel) do nothing;
end;
$$;

create or replace function public.process_poke_attack(
  p_channel text,
  p_damage integer,
  p_next_poke text,
  p_twitch_id text,
  p_username text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  normalized_channel text := lower(nullif(trim(p_channel), ''));
  normalized_next_poke text := lower(nullif(trim(p_next_poke), ''));
  normalized_twitch_id text := nullif(trim(p_twitch_id), '');
  normalized_username text := lower(nullif(trim(p_username), ''));
  encounter public.active_pokes%rowtype;
  remaining_health integer;
begin
  if normalized_channel is null
    or normalized_next_poke is null
    or normalized_twitch_id is null
    or normalized_username is null
    or p_damage is null
    or p_damage < 5
    or p_damage > 14
  then
    raise exception 'Invalid attack input'
      using errcode = '22023';
  end if;

  insert into public.active_pokes (channel, poke)
  values (normalized_channel, normalized_next_poke)
  on conflict (channel) do nothing;

  select *
  into strict encounter
  from public.active_pokes
  where channel = normalized_channel
  for update;

  remaining_health := encounter.health - p_damage;

  if remaining_health > 0 then
    update public.active_pokes
    set health = remaining_health,
        updated_at = now()
    where id = encounter.id;

    return jsonb_build_object(
      'outcome', 'hit',
      'damage', p_damage,
      'health', remaining_health,
      'poke', encounter.poke
    );
  end if;

  insert into public.collections (
    "user",
    channel,
    poke,
    owner_twitch_id
  )
  values (
    normalized_username,
    normalized_channel,
    encounter.poke,
    normalized_twitch_id
  );

  update public.active_pokes
  set poke = normalized_next_poke,
      health = 50,
      updated_at = now()
  where id = encounter.id;

  return jsonb_build_object(
    'outcome', 'caught',
    'nextPoke', normalized_next_poke,
    'poke', encounter.poke
  );
end;
$$;

create or replace function public.claim_welcome_pack(
  p_channel text,
  p_poke text,
  p_twitch_id text,
  p_username text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  normalized_channel text := lower(nullif(trim(p_channel), ''));
  normalized_poke text := lower(nullif(trim(p_poke), ''));
  normalized_twitch_id text := nullif(trim(p_twitch_id), '');
  normalized_username text := lower(nullif(trim(p_username), ''));
  new_collection_id uuid;
begin
  if normalized_channel is null
    or normalized_poke is null
    or normalized_twitch_id is null
    or normalized_username is null
  then
    raise exception 'Invalid welcome pack input'
      using errcode = '22023';
  end if;

  if exists (
    select 1
    from public.welcome_pack_claims
    where twitch_id = normalized_twitch_id
      and channel = normalized_channel
  ) then
    return jsonb_build_object('granted', false);
  end if;

  insert into public.collections (
    "user",
    channel,
    poke,
    owner_twitch_id
  )
  values (
    normalized_username,
    normalized_channel,
    normalized_poke,
    normalized_twitch_id
  )
  returning id into new_collection_id;

  insert into public.welcome_pack_claims (
    twitch_id,
    channel,
    collection_id
  )
  values (
    normalized_twitch_id,
    normalized_channel,
    new_collection_id
  )
  on conflict (twitch_id, channel) do nothing;

  if not found then
    delete from public.collections where id = new_collection_id;
    return jsonb_build_object('granted', false);
  end if;

  return jsonb_build_object(
    'granted', true,
    'poke', normalized_poke
  );
end;
$$;

revoke all on function public.ensure_active_poke(text, text)
  from public, anon, authenticated;
revoke all on function public.process_poke_attack(text, integer, text, text, text)
  from public, anon, authenticated;
revoke all on function public.claim_welcome_pack(text, text, text, text)
  from public, anon, authenticated;

grant execute on function public.ensure_active_poke(text, text)
  to service_role;
grant execute on function public.process_poke_attack(text, integer, text, text, text)
  to service_role;
grant execute on function public.claim_welcome_pack(text, text, text, text)
  to service_role;

commit;
