import { supabase } from '@/utils/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { email, referral_code } = req.body;
  const origin_ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const user_agent = req.headers['user-agent'] || 'unknown';

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Invalid email' });
  }

  // 🧮 Check if cap has been reached
  const { count } = await supabase
    .from('preorder_interest')
    .select('id', { count: 'exact', head: true });

  if ((count ?? 0) >= 100) {
    return res.status(403).json({ error: 'Preorder cap reached. 100 slots filled.' });
  }

  const { error } = await supabase.from('preorder_interest').insert({
    email: email.toLowerCase().trim(),
    referral_code,
    origin_ip,
    user_agent,
  });

  if (error) return res.status(500).json({ error: error.message });

  return res.status(200).json({ success: true });
}