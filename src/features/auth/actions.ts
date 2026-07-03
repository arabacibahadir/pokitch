"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getAppOrigin, getSafeNextPath } from "./origin";

export async function signInWithTwitch(formData?: FormData) {
  const next = getSafeNextPath(String(formData?.get("next") ?? "/"));
  const callbackUrl = new URL("/auth/callback", getAppOrigin());
  if (next !== "/") callbackUrl.searchParams.set("next", next);
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "twitch",
    options: {
      redirectTo: callbackUrl.toString(),
    },
  });

  if (error || !data.url) {
    redirect(`${next === "/" ? "/" : next}?authError=oauth`);
  }

  redirect(data.url);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
