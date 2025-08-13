// src/utils/logpromotion.ts
// Writes a promotion event to the `employee_promotions` table.

import { supabase } from '@/utils/supabaseClient';

export type PromotionLogInput = {
  userId: string;
  approverId: string;
  oldRole: string;
  newRole: string;
};

export type PromotionLogResult =
  | {
      ok: true;
    }
  | {
      ok: false;
      error: string;
    };

export default async function logPromotion({
  userId,
  approverId,
  oldRole,
  newRole,
}: PromotionLogInput): Promise<PromotionLogResult> {
  try {
    const { error } = await supabase.from('employee_promotions').insert([
      {
        user_id: userId,
        approver_id: approverId,
        old_role: oldRole,
        new_role: newRole,
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      console.error('Failed to log promotion:', error.message);
      return { ok: false, error: error.message };
    }

    return { ok: true };
  } catch (err) {
    const msg = (err as Error).message || 'Unknown error';
    console.error('[logPromotion] Unexpected error:', msg);
    return { ok: false, error: msg };
  }
}
