// pages/api/lottery/reset.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

type Json = { success: true } | { error: string };

const SUPABASE_URL =
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Json>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Optional: simple guard (e.g., header key) if you want a quick lock
    // if (req.headers['x-reset-key'] !== process.env.LOTTERY_RESET_KEY) {
    //   return res.status(403).json({ error: 'Forbidden' });
    // }

    const { error } = await supabaseAdmin.rpc('reset_lottery_week');

    if (error) {
      console.error('reset_lottery_week RPC error:', error);
      return res.status(500).json({ error: 'Reset failed' });
    }

    return res.status(200).json({ success: true });
  } catch (err: any) {
    console.error('RESET ERROR:', err);
    return res.status(500).json({ error: err?.message || 'Unknown error' });
  }
}