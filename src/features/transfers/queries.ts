import { getCurrentAccount, type Account } from "@/features/auth/queries";
import { createClient } from "@/lib/supabase/server";

import type { CollectionOption, CollectorOption, TradeRow } from "./types";

export async function getTransferContext(account: Account) {
  const supabase = await createClient();
  const [
    { data: owned, error: ownedError },
    { data: collectorRows, error: collectorsError },
  ] = await Promise.all([
    supabase
      .from("collections")
      .select("id,poke,user,channel")
      .eq("owner_twitch_id", account.twitch_id)
      .order("poke"),
    supabase.rpc("list_collectors", {
      p_exclude_twitch_id: account.twitch_id,
      p_limit: 100,
      p_query: "",
    }),
  ]);

  if (ownedError) {
    throw ownedError;
  }
  if (collectorsError) {
    throw collectorsError;
  }

  const collectors = (collectorRows ?? []).map(
    (row: { twitch_id: string; username: string }) => ({
      twitchId: row.twitch_id,
      username: row.username,
    }),
  ) as CollectorOption[];

  return {
    account,
    owned: (owned ?? []) as CollectionOption[],
    collectors,
  };
}

export async function getTradeContext(account: Account) {
  const base = await getTransferContext(account);
  const supabase = await createClient();
  const [
    { data: sent, error: sentError },
    { data: received, error: receivedError },
  ] = await Promise.all([
    supabase
      .from("trades")
      .select("*")
      .eq("sender_twitch_id", base.account.twitch_id)
      .order("created_at", { ascending: false }),
    supabase
      .from("trades")
      .select("*")
      .eq("recipient_twitch_id", base.account.twitch_id)
      .order("created_at", { ascending: false }),
  ]);

  if (sentError) {
    throw sentError;
  }
  if (receivedError) {
    throw receivedError;
  }

  return {
    ...base,
    sent: (sent ?? []) as TradeRow[],
    received: (received ?? []) as TradeRow[],
  };
}

export async function getCollectorPokemon(collectorTwitchId: string) {
  const account = await getCurrentAccount();
  if (!account) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("collections")
    .select("id,poke,user,channel")
    .eq("owner_twitch_id", collectorTwitchId)
    .neq("owner_twitch_id", account.twitch_id)
    .order("poke")
    .limit(500);

  if (error) {
    throw error;
  }

  return (data ?? []) as CollectionOption[];
}
