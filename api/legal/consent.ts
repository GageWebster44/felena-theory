import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import seAdmin from '@/utils/supabaseAdmin';

const CONSENT_VERSION = 'v1';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method Not Allowed' });

  try {
    const supabase = createServerSupabaseClient({ req, res });
    const { data: session, error: sessErr } = await supabase.auth.getSession();
    if (sessErr || !session.session?.user) {
      return res.status(401).json({ ok: false, error: 'Unauthorized' });
    }
    const user = session.session.user;

    // payload is minimal; allow overrides to keep it flexible
    const { accepted, version, whenISO } = (req.body ?? {}) as {
      accepted?: boolean;
      version?: string;
      whenISO?: string;
    };

    if (accepted !== true) {
      return res.status(400).json({ ok: false, error: 'accepted must be true' });
    }

    const when = whenISO ? new Date(whenISO) : new Date();
    if (Number.isNaN(when.getTime())) {
      return res.status(400).json({ ok: false, error: 'whenISO is invalid' });
    }

    // Write to your consent log table; adjust table/column names to match your schema.
    // You mentioned having user_consent in your DB list.
    const { error } = await seAdmin.from('user_consent').insert({
      user_id: user.id,
      accepted: true,
      version: version ?? CONSENT_VERSION,
      when_iso: when.toISOString(),
    });

    if (error) return res.status(400).json({ ok: false, error: error.message });

    return res.status(200).json({ ok: true });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: String(err?.message || err) });
  }
}