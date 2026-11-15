import { createBrowserClient } from "@supabase/ssr";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const hasSupabase = Boolean(url && key);
// Browser client: keeps the login session in cookies so the server (proxy, route handlers) can read it too.
export const supabase = createBrowserClient(url || "http://localhost:54321", key || "missing-key");
