import { describe, expect, it, vi } from "vitest";

import {
  type OverlayRealtimeHandlers,
  startOverlayRealtime,
} from "./realtime";

const snapshot = {
  health: 42,
  poke: "pikachu",
  updatedAt: "2026-07-02T12:00:00.000Z",
};

describe("startOverlayRealtime", () => {
  it("refreshes once when subscribed and applies broadcasts immediately", async () => {
    let handlers!: OverlayRealtimeHandlers;
    const unsubscribe = vi.fn();
    const fetchSnapshot = vi.fn().mockResolvedValue(snapshot);
    const onSnapshot = vi.fn();
    const onConnection = vi.fn();

    const stop = startOverlayRealtime({
      subscribe(nextHandlers) {
        handlers = nextHandlers;
        return unsubscribe;
      },
      fetchSnapshot,
      onConnection,
      onSnapshot,
    });

    expect(onConnection).toHaveBeenCalledWith("connecting");
    expect(fetchSnapshot).not.toHaveBeenCalled();

    handlers.onStatus("SUBSCRIBED");
    await vi.waitFor(() => expect(fetchSnapshot).toHaveBeenCalledTimes(1));
    expect(onSnapshot).toHaveBeenCalledWith(snapshot);
    expect(onConnection).toHaveBeenLastCalledWith("connected");

    const broadcast = { ...snapshot, health: 37 };
    handlers.onBroadcast(broadcast);
    expect(onSnapshot).toHaveBeenLastCalledWith(broadcast);
    expect(fetchSnapshot).toHaveBeenCalledTimes(1);

    stop();
    expect(unsubscribe).toHaveBeenCalledOnce();
  });

  it("refreshes once on every successful reconnect without using timers", async () => {
    let handlers!: OverlayRealtimeHandlers;
    const fetchSnapshot = vi.fn().mockResolvedValue(snapshot);
    const onConnection = vi.fn();
    vi.useFakeTimers();

    const stop = startOverlayRealtime({
      subscribe(nextHandlers) {
        handlers = nextHandlers;
        return vi.fn();
      },
      fetchSnapshot,
      onConnection,
      onSnapshot: vi.fn(),
    });

    handlers.onStatus("SUBSCRIBED");
    await Promise.resolve();
    expect(fetchSnapshot).toHaveBeenCalledTimes(1);
    handlers.onStatus("CHANNEL_ERROR");
    expect(onConnection).toHaveBeenLastCalledWith("reconnecting");
    handlers.onStatus("SUBSCRIBED");
    await Promise.resolve();
    expect(fetchSnapshot).toHaveBeenCalledTimes(2);

    expect(vi.getTimerCount()).toBe(0);
    stop();
    vi.useRealTimers();
  });

  it("aborts an active snapshot request when stopped", () => {
    let handlers!: OverlayRealtimeHandlers;
    let requestSignal: AbortSignal | undefined;

    const stop = startOverlayRealtime({
      subscribe(nextHandlers) {
        handlers = nextHandlers;
        return vi.fn();
      },
      fetchSnapshot(signal) {
        requestSignal = signal;
        return new Promise(() => undefined);
      },
      onConnection: vi.fn(),
      onSnapshot: vi.fn(),
    });

    handlers.onStatus("SUBSCRIBED");
    stop();

    expect(requestSignal?.aborted).toBe(true);
  });
});
