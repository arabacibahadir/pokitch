export function getSupabasePublicEnv() {
  const url = getSupabaseUrl();
  const publishableKey = (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )?.trim();

  if (!url || !publishableKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY are required",
    );
  }

  return { url, publishableKey };
}

export function getSupabaseUrl() {
  const url = (
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  )?.trim();

  if (!url) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is required");
  }

  return url;
}

export function getSupabaseSecretKey() {
  const secretKey = (
    process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
  )?.trim();

  if (!secretKey) {
    throw new Error("SUPABASE_SECRET_KEY is required");
  }

  return secretKey;
}
