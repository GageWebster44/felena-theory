// pages/api/notifyDevCandidates.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import seAdmin from '@/utils/supabaseAdmin'; // server-only Supabase client (service role)

type Candidate = {
  id: string;
  username: string | null;
  xp: number | null;
  devCandidateStatus?: string | null;
};

type Ok = { ok: true; notified: boolean; count: number };
type Err = { ok: false; error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Ok | Err>
) {
  try {
    // Allow either POST or GET (flip this to POST-only if you prefer)
    if (req.method !== 'POST' && req.method !== 'GET') {
      return res.status(405).json({ ok: false, error: 'Method not allowed' });
    }

    // Use the admin (service-role) Supabase client directly (do NOT call it)
    const supabase = seAdmin;

    // Find approved dev candidates with high XP (adjust thresholds as needed)
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id, username, xp, devCandidateStatus')
      .eq('devCandidateStatus', 'approved')
      .gte('xp', 100_000);

    if (error) {
      return res.status(500).json({ ok: false, error: error.message });
    }

    const candidates: Candidate[] = (data ?? []) as Candidate[];

    // Build lines for optional webhook notification
    const lines = candidates.map(
      (u: Candidate) =>
        `• Dev Candidate Found → ID: ${u.id} | Username: ${u.username ?? 'N/A'} | XP: ${u.xp ?? 0}`
    );

    // Optionally notify a webhook if configured
    const webhook = process.env.RECRUITING_WEBHOOK_URL;
    let notified = false;

    if (webhook && candidates.length > 0) {
      try {
        await fetch(webhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: lines.join('\n') }),
        });
        notified = true;
      } catch {
        // ignore webhook hiccups; API still returns ok
        notified = false;
      }
    }

    return res.status(200).json({
      ok: true,
      notified,
      count: candidates.length,
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: (err as Error).message ?? 'Unknown error',
    });
  }
}