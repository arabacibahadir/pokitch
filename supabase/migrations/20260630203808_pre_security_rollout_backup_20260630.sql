begin;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists private.accounts_pre_security_20260630
as table public.accounts with data;

create table if not exists private.collections_pre_security_20260630
as table public.collections with data;

create table if not exists private.trades_pre_security_20260630
as table public.trades with data;

revoke all on table private.accounts_pre_security_20260630
from public, anon, authenticated;
revoke all on table private.collections_pre_security_20260630
from public, anon, authenticated;
revoke all on table private.trades_pre_security_20260630
from public, anon, authenticated;

commit;
