// src/utils/notifyUser.ts
export default async function notifyUser(userId: string, message: string) {
  // Wire this up to your real notifier later (email, push, in‑app).
  console.log(`[notifyUser] -> ${userId}: ${message}`);
  return { ok: true };
}