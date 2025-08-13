// src/components/ConsentBanner.tsx
import React, { useEffect, useState } from 'react';
import Link from 'next/link';

const CONSENT_VERSION = '1.0.0'; // bump if Terms/Privacy materially change
const STORAGE_KEY = 'felena_consent_version';

export default function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Guard SSR
    if (typeof window === 'undefined') return;
    try {
      const v = window.localStorage.getItem(STORAGE_KEY);
      setVisible(v !== CONSENT_VERSION);
    } catch {
      setVisible(true);
    }
  }, []);

  function accept() {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, CONSENT_VERSION);
      }
    } catch {}
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: 'rgba(0, 20, 30, 0.95)',
        borderTop: '1px solid rgba(0,255,255,0.25)',
        backdropFilter: 'blur(4px)',
      }}
      className="text-sm text-cyan-100"
      role="dialog"
      aria-live="polite"
    >
      <div className="mx-auto max-w-5xl px-4 py-3 flex flex-col md:flex-row items-start md:items-center gap-3">
        <div className="flex-1">
          By using Felena Theory you agree to our{' '}
          <Link href="/terms" className="underline text-cyan-300">Terms</Link> and{' '}
          <Link href="/privacy" className="underline text-cyan-300">Privacy Policy</Link>.
          Some data is used for security, ops, and product analytics. You can withdraw by closing your account.
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={accept}
            className="px-3 py-1 border border-cyan-400 text-cyan-200 hover:bg-cyan-900/30 rounded"
          >
            I Agree
          </button>
        </div>
      </div>
    </div>
  );
}