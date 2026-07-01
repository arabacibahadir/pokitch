import { createClient } from "@/lib/supabase/server";

import type { ActivePoke } from "./model";

export async function getOverlayChannel(accountId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_overlay_channel", {
    p_account_id: accountId,
  });

  if (!error) {
    return data;
  }

  // Expand/deploy compatibility: remove this fallback after the RPC migration
  // is confirmed in every environment.
  if (error.code !== "PGRST202") {
    throw error;
  }

  const { data: legacyAccount, error: legacyError } = await supabase
    .from("accounts")
    .select("channel")
    .eq("id", accountId)
    .maybeSingle();

  if (legacyError) {
    throw legacyError;
  }

  return legacyAccount?.channel ?? null;
}

export async function getActivePoke(channel: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("active_pokes")
    .select("health,poke,updated_at")
    .eq("channel", channel)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) return null;
  return {
    health: data.health,
    poke: data.poke,
    updatedAt: data.updated_at,
  } satisfies ActivePoke;
}
