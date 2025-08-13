// pages/api/operator-transcript.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Accept GET (query) or POST (body)
    const user_id: string | undefined =
      (req.method === 'GET'
        ? (req.query.user_id as string | undefined)
        : (req.body?.user_id as string | undefined)) ?? undefined;

    if (!user_id || typeof user_id !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid user_id' });
    }

    const SITE =
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, '') || 'https://felena.app';

    // ---- Fetch data --------------------------------------------------------
    // Profile
    const { data: profile, error: profileErr } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user_id)
      .single();

    if (profileErr || !profile) {
      console.error('Supabase error in operator-transcript.ts (profile):', profileErr);
      return res.status(404).json({ error: 'User not found' });
    }

    // Badges (optional)
    const { data: badges, error: badgesErr } = await supabase
      .from('user_badges')
      .select('*')
      .eq('user_id', user_id);

    if (badgesErr) {
      console.error('Supabase error in operator-transcript.ts (badges):', badgesErr);
    }

    // Crates (optional)
    const { data: crates, error: cratesErr } = await supabase
      .from('xp_crates')
      .select('*')
      .eq('user_id', user_id);

    if (cratesErr) {
      console.error('Supabase error in operator-transcript.ts (crates):', cratesErr);
    }

    // Referrals (optional)
    const { data: referrals, error: referralsErr } = await supabase
      .from('referrals')
      .select('referrer_id')
      .eq('referrer_id', user_id);

    if (referralsErr) {
      console.error('Supabase error in operator-transcript.ts (referrals):', referralsErr);
    }

    // Recent XP logs (last 30)
    const { data: xpLogs, error: logsErr } = await supabase
      .from('xp_log')
      .select('*')
      .eq('user_id', user_id)
      .order('timestamp', { ascending: false })
      .limit(30);

    if (logsErr) {
      console.error('Supabase error in operator-transcript.ts (xp_log):', logsErr);
    }

    // ---- Build PDF ---------------------------------------------------------
    const doc = await PDFDocument.create();
    const page = doc.addPage([600, 800]);
    const font = await doc.embedFont(StandardFonts.Helvetica);

    let y = 760;
    const line = (text: string, size = 12) => {
      page.drawText(text, { x: 40, y, size, font, color: rgb(0, 0, 0) });
      y -= size + 6;
    };

    // Header
    line('OPERATOR TRANSCRIPT', 18);
    line(`Alias: ${profile.alias ?? 'N/A'}`, 12);
    line(`User ID: ${user_id}`, 12);
    line(`XP: ${Number(profile.xp || 0).toLocaleString()}`, 12);
    line(`Tier: ${getTier(Number(profile.xp || 0))}`, 12);
    line(`Referrals: ${referrals?.length ?? 0}`, 12);
    line(`Crates Claimed: ${crates?.length ?? 0}`, 12);
    line('');

    // Badges
    line('Badges Earned:', 14);
    if (badges && badges.length > 0) {
      badges.forEach((b: any) => line(`• ${b.label ?? 'Badge'}`));
    } else {
      line('• None');
    }
    line('');

    // Recent logs
    line('Recent XP Logs:', 14);
    (xpLogs ?? []).forEach((l: any) => {
      const t = l?.timestamp ? new Date(l.timestamp).toLocaleString() : '';
      line(`• ${l?.reason ?? ''}: ${l?.amount ?? 0} at ${t}`);
    });
    line('');

    // Footer
    const now = new Date();
    line(`Generated: ${now.toLocaleString()}`, 10);
    line(`Signed: EchoMind Systems`, 10);
    line(`Grid: ${SITE}`, 10);

    // ---- Audit writes (best-effort) ----------------------------------------
    try {
      await supabase.from('cert_issued').insert({
        user_id,
        cert_type: 'transcript',
        issued_at: new Date().toISOString(),
        cert_id: `transcript-${user_id}`,
      });
    } catch (error) {
      console.error('Supabase error in operator-transcript.ts (cert_issued):', error);
    }

    try {
      await supabase.from('cert_views').insert({
        user_id,
        cert_type: 'transcript',
        viewed_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Supabase error in operator-transcript.ts (cert_views):', error);
    }

    // ---- Send PDF ----------------------------------------------------------
    const pdfBytes = await doc.save();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=transcript-${user_id}.pdf`
    );
    return res.send(Buffer.from(pdfBytes));
  } catch (err: any) {
    console.error('operator-transcript.ts ERROR:', err);
    return res.status(500).json({ error: err?.message || 'Unknown error' });
  }
}

// Same thresholds used elsewhere
function getTier(xp: number): string {
  if (xp >= 100000) return 'Tier 17: Quantum Architect';
  if (xp >= 50000) return 'Tier 16: Ascendant';
  if (xp >= 25000) return 'Tier 15: Final Ascension';
  if (xp >= 20000) return 'Tier 14: Visionary';
  if (xp >= 15000) return 'Tier 13: Conductor';
  if (xp >= 12000) return 'Tier 12: Tactician';
  if (xp >= 10000) return 'Tier 11: Legendary';
  if (xp >= 8000) return 'Tier 10: Override';
  if (xp >= 6000) return 'Tier 9: Commander';
  if (xp >= 4000) return 'Tier 8: Operator';
  if (xp >= 2500) return 'Tier 7: Prototype';
  if (xp >= 1500) return 'Tier 6: Apprentice';
  if (xp >= 1000) return 'Tier 5: Initiate';
  if (xp >= 500) return 'Tier 4: Connected';
  if (xp >= 250) return 'Tier 3: Linked';
  if (xp >= 50) return 'Tier 2: Registered';
  if (xp >= 10) return 'Tier 1: Witness';
  return 'Tier 0: Observer';
}