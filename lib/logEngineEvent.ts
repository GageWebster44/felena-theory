// Minimal, self‑contained admin insert helper.
// Avoids missing getAdminClient by creating a local service client.

import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// If env isn’t present, fall back to a noop client so builds don’t fail.
const supabase =
  url && serviceRole
    ? createClient(url, serviceRole, { auth: { autoRefreshToken: false, persistSession: false } })
    : null;

export type EngineEventRow = {
  user_id: string;
  engine_key: string;
  xp?: number;
  profit_usd?: number;
  symbol?: string;
  position?: 'buy' | 'sell' | 'flat';
  signal_count?: number;
  override_active?: boolean;
  meta?: Record<string, unknown>;
  created_at?: string;
};

export async function logEngineEvent(row: EngineEventRow): Promise<void> {
  if (!supabase) return; // safe no‑op in non‑server contexts
  const { error } = await supabase.from('engine_events').insert(row);
  if (error) {
    // Don’t throw during builds; just surface in logs.
    // eslint-disable-next-line no-console
    console.error('[logEngineEvent] insert failed:', error);
  }
}