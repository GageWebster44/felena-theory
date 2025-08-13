// src/utils/supabaseAdmin.ts (server-only)
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string | undefined;

if (!url || !serviceKey) {
  // Avoid crashing build; API routes will still fail safely if missing.
  // eslint-disable-next-line no-console
  console.warn('[supabaseAdmin] Missing envs: NEXT_PUBLIC_SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY');
}

export const supabaseAdmin = createClient(url || '', serviceKey || '', {
  auth: { persistSession: false, autoRefreshToken: false },
  // db: { schema: 'public' }, // optional
});

export default supabaseAdmin; // keep default too if you already import default elsewhere