// src/pages/onboarding/broker-kyc-step.tsx
import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

type KycDocParams = {
  accountId: string;
  type: string;        // 'identity_document' (default)
  subType?: string;    // 'drivers_license_front' | 'drivers_license_back' | 'selfie' | etc.
  filename: string;
  mime: string;
  base64: string;      // raw base64 (no data: prefix)
};

type BrokerSignupResp =
  | { ok: true; account_id: string; status?: string }
  | { ok: false; error: string };

type KycUploadResp =
  | { ok: true; status?: string; document_id?: string }
  | { ok: false; error: string };

// ─────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────
const pageBox: React.CSSProperties = {
  maxWidth: 920,
  margin: '0 auto',
  padding: '2rem 1rem',
  color: '#e8faff',
  fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Inter, Arial, sans-serif',
};
const card: React.CSSProperties = {
  background: '#0f1115',
  border: '1px solid #263042',
  borderRadius: 12,
  padding: '1rem',
  marginBottom: '1rem',
};
const h1: React.CSSProperties = { color: '#0bffcc', marginBottom: 8 };
const h2: React.CSSProperties = { color: '#8de9ff', marginBottom: 6 };
const label: React.CSSProperties = { fontWeight: 600, display: 'block', marginTop: 10, marginBottom: 6 };
const button: React.CSSProperties = {
  background: '#0bffcc',
  border: 0,
  color: '#081017',
  borderRadius: 8,
  padding: '0.6rem 1rem',
  fontWeight: 700,
  cursor: 'pointer',
};
const ghost: React.CSSProperties = {
  background: 'transparent',
  border: '1px solid #0bffcc',
  color: '#0bffcc',
  borderRadius: 8,
  padding: '0.5rem 0.9rem',
  fontWeight: 700,
  cursor: 'pointer',
};
const row: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 };
const note: React.CSSProperties = { fontSize: 13, opacity: 0.9 };

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

/** Convert File → raw base64 (no data URL prefix) */
async function fileToBase64(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  // btoa needs a binary string
  let binary = '';
  const bytes = new Uint8Array(buf);
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk) as any);
  }
  // @ts-ignore
  return btoa(binary);
}

