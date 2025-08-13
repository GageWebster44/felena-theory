// src/utils/supabaseClient.ts
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!url || !anon) {
  throw new Error(
    'Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local',
  );
}

// Single shared client instance (safe for Next.js + edge/browser use)
export const supabase: SupabaseClient = createClient(url, anon, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    // Only parse the session from the URL in the browser (avoids SSR warnings)
    detectSessionInUrl: typeof window !== 'undefined',
  },
});

export default supabase;
