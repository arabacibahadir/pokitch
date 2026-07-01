begin;

create index if not exists trades_recipientpokeid_idx
  on public.trades(recipientpokeid);

create index if not exists welcome_pack_claims_collection_id_idx
  on public.welcome_pack_claims(collection_id);

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'private.accounts_pre_security_20260630'::regclass
      and contype = 'p'
  ) then
    alter table private.accounts_pre_security_20260630
      add primary key (id);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'private.collections_pre_security_20260630'::regclass
      and contype = 'p'
  ) then
    alter table private.collections_pre_security_20260630
      add primary key (id);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'private.trades_pre_security_20260630'::regclass
      and contype = 'p'
  ) then
    alter table private.trades_pre_security_20260630
      add primary key (id);
  end if;
end;
$$;

commit;
