import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  CHANNEL_RECONCILE_INTERVAL_MS,
  CHANNEL_SYNC_DEBOUNCE_MS,
  ChannelSynchronizer,
} from "./channel-sync";

describe("ChannelSynchronizer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("reconciles immediately and only joins or parts changed channels", async () => {
    const joinedChannels = ["#current", "#stale"];
    const joined: string[] = [];
    const parted: string[] = [];
    const initialized: string[] = [];
    const synchronizer = new ChannelSynchronizer({
      loadDesiredChannels: async () => ["Current", "new-channel"],
      getJoinedChannels: () => joinedChannels,
      join: async (channel) => {
        joined.push(channel);
        joinedChannels.push(`#${channel}`);
      },
      part: async (channel) => {
        parted.push(channel);
        joinedChannels.splice(
          joinedChannels.findIndex(
            (entry) => entry.replace(/^#/, "") === channel,
          ),
          1,
        );
      },
      initialize: async (channel) => {
        initialized.push(channel);
      },
      sleep: async () => undefined,
      now: () => new Date("2026-07-26T09:00:00.000Z"),
    });

    await synchronizer.start();

    expect(parted).toEqual(["stale"]);
    expect(joined).toEqual(["new-channel"]);
    expect(initialized).toEqual(["new-channel"]);
    expect(synchronizer.getHealth()).toEqual({
      status: "degraded",
      lastSuccessAt: "2026-07-26T09:00:00.000Z",
    });

    synchronizer.stop();
  });

  it("debounces account changes and performs one safety reconciliation every fifteen minutes", async () => {
    const loadDesiredChannels = vi.fn().mockResolvedValue([]);
    const synchronizer = new ChannelSynchronizer({
      loadDesiredChannels,
      getJoinedChannels: () => [],
      join: async () => undefined,
      part: async () => undefined,
      initialize: async () => undefined,
      sleep: async () => undefined,
    });

    await synchronizer.start();
    expect(loadDesiredChannels).toHaveBeenCalledTimes(1);

    synchronizer.schedule();
    synchronizer.schedule();
    await vi.advanceTimersByTimeAsync(CHANNEL_SYNC_DEBOUNCE_MS);
    expect(loadDesiredChannels).toHaveBeenCalledTimes(2);

    await vi.advanceTimersByTimeAsync(CHANNEL_RECONCILE_INTERVAL_MS);
    expect(loadDesiredChannels).toHaveBeenCalledTimes(3);

    synchronizer.stop();
  });

  it("queues at most one follow-up reconciliation while a sync is running", async () => {
    const firstLoad = Promise.withResolvers<string[]>();
    const loadDesiredChannels = vi
      .fn()
      .mockReturnValueOnce(firstLoad.promise)
      .mockResolvedValue([]);
    const synchronizer = new ChannelSynchronizer({
      loadDesiredChannels,
      getJoinedChannels: () => [],
      join: async () => undefined,
      part: async () => undefined,
      initialize: async () => undefined,
      sleep: async () => undefined,
    });

    const initialSync = synchronizer.start();
    void synchronizer.requestSync();
    void synchronizer.requestSync();
    firstLoad.resolve([]);
    await initialSync;

    expect(loadDesiredChannels).toHaveBeenCalledTimes(2);

    synchronizer.stop();
  });

  it("reports subscription health and resynchronizes after reconnecting", async () => {
    const loadDesiredChannels = vi.fn().mockResolvedValue([]);
    const synchronizer = new ChannelSynchronizer({
      loadDesiredChannels,
      getJoinedChannels: () => [],
      join: async () => undefined,
      part: async () => undefined,
      initialize: async () => undefined,
      sleep: async () => undefined,
      now: () => new Date("2026-07-26T09:30:00.000Z"),
    });

    await synchronizer.start();
    await synchronizer.handleSubscriptionStatus("SUBSCRIBED");

    expect(loadDesiredChannels).toHaveBeenCalledTimes(2);
    expect(synchronizer.getHealth()).toEqual({
      status: "subscribed",
      lastSuccessAt: "2026-07-26T09:30:00.000Z",
    });

    await synchronizer.handleSubscriptionStatus("CHANNEL_ERROR");
    expect(synchronizer.getHealth().status).toBe("degraded");

    synchronizer.stop();
  });
});
