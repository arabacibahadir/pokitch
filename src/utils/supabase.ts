import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : new Proxy({} as any, {
        get(target, prop) {
          if (prop === "auth") {
            return new Proxy({} as any, {
              get(authTarget, authProp) {
                return () => {
                  throw new Error(
                    `Supabase auth method '${String(authProp)}' called but NEXT_PUBLIC_SUPABASE_URL is missing.`
                  );
                };
              },
            });
          }
          return () => {
            throw new Error(
              `Supabase client method '${String(prop)}' called but NEXT_PUBLIC_SUPABASE_URL is missing.`
            );
          };
        },
      });
