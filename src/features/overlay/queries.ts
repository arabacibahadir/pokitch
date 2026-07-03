import { createClient } from "@/lib/supabase/server";

import type { ActivePoke } from "./model";

export async function getOverlayChannel(accountId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_overlay_channel", {
    p_account_id: accountId,
  });

  if (error) {
    throw error;
  }

  return data ?? null;
}

export async function getActivePoke(channel: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("active_pokes")
    .select(
      "health,poke,updated_at,last_event_kind,last_event_player,last_event_damage,last_event_at,last_catch_poke,last_catch_player,last_catch_at",
    )
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
    lastEventKind: data.last_event_kind,
    lastEventPlayer: data.last_event_player,
    lastEventDamage: data.last_event_damage,
    lastEventAt: data.last_event_at,
    lastCatchPoke: data.last_catch_poke,
    lastCatchPlayer: data.last_catch_player,
    lastCatchAt: data.last_catch_at,
  } satisfies ActivePoke;
}
