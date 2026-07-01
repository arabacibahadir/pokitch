export type ActivePoke = {
  health: number;
  poke: string;
  updatedAt?: string;
};

export type OverlaySize = "auto" | "compact" | "standard" | "large";
export type OverlaySnapshot = {
  health: number | null;
  poke: string | null;
  updatedAt: string | null;
};
export type OverlayState = {
  poke: ActivePoke | null;
  updatedAt: string | null;
};
export type EncounterEvent = {
  id: string;
  combo: number;
  createdAt: string;
  critical: boolean;
  damage: number;
  eventType: "hit" | "caught";
  health: number;
  maxCombo: number;
  participants: number;
  poke: string;
  username: string;
};

export type RealtimeEncounterEventChange = {
  eventType: "INSERT" | "UPDATE" | "DELETE";
  new: Record<string, unknown>;
};

type ActivePokeChange = {
  eventType: "INSERT" | "UPDATE" | "DELETE";
  new: Record<string, unknown>;
};

export type RealtimePokeChange = {
  eventType: "INSERT" | "UPDATE" | "DELETE";
  new: Record<string, unknown>;
  old: Record<string, unknown>;
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
    return { poke: null, updatedAt: snapshot.updatedAt };
  }
  if (
    typeof snapshot.poke !== "string" ||
    !snapshot.poke ||
    typeof snapshot.health !== "number" ||
    !Number.isFinite(snapshot.health)
  ) {
    return current;
  }

  return {
    poke: { health: snapshot.health, poke: snapshot.poke },
    updatedAt: snapshot.updatedAt,
  };
}

export function applyRealtimeChange(
  current: OverlayState,
  change: RealtimePokeChange,
): OverlayState {
  const record = change.eventType === "DELETE" ? change.old : change.new;
  const updatedAt =
    typeof record.updated_at === "string" ? record.updated_at : null;

  if (change.eventType === "DELETE") {
    return { poke: null, updatedAt: updatedAt ?? current.updatedAt };
  }

  return applyOverlaySnapshot(current, {
    health: typeof record.health === "number" ? record.health : Number.NaN,
    poke: typeof record.poke === "string" ? record.poke : "",
    updatedAt,
  });
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

export function applyEncounterEventChange(
  current: EncounterEvent | null,
  change: RealtimeEncounterEventChange,
): EncounterEvent | null {
  if (change.eventType !== "INSERT") {
    return current;
  }

  const record = change.new;
  const eventType = record.event_type;
  if (
    typeof record.id !== "string" ||
    typeof record.created_at !== "string" ||
    typeof record.critical !== "boolean" ||
    typeof record.poke !== "string" ||
    typeof record.username !== "string" ||
    (eventType !== "hit" && eventType !== "caught") ||
    !isFiniteNumber(record.damage) ||
    !isFiniteNumber(record.health) ||
    !isFiniteNumber(record.combo) ||
    !isFiniteNumber(record.max_combo) ||
    !isFiniteNumber(record.participants)
  ) {
    return current;
  }

  const nextTime = Date.parse(record.created_at);
  const currentTime = current ? Date.parse(current.createdAt) : 0;
  if (
    !Number.isFinite(nextTime) ||
    nextTime < currentTime ||
    (nextTime === currentTime && current && record.id <= current.id)
  ) {
    return current;
  }

  return {
    id: record.id,
    combo: record.combo,
    createdAt: record.created_at,
    critical: record.critical,
    damage: record.damage,
    eventType,
    health: record.health,
    maxCombo: record.max_combo,
    participants: record.participants,
    poke: record.poke,
    username: record.username,
  };
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}
