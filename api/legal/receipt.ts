import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import seAdmin from '@/utils/supabaseAdmin';

// Keep this in one place so you can bump versions later
const AGREEMENT_KEY = 'XP_SYSTEM_AGREEMENT';
const AGREEMENT_VERSION = 'v1';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method Not Allowed' });

  try {
    // get the signed-in user from cookies (RLS-safe)
    const supabase = createServerSupabaseClient({ req, res });
    const { data: session, error: sessErr } = await supabase.auth.getSession();
    if (sessErr || !session.session?.user) {
      return res.status(401).json({ ok: false, error: 'Unauthorized' });
    }
    const user = session.session.user;

    // payload (all optional except email; we’ll default key/version/when)
    const { email, agreementKey, version, whenISO } = (req.body ?? {}) as {
      email?: string;
      agreementKey?: string;
      version?: string;
      whenISO?: string;
    };

    if (!email) {
      return res.status(400).json({ ok: false, error: 'email is required' });
    }

    const when = whenISO ? new Date(whenISO) : new Date();
    if (Number.isNaN(when.getTime())) {
      return res.status(400).json({ ok: false, error: 'whenISO is invalid' });
    }

    // insert with the Service Role client so RLS can’t block it
    const { error } = await seAdmin.from('user_receipts').insert({
      user_id: user.id,
      email,
      agreement_key: agreementKey ?? AGREEMENT_KEY,
      agreement_version: version ?? AGREEMENT_VERSION,
      when_iso: when.toISOString(),
    });

    if (error) return res.status(400).json({ ok: false, error: error.message });

    return res.status(200).json({ ok: true });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: String(err?.message || err) });
  }
}