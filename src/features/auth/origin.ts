type RuntimeEnv = Record<string, string | undefined>;

export function getAppOrigin(env: RuntimeEnv = process.env) {
  const configured = env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");

  if (configured) {
    const url = new URL(configured);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new Error("NEXT_PUBLIC_APP_URL must use HTTP or HTTPS");
    }
    return url.origin;
  }

  if (env.NODE_ENV === "production") {
    throw new Error("NEXT_PUBLIC_APP_URL is required in production");
  }

  return `http://localhost:${env.PORT ?? 3000}`;
}

export function getSafeNextPath(value: string | null) {
  return value === "/gift" || value === "/trade" ? value : "/";
}
