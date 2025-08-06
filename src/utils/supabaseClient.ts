import { createClient } from '@supabase/supabase-js';

// Safely pull environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Singleton instance
let supabase: ReturnType<typeof createClient> | null = null;

if (!supabase) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export default supabase;