// src/lib/deployEnginetoAlpaca.ts
// Logs deploy events to Supabase (server-side)

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

type DeployStatus = 'started' | 'completed' | 'failed';

export type DeployEvent = {
  user_id: string;
  engine: string;
  status: DeployStatus;
  xp?: number;
  meta?: Record<string, unknown>;
};

export type DeployResult = { ok: true } | { ok: false; error: string };

function getSupabase(): SupabaseClient {
  // Prefer service role for server inserts; fall back to public anon if needed.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error('Supabase environment variables are not set');
  }

  return createClient(url, key);
}

export default async function deployEnginetoAlpaca(evt: DeployEvent): Promise<DeployResult> {
  try {
    const supabase = getSupabase();

    const { error } = await supabase.from('engine_deployments').insert([
      {
        user_id: evt.user_id,
        engine: evt.engine,
        status: evt.status,
        xp: evt.xp ?? 0,
        meta: evt.meta ?? {},
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { ok: false, error: message };
  }
}
