import type { OverlaySnapshot } from "./model";

export type OverlayConnection =
  | "connecting"
  | "connected"
  | "reconnecting"
  | "failed";

export type OverlayRealtimeHandlers = {
  // eslint-disable-next-line no-unused-vars
  onBroadcast: (snapshot: OverlaySnapshot) => void;
  // eslint-disable-next-line no-unused-vars
  onStatus: (status: string) => void;
};

type RealtimeOptions = {
  // eslint-disable-next-line no-unused-vars
  subscribe: (handlers: OverlayRealtimeHandlers) => () => void;
  // eslint-disable-next-line no-unused-vars
  fetchSnapshot: (signal: AbortSignal) => Promise<OverlaySnapshot>;
  // eslint-disable-next-line no-unused-vars
  onConnection: (connection: OverlayConnection) => void;
  // eslint-disable-next-line no-unused-vars
  onSnapshot: (snapshot: OverlaySnapshot) => void;
};

export function startOverlayRealtime({
  subscribe,
  fetchSnapshot,
  onConnection,
  onSnapshot,
}: RealtimeOptions) {
  let stopped = false;
  let connectedOnce = false;
  let snapshotController: AbortController | undefined;

  onConnection("connecting");

  const refreshSnapshot = async () => {
    snapshotController?.abort();
    const controller = new AbortController();
    snapshotController = controller;

    try {
      const snapshot = await fetchSnapshot(controller.signal);
      if (stopped || controller.signal.aborted) return;
      onSnapshot(snapshot);
      connectedOnce = true;
      onConnection("connected");
    } catch {
      if (stopped || controller.signal.aborted) return;
      onConnection(connectedOnce ? "reconnecting" : "failed");
    }
  };

  const unsubscribe = subscribe({
    onBroadcast(snapshot) {
      if (!stopped) onSnapshot(snapshot);
    },
    onStatus(status) {
      if (stopped) return;

      if (status === "SUBSCRIBED") {
        void refreshSnapshot();
        return;
      }

      if (
        status === "CHANNEL_ERROR" ||
        status === "TIMED_OUT" ||
        status === "CLOSED"
      ) {
        onConnection(connectedOnce ? "reconnecting" : "failed");
      }
    },
  });

  return () => {
    stopped = true;
    snapshotController?.abort();
    unsubscribe();
  };
}
