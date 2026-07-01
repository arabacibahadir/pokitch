begin;

alter table public.accounts enable row level security;
alter table public.active_pokes enable row level security;
alter table public.collections enable row level security;
alter table public.trades enable row level security;

drop policy if exists "Public accounts are viewable by everyone." on public.accounts;
drop policy if exists "Users can insert their own profile." on public.accounts;
drop policy if exists "Users can insert their own accounts." on public.accounts;
drop policy if exists "Users can read their own account" on public.accounts;

create policy "Users can read their own account"
on public.accounts for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Public can read active pokes" on public.active_pokes;
create policy "Public can read active pokes"
on public.active_pokes for select
to anon, authenticated
using (true);

drop policy if exists "Public can read collections" on public.collections;
create policy "Public can read collections"
on public.collections for select
to anon, authenticated
using (true);

revoke all on table public.accounts from public, anon, authenticated;
revoke all on table public.active_pokes from public, anon, authenticated;
revoke all on table public.collections from public, anon, authenticated;
revoke all on table public.trades from public, anon, authenticated;

grant select on table public.accounts to authenticated;
grant select on table public.active_pokes to anon, authenticated;
grant select (
  id,
  "user",
  channel,
  poke,
  created_at,
  updated_at
) on public.collections to anon;
grant select (
  id,
  "user",
  channel,
  poke,
  owner_twitch_id,
  created_at,
  updated_at
) on public.collections to authenticated;
grant select on table public.trades to authenticated;

create index if not exists accounts_user_id_idx
  on public.accounts(user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  provider_id text := nullif(trim(new.raw_user_meta_data->>'provider_id'), '');
  channel_name text := nullif(trim(new.raw_user_meta_data->>'name'), '');
begin
  if coalesce(new.raw_app_meta_data->>'provider', '') <> 'twitch' then
    raise exception 'Only Twitch identities are supported';
  end if;

  if provider_id is null or channel_name is null then
    raise exception 'Twitch identity metadata is incomplete';
  end if;

  insert into public.accounts (user_id, twitch_id, channel)
  values (new.id, provider_id, lower(channel_name))
  on conflict (twitch_id) do update
  set
    channel = excluded.channel,
    updated_at = now()
  where public.accounts.user_id = excluded.user_id;

  if not found then
    raise exception 'Twitch identity is already linked';
  end if;

  return new;
end;
$$;

revoke execute on function public.handle_new_user()
from public, anon, authenticated;

commit;
