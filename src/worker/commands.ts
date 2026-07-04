export type PokeCommand =
  | "attack"
  | "welcome-pack"
  | "inventory"
  | "help"
  | "status"
  | "last";

const COMMANDS: Record<string, PokeCommand> = {
  attack: "attack",
  a: "attack",
  welcomepack: "welcome-pack",
  wp: "welcome-pack",
  inventory: "inventory",
  i: "inventory",
  help: "help",
  h: "help",
  status: "status",
  s: "status",
  last: "last",
  l: "last",
};

function normalizeChannel(channel: string) {
  return channel.replace(/^#/, "").trim().toLowerCase();
}

export function getChannelSyncPlan(
  desiredChannels: string[],
  joinedChannels: string[],
) {
  const desired = new Set(
    desiredChannels.map(normalizeChannel).filter(Boolean),
  );
  const joined = new Set(joinedChannels.map(normalizeChannel).filter(Boolean));

  return {
    join: [...desired].filter((channel) => !joined.has(channel)),
    part: [...joined].filter((channel) => !desired.has(channel)),
  };
}

export function parsePokeCommand(message: string): PokeCommand | null {
  const [root, command] = message.trim().toLowerCase().split(/\s+/);

  if (root !== "!poke" || !command) {
    return null;
  }

  return COMMANDS[command] ?? null;
}

export function parseGamePlayer(tags: {
  username?: string;
  "user-id"?: string;
}) {
  const username = tags.username?.trim().toLowerCase();
  const twitchId = tags["user-id"]?.trim();

  if (!username || !twitchId) {
    return null;
  }

  return { twitchId, username };
}

export class CooldownStore {
  private readonly expiresAt = new Map<string, number>();
  private readonly durationMs: number;
  private readonly now: () => number;
  private readonly maxEntries: number;

  constructor(
    durationMs = 31_000,
    now: () => number = Date.now,
    maxEntries = 10_000,
  ) {
    this.durationMs = durationMs;
    this.now = now;
    this.maxEntries = maxEntries;
  }

  consume(channel: string, user: string) {
    const key = `${channel.toLowerCase()}:${user.toLowerCase()}`;
    const currentTime = this.now();

    if ((this.expiresAt.get(key) ?? 0) > currentTime) {
      return false;
    }

    if (!this.expiresAt.has(key) && this.expiresAt.size >= this.maxEntries) {
      for (const [storedKey, expiry] of this.expiresAt) {
        if (expiry <= currentTime) {
          this.expiresAt.delete(storedKey);
        }
      }

      if (this.expiresAt.size >= this.maxEntries) {
        return false;
      }
    }

    this.expiresAt.set(key, currentTime + this.durationMs);
    return true;
  }

  getRemainingCooldown(channel: string, user: string): number {
    const key = `${channel.toLowerCase()}:${user.toLowerCase()}`;
    const currentTime = this.now();
    const expiry = this.expiresAt.get(key) ?? 0;
    return expiry > currentTime ? Math.ceil((expiry - currentTime) / 1000) : 0;
  }
}

const INFORMATION_COMMANDS = new Set<PokeCommand>([
  "help",
  "inventory",
  "status",
  "last",
]);

export class CommandGate {
  private readonly attackCooldowns: CooldownStore;
  private readonly informationCooldowns: CooldownStore;
  private readonly welcomePackCooldowns: CooldownStore;

  constructor(now: () => number = Date.now) {
    this.attackCooldowns = new CooldownStore(31_000, now);
    this.informationCooldowns = new CooldownStore(10_000, now);
    this.welcomePackCooldowns = new CooldownStore(31_000, now);
  }

  consume(command: PokeCommand, channel: string, user: string) {
    if (command === "attack") {
      return this.attackCooldowns.consume(channel, user);
    }
    if (INFORMATION_COMMANDS.has(command)) {
      return this.informationCooldowns.consume(channel, command);
    }
    if (command === "welcome-pack") {
      return this.welcomePackCooldowns.consume(channel, user);
    }
    return true;
  }

  getRemainingCooldown(command: PokeCommand, channel: string, user: string): number {
    if (command === "attack") {
      return this.attackCooldowns.getRemainingCooldown(channel, user);
    }
    if (INFORMATION_COMMANDS.has(command)) {
      return this.informationCooldowns.getRemainingCooldown(channel, command);
    }
    if (command === "welcome-pack") {
      return this.welcomePackCooldowns.getRemainingCooldown(channel, user);
    }
    return 0;
  }
}

export class ChannelQueue {
  private readonly pending = new Map<string, Promise<unknown>>();
  private readonly pendingCounts = new Map<string, number>();
  private readonly maxPendingPerChannel: number;

  constructor(maxPendingPerChannel = 100) {
    this.maxPendingPerChannel = maxPendingPerChannel;
  }

  run<T>(channel: string, operation: () => Promise<T>): Promise<T> {
    const key = channel.toLowerCase();
    const pendingCount = this.pendingCounts.get(key) ?? 0;

    if (pendingCount >= this.maxPendingPerChannel) {
      return Promise.reject(new Error("Channel command queue is full"));
    }

    const previous = this.pending.get(key) ?? Promise.resolve();
    const current = previous.catch(() => undefined).then(operation);

    this.pending.set(key, current);
    this.pendingCounts.set(key, pendingCount + 1);

    const cleanup = () => {
      const remaining = (this.pendingCounts.get(key) ?? 1) - 1;
      if (remaining === 0) {
        this.pendingCounts.delete(key);
      } else {
        this.pendingCounts.set(key, remaining);
      }

      if (this.pending.get(key) === current) {
        this.pending.delete(key);
      }
    };

    void current.then(cleanup, cleanup);

    return current;
  }
}
