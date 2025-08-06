
// logSessionToSupabase.ts – Logs XP events and engine usage to Supabase

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_KEY!
);

export async function logSessionEvent({
  userId,
  engine,
  xp,
  signalCount,
  overrideActive
}: {
  userId: string;
  engine: string;
  xp: number;
  signalCount: number;
  overrideActive: boolean;
}) {
  const { data, error } = await supabase.from('xp_session_logs').insert([
    {
      user_id: userId,
      engine_codename: engine,
      xp_awarded: xp,
      signals_processed: signalCount,
      override_used: overrideActive,
      timestamp: new Date().toISOString()
    }
  ]);

  if (error) {
    console.error('[SESSION LOG ERROR]', error);
  } else {
  }

  return { data, error };
}
