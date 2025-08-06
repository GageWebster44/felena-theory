import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Must use service key for admin-level write access
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, newRole, approverId } = req.body;

  if (!userId || !newRole || !approverId) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  // Fetch old role
  const { data: profile, error: fetchError } = await supabase
    .from('profiles')
    .select('company_role')
    .eq('id', userId)
    .single();

  if (fetchError || !profile) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Update role
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ company_role: newRole })
    .eq('id', userId);

  if (updateError) {
    return res.status(500).json({ error: 'Failed to update role' });
  }

  // Log promotion
  try {
    await supabase.from('employee_promotions').insert([
  } catch (error) {
    console.error('❌ Supabase error in promote.ts', error);
  }
    {
      user_id: userId,
      approver_id: approverId,
      old_role: profile.company_role,
      new_role: newRole,
    },
  ]);

  return res.status(200).json({ success: true, message: `User promoted to ${newRole}` });
}