import React, { useState } from 'react';
import { createBrokerAccount, uploadKycDoc } from '@/utils/alpaca';
import { fileToBase64 } from '@/utils/file';

type Props = {
  onComplete?: (accountId: string) => void;
};

export default function BrokerKycStep({ onComplete }: Props) {
  const [accountId, setAccountId] = useState<string>('');
  const [front, setFront] = useState<File | null>(null);
  const [back, setBack] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string>('');
  const [error, setError] = useState<string>('');

  async function handleCreateAccount() {
    setError(''); setMsg(''); setBusy(true);
    try {
      const res = await createBrokerAccount();
      setAccountId(res.account_id);
      setMsg(`Broker account created: ${res.account_id}`);
    } catch (e: any) {
      setError(e?.message || 'Failed to create account');
    } finally {
      setBusy(false);
    }
  }

  async function uploadOne(kind: 'front' | 'back' | 'selfie', file: File) {
    if (!accountId) throw new Error('No account yet');
    const base64 = await fileToBase64(file);
    const common = {
      accountId,
      type: 'identity_document' as const,
      mime: file.type || 'image/jpeg',
    };
    if (kind === 'front') {
      return uploadKycDoc({
        ...common,
        subType: 'drivers_license_front',
        filename: file.name || 'front.jpg',
        base64,
      });
    }
    if (kind === 'back') {
      return uploadKycDoc({
        ...common,
        subType: 'drivers_license_back',
        filename: file.name || 'back.jpg',
        base64,
      });
    }
    return uploadKycDoc({
      ...common,
      subType: 'selfie',
      filename: file.name || 'selfie.jpg',
      base64,
    });
  }

  async function handleSubmit() {
    if (!accountId) { setError('Create your broker account first.'); return; }
    if (!front || !back || !selfie) { setError('Upload front, back, and selfie.'); return; }
    setBusy(true); setError(''); setMsg('Uploading documents…');

    try {
      await uploadOne('front', front);
      await uploadOne('back', back);
      await uploadOne('selfie', selfie);
      setMsg('KYC docs uploaded. Verification is now pending.');
      onComplete?.(accountId);
    } catch (e: any) {
      setError(e?.message || 'KYC upload failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={boxStyle}>
      <h3 style={{ marginTop: 0 }}>Broker Signup & KYC</h3>

      {!accountId ? (
        <button onClick={handleCreateAccount} disabled={busy} style={btnStyle}>
          {busy ? 'Creating…' : 'Create Broker Account'}
        </button>
      ) : (
        <p><b>Account:</b> {accountId}</p>
      )}

      <div style={{ display: 'grid', gap: '0.5rem', marginTop: '1rem' }}>
        <label>
          Front of ID
          <input type="file" accept="image/*" onChange={(e) => setFront(e.target.files?.[0] || null)} />
        </label>
        <label>
          Back of ID
          <input type="file" accept="image/*" onChange={(e) => setBack(e.target.files?.[0] || null)} />
        </label>
        <label>
          Selfie
          <input type="file" accept="image/*" onChange={(e) => setSelfie(e.target.files?.[0] || null)} />
        </label>
      </div>

      <button onClick={handleSubmit} disabled={busy || !accountId} style={btnStyle}>
        {busy ? 'Submitting…' : 'Submit KYC Documents'}
      </button>

      {msg && <p style={{ color: '#00ffaa' }}>{msg}</p>}
      {error && <p style={{ color: '#ff5555' }}>{error}</p>}

      <p style={{ fontSize: 12, opacity: 0.8, marginTop: 8 }}>
        We never store your raw images; they’re sent securely to the broker for verification.
      </p>
    </div>
  );
}

const boxStyle: React.CSSProperties = {
  background: '#111',
  border: '1px solid #333',
  borderRadius: 8,
  padding: '1rem',
};

const btnStyle: React.CSSProperties = {
  marginTop: '0.75rem',
  padding: '0.6rem 0.9rem',
  borderRadius: 6,
  border: '1px solid #333',
  cursor: 'pointer',
  background: '#1b1b1b',
  color: '#eaeaea',
};