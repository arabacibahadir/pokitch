import type tmi from "tmi.js";
import { describe, expect, it, vi } from "vitest";

import { ChannelQueue, CommandGate } from "./commands";
import type { PokemonGame } from "./game";
import { handleChatMessage } from "./message-handler";

describe("handleChatMessage", () => {
  it("silently drops attacks repeated during the viewer cooldown", async () => {
    const say = vi.fn().mockResolvedValue(undefined);
    const handle = vi.fn().mockResolvedValue(undefined);
    const client = { say } as unknown as tmi.Client;
    const game = { handle } as unknown as PokemonGame;
    const commandGate = new CommandGate(() => 1_000);
    const queue = new ChannelQueue();
    const message = {
      rawChannel: "#streamer",
      tags: { username: "Viewer", "user-id": "1234" },
      message: "!poke attack",
      self: false,
    };

    await handleChatMessage({
      ...message,
      client,
      commandGate,
      game,
      queue,
    });
    await handleChatMessage({
      ...message,
      client,
      commandGate,
      game,
      queue,
    });

    expect(handle).toHaveBeenCalledTimes(1);
    expect(say).not.toHaveBeenCalled();
  });

  it("ignores self messages and unrelated chat without entering the game queue", async () => {
    const handle = vi.fn().mockResolvedValue(undefined);
    const dependencies = {
      client: {} as tmi.Client,
      commandGate: new CommandGate(() => 1_000),
      game: { handle } as unknown as PokemonGame,
      queue: new ChannelQueue(),
    };

    await handleChatMessage({
      ...dependencies,
      rawChannel: "#streamer",
      tags: { username: "Viewer", "user-id": "1234" },
      message: "!poke attack",
      self: true,
    });
    await handleChatMessage({
      ...dependencies,
      rawChannel: "#streamer",
      tags: { username: "Viewer", "user-id": "1234" },
      message: "hello",
      self: false,
    });

    expect(handle).not.toHaveBeenCalled();
  });
});
