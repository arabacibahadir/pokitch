"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getAppOrigin } from "./origin";

export async function signInWithTwitch() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "twitch",
    options: {
      redirectTo: `${getAppOrigin()}/auth/callback`,
    },
  });

  if (error || !data.url) {
    redirect("/?authError=oauth");
  }

  redirect(data.url);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
