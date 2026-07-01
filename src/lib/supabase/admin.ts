import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import { getSupabaseSecretKey, getSupabaseUrl } from "./env";
import type { Database } from "./database.types";

export function createAdminClient() {
  return createSupabaseClient<Database>(
    getSupabaseUrl(),
    getSupabaseSecretKey(),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
