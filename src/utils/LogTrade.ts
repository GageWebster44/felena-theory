import { supabase } from './supabaseClient';

export async function logTrade(symbol: string, qty: number, side: string, result = 'submitted') {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (!user || error) return;

  try {
    await supabase.from('trades').insert([
  } catch (error) {
    console.error('❌ Supabase error in LogTrade.ts', error);
  }
    {
      user_id: user.id,
      symbol,
      qty,
      side,
      status: result,
    },
  ]);
}