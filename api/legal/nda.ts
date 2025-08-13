// pages/api/legal/nda.ts
// Generates a basic Mutual NDA PDF, stores it privately in Supabase Storage,
// and returns a short-lived signed download URL. Admin-only.

import type { NextApiRequest, NextApiResponse } from 'next';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';
// IMPORTANT: use a RELATIVE path so we don't depend on tsconfig path aliases
import seAdmin from '../../../src/utils/supabaseAdmin';

// NOTE: pdfkit ships without complete TS types, so require() avoids TS complaints
// eslint-disable-next-line @typescript-eslint/no-var-requires
const PDFDocument = require('pdfkit');

type Body = {
  counterpartyName: string;
  counterpartyEmail: string;
  counterpartyRole?: string; // "Employee", "Contractor", etc.
  effectiveDate?: string;    // YYYY-MM-DD
};

// Local helper to generate NDA text (kept inline to avoid brittle imports)
function renderNDA({
  counterpartyName,
  counterpartyEmail,
  counterpartyRole = 'Employee',
  effectiveDate,
}: Body): string {
  const date = effectiveDate || new Date().toISOString().slice(0, 10);

  return [
    'FELENA THEORY – MUTUAL NONDISCLOSURE AGREEMENT',
    '',
    `Effective Date: ${date}`,
    `Counterparty: ${counterpartyName} <${counterpartyEmail}> (${counterpartyRole})`,
    '',
    '1) Purpose. The parties wish to explore opportunities and may share confidential information.',
    '2) Confidential Information. Any nonpublic information disclosed by either party.',
    '3) Use & Protection. Information will be used solely for the purpose and protected with reasonable care.',
    '4) Exceptions. Information already known, public, independently developed, or rightfully received.',
    '5) Term. Confidentiality obligations last 3 years from Effective Date.',
    '6) Return/Destruction. Upon request, parties will return or destroy confidential materials.',
    '7) No License. No IP or other rights are granted by this Agreement.',
    '8) Governing Law. California, USA (or your applicable venue).',
    '',
    'The parties indicate acceptance by signature below.',
  ].join('\n');
}

// Create a simple PDF buffer with pdfkit
function createPdfBuffer(title: string, content: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'LETTER', margin: 54 }); // ~0.75" margins
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Title
    doc.fontSize(18).text(title, { align: 'center' }).moveDown(1);

    // Body
    content.split('\n').forEach((line) => {
      doc.fontSize(11).text(line, { align: 'left' });
    });

    // Signature page
    doc.addPage();
    doc.fontSize(14).text('SIGNATURES', { align: 'center' }).moveDown(2);

    const sigLine = (label: string) => {
      doc.fontSize(12).text(label);
      doc.text('Signature: __________________________');
      doc.moveDown(0.5);
      doc.text('Name: _____________________________');
      doc.moveDown(0.5);
      doc.text('Title (if any): _____________________');
      doc.moveDown(0.5);
      doc.text('Date: _____________________________');
      doc.moveDown(1.25);
    };

    sigLine('For Felena');
    sigLine('For Counterparty');

    doc.end();
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 1) Auth: require an authenticated admin (Pages Router helper)
  const supabase = createPagesServerClient({ req, res });
  const { data: user, error: userErr } = await supabase.auth.getUser();

  if (userErr || !user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Check the caller is an admin
  const { data: profile, error: profileErr } = await supabase
    .from('user_profiles')
    .select('role,email')
    .eq('id', user.user?.id)
    .maybeSingle();

  if (profileErr || !profile || profile.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  // 2) Validate inputs
  const body = (req.body ?? {}) as Partial<Body>;
  const { counterpartyName, counterpartyEmail, counterpartyRole, effectiveDate } = body;

  if (!counterpartyName || !counterpartyEmail) {
    return res.status(400).json({ error: 'counterpartyName and counterpartyEmail are required' });
  }

  // 3) Render NDA and create a PDF buffer
  const ndaText = renderNDA({ counterpartyName, counterpartyEmail, counterpartyRole, effectiveDate });
  const pdfBuffer = await createPdfBuffer('Felena Theory – Mutual NDA', ndaText);

  // 4) Upload to a PRIVATE bucket via service client
  // seAdmin is the server‑only (service role) Supabase client
  const serviceClient = seAdmin;

  // Build a safe path (e.g., legal/ndas/{user.id}/{timestamp}-{slug}.pdf)
  const safeSlug =
    counterpartyName.toLowerCase().replace(/[^a-z0-9]/gi, '-').replace(/^-+|-+$/g, '') || 'counterparty';
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const userId = user.user?.id || 'unknown';
  const storagePath = `legal/ndas/${userId}/${timestamp}-${safeSlug}.pdf`;

  try {
    // Bucket creation (best-effort; okay if it already exists)
    try {
      await serviceClient.storage.createBucket('legal', { public: false });
    } catch {
      /* ignore if already exists */
    }

    const { error: uploadErr } = await serviceClient.storage.from('legal').upload(storagePath, pdfBuffer, {
      contentType: 'application/pdf',
      upsert: false,
    });

    if (uploadErr) {
      // Fallback: if upload fails, just return the text (so the admin can still copy/paste)
      return res.status(200).json({
        ok: true,
        uploaded: false,
        message:
          'Upload failed; returning NDA text. Check your SUPABASE_SERVICE_ROLE_KEY and that bucket "legal" exists.',
        ndaText,
      });
    }

    // 5) Short‑lived signed URL (10 minutes)
    const { data: signed, error: signErr } = await serviceClient.storage.from('legal').createSignedUrl(storagePath, 600);

    if (signErr || !signed?.signedUrl) {
      return res.status(200).json({
        ok: true,
        uploaded: true,
        message: 'Stored successfully, but failed to create signed URL. You can fetch by path via admin.',
        path: storagePath,
      });
    }

    // 6) Optional audit row
    try {
      await serviceClient.from('audit_logs').insert({
        user_id: userId,
        action: 'nda_generated',
        metadata: { counterpartyName, counterpartyEmail, storagePath },
        created_at: new Date().toISOString(),
      });
    } catch {
      /* best-effort */
    }

    return res.status(200).json({
      ok: true,
      uploaded: true,
      path: storagePath,
      downloadUrl: signed.signedUrl,
    });
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error('[nda] error:', err?.message ?? err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}