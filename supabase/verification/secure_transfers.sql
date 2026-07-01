-- Read-only post-migration checks. Review every result before deployment.

select relname, relrowsecurity
from pg_class
where relnamespace = 'public'::regnamespace
  and relname in (
    'accounts',
    'active_pokes',
    'collections',
    'trade_reservations',
    'trades',
    'welcome_pack_claims'
  )
order by relname;

select tablename, policyname, roles, cmd
from pg_policies
where schemaname = 'public'
order by tablename, policyname;

select table_name, grantee, privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and grantee in ('anon', 'authenticated')
order by table_name, grantee, privilege_type;

select routine_name, grantee, privilege_type
from information_schema.routine_privileges
where specific_schema = 'public'
  and routine_name in (
    'claim_welcome_pack',
    'create_trade_offer',
    'ensure_active_poke',
    'gift_pokemon',
    'get_overlay_channel',
    'list_collectors',
    'process_poke_attack',
    'resolve_trade_offer'
  )
order by routine_name, grantee;

select
  count(*) filter (where owner_twitch_id is null) as locked_legacy_rows,
  count(*) filter (where owner_twitch_id is not null) as transferable_rows
from public.collections;

select
  count(*) as open_trades,
  (select count(*) from public.trade_reservations) as reservations,
  count(*) * 2 as expected_reservations
from public.trades;

select source_table, reason, count(*) as rejected_rows
from private.migration_rejects
group by source_table, reason
order by source_table, reason;

select indexname
from pg_indexes
where schemaname = 'public'
  and indexname in (
    'accounts_user_id_key',
    'collections_created_id_idx',
    'collections_user_created_id_idx',
    'collections_channel_created_id_idx',
    'collections_poke_created_id_idx',
    'collections_owner_created_id_idx'
  )
order by indexname;
