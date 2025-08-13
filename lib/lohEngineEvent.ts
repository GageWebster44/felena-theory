// src/lib/lohEngineEvent.ts
// Lightweight helper to write engine activity into the `engine_logs` table.

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
);

export type EngineEvent = {
  user_id: string;
  engine_name: string;
  symbol: string;
  position: string; // e.g. 'long' | 'short' | 'flat'
  profit_usd: number; // realized/unrealized P/L at event time
  xp: number; // xp credited for the event
  override: boolean; // if operator override was used
  crate_count: number; // crates unlocked in this action
  meta?: Record<string, unknown>; // optional extra payload
};

/**
 * Write an engine event to Supabase.
 */
export default async function logEngineEvent(
  event: EngineEvent,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const payload = {
      ...event,
      created_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('engine_logs').insert(payload);

    if (error) throw error;
    return { ok: true };
  } catch (err) {
    console.error('[Engine Log Error]', err);
    return { ok: false, error: (err as Error).message };
  }
}
