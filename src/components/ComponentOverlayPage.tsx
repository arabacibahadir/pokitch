"use client";

import { OverlayView } from "@/features/overlay/OverlayView";
import type { ActivePoke, OverlaySize } from "@/features/overlay/model";
import { useOverlayRealtime } from "@/features/overlay/use-overlay-realtime";

export default function ComponentOverlayPage({
  channel,
  debug,
  initialPoke,
  overlayId,
  size,
}: {
  channel: string;
  debug: boolean;
  initialPoke: ActivePoke | null;
  overlayId: string;
  size: OverlaySize;
}) {
  const { connection, event, poke } = useOverlayRealtime({
    channel,
    initialPoke,
    overlayId,
  });

  return (
    <main className="overlay-viewport" data-testid="overlay" data-size={size}>
      {poke ? <OverlayView event={event} poke={poke} size={size} /> : null}
      {debug ? (
        <output className="overlay-debug" data-connection={connection}>
          {connection}
        </output>
      ) : null}
    </main>
  );
}
