// src/pages/privacy.tsx
import Head from 'next/head';
import React from 'react';
import styles from '@/styles/crtLaunch.module.css';

export default function PrivacyPage() {
  const updatedAt = 'August 10, 2025';

  return (
    <>
      <Head>
        <title>Privacy Policy • Felena Theory</title>
        <meta name="robots" content="noindex" />
      </Head>

      <div className={styles.crtScreen}>
        <div className={styles.crtShell}>
          <header className={styles.crtHeader}>
            <span className={styles.crtTag}>Felena Theory</span>
            <span className={styles.crtStats}>
              <span>Page:</span> Privacy Policy
              <span className="ml-3">Status:</span> ONLINE
            </span>
          </header>

          <main className={styles.crtMain}>
            <h1 className="text-2xl text-cyan-400 font-bold p-2">Privacy Policy</h1>

            <section>
              <h2 className="text-xl text-cyan-400 font-bold p-2">What We Collect</h2>
              <ul className="list-disc ml-6 text-sm">
                <li>Account: email, username, profile role (from <em>public.user_profiles</em>).</li>
                <li>Usage: session events, XP actions, feature flags used.</li>
                <li>Device basics: browser/OS, coarse region. We avoid precise location.</li>
                <li>Logs: timestamped error/audit events for security and ops.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl text-cyan-400 font-bold p-2">How We Use It</h2>
              <ul className="list-disc ml-6 text-sm">
                <li>Run the app (auth, XP utilities, engines, QRUplink seasons).</li>
                <li>Security/enforcement (fraud checks, RLS policy decisions).</li>
                <li>Product analytics and reliability (crash/error diagnostics).</li>
                <li>Legal compliance and dispute resolution.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl text-cyan-400 font-bold p-2">Sharing</h2>
              <p className="text-sm">
                We share with infrastructure providers only as needed to operate the service (e.g., Supabase for auth/DB,
                hosting/CDN). We don’t sell personal data. We disclose if required by law or to protect our rights and users.
              </p>
            </section>

            <section>
              <h2 className="text-xl text-cyan-400 font-bold p-2">Retention</h2>
              <p className="text-sm">
                Account data is retained while your account is active. Security and audit logs may be kept longer for
                compliance and fraud prevention. We periodically aggregate or anonymize analytics data.
              </p>
            </section>

            <section>
              <h2 className="text-xl text-cyan-400 font-bold p-2">Your Choices</h2>
              <ul className="list-disc ml-6 text-sm">
                <li>Access/update your profile via in‑app settings.</li>
                <li>Request deletion of your account and associated personal data (subject to legal holds).</li>
                <li>Control cookies/consent in the banner below.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl text-cyan-400 font-bold p-2">Security</h2>
              <p className="text-sm">
                We use RLS policies, role checks, and least‑privilege access. No system is perfectly secure; use strong
                passwords and keep your session private.
              </p>
            </section>

            <section>
              <h2 className="text-xl text-cyan-400 font-bold p-2">Contact</h2>
              <p className="text-sm">
                For privacy questions or requests, contact: <span className="underline">privacy@felenatheory.com</span>
              </p>
            </section>

            <section className="opacity-75 text-xs mt-6">
              <p>© Felena Holdings LLC. Last revised {updatedAt}.</p>
            </section>
          </main>
        </div>
      </div>
    </>
  );
}