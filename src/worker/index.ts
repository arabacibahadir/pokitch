import { createServer } from "node:http";

import tmi from "tmi.js";

import { getAppOrigin } from "@/features/auth/origin";
import { createAdminClient } from "@/lib/supabase/admin";

import { ChannelSynchronizer } from "./channel-sync";
import { ChannelQueue, CommandGate } from "./commands";
import { PokemonGame } from "./game";
import { handleChatMessage } from "./message-handler";
import { SupabaseGameStore } from "./store";

const username = process.env.TWITCH_BOT_USERNAME;
const password = process.env.TWITCH_BOT_OAUTH;
const appUrl = getAppOrigin();
const healthPort = Number(process.env.WORKER_HEALTH_PORT ?? 3001);

if (!username || !password) {
  throw new Error("TWITCH_BOT_USERNAME and TWITCH_BOT_OAUTH are required");
}

const supabase = createAdminClient();
const client = tmi.Client({
  identity: { username, password },
  connection: { reconnect: true, secure: true },
});
const commandGate = new CommandGate();
const queue = new ChannelQueue();
const store = new SupabaseGameStore(supabase);
const game = new PokemonGame(store, appUrl);

let connected = false;
const channelSynchronizer = new ChannelSynchronizer({
  loadDesiredChannels: async () => {
    const { data, error } = await supabase
      .from("accounts")
      .select("channel")
      .not("channel", "is", null);

    if (error) throw error;
    return (data ?? []).map((row) => String(row.channel));
  },
  getJoinedChannels: () => client.getChannels(),
  join: async (channel) => {
    await client.join(channel);
  },
  part: async (channel) => {
    await client.part(channel);
  },
  initialize: (channel) => game.initialize(channel),
});

const accountChanges = supabase
  .channel("worker-account-changes")
  .on(
    "postgres_changes",
    { event: "*", schema: "public", table: "accounts" },
    () => channelSynchronizer.schedule(),
  )
  .subscribe((status) => {
    void channelSynchronizer
      .handleSubscriptionStatus(status)
      .catch((error) =>
        console.error("Account subscription synchronization failed:", error),
      );
  });

client.on("connected", () => {
  connected = true;
  console.log("Pokitch bot connected to Twitch.");
});

client.on("disconnected", (reason) => {
  connected = false;
  console.error("Pokitch bot disconnected:", reason);
});

client.on("message", (rawChannel, tags, message, self) => {
  void handleChatMessage({
    rawChannel,
    tags,
    message,
    self,
    client,
    commandGate,
    game,
    queue,
  })
    .catch((error) => console.error(`Command failed in ${rawChannel}:`, error));
});

const healthServer = createServer((request, response) => {
  if (request.url !== "/health") {
    response.writeHead(404).end();
    return;
  }

  response
    .writeHead(connected ? 200 : 503, { "Content-Type": "application/json" })
    .end(
      JSON.stringify({
        connected,
        channels: client.getChannels().length,
        channelSync: channelSynchronizer.getHealth(),
      }),
    );
});

async function main() {
  healthServer.listen(healthPort, "0.0.0.0");
  await client.connect();
  await channelSynchronizer.start();
}

async function shutdown() {
  channelSynchronizer.stop();
  await supabase.removeChannel(accountChanges).catch(() => undefined);
  healthServer.close();
  await client.disconnect().catch(() => undefined);
  process.exit(0);
}

process.on("SIGTERM", () => void shutdown());
process.on("SIGINT", () => void shutdown());

void main().catch((error) => {
  console.error("Pokitch bot failed to start:", error);
  process.exit(1);
});
