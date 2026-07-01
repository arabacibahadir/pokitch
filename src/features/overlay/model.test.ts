import { describe, expect, it } from "vitest";

import {
  applyActivePokeChange,
  applyOverlaySnapshot,
  applyRealtimeChange,
  applyEncounterEventChange,
  getHealthPercent,
  getHealthTone,
  parseOverlaySize,
} from "./model";

describe("getHealthPercent", () => {
  it("converts the 50 HP scale to a clamped percentage", () => {
    expect(getHealthPercent(50)).toBe(100);
    expect(getHealthPercent(25)).toBe(50);
    expect(getHealthPercent(-5)).toBe(0);
    expect(getHealthPercent(80)).toBe(100);
  });
});

describe("overlay presentation", () => {
  it("normalizes supported sizes and falls back to auto", () => {
    expect(parseOverlaySize("compact")).toBe("compact");
    expect(parseOverlaySize("standard")).toBe("standard");
    expect(parseOverlaySize("large")).toBe("large");
    expect(parseOverlaySize("unexpected")).toBe("auto");
    expect(parseOverlaySize(undefined)).toBe("auto");
  });

  it("maps health to readable status tones", () => {
    expect(getHealthTone(50)).toBe("high");
    expect(getHealthTone(25)).toBe("medium");
    expect(getHealthTone(10)).toBe("low");
  });
});

describe("applyOverlaySnapshot", () => {
  it("accepts newer snapshots and rejects stale snapshots", () => {
    const current = {
      poke: { health: 30, poke: "eevee" },
      updatedAt: "2026-07-01T12:00:00.000Z",
    };

    expect(
      applyOverlaySnapshot(current, {
        poke: "eevee",
        health: 20,
        updatedAt: "2026-07-01T12:00:01.000Z",
      }),
    ).toEqual({
      poke: { health: 20, poke: "eevee" },
      updatedAt: "2026-07-01T12:00:01.000Z",
    });

    expect(
      applyOverlaySnapshot(current, {
        poke: "eevee",
        health: 40,
        updatedAt: "2026-07-01T11:59:59.000Z",
      }),
    ).toEqual(current);
  });

  it("clears on a valid empty snapshot but preserves state for malformed data", () => {
    const current = {
      poke: { health: 30, poke: "eevee" },
      updatedAt: "2026-07-01T12:00:00.000Z",
    };

    expect(
      applyOverlaySnapshot(current, {
        poke: null,
        health: null,
        updatedAt: "2026-07-01T12:00:01.000Z",
      }),
    ).toEqual({ poke: null, updatedAt: "2026-07-01T12:00:01.000Z" });

    expect(
      applyOverlaySnapshot(current, {
        poke: "eevee",
        health: Number.NaN,
        updatedAt: "2026-07-01T12:00:01.000Z",
      }),
    ).toEqual(current);
  });
});

describe("applyRealtimeChange", () => {
  it("ignores an update older than the current snapshot", () => {
    const current = {
      poke: { health: 20, poke: "eevee" },
      updatedAt: "2026-07-01T12:00:02.000Z",
    };

    expect(
      applyRealtimeChange(current, {
        eventType: "UPDATE",
        new: {
          health: 40,
          poke: "eevee",
          updated_at: "2026-07-01T12:00:01.000Z",
        },
        old: {},
      }),
    ).toEqual(current);
  });

  it("clears the encounter on a delete event", () => {
    const current = {
      poke: { health: 20, poke: "eevee" },
      updatedAt: "2026-07-01T12:00:02.000Z",
    };

    expect(
      applyRealtimeChange(current, {
        eventType: "DELETE",
        new: {},
        old: { updated_at: "2026-07-01T12:00:03.000Z" },
      }),
    ).toEqual({ poke: null, updatedAt: "2026-07-01T12:00:03.000Z" });
  });
});

describe("applyActivePokeChange", () => {
  it("uses realtime insert and update payloads without another database read", () => {
    expect(
      applyActivePokeChange(null, {
        eventType: "INSERT",
        new: { channel: "pokitch", health: 50, poke: "pikachu" },
      }),
    ).toEqual({ health: 50, poke: "pikachu" });

    expect(
      applyActivePokeChange(
        { health: 50, poke: "pikachu" },
        {
          eventType: "UPDATE",
          new: { channel: "pokitch", health: 37, poke: "pikachu" },
        },
      ),
    ).toEqual({ health: 37, poke: "pikachu" });
  });

  it("clears the encounter on delete and ignores malformed payloads", () => {
    const current = { health: 12, poke: "eevee" };

    expect(
      applyActivePokeChange(current, { eventType: "DELETE", new: {} }),
    ).toBeNull();
    expect(
      applyActivePokeChange(current, {
        eventType: "UPDATE",
        new: { health: "12", poke: "eevee" },
      }),
    ).toEqual(current);
  });
});

describe("applyEncounterEventChange", () => {
  it("maps a valid realtime insert into overlay event state", () => {
    expect(
      applyEncounterEventChange(null, {
        eventType: "INSERT",
        new: {
          id: "event-1",
          channel: "streamer",
          combo: 3,
          created_at: "2026-07-01T12:00:00.000Z",
          critical: true,
          damage: 14,
          event_type: "hit",
          health: 20,
          max_combo: 3,
          participants: 3,
          poke: "pikachu",
          username: "viewer",
        },
      }),
    ).toEqual({
      id: "event-1",
      combo: 3,
      createdAt: "2026-07-01T12:00:00.000Z",
      critical: true,
      damage: 14,
      eventType: "hit",
      health: 20,
      maxCombo: 3,
      participants: 3,
      poke: "pikachu",
      username: "viewer",
    });
  });

  it("ignores malformed, non-insert, and stale events", () => {
    const current = {
      id: "event-2",
      combo: 4,
      createdAt: "2026-07-01T12:00:02.000Z",
      critical: false,
      damage: 8,
      eventType: "hit" as const,
      health: 12,
      maxCombo: 4,
      participants: 4,
      poke: "pikachu",
      username: "viewer-2",
    };

    expect(
      applyEncounterEventChange(current, {
        eventType: "UPDATE",
        new: {},
      }),
    ).toEqual(current);
    expect(
      applyEncounterEventChange(current, {
        eventType: "INSERT",
        new: { id: "bad" },
      }),
    ).toEqual(current);
    expect(
      applyEncounterEventChange(current, {
        eventType: "INSERT",
        new: {
          id: "event-1",
          combo: 1,
          created_at: "2026-07-01T12:00:01.000Z",
          critical: false,
          damage: 5,
          event_type: "hit",
          health: 45,
          max_combo: 1,
          participants: 1,
          poke: "pikachu",
          username: "viewer-1",
        },
      }),
    ).toEqual(current);
  });
});
