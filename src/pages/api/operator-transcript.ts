// /pages/api/operator-transcript.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/utils/supabaseClient';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { user_id } = req.query;
  if (!user_id || typeof user_id !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid user_id' });
  }

  const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://felena.app';

  // Pull profile
  const { data: profile } = await supabase.from('user_profiles').select('*').eq('id', user_id).single();
  if (!profile) return res.status(404).json({ error: 'User not found' });

  try {
    const { data: badges } = await supabase.from('user_badges').select('*').eq('user_id', user_id);
  } catch (error) {
    console.error('❌ Supabase error in operator-transcript.ts', error);
  }
  try {
    const { data: crates } = await supabase.from('xp_crates').select('*').eq('user_id', user_id);
  } catch (error) {
    console.error('❌ Supabase error in operator-transcript.ts', error);
  }
  try {
    const { data: referrals } = await supabase.from('referrals').select('*').eq('referrer_id', user_id);
  } catch (error) {
    console.error('❌ Supabase error in operator-transcript.ts', error);
  }
  try {
    const { data: xpLogs } = await supabase.from('xp_log').select('*').eq('user_id', user_id).limit(30).order('timestamp', { ascending: false });
  } catch (error) {
    console.error('❌ Supabase error in operator-transcript.ts', error);
  }

  // Build PDF
  const doc = await PDFDocument.create();
  const page = doc.addPage([600, 800]);
  const font = await doc.embedFont(StandardFonts.Helvetica);

  let y = 780;
  const draw = (text: string, size = 12) => {
    page.drawText(text, { x: 40, y, size, font, color: rgb(0, 1, 0) });
    y -= size + 6;
  };

  draw('📜 OPERATOR TRANSCRIPT', 18);
  draw(`Alias: ${profile.alias || 'N/A'}`);
  draw(`User ID: ${user_id}`);
  draw(`XP: ${profile.xp?.toLocaleString()}`);
  draw(`Role: ${profile.role}`);
  draw(`Tier: ${getTier(profile.xp || 0)}`);
  draw(`Referrals: ${referrals?.length || 0}`);
  draw(`Crates Claimed: ${crates?.length || 0}`);
  draw('');

  draw('🏅 Badges Earned:', 14);
  if (badges?.length) {
    badges.forEach(b => draw(`• ${b.label}`));
  } else {
    draw('• None');
  }
  draw('');

  draw('📈 Recent XP Logs:', 14);
  xpLogs?.forEach(l => {
    const time = new Date(l.timestamp).toLocaleString();
    draw(`• ${l.reason} [+${l.amount}] @ ${time}`, 10);
  });

  draw('');
  draw(`Generated: ${new Date().toLocaleString()}`, 10);
  draw('Signed: EchoMind Systems', 10);
  draw(`Grid: ${site}`, 10);

  try {
    await supabase.from('cert_issued').insert({
  } catch (error) {
    console.error('❌ Supabase error in operator-transcript.ts', error);
  }
    user_id,
    cert_type: 'transcript',
    issued_at: new Date().toISOString(),
    cert_id: `transcript-${user_id}`
  });

  try {
    await supabase.from('cert_views').insert({
  } catch (error) {
    console.error('❌ Supabase error in operator-transcript.ts', error);
  }
    user_id,
    cert_type: 'transcript',
    viewed_at: new Date().toISOString()
  });

  const pdfBytes = await doc.save();
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=transcript-${user_id}.pdf`);
  res.send(pdfBytes);
}

function getTier(xp: number): string {
  if (xp >= 100000) return 'Tier 17: Quantum Architect';
  if (xp >= 75000) return 'Tier 16: Ascendant';
  if (xp >= 50000) return 'Tier 15: Final Ascension';
  if (xp >= 25000) return 'Tier 14: Visionary';
  if (xp >= 20000) return 'Tier 13: Conductor';
  if (xp >= 15000) return 'Tier 12: Tactician';
  if (xp >= 10000) return 'Tier 11: Legendary';
  if (xp >= 5000) return 'Tier 10: Override';
  if (xp >= 2500) return 'Tier 9: Commander';
  if (xp >= 1000) return 'Tier 8: Operator';
  if (xp >= 500) return 'Tier 7: Prototype';
  if (xp >= 250) return 'Tier 6: Apprentice';
  if (xp >= 100) return 'Tier 5: Initiate';
  if (xp >= 50) return 'Tier 4: Connected';
  if (xp >= 20) return 'Tier 3: Linked';
  if (xp >= 10) return 'Tier 2: Registered';
  if (xp >= 5) return 'Tier 1: Witness';
  return 'Tier 0: Observer';
}