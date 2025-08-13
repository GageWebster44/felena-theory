// src/pages/api/broker/signup.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase'; // if you have generated types; otherwise remove this import and generic
import seAdmin from '@/utils/supabaseAdmin'; // service-role client (server only)
import rateLimit from '@/utils/rateLimit'; // if you don’t have this, remove the guard or create it
// ^ You already used a rateLimit util elsewhere. If the path differs, update the import.

const limiter = rateLimit({ windowMs: 60_000, max: 10 }); // 10 req/min per IP

// Prefer putting these in your .env
const ALPACA_BASE_URL =
  process.env.ALPACA_BROKER_BASE_URL || 'https://broker-api.sandbox.alpaca.markets';
const ALPACA_KEY = process.env.ALPACA_BROKER_API_KEY;
const ALPACA_SECRET = process.env.ALPACA_BROKER_API_SECRET;

type Ok = { ok: true; account_id: string; status: string };
type Err = { ok: false; error: string };

// Minimal KYC payload (expand as needed)
// See Alpaca Broker API docs for full fields. Keep SSN/DOB handling server-only.
interface BrokerSignupBody {
  legal_name: string;                // "First Last"
  email: string;
  phone: string;                     // E.164 recommended
  address: {
    street: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;                 // "US"
  };
  identity: {
    dob: string;                     // "YYYY-MM-DD"
    ssn: string;                     // last4 or full per your program (handle carefully!)
    citizenship: string;             // "US"
  };
  disclosures?: {
    is_control_person?: boolean;
    is_affiliated_exchange_or_finra?: boolean;
    is_politically_exposed?: boolean;
    immediate_family_exposed?: boolean;
  };
}

function bad(res: NextApiResponse<Err>, error: string, code = 400) {
  return res.status(code).json({ ok: false, error });
}

function requireEnv(res: NextApiResponse<Err>) {
  if (!ALPACA_KEY || !ALPACA_SECRET) {
    return bad(res, 'Server missing Alpaca broker credentials', 500);
  }
  return null;
}

function validate(b: any): b is BrokerSignupBody {
  if (!b || typeof b !== 'object') return false;
  const ok =
    typeof b.legal_name === 'string' &&
    typeof b.email === 'string' &&
    typeof b.phone === 'string' &&
    b.address &&
    typeof b.address.street === 'string' &&
    typeof b.address.city === 'string' &&
    typeof b.address.state === 'string' &&
    typeof b.address.postal_code === 'string' &&
    typeof b.address.country === 'string' &&
    b.identity &&
    typeof b.identity.dob === 'string' &&
    typeof b.identity.ssn === 'string' &&
    typeof b.identity.citizenship === 'string';
  return ok;
}

// Map our input to Alpaca Broker "accounts" payload
function toAlpacaPayload(b: BrokerSignupBody) {
  // Minimal common fields; add more per your program config
  return {
    contact: {
      email_address: b.email,
      phone_number: b.phone,
      street_address: [b.address.street],
      city: b.address.city,
      state: b.address.state,
      postal_code: b.address.postal_code,
      country: b.address.country,
    },
    identity: {
      given_name: b.legal_name.split(' ').slice(0, -1).join(' ') || b.legal_name,
      family_name: b.legal_name.split(' ').slice(-1)[0] || b.legal_name,
      date_of_birth: b.identity.dob,
      tax_id: b.identity.ssn, // handle securely — do not log
      country_of_citizenship: b.identity.citizenship,
    },
    disclosures: {
      is_control_person: !!b.disclosures?.is_control_person,
      is_affiliated_exchange_or_finra: !!b.disclosures?.is_affiliated_exchange_or_finra,
      is_politically_exposed: !!b.disclosures?.is_politically_exposed,
      immediate_family_exposed: !!b.disclosures?.immediate_family_exposed,
    },
    agreements: [
      { agreement: 'margin_agreement', signed_at: new Date().toISOString(), ip_address: '0.0.0.0' },
      { agreement: 'account_agreement', signed_at: new Date().toISOString(), ip_address: '0.0.0.0' },
      { agreement: 'customer_agreement', signed_at: new Date().toISOString(), ip_address: '0.0.0.0' },
    ],
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Ok | Err>
) {
  // Method guard
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return bad(res, 'Method not allowed', 405);
  }

  // Rate limit
  try {
    await limiter.check(res, 10, 'broker:signup'); // key prefix
  } catch {
    return bad(res, 'Too many requests', 429);
  }

  // Ensure env
  const envErr = requireEnv(res);
  if (envErr) return envErr;

  // Get the logged-in user (Supabase session cookie)
  const supabase = createPagesServerClient<Database>({ req, res });
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) return bad(res, 'Unauthorized', 401);

  // Validate body
  let body: BrokerSignupBody;
  try {
    body = req.body && typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch {
    return bad(res, 'Invalid JSON body');
  }
  if (!validate(body)) return bad(res, 'Missing or invalid fields');

  // Build payload
  const payload = toAlpacaPayload(body);

  // Call Alpaca Broker API
  let accountId = '';
  let status = '';
  try {
    const r = await fetch(`${ALPACA_BASE_URL}/v1/accounts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'APCA-API-KEY-ID': ALPACA_KEY!,
        'APCA-API-SECRET-KEY': ALPACA_SECRET!,
      },
      body: JSON.stringify(payload),
    });

    const pj = await r.json().catch(() => ({}));
    if (!r.ok) {
      const errMsg = pj?.message || pj?.error || 'Alpaca broker error';
      return bad(res, `Alpaca signup failed: ${errMsg}`, 502);
    }

    accountId = pj?.id || pj?.account_id || '';
    status = pj?.status || 'submitted';
    if (!accountId) return bad(res, 'Alpaca returned no account id', 502);
  } catch (e: any) {
    return bad(res, `Alpaca request failed: ${e?.message || 'unknown'}`, 502);
  }

  // Persist to DB (service role client)
  try {
    // Update the profile with broker IDs
    await seAdmin
      .from('user_profiles')
      .update({
        alpaca_account_id: accountId,
        alpaca_status: status,
        // we do NOT store SSN or DOB!
      })
      .eq('id', user.id);

    // Audit log
    await seAdmin.from('audit_logs').insert({
      user_id: user.id,
      action: 'broker_signup',
      details: {
        alpaca_account_id: accountId,
        alpaca_status: status,
      } as any,
      created_at: new Date().toISOString(),
    } as any);
  } catch (e) {
    // If audit insert fails, don’t block the success response—just report it
    console.error('[broker/signup] DB persist error:', e);
  }

  return res.status(200).json({ ok: true, account_id: accountId, status });
}