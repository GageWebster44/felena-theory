import { createClient } from '@supabase/supabase-js';

// ✅ Load env vars with fallback protection
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// ✅ Check for missing envs in runtime
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// ✅ Singleton client pattern
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;