begin;

create extension if not exists pgtap with schema extensions;

select plan(14);

select has_function(
  'public',
  'ensure_active_poke',
  array['text', 'text'],
  'ensure_active_poke exists'
);
select has_function(
  'public',
  'process_poke_attack',
  array['text', 'integer', 'text', 'text', 'text'],
  'process_poke_attack exists'
);
select has_function(
  'public',
  'claim_welcome_pack',
  array['text', 'text', 'text', 'text'],
  'claim_welcome_pack exists'
);

select ok(
  has_function_privilege(
    'service_role',
    'public.process_poke_attack(text, integer, text, text, text)',
    'execute'
  ),
  'service_role can run game transactions'
);
select ok(
  not has_function_privilege(
    'anon',
    'public.process_poke_attack(text, integer, text, text, text)',
    'execute'
  ),
  'anonymous clients cannot run game transactions'
);

truncate table public.welcome_pack_claims, public.trades, public.collections,
  public.active_pokes restart identity cascade;

set local role service_role;

select public.ensure_active_poke('#Streamer', 'Pikachu');
select public.ensure_active_poke('#STREAMER', 'Eevee');

select is(
  (select count(*)::integer from public.active_pokes),
  1,
  'encounter initialization is idempotent'
);
select is(
  (select poke from public.active_pokes where channel = '#streamer'),
  'pikachu',
  'initial encounter is not replaced'
);

select is(
  public.process_poke_attack(
    '#streamer', 5, 'eevee', 'twitch-1', 'Viewer'
  ) ->> 'outcome',
  'hit',
  'nonlethal attacks report a hit'
);
select is(
  (select health::integer from public.active_pokes where channel = '#streamer'),
  45,
  'nonlethal damage is persisted once'
);

select public.process_poke_attack(
  '#streamer', 14, 'eevee', 'twitch-1', 'Viewer'
);
select public.process_poke_attack(
  '#streamer', 14, 'eevee', 'twitch-1', 'Viewer'
);
select public.process_poke_attack(
  '#streamer', 14, 'eevee', 'twitch-1', 'Viewer'
);

select is(
  public.process_poke_attack(
    '#streamer', 14, 'eevee', 'twitch-1', 'Viewer'
  ) ->> 'outcome',
  'caught',
  'lethal attacks report a catch'
);
select is(
  (
    select owner_twitch_id
    from public.collections
    where poke = 'pikachu'
  ),
  'twitch-1',
  'caught Pokemon use immutable Twitch ownership'
);
select is(
  (select health::integer from public.active_pokes where channel = '#streamer'),
  50,
  'a caught encounter resets atomically'
);

select is(
  public.claim_welcome_pack(
    '#streamer', 'bulbasaur', 'twitch-2', 'OtherViewer'
  ) ->> 'granted',
  'true',
  'the first welcome pack claim succeeds'
);
select is(
  public.claim_welcome_pack(
    '#streamer', 'charmander', 'twitch-2', 'RenamedViewer'
  ) ->> 'granted',
  'false',
  'duplicate welcome pack claims are rejected by Twitch ID'
);

reset role;

select * from finish();
rollback;
