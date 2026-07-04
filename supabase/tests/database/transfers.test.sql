begin;

create extension if not exists pgtap with schema extensions;

select plan(9);

select has_table('public', 'trade_reservations', 'trade reservations exist');
select col_is_pk(
  'public',
  'trade_reservations',
  'collection_id',
  'each collection can have only one open reservation'
);
select col_not_null(
  'public',
  'trades',
  'sender_twitch_id',
  'trade senders use immutable IDs'
);
select col_not_null(
  'public',
  'trades',
  'recipient_twitch_id',
  'trade recipients use immutable IDs'
);
select has_function(
  'public',
  'gift_pokemon',
  array['uuid', 'text'],
  'atomic gift function exists'
);
select has_function(
  'public',
  'create_trade_offer',
  array['uuid', 'uuid'],
  'atomic trade creation function exists'
);
select has_function(
  'public',
  'resolve_trade_offer',
  array['uuid', 'text'],
  'atomic trade resolution function exists'
);
select has_function(
  'public',
  'list_collectors',
  array['text', 'text', 'integer'],
  'bounded collector lookup exists'
);
select is(
  (
    select count(*)::integer
    from pg_index
    where indrelid = 'public.trade_reservations'::regclass
      and indisunique
  ),
  2,
  'reservations enforce collection and trade-role uniqueness'
);

select * from finish();
rollback;
