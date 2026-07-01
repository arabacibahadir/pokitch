begin;

drop index if exists public.accounts_user_id_idx;
drop index if exists public.collections_user_poke_idx;
drop index if exists public.collections_channel_created_at_idx;
drop index if exists public.collections_poke_created_at_idx;
drop index if exists public.trades_recipient_created_at_idx;

create index if not exists trades_sender_twitch_created_idx
  on public.trades(sender_twitch_id, created_at desc);

create index if not exists trades_recipient_twitch_created_idx
  on public.trades(recipient_twitch_id, created_at desc);

commit;
