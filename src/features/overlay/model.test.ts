import { describe, expect, it } from "vitest";

import {
  applyActivePokeChange,
  applyOverlaySnapshot,
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

const EMPTY_STATE = {
  event: { kind: null, player: null, damage: null, at: null },
  catch: { poke: null, player: null, at: null },
};

describe("applyOverlaySnapshot", () => {
  it("accepts newer snapshots and rejects stale snapshots", () => {
    const current = {
      poke: { health: 30, poke: "eevee" },
      updatedAt: "2026-07-01T12:00:00.000Z",
      ...EMPTY_STATE,
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
      event: { kind: null, player: null, damage: null, at: null },
      catch: { poke: null, player: null, at: null },
    });

    expect(
      applyOverlaySnapshot(current, {
        poke: "eevee",
        health: 40,
        updatedAt: "2026-07-01T11:59:59.000Z",
      }),
    ).toEqual(current);
  });

  it("carries combat events and persistent catch badges from the snapshot", () => {
    const current = {
      poke: { health: 30, poke: "eevee" },
      updatedAt: "2026-07-01T12:00:00.000Z",
      ...EMPTY_STATE,
    };

    const result = applyOverlaySnapshot(current, {
      poke: "eevee",
      health: 22,
      updatedAt: "2026-07-01T12:00:02.000Z",
      lastEventKind: "hit",
      lastEventPlayer: "viewer",
      lastEventDamage: 8,
      lastEventAt: "2026-07-01T12:00:02.000Z",
    });

    expect(result.event).toEqual({
      kind: "hit",
      player: "viewer",
      damage: 8,
      at: "2026-07-01T12:00:02.000Z",
    });
    // No catch landed, so the catch badge stays empty.
    expect(result.catch).toEqual({ poke: null, player: null, at: null });
  });

  it("updates the catch badge when a new catch lands", () => {
    const current = {
      poke: { health: 5, poke: "eevee" },
      updatedAt: "2026-07-01T12:00:05.000Z",
      ...EMPTY_STATE,
    };

    const result = applyOverlaySnapshot(current, {
      poke: "pikachu",
      health: 50,
      updatedAt: "2026-07-01T12:00:06.000Z",
      lastEventKind: "caught",
      lastEventPlayer: "viewer",
      lastEventDamage: null,
      lastEventAt: "2026-07-01T12:00:06.000Z",
      lastCatchPoke: "eevee",
      lastCatchPlayer: "viewer",
      lastCatchAt: "2026-07-01T12:00:06.000Z",
    });

    expect(result.event.kind).toBe("caught");
    expect(result.catch).toEqual({
      poke: "eevee",
      player: "viewer",
      at: "2026-07-01T12:00:06.000Z",
    });
  });

  it("clears on a valid empty snapshot but preserves state for malformed data", () => {
    const current = {
      poke: { health: 30, poke: "eevee" },
      updatedAt: "2026-07-01T12:00:00.000Z",
      ...EMPTY_STATE,
    };

    expect(
      applyOverlaySnapshot(current, {
        poke: null,
        health: null,
        updatedAt: "2026-07-01T12:00:01.000Z",
      }),
    ).toEqual({
      poke: null,
      updatedAt: "2026-07-01T12:00:01.000Z",
      event: { kind: null, player: null, damage: null, at: null },
      catch: { poke: null, player: null, at: null },
    });

    expect(
      applyOverlaySnapshot(current, {
        poke: "eevee",
        health: Number.NaN,
        updatedAt: "2026-07-01T12:00:01.000Z",
      }),
    ).toEqual(current);
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
