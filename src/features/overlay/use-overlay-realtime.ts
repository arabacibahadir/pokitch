"use client";

import { useEffect, useState } from "react";

import { createPublicClient } from "@/lib/supabase/public";

import {
  applyOverlaySnapshot,
  type ActivePoke,
  type OverlayEvent,
  type OverlayCatch,
  type OverlaySnapshot,
  type OverlayState,
} from "./model";
import {
  type OverlayConnection,
  startOverlayRealtime,
} from "./realtime";

const EMPTY_EVENT: OverlayEvent = {
  kind: null,
  player: null,
  damage: null,
  at: null,
};
const EMPTY_CATCH: OverlayCatch = {
  poke: null,
  player: null,
  at: null,
};

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
    event: EMPTY_EVENT,
    catch: EMPTY_CATCH,
  });
  const [connection, setConnection] =
    useState<OverlayConnection>("connecting");

  useEffect(
    () =>
      startOverlayRealtime({
        subscribe({ onBroadcast, onStatus }) {
          const supabase = createPublicClient();
          const realtimeChannel = supabase
            .channel(`overlay:${channel}`)
            .on(
              "broadcast",
              { event: "snapshot" },
              ({ payload }) => onBroadcast(payload as OverlaySnapshot),
            )
            .subscribe(onStatus);

          return () => {
            void supabase.removeChannel(realtimeChannel);
          };
        },
        async fetchSnapshot(signal) {
          const response = await fetch(`/api/overlays/${overlayId}/snapshot`, {
            cache: "no-store",
            signal,
          });
          if (!response.ok) throw new Error(`Snapshot request failed: ${response.status}`);
          return (await response.json()) as OverlaySnapshot;
        },
        onConnection: setConnection,
        onSnapshot(snapshot) {
          setState((current) => applyOverlaySnapshot(current, snapshot));
        },
      }),
    [channel, overlayId],
  );

  return { connection, poke: state.poke, event: state.event, catch: state.catch };
}
