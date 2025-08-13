import type { NextApiRequest, NextApiResponse } from 'next';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';
import seAdmin from '@/utils/supabaseAdmin';
import rateLimit from '@/utils/rateLimit';
import FormData from 'form-data';

const limiter = rateLimit({ windowMs: 60_000, max: 12 });

const ALPACA_BASE_URL =
  process.env.ALPACA_BROKER_BASE_URL || 'https://broker-api.sandbox.alpaca.markets';
const ALPACA_KEY = process.env.ALPACA_BROKER_API_KEY;
const ALPACA_SECRET = process.env.ALPACA_BROKER_API_SECRET;

type Ok = { ok: true; status: string; document_id?: string };
type Err = { ok: false; error: string };

type Body = {
  accountId: string;
  type: string;        // Alpaca document_type (program-specific)
  subType?: string;    // optional document_sub_type
  filename: string;
  mime?: string;       // defaults to image/jpeg
  base64: string;      // raw file, base64-encoded
};

function bad(res: NextApiResponse<Err>, error: string, code = 400) {
  return res.status(code).json({ ok: false, error });
}

function hasEnv() {
  return !!(ALPACA_KEY && ALPACA_SECRET);
}

function validate(b: any): b is Body {
  return (
    b &&
    typeof b.accountId === 'string' &&
    typeof b.type === 'string' &&
    typeof b.filename === 'string' &&
    typeof b.base64 === 'string'
  );
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Ok | Err>
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return bad(res, 'Method not allowed', 405);
  }

  try {
    await limiter.check(res, 12, 'broker:kyc-doc');
  } catch {
    return bad(res, 'Too many requests', 429);
  }

  if (!hasEnv()) return bad(res, 'Server missing Alpaca credentials', 500);

  const supabase = createPagesServerClient({ req, res });
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) return bad(res, 'Unauthorized', 401);

  // Parse body (expecting JSON)
  const body: unknown = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  if (!validate(body)) return bad(res, 'Invalid request body');

  const { accountId, type, subType, filename, mime, base64 } = body;

  // Build multipart form for Alpaca Broker “Upload Document” endpoint
  // Endpoint: POST /v1/accounts/{account_id}/documents
  // Fields commonly supported: document_type, document_sub_type, document (file)
  const form = new FormData();
  form.append('document_type', type);
  if (subType) form.append('document_sub_type', subType);

  const buffer = Buffer.from(base64, 'base64');
  form.append('document', buffer, {
    filename,
    contentType: mime || 'image/jpeg',
    knownLength: buffer.length,
  });

  let alpacaStatus = 'submitted';
  let alpacaDocId: string | undefined;

  try {
    const resp = await fetch(
      `${ALPACA_BASE_URL}/v1/accounts/${encodeURIComponent(accountId)}/documents`,
      {
        method: 'POST',
        headers: {
          'APCA-API-KEY-ID': ALPACA_KEY!,
          'APCA-API-SECRET-KEY': ALPACA_SECRET!,
          // NOTE: form-data sets its own Content-Type boundary
          ...form.getHeaders(),
        },
        body: form as any,
      }
    );

    const json = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      const msg = json?.message || json?.error || 'Alpaca document upload failed';
      return bad(res, msg, 502);
    }

    // Alpaca typically returns a document object or list; capture what we can
    alpacaStatus = json?.status || 'submitted';
    alpacaDocId = json?.id || json?.document_id || undefined;
  } catch (e: any) {
    return bad(res, `Alpaca request failed: ${e?.message || 'unknown'}`, 502);
  }

  // Minimal audit trail (do not store the raw file!)
  try {
    await seAdmin.from('audit_logs').insert({
      user_id: user.id,
      action: 'broker_kyc_document_upload',
      details: {
        alpaca_account_id: accountId,
        alpaca_document_id: alpacaDocId,
        alpaca_status: alpacaStatus,
        type,
        subType: subType ?? null,
        filename,
      } as any,
      created_at: new Date().toISOString(),
    } as any);
  } catch (e) {
    console.error('[broker/kyc-doc] audit insert error', e);
  }

  return res.status(200).json({ ok: true, status: alpacaStatus, document_id: alpacaDocId });
}