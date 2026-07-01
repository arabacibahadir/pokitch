import type tmi from "tmi.js";

import { getRandomPokemonSpeciesName } from "@/utils/pokemon-species";

import type { PokeCommand } from "./commands";

export type GamePlayer = {
  twitchId: string;
  username: string;
};

export type AttackInput = GamePlayer & {
  channel: string;
  damage: number;
  nextPoke: string;
};

export type AttackResult =
  | {
      outcome: "hit";
      damage: number;
      health: number;
      poke: string;
    }
  | {
      outcome: "caught";
      nextPoke: string;
      poke: string;
    };

export type WelcomePackInput = GamePlayer & {
  channel: string;
  poke: string;
};

export type EncounterEventInput = {
  channel: string;
  combo: number;
  critical: boolean;
  damage: number;
  eventType: "hit" | "caught";
  health: number;
  maxCombo: number;
  participants: number;
  poke: string;
  username: string;
};

export interface GameStore {
  // eslint-disable-next-line no-unused-vars
  ensureEncounter(_input: { channel: string; poke: string }): Promise<void>;
  // eslint-disable-next-line no-unused-vars
  attack(_input: AttackInput): Promise<AttackResult>;
  claimWelcomePack(
    // eslint-disable-next-line no-unused-vars
    _input: WelcomePackInput,
  ): Promise<{ granted: boolean; poke?: string }>;
  // eslint-disable-next-line no-unused-vars
  recordEncounterEvent(_input: EncounterEventInput): Promise<void>;
  // eslint-disable-next-line no-unused-vars
  getStatus(_channel: string): Promise<{ health: number; poke: string } | null>;
  getLastCatch(
    // eslint-disable-next-line no-unused-vars
    _channel: string,
  ): Promise<{ poke: string; username: string } | null>;
}

type GameDependencies = {
  getRandomPokemon: () => Promise<string>;
  rollDamage: () => number;
};

export type ComboSnapshot = {
  combo: number;
  maxCombo: number;
  participants: number;
};

type ComboState = ComboSnapshot & {
  lastAttackAt: number;
  users: Set<string>;
};

export class ComboTracker {
  private readonly channels = new Map<string, ComboState>();
  private readonly now: () => number;
  private readonly windowMs: number;

  constructor(now: () => number = Date.now, windowMs = 12_000) {
    this.now = now;
    this.windowMs = windowMs;
  }

  record(channel: string, username: string): ComboSnapshot {
    const key = channel.toLowerCase();
    const currentTime = this.now();
    const previous = this.channels.get(key);
    const active =
      previous && currentTime - previous.lastAttackAt <= this.windowMs;
    const users = active ? previous.users : new Set<string>();
    users.add(username.toLowerCase());
    const combo = active ? previous.combo + 1 : 1;
    const state: ComboState = {
      combo,
      maxCombo: active ? Math.max(previous.maxCombo, combo) : combo,
      participants: users.size,
      lastAttackAt: currentTime,
      users,
    };
    this.channels.set(key, state);
    return this.snapshot(state);
  }

  current(channel: string): ComboSnapshot {
    const state = this.channels.get(channel.toLowerCase());
    if (!state || this.now() - state.lastAttackAt > this.windowMs) {
      return { combo: 0, maxCombo: 0, participants: 0 };
    }
    return this.snapshot(state);
  }

  finish(channel: string): ComboSnapshot {
    const snapshot = this.current(channel);
    this.channels.delete(channel.toLowerCase());
    return snapshot;
  }

  private snapshot(state: ComboState): ComboSnapshot {
    return {
      combo: state.combo,
      maxCombo: state.maxCombo,
      participants: state.participants,
    };
  }
}

const defaultDependencies: GameDependencies = {
  getRandomPokemon: getRandomPokemonSpeciesName,
  rollDamage: () => Math.floor(Math.random() * 10) + 5,
};

export class PokemonGame {
  private readonly store: GameStore;
  private readonly appUrl: string;
  private readonly dependencies: GameDependencies;
  private readonly combos: ComboTracker;

  constructor(
    store: GameStore,
    appUrl: string,
    dependencies: GameDependencies = defaultDependencies,
    combos = new ComboTracker(),
  ) {
    this.store = store;
    this.appUrl = appUrl;
    this.dependencies = dependencies;
    this.combos = combos;
  }

  async initialize(channel: string) {
    await this.store.ensureEncounter({
      channel,
      poke: await this.dependencies.getRandomPokemon(),
    });
  }

  async handle(
    command: PokeCommand,
    client: tmi.Client,
    channel: string,
    player: GamePlayer,
  ) {
    if (command === "help") {
      await client.say(
        channel,
        "Pokitch: !poke attack | status | last | inventory | welcomepack",
      );
      return;
    }
    if (command === "status") {
      const status = await this.store.getStatus(channel);
      const combo = this.combos.current(channel).combo;
      await client.say(
        channel,
        status
          ? `Wild ${status.poke} has ${status.health}/50 HP. Team combo: ${combo}.`
          : "There is no active encounter right now.",
      );
      return;
    }
    if (command === "last") {
      const caught = await this.store.getLastCatch(channel);
      await client.say(
        channel,
        caught
          ? `Last catch: @${caught.username} caught ${caught.poke}.`
          : "No catches have been recorded in this channel yet.",
      );
      return;
    }
    if (command === "welcome-pack") {
      return this.welcomePack(client, channel, player);
    }
    if (command === "inventory") {
      return this.inventory(client, channel, player);
    }
    return this.attack(client, channel, player);
  }

  private async welcomePack(
    client: tmi.Client,
    channel: string,
    player: GamePlayer,
  ) {
    const poke = await this.dependencies.getRandomPokemon();
    const result = await this.store.claimWelcomePack({
      channel,
      poke,
      twitchId: player.twitchId,
      username: player.username,
    });

    if (!result.granted) {
      await client.say(
        channel,
        `@${player.username}, you already received a welcome pack.`,
      );
      return;
    }

    await client.say(
      channel,
      `@${player.username} received ${result.poke ?? poke} as a welcome pack!`,
    );
  }

  private async inventory(
    client: tmi.Client,
    channel: string,
    player: GamePlayer,
  ) {
    const url = new URL("/collections", this.appUrl);
    url.searchParams.set("mode", "user");
    url.searchParams.set("q", player.username);
    await client.say(
      channel,
      `@${player.username}'s collection: ${url.toString()}`,
    );
  }

  private async attack(
    client: tmi.Client,
    channel: string,
    player: GamePlayer,
  ) {
    const damage = this.dependencies.rollDamage();
    const result = await this.store.attack({
      channel,
      damage,
      nextPoke: await this.dependencies.getRandomPokemon(),
      twitchId: player.twitchId,
      username: player.username,
    });

    const combo = this.combos.record(channel, player.username);
    const event: EncounterEventInput = {
      channel,
      combo: combo.combo,
      critical: damage === 14,
      damage,
      eventType: result.outcome === "caught" ? "caught" : "hit",
      health: result.outcome === "caught" ? 0 : result.health,
      maxCombo: combo.maxCombo,
      participants: combo.participants,
      poke: result.poke,
      username: player.username,
    };

    try {
      await this.store.recordEncounterEvent(event);
    } catch (error) {
      console.error(`Encounter event failed in ${channel}:`, error);
    } finally {
      if (result.outcome === "caught") {
        this.combos.finish(channel);
      }
    }

    if (result.outcome === "caught") {
      await client.say(channel, `@${player.username} caught ${result.poke}!`);
      return;
    }

    return;
  }
}
