do $$
begin
  if exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'active_pokes'
  ) then
    alter publication supabase_realtime drop table public.active_pokes;
  end if;
end
$$;
