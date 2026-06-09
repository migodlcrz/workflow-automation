import { createClient } from "@supabase/supabase-js";

// Server-side client — uses service role key, bypasses RLS
// Only use in Server Actions and API Routes (never ship to client)
export function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
