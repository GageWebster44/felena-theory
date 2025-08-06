import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/utils/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { user_id, action, timestamp } = req.body;

  if (!user_id || !action) {
    return res.status(400).json({ message: 'Missing required fields: user_id or action' });
  }

  try {
    const { error } = await supabase.from('audit_logs').insert({
      user_id,
      action,
      timestamp: timestamp || new Date().toISOString()
    });

    if (error) throw error;

    return res.status(200).json({ message: 'Action logged successfully' });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to log action', error: err.message });
  }
}