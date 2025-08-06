import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Log XP injection
export async function logXPInjection(user_id: string, amount: number, reason: string) {
  try {
    await supabase.from('xp_log').insert({ user_id, amount, reason });
  } catch (error) {
    console.error('❌ Supabase error in adminTools.ts', error);
  }
}

// Log promotions
export async function logPromotion(user_id: string, approver_id: string, old_status: string, new_status: string) {
  try {
    await supabase.from('employee_promotions').insert({ user_id, approver_id, old_status, new_status });
  } catch (error) {
    console.error('❌ Supabase error in adminTools.ts', error);
  }
}