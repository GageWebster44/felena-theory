// pages/api/promote.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  // SERVICE ROLE KEY — server only
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

type PromoteBody = {
  userId?: string;
  newRole?: string;
  approverId?: string;
  reason?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, newRole, approverId, reason }: PromoteBody = req.body || {};

  if (!userId || !newRole || !approverId) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  // 1) Fetch current role (for logging)
  const { data: profile, error: fetchError } = await supabase
    .from('profiles')
    .select('id, company_role')
    .eq('id', userId)
    .single();

  if (fetchError || !profile) {
    return res.status(404).json({ error: 'User not found' });
  }

  // 2) Update role
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ company_role: newRole })
    .eq('id', userId);

  if (updateError) {
    return res.status(500).json({ error: 'Failed to update role' });
  }

  // 3) Log promotion (best‑effort; don’t fail request if this write fails)
  try {
    await supabase.from('employee_promotions').insert({
      user_id: userId,
      approver_id: approverId,
      old_role: profile.company_role ?? null,
      new_role: newRole,
      reason: reason ?? null,
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Supabase error in promote.ts (log insert):', err);
  }

  return res
    .status(200)
    .json({ success: true, message: `User promoted to ${newRole}` });
}