export type ActivePoke = {
  health: number;
  poke: string;
  updatedAt?: string;
  lastEventKind?: string | null;
  lastEventPlayer?: string | null;
  lastEventDamage?: number | null;
  lastEventAt?: string | null;
  lastCatchPoke?: string | null;
  lastCatchPlayer?: string | null;
  lastCatchAt?: string | null;
};

export type OverlaySize = "auto" | "compact" | "standard" | "large";
export type OverlaySnapshot = {
  health: number | null;
  poke: string | null;
  updatedAt: string | null;
  lastEventKind?: string | null;
  lastEventPlayer?: string | null;
  lastEventDamage?: number | null;
  lastEventAt?: string | null;
  lastCatchPoke?: string | null;
  lastCatchPlayer?: string | null;
  lastCatchAt?: string | null;
};
export type OverlayEvent = {
  kind: "hit" | "caught" | null;
  player: string | null;
  damage: number | null;
  at: string | null;
};
export type OverlayCatch = {
  poke: string | null;
  player: string | null;
  at: string | null;
};
export type OverlayState = {
  poke: ActivePoke | null;
  updatedAt: string | null;
  event: OverlayEvent;
  catch: OverlayCatch;
};

type ActivePokeChange = {
  eventType: "INSERT" | "UPDATE" | "DELETE";
  new: Record<string, unknown>;
};

export function getHealthPercent(health: number) {
  return Math.max(0, Math.min(100, health * 2));
}

export function getHealthTone(health: number) {
  if (health <= 15) return "low";
  if (health <= 30) return "medium";
  return "high";
}

export function parseOverlaySize(value: string | undefined): OverlaySize {
  return value === "compact" || value === "standard" || value === "large"
    ? value
    : "auto";
}

export function applyOverlaySnapshot(
  current: OverlayState,
  snapshot: OverlaySnapshot,
): OverlayState {
  const nextTime = snapshot.updatedAt ? Date.parse(snapshot.updatedAt) : 0;
  const currentTime = current.updatedAt ? Date.parse(current.updatedAt) : 0;

  if (nextTime < currentTime) return current;
  if (snapshot.poke === null && snapshot.health === null) {
    return {
      poke: null,
      updatedAt: snapshot.updatedAt,
      event: { kind: null, player: null, damage: null, at: null },
      catch: current.catch,
    };
  }
  if (
    typeof snapshot.poke !== "string" ||
    !snapshot.poke ||
    typeof snapshot.health !== "number" ||
    !Number.isFinite(snapshot.health)
  ) {
    return current;
  }

  const event: OverlayEvent = {
    kind:
      snapshot.lastEventKind === "hit" || snapshot.lastEventKind === "caught"
        ? snapshot.lastEventKind
        : null,
    player: snapshot.lastEventPlayer ?? null,
    damage: snapshot.lastEventDamage ?? null,
    at: snapshot.lastEventAt ?? null,
  };

  // Only update the persistent catch badge when a new catch lands.
  const catch_: OverlayCatch =
    snapshot.lastCatchPoke && snapshot.lastCatchAt
      ? {
          poke: snapshot.lastCatchPoke,
          player: snapshot.lastCatchPlayer ?? null,
          at: snapshot.lastCatchAt,
        }
      : current.catch;

  return {
    poke: { health: snapshot.health, poke: snapshot.poke },
    updatedAt: snapshot.updatedAt,
    event,
    catch: catch_,
  };
}

export function applyActivePokeChange(
  current: ActivePoke | null,
  change: ActivePokeChange,
): ActivePoke | null {
  if (change.eventType === "DELETE") {
    return null;
  }

  const { health, poke } = change.new;
  if (typeof health !== "number" || typeof poke !== "string" || !poke) {
    return current;
  }

  return { health, poke };
}
