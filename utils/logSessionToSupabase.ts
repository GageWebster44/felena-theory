// src/utils/logSessionToSupabase.ts
// Logs XP events and engine usage to Supabase

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
);

export type SessionLogInput = {
  userId: string;
  engine: string;
  xp: number;
  signalCount: number;
  overrideActive: boolean;
};

/**
 * Insert a row into `xp_session_logs`.
 * Returns `{ data, error }` from Supabase.
 */
export async function logSessionEvent({
  userId,
  engine,
  xp,
  signalCount,
  overrideActive,
}: SessionLogInput) {
  const { data, error } = await supabase.from('xp_session_logs').insert([
    {
      user_id: userId,
      engine_codename: engine,
      xp_awarded: xp,
      signals_processed: signalCount,
      override_used: overrideActive,
      timestamp: new Date().toISOString(),
    },
  ]);

  if (error) {
    console.error('[SESSION LOG ERROR]', error);
  }

  return { data, error };
}

export default logSessionEvent;
