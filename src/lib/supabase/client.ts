import { createClient } from "@supabase/supabase-js";
import type { Ticket } from "@/types/ticket";

// Browser client — uses anon key, respects RLS
export function createBrowserClient() {
  return createClient<{ public: { Tables: { tickets: { Row: Ticket } } } }>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
