import type { NextApiRequest, NextApiResponse } from 'next';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';
import seAdmin from '@/utils/supabaseAdmin';
import crypto from 'crypto';

type AlpacaWebhookEvent = {
  event: string; // e.g., "ACCOUNT_STATUS_UPDATE"
  account_id: string;
  status: string; // e.g., "APPROVED", "REJECTED", "ACTION_REQUIRED"
  [key: string]: any;
};

// Optional: set in env for signature verification
const WEBHOOK_SECRET = process.env.ALPACA_WEBHOOK_SECRET || '';

function verifySignature(rawBody: string, signature: string | undefined) {
  if (!WEBHOOK_SECRET) return true; // if no secret set, skip verify
  if (!signature) return false;
  const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
  hmac.update(rawBody, 'utf8');
  const digest = hmac.digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(digest, 'hex'));
}

export const config = {
  api: {
    bodyParser: false, // we need raw body for signature check
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    // Grab raw body
    const buffers: Uint8Array[] = [];
    for await (const chunk of req) buffers.push(chunk);
    const rawBody = Buffer.concat(buffers).toString('utf8');

    // Verify signature if provided
    const signature = req.headers['x-alpaca-signature'] as string | undefined;
    if (!verifySignature(rawBody, signature)) {
      return res.status(401).json({ ok: false, error: 'Invalid webhook signature' });
    }

    const event: AlpacaWebhookEvent = JSON.parse(rawBody);
    console.log('[Alpaca Webhook]', event);

    const accountId = event.account_id;
    const status = event.status;

    if (!accountId || !status) {
      return res.status(400).json({ ok: false, error: 'Missing account_id or status' });
    }

    // Normalize the status to match our gating logic
    const normalized = (() => {
      const u = status.toUpperCase();
      if (['APPROVED', 'ACTIVE', 'ACCOUNT_APPROVED'].includes(u)) return 'approved';
      if (['SUBMITTED', 'PENDING', 'ACCOUNT_SUBMITTED', 'OPENING'].includes(u)) return 'submitted';
      if (['ACTION_REQUIRED', 'DOCUMENT_REQUIRED', 'ACCOUNT_ACTION_REQUIRED'].includes(u)) return 'action_required';
      if (['REJECTED', 'DENIED', 'ACCOUNT_REJECTED', 'CLOSED'].includes(u)) return 'rejected';
      return 'unknown';
    })();

    // Find the user by account_id
    const { data: acctRow } = await seAdmin
      .from('alpaca_accounts') // change if you use broker_links
      .select('user_id')
      .eq('account_id', accountId)
      .maybeSingle();

    if (!acctRow?.user_id) {
      console.warn(`[Alpaca Webhook] No user found for account_id ${accountId}`);
    } else {
      // Update stored status
      await seAdmin
        .from('alpaca_accounts')
        .upsert({
          user_id: acctRow.user_id,
          account_id: accountId,
          status,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      // Optionally log to audit_logs
      await seAdmin
        .from('audit_logs')
        .insert({
          user_id: acctRow.user_id,
          action: 'broker_status_update',
          details: { account_id: accountId, status, normalized },
        });
    }

    return res.status(200).json({ ok: true });
  } catch (e: any) {
    console.error('[Alpaca Webhook] Error', e);
    return res.status(500).json({ ok: false, error: e?.message || 'Webhook error' });
  }
}