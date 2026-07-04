begin;

alter table public.accounts enable row level security;
alter table public.active_pokes enable row level security;
alter table public.collections enable row level security;
alter table public.trades enable row level security;
alter table public.welcome_pack_claims enable row level security;
alter table public.trade_reservations enable row level security;

drop policy if exists "Public accounts are viewable by everyone." on public.accounts;
drop policy if exists "Users can insert their own profile." on public.accounts;
drop policy if exists "Users can insert their own accounts." on public.accounts;
drop policy if exists "Users can insert their own account" on public.accounts;
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
revoke all on table public.welcome_pack_claims from public, anon, authenticated;
revoke all on table public.trade_reservations from public, anon, authenticated;

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
grant select on table public.collections to authenticated;
grant select on table public.trades to authenticated;

create or replace function public.get_overlay_channel(p_account_id uuid)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select channel
  from public.accounts
  where id = p_account_id;
$$;

revoke all on function public.get_overlay_channel(uuid)
  from public;
grant execute on function public.get_overlay_channel(uuid)
  to anon, authenticated;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'active_pokes'
  ) then
    alter publication supabase_realtime add table public.active_pokes;
  end if;
end;
$$;

revoke execute on function public.handle_new_user()
  from public, anon, authenticated;

commit;
