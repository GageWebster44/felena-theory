// ledger_sign.ts
// Auto-signs entries to the Felena IP Vault

import fs from 'fs';
import crypto from 'crypto';

const entry = {
  timestamp: "2025-07-31T17:20:07.319513",
  author: "The Architect",
  description: "Signed initial 5 core systems to Felena Theory IP Vault",
  file: "ip_ledger.json"
};

const hash = crypto
  .createHash('sha256')
  .update(JSON.stringify(entry))
  .digest('hex');

fs.writeFileSync('vault/ip-ledger/ledger_signature.txt', `HASH: ${hash}\nENTRY: ${JSON.stringify(entry, null, 2)}`);

