import { createServerClient } from "@supabase/ssr";
import type { GetServerSidePropsContext } from "next";
import type { NextApiRequest, NextApiResponse } from "next";

function parseCookieHeader(cookieHeader: string | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  if (!cookieHeader) return out;
  for (const part of cookieHeader.split(";")) {
    const [name, ...v] = part.trim().split("=");
    if (name) out[name] = v.join("=").trim();
  }
  return out;
}

function serializeCookie(
  name: string,
  value: string,
  options: { path?: string; maxAge?: number; domain?: string; secure?: boolean; httpOnly?: boolean; sameSite?: "lax" | "strict" | "none" } = {}
): string {
  const parts = [`${name}=${value}`];
  if (options.path) parts.push(`Path=${options.path}`);
  if (options.maxAge !== undefined) parts.push(`Max-Age=${options.maxAge}`);
  if (options.domain) parts.push(`Domain=${options.domain}`);
  if (options.secure) parts.push("Secure");
  if (options.httpOnly) parts.push("HttpOnly");
  if (options.sameSite) parts.push(`SameSite=${options.sameSite}`);
  return parts.join("; ");
}

export function createServerSupabaseClient(ctx: GetServerSidePropsContext) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const cookieHeader = ctx.req.headers.cookie;
  const parsed = parseCookieHeader(cookieHeader);

  return createServerClient(url, key, {
    cookies: {
      get(name: string) {
        return parsed[name];
      },
      set(name: string, value: string, options: Record<string, unknown>) {
        const cookie = serializeCookie(name, value, options as Parameters<typeof serializeCookie>[2]);
        const setCookie = ctx.res.getHeader("Set-Cookie") as string | string[] | undefined;
        const arr = Array.isArray(setCookie) ? setCookie : setCookie ? [setCookie] : [];
        arr.push(cookie);
        ctx.res.setHeader("Set-Cookie", arr);
      },
      remove(name: string, options: Record<string, unknown>) {
        const cookie = serializeCookie(name, "", { ...(options as object), maxAge: 0 });
        const setCookie = ctx.res.getHeader("Set-Cookie") as string | string[] | undefined;
        const arr = Array.isArray(setCookie) ? setCookie : setCookie ? [setCookie] : [];
        arr.push(cookie);
        ctx.res.setHeader("Set-Cookie", arr);
      },
    },
  });
}

export function createServerSupabaseClientFromApi(req: NextApiRequest, res: NextApiResponse) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const cookieHeader = req.headers.cookie;
  const parsed = parseCookieHeader(cookieHeader);

  return createServerClient(url, key, {
    cookies: {
      get(name: string) {
        return parsed[name];
      },
      set(name: string, value: string, options: Record<string, unknown>) {
        const cookie = serializeCookie(name, value, options as Parameters<typeof serializeCookie>[2]);
        const setCookie = res.getHeader("Set-Cookie") as string | string[] | undefined;
        const arr = Array.isArray(setCookie) ? setCookie : setCookie ? [setCookie] : [];
        arr.push(cookie);
        res.setHeader("Set-Cookie", arr);
      },
      remove(name: string, options: Record<string, unknown>) {
        const cookie = serializeCookie(name, "", { ...(options as object), maxAge: 0 });
        const setCookie = res.getHeader("Set-Cookie") as string | string[] | undefined;
        const arr = Array.isArray(setCookie) ? setCookie : setCookie ? [setCookie] : [];
        arr.push(cookie);
        res.setHeader("Set-Cookie", arr);
      },
    },
  });
}
