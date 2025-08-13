export type KycDocParams = {
  accountId: string;
  type: 'identity_document' | 'address_document' | string;
  subType?: string;
  filename: string;
  mime: string;
  base64: string; // raw base64 (no "data:" prefix)
};

export async function uploadKycDoc(params: KycDocParams) {
  const res = await fetch('/api/alpaca/broker/kyc-doc', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'KYC upload failed');
  return data; // { ok: true, document_id, ... }
}

export async function createBrokerAccount() {
  const res = await fetch('/api/alpaca/broker/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    // Body can be empty; backend uses auth + defaults. Extend if you collect more fields.
    body: JSON.stringify({}),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || 'Broker signup failed');
  return data as { ok: true; account_id: string; status?: string };
}