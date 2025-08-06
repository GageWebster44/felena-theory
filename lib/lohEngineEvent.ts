 import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function logEngineEvent(event: {
  user_id: string;
  engine_name: string;
  symbol: string;
  position: string;
  profit_usd: number;
  xp_gain: number;
  override: boolean;
  crate_count: number;
}) {
  const { error } = await supabase.from('engine_logs').insert([event]);
  if (error) console.error('[Engine Log Error]', error);
}