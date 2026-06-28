import { createClient } from "@supabase/supabase-js";

// Fall back to placeholders so the build doesn't crash when env vars aren't
// set yet (e.g. local build before .env.local exists). Real values must be
// set in .env.local / Vercel env vars for the calculator and /admin to work.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
