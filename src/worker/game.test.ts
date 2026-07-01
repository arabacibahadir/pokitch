import type tmi from "tmi.js";
import { describe, expect, it } from "vitest";

import { ComboTracker, PokemonGame, type GameStore } from "./game";

describe("ComboTracker", () => {
  it("builds a visual combo within twelve seconds", () => {
    let now = 1_000;
    const combos = new ComboTracker(() => now);

    expect(combos.record("channel", "viewer-1")).toEqual({
      combo: 1,
      maxCombo: 1,
      participants: 1,
    });
    now += 12_000;
    expect(combos.record("channel", "viewer-2")).toEqual({
      combo: 2,
      maxCombo: 2,
      participants: 2,
    });
  });

  it("resets after the window and clears after a catch", () => {
    let now = 1_000;
    const combos = new ComboTracker(() => now);
    combos.record("channel", "viewer-1");
    now += 12_001;

    expect(combos.record("channel", "viewer-2").combo).toBe(1);
    expect(combos.finish("channel")).toEqual({
      combo: 1,
      maxCombo: 1,
      participants: 1,
    });
    expect(combos.current("channel")).toEqual({
      combo: 0,
      maxCombo: 0,
      participants: 0,
    });
  });
});

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
  it("records a critical hit event without writing to chat", async () => {
    const events: unknown[] = [];
    const store = {
      ensureEncounter: async () => undefined,
      attack: async () => ({
        outcome: "hit" as const,
        damage: 14,
        health: 36,
        poke: "pikachu",
      }),
      claimWelcomePack: async () => ({ granted: false }),
      recordEncounterEvent: async (
        event: Parameters<GameStore["recordEncounterEvent"]>[0],
      ) => {
        events.push(event);
      },
      getStatus: async () => null,
      getLastCatch: async () => null,
    } as GameStore;
    const { client, messages } = createChatClient();
    const game = new PokemonGame(store, "https://pokitch.app", {
      getRandomPokemon: async () => "eevee",
      rollDamage: () => 14,
    });

    await game.handle("attack", client, "streamer", {
      twitchId: "1234",
      username: "viewer",
    });

    expect(messages).toEqual([]);
    expect(events).toEqual([
      {
        channel: "streamer",
        combo: 1,
        critical: true,
        damage: 14,
        eventType: "hit",
        health: 36,
        maxCombo: 1,
        participants: 1,
        poke: "pikachu",
        username: "viewer",
      },
    ]);
  });

  it("records a catch summary and still announces the catch", async () => {
    const events: unknown[] = [];
    const store = {
      ensureEncounter: async () => undefined,
      attack: async () => ({
        outcome: "caught" as const,
        poke: "mew",
        nextPoke: "eevee",
      }),
      claimWelcomePack: async () => ({ granted: false }),
      recordEncounterEvent: async (
        event: Parameters<GameStore["recordEncounterEvent"]>[0],
      ) => {
        events.push(event);
      },
      getStatus: async () => null,
      getLastCatch: async () => null,
    } as GameStore;
    const { client, messages } = createChatClient();
    const game = new PokemonGame(store, "https://pokitch.app", {
      getRandomPokemon: async () => "eevee",
      rollDamage: () => 9,
    });

    await game.handle("attack", client, "streamer", {
      twitchId: "1234",
      username: "viewer",
    });

    expect(events).toEqual([
      expect.objectContaining({
        eventType: "caught",
        health: 0,
        poke: "mew",
        username: "viewer",
        participants: 1,
        maxCombo: 1,
      }),
    ]);
    expect(messages).toEqual([
      { channel: "streamer", message: "@viewer caught mew!" },
    ]);
  });

  it("answers help, status, and last-catch commands on demand", async () => {
    const store = {
      ensureEncounter: async () => undefined,
      attack: async () => ({
        outcome: "hit" as const,
        damage: 5,
        health: 45,
        poke: "pikachu",
      }),
      claimWelcomePack: async () => ({ granted: false }),
      recordEncounterEvent: async () => undefined,
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
        message: "Wild pikachu has 32/50 HP. Team combo: 0.",
      },
      {
        channel: "streamer",
        message: "Last catch: @winner caught mew.",
      },
    ]);
  });

  it("does not fail gameplay when the visual event cannot be stored", async () => {
    const store = {
      ensureEncounter: async () => undefined,
      attack: async () => ({
        outcome: "hit" as const,
        damage: 8,
        health: 42,
        poke: "pikachu",
      }),
      claimWelcomePack: async () => ({ granted: false }),
      recordEncounterEvent: async () => {
        throw new Error("realtime unavailable");
      },
      getStatus: async () => null,
      getLastCatch: async () => null,
    } as GameStore;
    const { client } = createChatClient();
    const game = new PokemonGame(store, "https://pokitch.app", {
      getRandomPokemon: async () => "eevee",
      rollDamage: () => 8,
    });

    await expect(
      game.handle("attack", client, "streamer", {
        twitchId: "1234",
        username: "viewer",
      }),
    ).resolves.toBeUndefined();
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
        };
      },
      claimWelcomePack: async () => ({ granted: false }),
      recordEncounterEvent: async () => undefined,
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
    expect(messages).toEqual([]);
  });

  it("announces a caught Pokemon returned by the atomic store operation", async () => {
    const store: GameStore = {
      ensureEncounter: async () => undefined,
      attack: async () => ({
        outcome: "caught",
        poke: "mew",
        nextPoke: "eevee",
      }),
      claimWelcomePack: async () => ({ granted: false }),
      recordEncounterEvent: async () => undefined,
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

    expect(messages).toEqual([
      { channel: "streamer", message: "@viewer caught mew!" },
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
      }),
      claimWelcomePack: async (input) => {
        claims.push(input);
        return { granted: true, poke: input.poke };
      },
      recordEncounterEvent: async () => undefined,
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
      }),
      claimWelcomePack: async () => ({ granted: false }),
      recordEncounterEvent: async () => undefined,
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
      }),
      claimWelcomePack: async () => ({ granted: false }),
      recordEncounterEvent: async () => undefined,
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
