begin;

create or replace function private.broadcast_active_poke_snapshot()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform realtime.send(
    jsonb_build_object(
      'health', new.health,
      'poke', new.poke,
      'updatedAt', new.updated_at,
      'lastEventKind', new.last_event_kind,
      'lastEventPlayer', new.last_event_player,
      'lastEventDamage', new.last_event_damage,
      'lastEventAt', new.last_event_at,
      'lastCatchPoke', new.last_catch_poke,
      'lastCatchPlayer', new.last_catch_player,
      'lastCatchAt', new.last_catch_at
    ),
    'snapshot',
    'overlay:' || new.channel,
    false
  );

  return null;
end;
$$;

revoke all on function private.broadcast_active_poke_snapshot()
  from public, anon, authenticated;

drop trigger if exists broadcast_active_poke_snapshot
  on public.active_pokes;

create trigger broadcast_active_poke_snapshot
after insert or update of
  health,
  poke,
  updated_at,
  last_event_kind,
  last_event_player,
  last_event_damage,
  last_event_at,
  last_catch_poke,
  last_catch_player,
  last_catch_at
on public.active_pokes
for each row
execute function private.broadcast_active_poke_snapshot();

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'accounts'
  ) then
    alter publication supabase_realtime add table public.accounts;
  end if;
end
$$;

commit;
