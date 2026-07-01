import { cache } from "react";

import { createClient } from "@/lib/supabase/server";

export type Account = {
  id: string;
  user_id: string;
  twitch_id: string;
  channel: string;
};

export const getCurrentAccount = cache(async (): Promise<Account | null> => {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (!userId) {
    return null;
  }

  const { data, error } = await supabase
    .from("accounts")
    .select("id,user_id,twitch_id,channel")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as Account | null;
});
