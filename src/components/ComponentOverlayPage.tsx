"use client";

import { OverlayView } from "@/features/overlay/OverlayView";
import type { ActivePoke, OverlaySize } from "@/features/overlay/model";
import { useOverlayPolling } from "@/features/overlay/use-overlay-polling";

export default function ComponentOverlayPage({
  debug,
  initialPoke,
  overlayId,
  size,
}: {
  debug: boolean;
  initialPoke: ActivePoke | null;
  overlayId: string;
  size: OverlaySize;
}) {
  const { connection, poke, event, catch: lastCatch } = useOverlayPolling({
    initialPoke,
    overlayId,
  });

  const showConnectionBadge =
    connection === "reconnecting" || connection === "failed";

  return (
    <main className="overlay-viewport" data-testid="overlay" data-size={size}>
      {poke ? (
        <OverlayView
          poke={poke}
          size={size}
          event={event}
          catch={lastCatch}
        />
      ) : null}
      {showConnectionBadge ? (
        <span
          className="overlay-connection"
          data-connection={connection}
          role="status"
        >
          {connection}
        </span>
      ) : null}
      {debug ? (
        <output className="overlay-debug" data-connection={connection}>
          {connection}
        </output>
      ) : null}
    </main>
  );
}
