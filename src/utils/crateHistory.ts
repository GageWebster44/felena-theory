

import { supabase } from '@/utils/supabaseClient' 


export async function logCrateUnlock(userId: string, tier: string) {
  const { data, error } = await supabase.from('crate_history').insert([
    {
      user_id: userId,
      crate_tier: tier,
      timestamp: new Date().toISOString()
    }
  ]);

  if (error) {
    console.error('[CRATE LOG ERROR]', error);
  } else {
  }

  return { data, error };
}

export async function getCrateHistory(userId: string) {
  const { data, error } = await supabase
    .from('crate_history')
    .select('*')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false });

  if (error) {
    console.error('[CRATE FETCH ERROR]', error);
    return [];
  }

  return data;
}
