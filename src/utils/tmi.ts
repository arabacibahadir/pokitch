import tmi from "tmi.js";

export const tmiClient = tmi.Client({
  identity: {
    username: process.env.NEXT_PUBLIC_TWITCH_BOT_USERNAME,
    password: process.env.NEXT_PUBLIC_TWITCH_BOT_OAUTH,
  },
});
