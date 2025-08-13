// pages/api/keycard-pdf.ts
// Generates a PDF keycard for a user with profile snapshot + QR

import type { NextApiRequest, NextApiResponse } from 'next';
import seAdmin from '@utils/supabaseAdmin';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

// Small helper: fetch a PNG as Uint8Array (for QR)
async function fetchPngBuffer(url: string): Promise<Uint8Array> {
  const resp = await fetch(url);
  if (!resp.ok) {
    throw new Error(`QR service failed: ${resp.status} ${resp.statusText}`);
  }
  return new Uint8Array(await resp.arrayBuffer());
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const userId = (req.query.user_id ?? '').toString().trim();
  if (!userId) {
    return res.status(400).json({ ok: false, error: 'Missing user_id' });
  }

  try {
    // ---- Fetch profile snapshot ----
    const { data: profile, error: profileErr } = await seAdmin
      .from('user_profiles')
      .select('id, alias, role, xp, badges, connects, crates')
      .eq('id', userId)
      .single();

    if (profileErr || !profile) {
      throw new Error(profileErr?.message || 'Profile not found');
    }

    // ---- Build PDF ----
    const doc = await PDFDocument.create();
    const page = doc.addPage([400, 300]);
    const font = await doc.embedFont(StandardFonts.Helvetica);

    const draw = (
      text: string,
      x: number,
      y: number,
      size = 12
    ): void => {
      page.drawText(text, { x, y, size, font, color: rgb(0, 0, 0) });
    };

    // Header
    draw('Felena Keycard', 20, 270, 18);

    // Profile (defensive fallbacks)
    draw(`Alias: ${profile.alias ?? 'N/A'}`, 20, 240);
    draw(`XP: ${Number(profile.xp ?? 0).toLocaleString()}`, 20, 225);
    draw(`Role: ${profile.role ?? 'public'}`, 20, 210);
    draw(
      `Connects: ${Array.isArray(profile.connects) ? profile.connects.length : 0}`,
      20,
      195
    );
    draw(
      `Crates: ${Array.isArray(profile.crates) ? profile.crates.length : 0}`,
      20,
      180
    );

    // Badges (up to 4)
    const badges = profile.badges as Array<{ label?: string }> | null;
    const shownBadges = (badges ?? []).slice(0, 4);
    let by = 150;
    shownBadges.forEach((b) => {
      const label = (b?.label ?? '').toString();
      if (label) {
        draw(`• ${label}`, 20, by);
        by -= 15;
      }
    });

    // ---- QR (deep link to keycard page) ----
    const siteURL =
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, '') ||
      process.env.VERCEL_URL?.replace(/\/+$/, '') ||
      'http://localhost:3000';

    const keycardUrl = `${siteURL}/keycard/${encodeURIComponent(userId)}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(
      keycardUrl
    )}`;
    const qrPng = await fetchPngBuffer(qrUrl);
    const qrImage = await doc.embedPng(qrPng);
    page.drawImage(qrImage, { x: 320, y: 20, width: 60, height: 60 });

    // ---- Optional audit log ----
    await seAdmin.from('cert_issued').insert({
      user_id: userId,
      cert_type: 'keycard',
      issued_at: new Date().toISOString(),
      issuer_id: userId,
    });

    // ---- Send as attachment ----
    const pdfBytes = await doc.save(); // Uint8Array
    // Convert for Node response: Buffer.from(ArrayBuffer)
    const nodeBuffer = Buffer.from(pdfBytes.buffer);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="keycard-${userId}.pdf"`
    );
    return res.status(200).send(nodeBuffer);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    // eslint-disable-next-line no-console
    console.error('[keycard-pdf] error:', msg);
    return res.status(500).json({ ok: false, error: msg });
  }
}