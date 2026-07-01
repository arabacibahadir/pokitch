begin;

create extension if not exists pgtap with schema extensions;

select plan(10);

select has_table('public', 'encounter_events', 'encounter_events exists');
select columns_are(
  'public',
  'encounter_events',
  array[
    'id', 'channel', 'poke', 'event_type', 'username', 'damage', 'health',
    'critical', 'combo', 'max_combo', 'participants', 'created_at'
  ],
  'encounter event columns are stable'
);
select ok(
  (select relrowsecurity from pg_class where oid = 'public.encounter_events'::regclass),
  'encounter_events has RLS enabled'
);
select ok(
  has_table_privilege('anon', 'public.encounter_events', 'select'),
  'anonymous overlays can read encounter events'
);
select ok(
  not has_table_privilege('anon', 'public.encounter_events', 'insert'),
  'anonymous clients cannot create encounter events'
);
select ok(
  has_table_privilege('service_role', 'public.encounter_events', 'insert'),
  'the worker can create encounter events'
);
select ok(
  exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'encounter_events'
      and cmd = 'SELECT'
      and roles @> array['anon']::name[]
  ),
  'anonymous reads are protected by an explicit policy'
);
select ok(
  exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'encounter_events'
  ),
  'encounter events are published to Realtime'
);
select has_index(
  'public',
  'encounter_events',
  'encounter_events_channel_created_idx',
  'channel event lookups are indexed'
);
select has_index(
  'public',
  'encounter_events',
  'encounter_events_created_at_idx',
  'retention cleanup is indexed'
);

select * from finish();
rollback;
