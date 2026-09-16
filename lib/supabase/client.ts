import { createBrowserClient } from "@supabase/ssr";

export function createBrowserSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error("Authentication isn't configured yet. Add the Supabase URL and anonymous key to .env.local.");
  }
  return createBrowserClient(url, anonKey);
}