/** Light polling hook to fetch live broker status (every 8s until approved) */
function useBrokerStatusPoll(accountId?: string) {
  const [status, setStatus] = useState<'unknown' | 'none' | 'submitted' | 'approved' | 'action_required' | 'rejected'>('unknown');

  useEffect(() => {
    let cancelled = false;
    let timer: any;

    async function tick() {
      try {
        const qs = accountId ? `?accountId=${encodeURIComponent(accountId)}` : '';
        const res = await fetch(`/api/alpaca/broker/status${qs}`, { method: 'GET' });
        const j = await res.json().catch(() => ({}));
        if (!cancelled && j?.ok) setStatus(j.status_normalized || 'unknown');

        if (!cancelled && j?.status_normalized !== 'approved') {
          timer = setTimeout(tick, 8000);
        }
      } catch {
        if (!cancelled) {
          timer = setTimeout(tick, 12000);
        }
      }
    }

    tick();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [accountId]);

  return status;
}

// ─────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────
export default function BrokerKycStepPage() {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string>('');
  const [err, setErr] = useState<string>('');

  const [accountId, setAccountId] = useState<string>('');
  const liveStatus = useBrokerStatusPoll(accountId || undefined);

  // Files
  const [front, setFront] = useState<File | null>(null);
  const [back, setBack] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);

  // Create broker account
  async function createBrokerAccount() {
    setBusy(true);
    setErr('');
    setMsg('Creating broker account…');
    try {
      const res = await fetch('/api/alpaca/broker/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}), // backend uses session + defaults or your payload mapping
      });
      const data: BrokerSignupResp = await res.json();
      if (!res.ok || !(data as any)?.ok) throw new Error((data as any)?.error || 'Broker signup failed');

      const id = (data as any).account_id as string;
      setAccountId(id);
      setMsg(`Account created: ${id}`);
    } catch (e: any) {
      setErr(e?.message || 'Could not create broker account.');
    } finally {
      setBusy(false);
    }
  }

  // Upload document wrapper
  async function uploadKycDoc(p: KycDocParams) {
    const res = await fetch('/api/alpaca/broker/kyc-doc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(p),
    });
    const data: KycUploadResp = await res.json().catch(() => ({} as any));
    if (!res.ok) throw new Error((data as any)?.error || 'Upload failed');
    return data;
  }

  // Submit all three docs
  async function submitKyc() {
    if (!accountId) {
      setErr('Create your broker account first.');
      return;
    }
    if (!front || !back || !selfie) {
      setErr('Please upload front, back, and a selfie.');
      return;
    }

    setBusy(true);
    setErr('');
    setMsg('Uploading documents…');

    try {
      const f64 = await fileToBase64(front);
      await uploadKycDoc({
        accountId,
        type: 'identity_document',
        subType: 'drivers_license_front',
        filename: front.name || 'front.jpg',
        mime: front.type || 'image/jpeg',
        base64: f64,
      });

      const b64 = await fileToBase64(back);
      await uploadKycDoc({
        accountId,
        type: 'identity_document',
        subType: 'drivers_license_back',
        filename: back.name || 'back.jpg',
        mime: back.type || 'image/jpeg',
        base64: b64,
      });

      const s64 = await fileToBase64(selfie);
      await uploadKycDoc({
        accountId,
        type: 'identity_document',
        subType: 'selfie',
        filename: selfie.name || 'selfie.jpg',
        mime: selfie.type || 'image/jpeg',
        base64: s64,
      });

      setMsg('KYC submitted. Verification pending.');
    } catch (e: any) {
      setErr(e?.message || 'KYC upload failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Head>
        <title>Broker KYC • Felena Theory</title>
        <meta name="robots" content="noindex" />
      </Head>

      <div style={pageBox}>
        <h1 style={h1}>Broker KYC</h1>
        <p style={note}>
          To <strong>withdraw XP value to the real world</strong>, you must complete broker onboarding (KYC).
          Your account is created with our broker partner and documents are reviewed for compliance.
        </p>

        {/* Status card */}
        <div style={card}>
          <h2 style={h2}>Status</h2>
          <p>
            Account:&nbsp;
            {accountId ? <code>{accountId}</code> : <em>not created</em>}
            <br />
            KYC:&nbsp;<b>{liveStatus}</b>
          </p>
          {!accountId ? (
            <button style={button} onClick={createBrokerAccount} disabled={busy}>
              {busy ? 'Creating…' : 'Create Broker Account'}
            </button>
          ) : (
            <button
              style={ghost}
              onClick={() => setMsg('If KYC shows submitted, approval can take a bit.')}
              disabled={busy}
            >
              Refresh / Info
            </button>
          )}
        </div>

        {/* Upload docs */}
        <div style={card}>
          <h2 style={h2}>Upload Documents</h2>
          {!accountId && <p style={note}>Create your broker account first.</p>}

          <div style={row}>
            <div>
              <label style={label}>Front of ID</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFront(e.target.files?.[0] || null)}
                disabled={!accountId || busy}
              />
            </div>
            <div>
              <label style={label}>Back of ID</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setBack(e.target.files?.[0] || null)}
                disabled={!accountId || busy}
              />
            </div>
          </div>

          <div style={{ marginTop: 10 }}>
            <label style={label}>Selfie</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setSelfie(e.target.files?.[0] || null)}
              disabled={!accountId || busy}
            />
          </div>

          <div style={{ marginTop: 14, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button
              style={button}
              onClick={submitKyc}
              disabled={!accountId || busy || !front || !back || !selfie}
            >
              {busy ? 'Submitting…' : 'Submit KYC'}
            </button>
            <Link href="/onboarding/onboarding" style={ghost}>
              Back to Onboarding
            </Link>
          </div>

          <p style={{ ...note, marginTop: 10 }}>
            We never store your raw images; they’re sent securely to the broker for verification.
          </p>
        </div>

        {/* Messages */}
        {msg && (
          <div style={{ ...card, borderColor: '#1d3a2f' }}>
            <strong>✓</strong> {msg}
          </div>
        )}
        {err && (
          <div style={{ ...card, borderColor: '#4b2a2a' }}>
            <strong>⚠</strong> {err}
          </div>
        )}
      </div>
    </>
  );
}