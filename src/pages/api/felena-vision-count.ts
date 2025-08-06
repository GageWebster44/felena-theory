// pages/api/felena-vision-count.ts
import { supabase } from '@/utils/supabaseClient';

export default async function handler(req, res) {
  const { data, error } = await supabase
    .from('preorder_interest')
    .select('id', { count: 'exact' });

  if (error) {
    return res.status(500).json({ error: 'Failed to fetch preorder count.' });
  }

  const count = data.length;
  const remaining = Math.max(0, 100 - count);
  const isFull = count >= 100;

  res.status(200).json({ count, remaining, isFull });
}