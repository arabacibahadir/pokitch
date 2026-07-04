import { createClient } from "@/lib/supabase/server";

import type { ActivePoke } from "./model";

const OVERLAY_EVENT_COLUMNS =
  "health,poke,updated_at,last_event_kind,last_event_player,last_event_damage,last_event_at,last_catch_poke,last_catch_player,last_catch_at";
const LEGACY_OVERLAY_COLUMNS = "health,poke,updated_at";

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
  let { data, error } = await supabase
    .from("active_pokes")
    .select(OVERLAY_EVENT_COLUMNS)
    .eq("channel", channel)
    .maybeSingle();

  // Local or stale databases can lag behind the overlay-events migration.
  // In that case, keep the overlay available without event badges.
  if (error?.code === "42703") {
    const legacyResult = await supabase
      .from("active_pokes")
      .select(LEGACY_OVERLAY_COLUMNS)
      .eq("channel", channel)
      .maybeSingle();

    data = legacyResult.data
      ? {
          ...legacyResult.data,
          last_event_kind: null,
          last_event_player: null,
          last_event_damage: null,
          last_event_at: null,
          last_catch_poke: null,
          last_catch_player: null,
          last_catch_at: null,
        }
      : null;
    error = legacyResult.error;
  }

  if (error) {
    throw error;
  }

  if (!data) return null;
  return {
    health: data.health,
    poke: data.poke,
    updatedAt: data.updated_at,
    lastEventKind: "last_event_kind" in data ? data.last_event_kind : null,
    lastEventPlayer:
      "last_event_player" in data ? data.last_event_player : null,
    lastEventDamage:
      "last_event_damage" in data ? data.last_event_damage : null,
    lastEventAt: "last_event_at" in data ? data.last_event_at : null,
    lastCatchPoke: "last_catch_poke" in data ? data.last_catch_poke : null,
    lastCatchPlayer:
      "last_catch_player" in data ? data.last_catch_player : null,
    lastCatchAt: "last_catch_at" in data ? data.last_catch_at : null,
  } satisfies ActivePoke;
}
