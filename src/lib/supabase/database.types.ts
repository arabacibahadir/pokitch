export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type Table<Row, Insert = Partial<Row>, Update = Partial<Row>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      accounts: Table<{
        channel: string;
        created_at: string;
        id: string;
        twitch_id: string;
        updated_at: string;
        user_id: string;
      }>;
      active_pokes: Table<{
        channel: string;
        created_at: string;
        health: number;
        id: string;
        last_catch_at: string | null;
        last_catch_player: string | null;
        last_catch_poke: string | null;
        last_event_at: string | null;
        last_event_damage: number | null;
        last_event_kind: string | null;
        last_event_player: string | null;
        poke: string;
        updated_at: string;
      }>;
      collections: Table<{
        channel: string;
        created_at: string;
        id: string;
        owner_twitch_id: string | null;
        poke: string;
        updated_at: string;
        user: string;
      }>;
      trade_reservations: Table<{
        collection_id: string;
        created_at: string;
        reservation_role: "offered" | "requested";
        trade_id: string;
      }>;
      trades: Table<{
        created_at: string;
        id: string;
        poke: string;
        pokeid: string;
        recipient: string;
        recipient_twitch_id: string;
        recipientpoke: string;
        recipientpokeid: string;
        sender_twitch_id: string;
        user: string;
      }>;
      welcome_pack_claims: Table<{
        channel: string;
        claimed_at: string;
        collection_id: string;
        twitch_id: string;
      }>;
    };
    Views: Record<string, never>;
    Functions: {
      claim_welcome_pack: {
        Args: {
          p_channel: string;
          p_poke: string;
          p_twitch_id: string;
          p_username: string;
        };
        Returns: Json;
      };
      create_trade_offer: {
        Args: {
          p_offered_collection_id: string;
          p_requested_collection_id: string;
        };
        Returns: string;
      };
      ensure_active_poke: {
        Args: { p_channel: string; p_poke: string };
        Returns: undefined;
      };
      gift_pokemon: {
        Args: { p_collection_id: string; p_recipient_twitch_id: string };
        Returns: undefined;
      };
      get_overlay_channel: {
        Args: { p_account_id: string };
        Returns: string | null;
      };
      list_collectors: {
        Args: {
          p_exclude_twitch_id: string;
          p_limit?: number;
          p_query?: string;
        };
        Returns: { twitch_id: string; username: string }[];
      };
      process_poke_attack: {
        Args: {
          p_channel: string;
          p_damage: number;
          p_next_poke: string;
          p_twitch_id: string;
          p_username: string;
        };
        Returns: Json;
      };
      resolve_trade_offer: {
        Args: { p_decision: string; p_trade_id: string };
        Returns: undefined;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
