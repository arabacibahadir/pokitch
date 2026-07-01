begin;

create table public.encounter_events (
  id uuid primary key default gen_random_uuid(),
  channel text not null check (channel = lower(trim(channel)) and channel <> ''),
  poke text not null check (poke = lower(trim(poke)) and poke <> ''),
  event_type text not null check (event_type in ('hit', 'caught')),
  username text not null check (username = lower(trim(username)) and username <> ''),
  damage integer not null check (damage between 5 and 14),
  health integer not null check (health between 0 and 50),
  critical boolean not null default false,
  combo integer not null check (combo > 0),
  max_combo integer not null check (max_combo >= combo),
  participants integer not null check (participants > 0),
  created_at timestamptz not null default now()
);

create index encounter_events_channel_created_idx
  on public.encounter_events(channel, created_at desc);
create index encounter_events_created_at_idx
  on public.encounter_events(created_at);

alter table public.encounter_events enable row level security;

create policy "Encounter events are publicly readable"
  on public.encounter_events
  for select
  to anon, authenticated
  using (true);

revoke all on table public.encounter_events from public, anon, authenticated;
grant select on table public.encounter_events to anon, authenticated;
grant select, insert, delete on table public.encounter_events to service_role;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'encounter_events'
  ) then
    alter publication supabase_realtime add table public.encounter_events;
  end if;
end;
$$;

commit;
