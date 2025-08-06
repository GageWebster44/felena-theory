import { supabase } from '@/utils/supabaseClient';

export async function logPromotion(userId: string, approverId: string, oldRole: string, newRole: string) {
  const { error } = await supabase.from('employee_promotions').insert([
    {
      user_id: userId,
      approver_id: approverId,
      old_role: oldRole,
      new_role: newRole,
    },
  ]);

  if (error) {
    console.error('Failed to log promotion:', error.message);
  } else {
  }
}