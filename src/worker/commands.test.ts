import { describe, expect, it } from "vitest";

import {
  ChannelQueue,
  CommandGate,
  CooldownStore,
  getChannelSyncPlan,
  parseGamePlayer,
  parsePokeCommand,
} from "./commands";

describe("getChannelSyncPlan", () => {
  it("joins missing channels and parts stale channels", () => {
    expect(
      getChannelSyncPlan(["Current", "new-channel"], ["#current", "#stale"]),
    ).toEqual({ join: ["new-channel"], part: ["stale"] });
  });
});

describe("parsePokeCommand", () => {
  it.each([
    ["!poke attack", "attack"],
    ["!POKE a", "attack"],
    ["!poke welcomepack", "welcome-pack"],
    ["!poke wp", "welcome-pack"],
    ["!poke inventory", "inventory"],
    ["!poke i", "inventory"],
    ["!poke help", "help"],
    ["!poke h", "help"],
    ["!poke status", "status"],
    ["!poke s", "status"],
    ["!poke last", "last"],
    ["!poke l", "last"],
  ] as const)("maps %s to %s", (message, expected) => {
    expect(parsePokeCommand(message)).toBe(expected);
  });

  it("ignores unrelated and incomplete messages", () => {
    expect(parsePokeCommand("hello")).toBeNull();
    expect(parsePokeCommand("!poke")).toBeNull();
    expect(parsePokeCommand("!pokemon attack")).toBeNull();
  });
});

describe("parseGamePlayer", () => {
  it("requires the immutable Twitch user ID", () => {
    expect(parseGamePlayer({ username: "Viewer", "user-id": "1234" })).toEqual({
      twitchId: "1234",
      username: "viewer",
    });
    expect(parseGamePlayer({ username: "Viewer" })).toBeNull();
    expect(parseGamePlayer({ "user-id": "1234" })).toBeNull();
  });
});

describe("CooldownStore", () => {
  it("tracks cooldowns per channel and user", () => {
    let now = 1_000;
    const cooldowns = new CooldownStore(31_000, () => now);

    expect(cooldowns.consume("channel-one", "viewer")).toBe(true);
    expect(cooldowns.consume("channel-one", "viewer")).toBe(false);
    expect(cooldowns.consume("channel-two", "viewer")).toBe(true);

    now += 31_001;
    expect(cooldowns.consume("channel-one", "viewer")).toBe(true);
  });

  it("bounds retained users and admits new users after expiry", () => {
    let now = 1_000;
    const cooldowns = new CooldownStore(31_000, () => now, 2);

    expect(cooldowns.consume("channel", "viewer-1")).toBe(true);
    expect(cooldowns.consume("channel", "viewer-2")).toBe(true);
    expect(cooldowns.consume("channel", "viewer-3")).toBe(false);

    now += 31_001;
    expect(cooldowns.consume("channel", "viewer-3")).toBe(true);
  });
});

describe("CommandGate", () => {
  it("keeps attack cooldowns independent from information commands", () => {
    let now = 1_000;
    const gate = new CommandGate(() => now);

    expect(gate.consume("attack", "channel", "viewer")).toBe(true);
    expect(gate.consume("attack", "channel", "viewer")).toBe(false);
    expect(gate.consume("status", "channel", "viewer")).toBe(true);

    now += 10_001;
    expect(gate.consume("status", "channel", "another-viewer")).toBe(true);
    expect(gate.consume("attack", "channel", "viewer")).toBe(false);
  });

  it("limits information responses per channel and command", () => {
    const gate = new CommandGate(() => 1_000);

    expect(gate.consume("help", "channel", "viewer-1")).toBe(true);
    expect(gate.consume("help", "channel", "viewer-2")).toBe(false);
    expect(gate.consume("last", "channel", "viewer-2")).toBe(true);
    expect(gate.consume("help", "other-channel", "viewer-2")).toBe(true);
    expect(gate.consume("inventory", "channel", "viewer-1")).toBe(true);
    expect(gate.consume("inventory", "channel", "viewer-2")).toBe(false);
  });

  it("retains a per-user welcome-pack cooldown without consuming attacks", () => {
    const gate = new CommandGate(() => 1_000);

    expect(gate.consume("welcome-pack", "channel", "viewer")).toBe(true);
    expect(gate.consume("welcome-pack", "channel", "viewer")).toBe(false);
    expect(gate.consume("attack", "channel", "viewer")).toBe(true);
  });

  it("calculates the remaining cooldown accurately", () => {
    let now = 1_000;
    const gate = new CommandGate(() => now);

    expect(gate.getRemainingCooldown("attack", "channel", "viewer")).toBe(0);
    expect(gate.consume("attack", "channel", "viewer")).toBe(true);
    expect(gate.getRemainingCooldown("attack", "channel", "viewer")).toBe(31);

    now += 15_000;
    expect(gate.getRemainingCooldown("attack", "channel", "viewer")).toBe(16);

    now += 17_000;
    expect(gate.getRemainingCooldown("attack", "channel", "viewer")).toBe(0);
  });
});

describe("ChannelQueue", () => {
  it("serializes work for the same channel", async () => {
    const queue = new ChannelQueue();
    const events: string[] = [];

    const first = queue.run("channel", async () => {
      events.push("first:start");
      await Promise.resolve();
      events.push("first:end");
    });
    const second = queue.run("channel", async () => {
      events.push("second:start");
      events.push("second:end");
    });

    await Promise.all([first, second]);
    expect(events).toEqual([
      "first:start",
      "first:end",
      "second:start",
      "second:end",
    ]);
  });

  it("rejects work above the per-channel backlog limit", async () => {
    const queue = new ChannelQueue(1);
    let release!: () => void;
    const blocked = new Promise<void>((resolve) => {
      release = resolve;
    });

    const first = queue.run("channel", () => blocked);
    await expect(queue.run("channel", async () => undefined)).rejects.toThrow(
      "Channel command queue is full",
    );

    release();
    await first;
  });

  it("does not create an unhandled rejection while cleaning up", async () => {
    const queue = new ChannelQueue();
    const unhandled: unknown[] = [];
    const listener = (reason: unknown) => unhandled.push(reason);
    process.on("unhandledRejection", listener);

    try {
      await expect(
        queue.run("channel", async () => {
          throw new Error("boom");
        }),
      ).rejects.toThrow("boom");
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(unhandled).toEqual([]);
    } finally {
      process.off("unhandledRejection", listener);
    }
  });
});
