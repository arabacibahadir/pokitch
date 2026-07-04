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
      lastEventKind: "hit";
      lastEventPlayer: string;
      lastEventDamage: number;
      lastEventAt: string;
    }
  | {
      outcome: "caught";
      nextPoke: string;
      poke: string;
      lastEventKind: "caught";
      lastEventPlayer: string;
      lastEventAt: string;
      lastCatchPoke: string;
      lastCatchPlayer: string;
    };

export type WelcomePackInput = GamePlayer & {
  channel: string;
  poke: string;
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

const defaultDependencies: GameDependencies = {
  getRandomPokemon: getRandomPokemonSpeciesName,
  rollDamage: () => Math.floor(Math.random() * 10) + 5,
};

export class PokemonGame {
  private readonly store: GameStore;
  private readonly appUrl: string;
  private readonly dependencies: GameDependencies;

  constructor(
    store: GameStore,
    appUrl: string,
    dependencies: GameDependencies = defaultDependencies,
  ) {
    this.store = store;
    this.appUrl = appUrl;
    this.dependencies = dependencies;
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
      await client.say(
        channel,
        status
          ? `Wild ${status.poke} has ${status.health}/50 HP.`
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
    // Combat outcomes (hit damage) are silent in chat and rendered on the OBS overlay,
    // but successful catches are announced to celebrate the capture.
    const result = await this.store.attack({
      channel,
      damage,
      nextPoke: await this.dependencies.getRandomPokemon(),
      twitchId: player.twitchId,
      username: player.username,
    });

    if (result.outcome === "caught") {
      const caughtPoke = result.poke.charAt(0).toUpperCase() + result.poke.slice(1);
      const nextPoke = result.nextPoke.charAt(0).toUpperCase() + result.nextPoke.slice(1);
      await client.say(
        channel,
        `🎉 @${player.username} caught ${caughtPoke}! A wild ${nextPoke} has appeared.`
      );
    }
  }
}
