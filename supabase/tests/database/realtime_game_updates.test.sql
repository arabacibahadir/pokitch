begin;

create extension if not exists pgtap with schema extensions;

select plan(8);

select has_function(
  'private',
  'broadcast_active_poke_snapshot',
  array[]::text[],
  'the overlay broadcast trigger function exists outside the exposed schema'
);
select has_trigger(
  'public',
  'active_pokes',
  'broadcast_active_poke_snapshot',
  'active encounter writes emit overlay snapshots'
);
select ok(
  not has_function_privilege(
    'anon',
    'private.broadcast_active_poke_snapshot()',
    'execute'
  ),
  'anonymous clients cannot execute the trigger function'
);
select ok(
  exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'accounts'
  ),
  'account changes are available to the server-side channel watcher'
);
select ok(
  not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'active_pokes'
  ),
  'active encounters are not exposed through Postgres Changes'
);

delete from realtime.messages where topic = 'overlay:streamer';
delete from public.active_pokes where channel = 'streamer';

set local role service_role;
select public.ensure_active_poke('streamer', 'pikachu');
reset role;

select is(
  (
    select count(*)::integer
    from realtime.messages
    where topic = 'overlay:streamer'
      and event = 'snapshot'
      and private is false
  ),
  1,
  'one encounter write creates one public overlay snapshot'
);
select is(
  (
    select payload ->> 'health'
    from realtime.messages
    where topic = 'overlay:streamer'
      and event = 'snapshot'
    order by inserted_at desc
    limit 1
  ),
  '50',
  'the snapshot contains the persisted encounter health'
);
select ok(
  (
    select payload ? 'health'
      and payload ? 'poke'
      and not payload ? 'accountId'
      and not payload ? 'twitchId'
    from realtime.messages
    where topic = 'overlay:streamer'
      and event = 'snapshot'
    order by inserted_at desc
    limit 1
  ),
  'the public snapshot contains game state without private identities'
);

select * from finish();
rollback;
