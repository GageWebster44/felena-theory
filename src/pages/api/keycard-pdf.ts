// /pages/api/keycard-pdf.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/utils/supabaseClient';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { user_id, view } = req.query;
  if (!user_id) return res.status(400).json({ error: 'Missing user_id' });

  try {
    const { data: profile } = await supabase.from('user_profiles').select('*').eq('id', user_id).single();
  } catch (error) {
    console.error('❌ Supabase error in keycard-pdf.ts', error);
  }
  try {
    const { data: referrals } = await supabase.from('referrals').select('id').eq('referrer_id', user_id);
  } catch (error) {
    console.error('❌ Supabase error in keycard-pdf.ts', error);
  }
  try {
    const { data: crates } = await supabase.from('xp_crates').select('id').eq('user_id', user_id);
  } catch (error) {
    console.error('❌ Supabase error in keycard-pdf.ts', error);
  }
  try {
    const { data: badges } = await supabase.from('user_badges').select('*').eq('user_id', user_id);
  } catch (error) {
    console.error('❌ Supabase error in keycard-pdf.ts', error);
  }

  const doc = await PDFDocument.create();
  const page = doc.addPage([400, 300]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://felena.app';

  const draw = (text: string, x: number, y: number, size = 12) => {
    page.drawText(text, { x, y, size, font, color: rgb(0, 1, 0) });
  };

  // 🧬 Operator Profile
  draw('🧬 OPERATOR KEYCARD', 20, 270, 18);
  draw(`Alias: ${profile?.alias || 'N/A'}`, 20, 245);
  draw(`XP: ${profile?.xp?.toLocaleString() || '0'}`, 20, 230);
  draw(`Tier: ${getTier(profile?.xp || 0)}`, 20, 215);
  draw(`Role: ${profile?.role || 'N/A'}`, 20, 200);
  draw(`Connects: ${referrals?.length || 0}`, 20, 185);
  draw(`Crates: ${crates?.length || 0}`, 20, 170);

  // 🏅 Badges
  draw(`Badges:`, 20, 150);
  const shownBadges = badges?.slice(0, 4) || [];
  let x = 20;
  let y = 130;

  for (let i = 0; i < shownBadges.length; i++) {
    const badge = shownBadges[i];
    const slug = slugify(badge.label);
    const badgePath = path.resolve(`./public/badges/${slug}.png`);

    if (fs.existsSync(badgePath)) {
      const imageBytes = fs.readFileSync(badgePath);
      const image = await doc.embedPng(imageBytes);
      page.drawImage(image, {
        x,
        y,
        width: 32,
        height: 32
      });
      page.drawText(badge.label, { x: x + 38, y: y + 10, size: 10, font, color: rgb(0, 1, 0) });
    } else {
      page.drawText(`• ${badge.label}`, { x, y: y + 10, size: 12, font, color: rgb(0, 1, 0) });
    }
    y -= 40;
  }

  // 🔐 Footer + QR + Logging
  draw(`Issued: ${new Date().toLocaleDateString()}`, 20, 20, 10);
  draw(`Signed: EchoMind AI`, 270, 20, 10);
  draw('Felena Theory', 250, 285, 10);
  draw(`CERT ID: ${user_id}`, 250, 275, 10);

  const qrUrl = `${site}/keycard?ref=${user_id}`;
  const qrBytes = await fetch(`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(qrUrl)}`).then(r => r.arrayBuffer());
  const qrImage = await doc.embedPng(qrBytes);
  page.drawImage(qrImage, { x: 320, y: 20, width: 60, height: 60 });

  if (view === '1') {
  try {
    await supabase.from('cert_views').insert({
  } catch (error) {
    console.error('❌ Supabase error in keycard-pdf.ts', error);
  }
      user_id,
      cert_type: 'keycard',
      viewed_at: new Date().toISOString()
    });
  }

  try {
    await supabase.from('cert_issued').insert({
  } catch (error) {
    console.error('❌ Supabase error in keycard-pdf.ts', error);
  }
    user_id,
    cert_type: 'keycard',
    issued_at: new Date().toISOString(),
    cert_id: user_id
  });

  const pdfBytes = await doc.save();
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="keycard-${user_id}.pdf"`);
  res.send(pdfBytes);
}

function getTier(xp: number) {
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

function slugify(label: string) {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}