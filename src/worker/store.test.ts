import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";

import { SupabaseGameStore } from "./store";

describe("SupabaseGameStore", () => {
  it("reads current status and the latest channel catch", async () => {
    const requests: Array<{ table: string; filters: unknown[] }> = [];
    const rows = {
      active_pokes: { data: { health: 30, poke: "pikachu" }, error: null },
      collections: { data: { poke: "mew", user: "winner" }, error: null },
    };
    const client = {
      from: (table: keyof typeof rows) => {
        const filters: unknown[] = [];
        const builder = {
          select: () => builder,
          eq: (column: string, value: string) => {
            filters.push({ column, value });
            return builder;
          },
          order: () => builder,
          limit: () => builder,
          maybeSingle: async () => {
            requests.push({ table, filters });
            return rows[table];
          },
        };
        return builder;
      },
    } as unknown as SupabaseClient;
    const store = new SupabaseGameStore(client);

    await expect(store.getStatus("streamer")).resolves.toEqual({
      health: 30,
      poke: "pikachu",
    });
    await expect(store.getLastCatch("streamer")).resolves.toEqual({
      poke: "mew",
      username: "winner",
    });
    expect(requests).toEqual([
      {
        table: "active_pokes",
        filters: [{ column: "channel", value: "streamer" }],
      },
      {
        table: "collections",
        filters: [{ column: "channel", value: "streamer" }],
      },
    ]);
  });

  it("initializes an encounter with one idempotent RPC", async () => {
    const calls: Array<{ name: string; params: unknown }> = [];
    const client = {
      rpc: async (name: string, params: unknown) => {
        calls.push({ name, params });
        return { data: null, error: null };
      },
    } as unknown as SupabaseClient;
    const store = new SupabaseGameStore(client);

    await store.ensureEncounter({ channel: "streamer", poke: "pikachu" });

    expect(calls).toEqual([
      {
        name: "ensure_active_poke",
        params: { p_channel: "streamer", p_poke: "pikachu" },
      },
    ]);
  });

  it("maps one attack RPC call to the game result", async () => {
    const calls: Array<{ name: string; params: unknown }> = [];
    const client = {
      rpc: async (name: string, params: unknown) => {
        calls.push({ name, params });
        return {
          data: {
            outcome: "hit",
            damage: 8,
            health: 42,
            poke: "pikachu",
            lastEventKind: "hit",
            lastEventPlayer: "viewer",
            lastEventDamage: 8,
            lastEventAt: "2026-07-03T12:00:00.000Z",
          },
          error: null,
        };
      },
    } as unknown as SupabaseClient;
    const store = new SupabaseGameStore(client);

    const result = await store.attack({
      channel: "streamer",
      damage: 8,
      nextPoke: "eevee",
      twitchId: "1234",
      username: "viewer",
    });

    expect(calls).toEqual([
      {
        name: "process_poke_attack",
        params: {
          p_channel: "streamer",
          p_damage: 8,
          p_next_poke: "eevee",
          p_twitch_id: "1234",
          p_username: "viewer",
        },
      },
    ]);
    expect(result).toEqual({
      outcome: "hit",
      damage: 8,
      health: 42,
      poke: "pikachu",
      lastEventKind: "hit",
      lastEventPlayer: "viewer",
      lastEventDamage: 8,
      lastEventAt: "2026-07-03T12:00:00.000Z",
    });
  });

  it("throws instead of acknowledging a failed gameplay transaction", async () => {
    const client = {
      rpc: async () => ({
        data: null,
        error: new Error("database unavailable"),
      }),
    } as unknown as SupabaseClient;
    const store = new SupabaseGameStore(client);

    await expect(
      store.claimWelcomePack({
        channel: "streamer",
        poke: "bulbasaur",
        twitchId: "1234",
        username: "viewer",
      }),
    ).rejects.toThrow("database unavailable");
  });

  it("maps a welcome-pack RPC result", async () => {
    const client = {
      rpc: async () => ({
        data: { granted: true, poke: "bulbasaur" },
        error: null,
      }),
    } as unknown as SupabaseClient;
    const store = new SupabaseGameStore(client);

    await expect(
      store.claimWelcomePack({
        channel: "streamer",
        poke: "bulbasaur",
        twitchId: "1234",
        username: "viewer",
      }),
    ).resolves.toEqual({ granted: true, poke: "bulbasaur" });
  });
});
