"use client";

import { RealtimeClient } from "@supabase/realtime-js";
import { useEffect, useMemo, useState } from "react";

import { getSupabasePublicEnv } from "@/lib/supabase/env";

import {
  applyOverlaySnapshot,
  applyEncounterEventChange,
  applyRealtimeChange,
  type ActivePoke,
  type EncounterEvent,
  type OverlaySnapshot,
  type OverlayState,
  type RealtimePokeChange,
  type RealtimeEncounterEventChange,
} from "./model";

export type OverlayConnection =
  | "connecting"
  | "connected"
  | "reconnecting"
  | "failed";

export function useOverlayRealtime({
  channel,
  initialPoke,
  overlayId,
}: {
  channel: string;
  initialPoke: ActivePoke | null;
  overlayId: string;
}) {
  const [state, setState] = useState<OverlayState>({
    poke: initialPoke,
    updatedAt: initialPoke?.updatedAt ?? null,
  });
  const [connection, setConnection] = useState<OverlayConnection>("connecting");
  const [event, setEvent] = useState<EncounterEvent | null>(null);
  const realtime = useMemo(() => {
    const { url, publishableKey } = getSupabasePublicEnv();
    const endpoint = `${url.replace(/^http/, "ws").replace(/\/$/, "")}/realtime/v1`;
    return new RealtimeClient(endpoint, { params: { apikey: publishableKey } });
  }, []);

  useEffect(() => {
    let active = true;
    let connectedOnce = false;

    async function resync() {
      try {
        const response = await fetch(`/api/overlays/${overlayId}/snapshot`, {
          cache: "no-store",
        });
        if (!response.ok || !active) return;
        const snapshot = (await response.json()) as OverlaySnapshot;
        if (active)
          setState((current) => applyOverlaySnapshot(current, snapshot));
      } catch {
        // Realtime remains the primary transport; keep the last valid frame.
      }
    }

    const subscription = realtime
      .channel(`active-pokes-${channel}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "active_pokes",
          filter: `channel=eq.${channel}`,
        },
        (payload) => {
          setState((current) =>
            applyRealtimeChange(
              current,
              payload as unknown as RealtimePokeChange,
            ),
          );
        },
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "encounter_events",
          filter: `channel=eq.${channel}`,
        },
        (payload) => {
          setEvent((current) =>
            applyEncounterEventChange(
              current,
              payload as unknown as RealtimeEncounterEventChange,
            ),
          );
        },
      )
      .subscribe((status) => {
        if (!active) return;
        if (status === "SUBSCRIBED") {
          setConnection("connected");
          connectedOnce = true;
          void resync();
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          setConnection(connectedOnce ? "reconnecting" : "failed");
        } else if (status === "CLOSED" && connectedOnce) {
          setConnection("reconnecting");
        }
      });

    return () => {
      active = false;
      void realtime
        .removeChannel(subscription)
        .finally(() => realtime.disconnect());
    };
  }, [channel, overlayId, realtime]);

  useEffect(() => {
    if (!event) return;
    const timeout = window.setTimeout(() => setEvent(null), 2_000);
    return () => window.clearTimeout(timeout);
  }, [event]);

  return { connection, event, poke: state.poke };
}
