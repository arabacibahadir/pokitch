import type { OverlaySnapshot } from "./model";

export type OverlayConnection =
  | "connecting"
  | "connected"
  | "reconnecting"
  | "failed";

type PollingOptions = {
  // eslint-disable-next-line no-unused-vars
  fetchSnapshot: (signal: AbortSignal) => Promise<OverlaySnapshot>;
  // eslint-disable-next-line no-unused-vars
  onConnection: (connection: OverlayConnection) => void;
  // eslint-disable-next-line no-unused-vars
  onSnapshot: (snapshot: OverlaySnapshot) => void;
};

export const POLLING_INTERVAL_MS = 5_000;
// Back off when the server is unreachable or returns errors, so a flaky
// overlay does not hammer the database while nothing can change on screen.
const BACKOFF_INTERVAL_MS = 5_000;

export function startOverlayPolling({
  fetchSnapshot,
  onConnection,
  onSnapshot,
}: PollingOptions) {
  const controller = new AbortController();
  let connectedOnce = false;
  let stopped = false;
  let timer: ReturnType<typeof setTimeout> | undefined;

  async function poll() {
    try {
      const snapshot = await fetchSnapshot(controller.signal);
      if (stopped) return;

      onSnapshot(snapshot);
      connectedOnce = true;
      onConnection("connected");
      if (!stopped) timer = setTimeout(poll, POLLING_INTERVAL_MS);
    } catch {
      if (stopped) return;
      onConnection(connectedOnce ? "reconnecting" : "failed");
      if (!stopped) timer = setTimeout(poll, BACKOFF_INTERVAL_MS);
    }
  }

  void poll();

  return () => {
    stopped = true;
    controller.abort();
    if (timer) clearTimeout(timer);
  };
}
