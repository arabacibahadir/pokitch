import type tmi from "tmi.js";
import { describe, expect, it } from "vitest";

import { PokemonGame, type GameStore } from "./game";

function createChatClient() {
  const messages: Array<{ channel: string; message: string }> = [];
  const client = {
    say: async (channel: string, message: string) => {
      messages.push({ channel, message });
    },
  } as unknown as tmi.Client;

  return { client, messages };
}

describe("PokemonGame", () => {
  it("answers help, status, and last-catch commands on demand", async () => {
    const store = {
      ensureEncounter: async () => undefined,
      attack: async () => ({
        outcome: "hit" as const,
        damage: 5,
        health: 45,
        poke: "pikachu",
        lastEventKind: "hit" as const,
        lastEventPlayer: "viewer",
        lastEventDamage: 5,
        lastEventAt: "2026-07-03T12:00:00.000Z",
      }),
      claimWelcomePack: async () => ({ granted: false }),
      getStatus: async () => ({ health: 32, poke: "pikachu" }),
      getLastCatch: async () => ({ poke: "mew", username: "winner" }),
    } as GameStore;
    const { client, messages } = createChatClient();
    const game = new PokemonGame(store, "https://pokitch.app");
    const player = { twitchId: "1234", username: "viewer" };

    await game.handle("help", client, "streamer", player);
    await game.handle("status", client, "streamer", player);
    await game.handle("last", client, "streamer", player);

    expect(messages).toEqual([
      {
        channel: "streamer",
        message:
          "Pokitch: !poke attack | status | last | inventory | welcomepack",
      },
      {
        channel: "streamer",
        message: "Wild pikachu has 32/50 HP.",
      },
      {
        channel: "streamer",
        message: "Last catch: @winner caught mew.",
      },
    ]);
  });

  it("processes an attack atomically through the game store", async () => {
    const attacks: Parameters<GameStore["attack"]>[0][] = [];
    const store: GameStore = {
      ensureEncounter: async () => undefined,
      attack: async (input) => {
        attacks.push(input);
        return {
          outcome: "hit",
          damage: input.damage,
          health: 41,
          poke: "pikachu",
          lastEventKind: "hit",
          lastEventPlayer: input.username,
          lastEventDamage: input.damage,
          lastEventAt: "2026-07-03T12:00:00.000Z",
        };
      },
      claimWelcomePack: async () => ({ granted: false }),
      getStatus: async () => null,
      getLastCatch: async () => null,
    };
    const { client, messages } = createChatClient();
    const game = new PokemonGame(store, "https://pokitch.app", {
      getRandomPokemon: async () => "eevee",
      rollDamage: () => 9,
    });

    await game.handle("attack", client, "streamer", {
      twitchId: "1234",
      username: "viewer",
    });

    expect(attacks).toEqual([
      {
        channel: "streamer",
        damage: 9,
        nextPoke: "eevee",
        twitchId: "1234",
        username: "viewer",
      },
    ]);
    // Hits stay silent in chat; the overlay renders the combat event instead.
    expect(messages).toEqual([]);
  });

  it("announces a caught Pokemon in chat", async () => {
    const store: GameStore = {
      ensureEncounter: async () => undefined,
      attack: async () => ({
        outcome: "caught",
        poke: "mew",
        nextPoke: "eevee",
        lastEventKind: "caught",
        lastEventPlayer: "viewer",
        lastEventAt: "2026-07-03T12:00:00.000Z",
        lastCatchPoke: "mew",
        lastCatchPlayer: "viewer",
      }),
      claimWelcomePack: async () => ({ granted: false }),
      getStatus: async () => null,
      getLastCatch: async () => null,
    };
    const { client, messages } = createChatClient();
    const game = new PokemonGame(store, "https://pokitch.app", {
      getRandomPokemon: async () => "eevee",
      rollDamage: () => 9,
    });

    await game.handle("attack", client, "streamer", {
      twitchId: "1234",
      username: "viewer",
    });

    // The catch is surfaced on the overlay and announced in chat.
    expect(messages).toEqual([
      {
        channel: "streamer",
        message: "🎉 @viewer caught Mew! A wild Eevee has appeared.",
      },
    ]);
  });

  it("claims a welcome pack once using the stable Twitch identity", async () => {
    const claims: Parameters<GameStore["claimWelcomePack"]>[0][] = [];
    const store: GameStore = {
      ensureEncounter: async () => undefined,
      attack: async () => ({
        outcome: "hit",
        damage: 5,
        health: 45,
        poke: "pikachu",
        lastEventKind: "hit",
        lastEventPlayer: "viewer",
        lastEventDamage: 5,
        lastEventAt: "2026-07-03T12:00:00.000Z",
      }),
      claimWelcomePack: async (input) => {
        claims.push(input);
        return { granted: true, poke: input.poke };
      },
      getStatus: async () => null,
      getLastCatch: async () => null,
    };
    const { client, messages } = createChatClient();
    const game = new PokemonGame(store, "https://pokitch.app", {
      getRandomPokemon: async () => "bulbasaur",
      rollDamage: () => 5,
    });

    await game.handle("welcome-pack", client, "streamer", {
      twitchId: "1234",
      username: "viewer",
    });

    expect(claims).toEqual([
      {
        channel: "streamer",
        poke: "bulbasaur",
        twitchId: "1234",
        username: "viewer",
      },
    ]);
    expect(messages).toEqual([
      {
        channel: "streamer",
        message: "@viewer received bulbasaur as a welcome pack!",
      },
    ]);
  });

  it("reports an already claimed welcome pack without inserting another", async () => {
    const store: GameStore = {
      ensureEncounter: async () => undefined,
      attack: async () => ({
        outcome: "hit",
        damage: 5,
        health: 45,
        poke: "pikachu",
        lastEventKind: "hit",
        lastEventPlayer: "viewer",
        lastEventDamage: 5,
        lastEventAt: "2026-07-03T12:00:00.000Z",
      }),
      claimWelcomePack: async () => ({ granted: false }),
      getStatus: async () => null,
      getLastCatch: async () => null,
    };
    const { client, messages } = createChatClient();
    const game = new PokemonGame(store, "https://pokitch.app", {
      getRandomPokemon: async () => "bulbasaur",
      rollDamage: () => 5,
    });

    await game.handle("welcome-pack", client, "streamer", {
      twitchId: "1234",
      username: "viewer",
    });

    expect(messages).toEqual([
      {
        channel: "streamer",
        message: "@viewer, you already received a welcome pack.",
      },
    ]);
  });

  it("initializes a channel through an idempotent store operation", async () => {
    const encounters: Array<{ channel: string; poke: string }> = [];
    const store: GameStore = {
      ensureEncounter: async (input) => {
        encounters.push(input);
      },
      attack: async () => ({
        outcome: "hit",
        damage: 5,
        health: 45,
        poke: "pikachu",
        lastEventKind: "hit",
        lastEventPlayer: "viewer",
        lastEventDamage: 5,
        lastEventAt: "2026-07-03T12:00:00.000Z",
      }),
      claimWelcomePack: async () => ({ granted: false }),
      getStatus: async () => null,
      getLastCatch: async () => null,
    };
    const game = new PokemonGame(store, "https://pokitch.app", {
      getRandomPokemon: async () => "squirtle",
      rollDamage: () => 5,
    });

    await game.initialize("streamer");

    expect(encounters).toEqual([{ channel: "streamer", poke: "squirtle" }]);
  });
});
