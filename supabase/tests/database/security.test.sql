begin;

create extension if not exists pgtap with schema extensions;

select plan(16);

select ok(
  (select relrowsecurity from pg_class where oid = 'public.accounts'::regclass),
  'accounts has RLS enabled'
);
select ok(
  (select relrowsecurity from pg_class where oid = 'public.active_pokes'::regclass),
  'active_pokes has RLS enabled'
);
select ok(
  (select relrowsecurity from pg_class where oid = 'public.collections'::regclass),
  'collections has RLS enabled'
);
select ok(
  (select relrowsecurity from pg_class where oid = 'public.trades'::regclass),
  'trades has RLS enabled'
);

select ok(
  not has_table_privilege('anon', 'public.accounts', 'select'),
  'anonymous clients cannot read accounts'
);
select ok(
  has_table_privilege('authenticated', 'public.accounts', 'select'),
  'authenticated users can query their RLS-scoped account'
);
select ok(
  has_table_privilege('anon', 'public.active_pokes', 'select'),
  'anonymous overlays can read encounters'
);
select ok(
  has_column_privilege('anon', 'public.collections', 'poke', 'select'),
  'anonymous visitors can read public collection fields'
);
select ok(
  not has_column_privilege(
    'anon',
    'public.collections',
    'owner_twitch_id',
    'select'
  ),
  'anonymous visitors cannot read immutable owner IDs'
);
select ok(
  has_column_privilege(
    'authenticated',
    'public.collections',
    'owner_twitch_id',
    'select'
  ),
  'authenticated transfer screens can read immutable owner IDs'
);
select ok(
  not has_table_privilege('authenticated', 'public.collections', 'insert'),
  'authenticated clients cannot insert catches directly'
);
select ok(
  has_table_privilege('authenticated', 'public.trades', 'select'),
  'authenticated users can read RLS-scoped trades'
);
select ok(
  not has_table_privilege('authenticated', 'public.trades', 'insert'),
  'authenticated clients cannot insert trades directly'
);
select ok(
  has_function_privilege(
    'authenticated',
    'public.gift_pokemon(uuid, text)',
    'execute'
  ) and not has_function_privilege(
    'anon',
    'public.gift_pokemon(uuid, text)',
    'execute'
  ),
  'gift RPC is authenticated-only'
);
select ok(
  has_function_privilege(
    'service_role',
    'public.process_poke_attack(text, integer, text, text, text)',
    'execute'
  ) and not has_function_privilege(
    'authenticated',
    'public.process_poke_attack(text, integer, text, text, text)',
    'execute'
  ),
  'game mutation RPC is service-role-only'
);
select ok(
  has_function_privilege(
    'anon',
    'public.get_overlay_channel(uuid)',
    'execute'
  ),
  'anonymous OBS pages can resolve one overlay channel through the narrow RPC'
);

select * from finish();
rollback;
