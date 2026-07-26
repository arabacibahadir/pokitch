import type tmi from "tmi.js";

import {
  type ChannelQueue,
  type CommandGate,
  parseGamePlayer,
  parsePokeCommand,
} from "./commands";
import type { PokemonGame } from "./game";

type ChatMessageInput = {
  rawChannel: string;
  tags: {
    username?: string;
    "user-id"?: string;
  };
  message: string;
  self: boolean;
  client: tmi.Client;
  commandGate: CommandGate;
  game: PokemonGame;
  queue: ChannelQueue;
};

export async function handleChatMessage({
  rawChannel,
  tags,
  message,
  self,
  client,
  commandGate,
  game,
  queue,
}: ChatMessageInput) {
  if (self) return;

  const command = parsePokeCommand(message);
  const player = parseGamePlayer(tags);
  if (!command || !player) return;

  const channel = rawChannel.replace(/^#/, "").toLowerCase();
  if (!commandGate.consume(command, channel, player.twitchId)) return;

  await queue.run(channel, () =>
    game.handle(command, client, channel, player),
  );
}
