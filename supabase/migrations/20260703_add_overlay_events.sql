begin;

-- Surface combat events on the overlay without chat spam. Each attack writes
-- the latest event (who attacked, how much damage, the outcome) onto the
-- active encounter so the polling snapshot can render it. The last catch is
-- kept separately so the overlay can keep showing the most recent capture even
-- after a new encounter spawns.
alter table public.active_pokes
  add column if not exists last_event_kind text,
  add column if not exists last_event_player text,
  add column if not exists last_event_damage smallint,
  add column if not exists last_event_at timestamptz,
  add column if not exists last_catch_poke text,
  add column if not exists last_catch_player text,
  add column if not exists last_catch_at timestamptz;

-- A fresh encounter starts with no pending event; the last catch persists.
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
        updated_at = now(),
        last_event_kind = 'hit',
        last_event_player = normalized_username,
        last_event_damage = p_damage,
        last_event_at = now()
    where id = encounter.id;

    return jsonb_build_object(
      'outcome', 'hit',
      'damage', p_damage,
      'health', remaining_health,
      'poke', encounter.poke,
      'lastEventKind', 'hit',
      'lastEventPlayer', normalized_username,
      'lastEventDamage', p_damage,
      'lastEventAt', to_char(clock_timestamp() at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"')
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
      updated_at = now(),
      last_event_kind = 'caught',
      last_event_player = normalized_username,
      last_event_damage = null,
      last_event_at = now(),
      last_catch_poke = encounter.poke,
      last_catch_player = normalized_username,
      last_catch_at = now()
  where id = encounter.id;

  return jsonb_build_object(
    'outcome', 'caught',
    'nextPoke', normalized_next_poke,
    'poke', encounter.poke,
    'lastEventKind', 'caught',
    'lastEventPlayer', normalized_username,
    'lastEventAt', to_char(clock_timestamp() at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"'),
    'lastCatchPoke', encounter.poke,
    'lastCatchPlayer', normalized_username
  );
end;
$$;

revoke all on function public.ensure_active_poke(text, text)
  from public, anon, authenticated;
revoke all on function public.process_poke_attack(text, integer, text, text, text)
  from public, anon, authenticated;

grant execute on function public.ensure_active_poke(text, text)
  to service_role;
grant execute on function public.process_poke_attack(text, integer, text, text, text)
  to service_role;

commit;
