import tmi from "tmi.js";

export const tmiClient = tmi.Client({ connection: { secure: true } });
