import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { startOverlayPolling, POLLING_INTERVAL_MS } from "./polling";

const snapshot = {
  health: 42,
  poke: "pikachu",
  updatedAt: "2026-07-02T12:00:00.000Z",
};

describe("startOverlayPolling", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("fetches immediately and waits after completion", async () => {
    const fetchSnapshot = vi.fn().mockResolvedValue(snapshot);
    const onSnapshot = vi.fn();

    const stop = startOverlayPolling({
      fetchSnapshot,
      onConnection: vi.fn(),
      onSnapshot,
    });

    expect(fetchSnapshot).toHaveBeenCalledTimes(1);
    await vi.runAllTicks();
    expect(onSnapshot).toHaveBeenCalledWith(snapshot);

    await vi.advanceTimersByTimeAsync(POLLING_INTERVAL_MS - 1);
    expect(fetchSnapshot).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1);
    expect(fetchSnapshot).toHaveBeenCalledTimes(2);

    stop();
  });

  it("never overlaps requests when a snapshot is slow", async () => {
    let resolveFirst!: ReturnType<
      typeof Promise.withResolvers<typeof snapshot>
    >["resolve"];
    const fetchSnapshot = vi.fn(
      () =>
        new Promise<typeof snapshot>((resolve) => {
          resolveFirst = resolve;
        }),
    );

    const stop = startOverlayPolling({
      fetchSnapshot,
      onConnection: vi.fn(),
      onSnapshot: vi.fn(),
    });

    await vi.advanceTimersByTimeAsync(10_000);
    expect(fetchSnapshot).toHaveBeenCalledTimes(1);

    resolveFirst(snapshot);
    await vi.runAllTicks();
    await vi.advanceTimersByTimeAsync(POLLING_INTERVAL_MS);
    expect(fetchSnapshot).toHaveBeenCalledTimes(2);

    stop();
  });

  it("reports initial failure, reconnecting after a later failure, and recovery", async () => {
    const fetchSnapshot = vi
      .fn()
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce(snapshot)
      .mockRejectedValueOnce(new Error("offline again"))
      .mockResolvedValueOnce(snapshot);
    const onConnection = vi.fn();

    const stop = startOverlayPolling({
      fetchSnapshot,
      onConnection,
      onSnapshot: vi.fn(),
    });

    await vi.runAllTicks();
    expect(onConnection).toHaveBeenLastCalledWith("failed");

    // Failed/reconnecting states back off to avoid hammering the snapshot route.
    await vi.advanceTimersByTimeAsync(5_000);
    expect(onConnection).toHaveBeenLastCalledWith("connected");

    await vi.advanceTimersByTimeAsync(POLLING_INTERVAL_MS);
    expect(onConnection).toHaveBeenLastCalledWith("reconnecting");

    await vi.advanceTimersByTimeAsync(5_000);
    expect(onConnection).toHaveBeenLastCalledWith("connected");

    stop();
  });

  it("aborts the active request and clears future polling when stopped", async () => {
    let requestSignal: AbortSignal | undefined;
    const fetchSnapshot = vi.fn((signal: AbortSignal) => {
      requestSignal = signal;
      return new Promise<typeof snapshot>(() => undefined);
    });

    const stop = startOverlayPolling({
      fetchSnapshot,
      onConnection: vi.fn(),
      onSnapshot: vi.fn(),
    });

    stop();
    expect(requestSignal?.aborted).toBe(true);

    await vi.advanceTimersByTimeAsync(10_000);
    expect(fetchSnapshot).toHaveBeenCalledTimes(1);
  });
});
