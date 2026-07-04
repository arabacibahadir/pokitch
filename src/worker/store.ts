import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  AttackInput,
  AttackResult,
  GameStore,
  WelcomePackInput,
} from "./game";

export class SupabaseGameStore implements GameStore {
  private readonly client: SupabaseClient;

  constructor(client: SupabaseClient) {
    this.client = client;
  }

  async ensureEncounter(input: { channel: string; poke: string }) {
    const { error } = await this.client.rpc("ensure_active_poke", {
      p_channel: input.channel,
      p_poke: input.poke,
    });

    if (error) {
      throw error;
    }
  }

  async getStatus(channel: string) {
    const { data, error } = await this.client
      .from("active_pokes")
      .select("health,poke")
      .eq("channel", channel)
      .maybeSingle();

    if (error) {
      throw error;
    }
    return data ? { health: data.health, poke: data.poke } : null;
  }

  async getLastCatch(channel: string) {
    const { data, error } = await this.client
      .from("collections")
      .select("poke,user")
      .eq("channel", channel)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw error;
    }
    return data ? { poke: data.poke, username: data.user } : null;
  }

  async attack(input: AttackInput): Promise<AttackResult> {
    const { data, error } = await this.client.rpc("process_poke_attack", {
      p_channel: input.channel,
      p_damage: input.damage,
      p_next_poke: input.nextPoke,
      p_twitch_id: input.twitchId,
      p_username: input.username,
    });

    if (error) {
      throw error;
    }

    return data as AttackResult;
  }

  async claimWelcomePack(
    input: WelcomePackInput,
  ): Promise<{ granted: boolean; poke?: string }> {
    const { data, error } = await this.client.rpc("claim_welcome_pack", {
      p_channel: input.channel,
      p_poke: input.poke,
      p_twitch_id: input.twitchId,
      p_username: input.username,
    });

    if (error) {
      throw error;
    }

    return data as { granted: boolean; poke?: string };
  }
}
