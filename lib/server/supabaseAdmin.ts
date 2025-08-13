// src/lib/server/supabaseAdmin.ts
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Fail fast if env is missing (prevents silent runtime bugs)
if (!SUPABASE_URL) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
}
if (!SERVICE_ROLE_KEY) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY (server-only)');
}

/**
 * Server-side Supabase client with the Service Role key.
 * Never import this in client components/routes.
 */
export const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false, // no cookies/sessions on server helpers
    autoRefreshToken: false,
  },
  global: {
    headers: {
      'X-Client-Info': 'felena-admin-server',
    },
  },
});

// Optional: tiny helper to assert this file is used on the server
export function assertServerOnly() {
  if (typeof window !== 'undefined') {
    throw new Error('supabaseAdmin must not be imported in the browser');
  }
}
