import { createServer } from "node:http";

import tmi from "tmi.js";

import { createAdminClient } from "@/lib/supabase/admin";

import {
  ChannelQueue,
  CommandGate,
  getChannelSyncPlan,
  parseGamePlayer,
  parsePokeCommand,
} from "./commands";
import { PokemonGame } from "./game";
import { SupabaseGameStore } from "./store";

const username = process.env.TWITCH_BOT_USERNAME;
const password = process.env.TWITCH_BOT_OAUTH;
const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
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
let syncTimer: NodeJS.Timeout | undefined;

async function syncChannels() {
  const { data, error } = await supabase
    .from("accounts")
    .select("channel")
    .not("channel", "is", null);

  if (error) {
    throw error;
  }

  const desiredChannels = (data ?? []).map((row) => String(row.channel));
  const plan = getChannelSyncPlan(desiredChannels, client.getChannels());

  for (const channel of plan.part) {
    await client.part(channel);
  }

  for (const channel of plan.join) {
    await client.join(channel);
    await game.initialize(channel);
  }
}

client.on("connected", () => {
  connected = true;
  console.log("Pokitch bot connected to Twitch.");
});

client.on("disconnected", (reason) => {
  connected = false;
  console.error("Pokitch bot disconnected:", reason);
});

client.on("message", (rawChannel, tags, message, self) => {
  if (self) {
    return;
  }

  const command = parsePokeCommand(message);
  const player = parseGamePlayer(tags);
  if (!command || !player) {
    return;
  }

  const channel = rawChannel.replace(/^#/, "").toLowerCase();
  if (!commandGate.consume(command, channel, player.twitchId)) {
    return;
  }

  void queue
    .run(channel, () => game.handle(command, client, channel, player))
    .catch((error) => console.error(`Command failed in ${channel}:`, error));
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
      }),
    );
});

async function main() {
  healthServer.listen(healthPort, "0.0.0.0");
  await client.connect();
  await syncChannels();
  syncTimer = setInterval(() => {
    void syncChannels().catch((error) =>
      console.error("Channel synchronization failed:", error),
    );
  }, 60_000);
}

async function shutdown() {
  if (syncTimer) {
    clearInterval(syncTimer);
  }
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
