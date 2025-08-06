// /pages/api/lottery/reset.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    // 1. Archive this week's lottery entries
    const { data: currentEntries, error: fetchError } = await supabase
      .from('lottery_entries')
      .select('*');

    if (fetchError) throw fetchError;

    const archiveInsert = await supabase.from('lottery_entries_archive').insert(currentEntries || []);

    // 2. Wipe current entries
    const { error: deleteError } = await supabase.from('lottery_entries').delete().neq('id', '');
    if (deleteError) throw deleteError;

    // 3. Optionally reset global jackpot tracker (if stored separately)
  try {
    await supabase.from('lottery_stats').upsert({ id: 'jackpot', value: 0 });
  } catch (error) {
    console.error('❌ Supabase error in reset.ts', error);
  }

    // 4. Log to audit
  try {
    await supabase.from('audit_logs').insert({
  } catch (error) {
    console.error('❌ Supabase error in reset.ts', error);
  }
      user_id: 'system',
      action: '🎲 Weekly Lottery Reset Executed',
      timestamp: new Date().toISOString()
    });

    return res.status(200).json({ success: true });
  } catch (err: any) {
    console.error('[RESET ERROR]', err);
    return res.status(500).json({ error: err.message });
  }
}