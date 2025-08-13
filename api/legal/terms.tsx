// src/pages/terms.tsx
import Head from 'next/head';
import React from 'react';
import styles from '@/styles/crtLaunch.module.css';

export default function TermsPage() {
  const updatedAt = 'August 10, 2025';

  return (
    <>
      <Head>
        <title>Felena Theory — Terms of Use & XP Policy</title>
        <meta name="robots" content="noindex" />
      </Head>

      <div className={styles.crtScreen}>
        <div className={styles.crtShell}>
          <header className={styles.crtHeader}>
            <span className={styles.crtTag}>Felena Theory</span>
            <span className={styles.crtStats}>
              <span>Page:</span> Terms of Use & XP Policy
              <span className="ml-3">Status:</span> ONLINE
            </span>
          </header>

          <main className={styles.crtMain}>

            {/* XP Digital Utility */}
            <section>
              <h2 className="text-xl text-cyan-400 font-bold p-2">XP as Digital Utility</h2>
              <p>
                Experience Points (XP) is a digital access mechanism within the Felena Theory grid. XP is non-cash,
                non-tokenized, and not exchangeable for fiat or crypto. XP has no intrinsic or monetary value and is used
                solely for internal system actions such as game access, unlocks, tiers, crates, raffles, and other in-app
                utilities. XP is not a currency, not a security, and not a financial instrument.
              </p>
            </section>

            {/* Legal Structure & Tax */}
            <section>
              <h2 className="text-xl text-cyan-400 font-bold p-2">Legal Structure & Tax Positioning</h2>
              <p>
                XP represents access, not a security or investment. XP is not subject to taxation as income, winnings,
                or capital gains by Felena Theory. All XP systems are internally simulated and classified as non-monetary
                entertainment utilities. No user should construe any part of Felena Theory as providing financial advice
                or regulated investment products.
              </p>
            </section>

            {/* Guardian / Child Protections */}
            <section>
              <h2 className="text-xl text-cyan-400 font-bold p-2">Guardian Compliance & Child Labor Protections</h2>
              <p>
                Minors are permitted to use the Kids grid under full guardian consent (COPPA-compliant). All youth XP is
                segmented and governed by a 7/30/90 XP split system. Felena Theory enforces strict protections to ensure
                safety and responsible access.
              </p>
            </section>

            {/* AI Governance */}
            <section>
              <h2 className="text-xl text-cyan-400 font-bold p-2">AI Governance & Regulatory Grandfathering</h2>
              <p>
                All current and future iterations of Felena Theory, Autonomic AI, algorithmic orchestration, engine
                black-box, and multi-chain referral systems run under a legally protected intellectual structure registered
                under Felena Holdings LLC. Should future standards change, we will maintain continuity via lawful
                grandfathering and published change logs.
              </p>
            </section>

            {/* Proprietary & Integrations */}
            <section>
              <h2 className="text-xl text-cyan-400 font-bold p-2">Proprietary Logic & Integration Protections</h2>
              <p>
                The engine orchestration framework, database adapters, QRUplink behavior, and multi-chain referral systems
                are proprietary. Any clone, mimicry, or derivative implementation is strictly prohibited without written
                authorization.
              </p>
            </section>

            {/* QRUplink */}
            <section>
              <h2 className="text-xl text-cyan-400 font-bold p-2">QRUplink Chain Participation</h2>
              <p>
                The QRUplink Chain is an optional feature that connects users into a seasonal activity network within the
                Felena Theory platform. Participation is voluntary and not required to access core features.
              </p>
              <p>
                Each QRUplink Chain operates in <strong>90-day seasons</strong>. At the end of each season, the{' '}
                <strong>QRUplink flow chain</strong> (the referral flow network and its positional structure) is reset for
                fairness and equal opportunity. <strong>XP balances and tier progression are not reset</strong> and carry
                forward between seasons.
              </p>
              <p>
                New QRUplink codes are released publicly at the start of each season to ensure fairness. Public drops are
                commonly 20 codes at a time but may vary at Felena Theory’s discretion.
              </p>
              <p>
                QRUplink participation does not involve paying for the right to recruit. All earnings and tier progression
                must derive from legitimate platform activity, including but not limited to:
              </p>
              <ul className="list-disc ml-6">
                <li>Purchasing XP for in-app use and unlocks</li>
                <li>Referrals where new users engage in XP purchases or XP-based activities</li>
                <li>Approved third-party referral partnerships</li>
                <li>Lottery and chance-based XP prize events</li>
                <li>Gambling or XP-based game play within platform rules</li>
                <li>Completing sanctioned in-app actions, challenges, or unlocks</li>
              </ul>
              <p>
                QRUplink codes may generate upstream rewards for the holder when referred users make XP purchases or
                perform XP-related actions during the same 90-day season. Earlier access and sharing can increase the
                potential to capture seasonal chain activity before the reset. Earnings are based on in-season
                QRUplink network activity, not on carryover from prior seasons.
              </p>
              <p>
                Prior to each public drop, Felena Theory may seed QRUplink codes internally with DBAs under the Felena
                umbrella and with employees under NDA to ensure immediate activity upon launch. Internal structures are
                not open to public participation and do not pay direct public commissions.
              </p>
              <p>
                The QRUplink Chain is <strong>not</strong> a pyramid scheme. Safeguards include: (i) no payment for the
                right to recruit; (ii) XP is a real utility with in-platform function; (iii) rewards derive from activity
                and XP usage, not solely recruitment; (iv) a fixed 90-day QRUplink reset prevents perpetual position
                advantage; and (v) seasonal public drops ensure fair opportunity.
              </p>
              <p>
                Felena Theory may adjust drop quantities, season length, and reward parameters to maintain a balanced,
                fair, and compliant system.
              </p>
            </section>

            {/* Platform Enforcement */}
            <section>
              <h2 className="text-xl text-cyan-400 font-bold p-2">Platform Enforcement & Federal Actions</h2>
              <p>
                Unauthorized access, scraping, tampering, reproduction, or reverse engineering of the Felena system will
                be pursued to the fullest extent of the law, including but not limited to CFAA, DMCA, trade secret,
                contract, and computer misuse statutes.
              </p>
            </section>

            {/* Games / Crates / Jackpots */}
            <section>
              <h2 className="text-xl text-cyan-400 font-bold p-2">Crates, Engines, Jackpots, and Game Systems</h2>
              <p>
                All crates, jackpot simulations, algorithmic engines, and casino-style XP games operate within a sealed XP
                grid. They do not provide real-world prizes, payouts, or cash, and are bound to XP utility rules, odds
                disclosures, and local-law compliance gating.
              </p>
            </section>

            {/* XP Conversion Path */}
            <section>
              <h2 className="text-xl text-cyan-400 font-bold p-2">XP Conversion Path</h2>
              <p>
                There are no financial investments. XP is a digital access token inside simulated XP units used solely
                within the Felena Theory grid. No representations of returns are made. Cash-out, where available, is
                limited to in-app rules and compliant jurisdictions only.
              </p>
            </section>

            {/* Umbrella & IP */}
            <section>
              <h2 className="text-xl text-cyan-400 font-bold p-2">Umbrella Structure & Internal IP Contracts</h2>
              <p>
                Felena Holdings LLC operates a utility-based digital simulation platform. DBA orgs, Oracles, Arcade,
                Control Console, XP Hub, and Override Panel are operated as modular divisions under Felena Holdings LLC.
                All team members, contractors, and DBAs operate under binding NDA and IP assignment agreements.
              </p>
            </section>

            {/* Legal Safeguards */}
            <section>
              <h2 className="text-xl text-cyan-400 font-bold p-2">Legal Safeguards, Disclaimers & Limitations</h2>
              <p><strong>Assumption of Risk:</strong> Users participate at their own risk and understand all XP and QRUplink
              flows are for entertainment and internal platform purposes only.</p>
              <p><strong>No Warranties:</strong> The platform is provided “as-is” without any warranty, express or implied.</p>
              <p><strong>Limitation of Liability:</strong> Felena Holdings LLC’s total liability shall not exceed the amount paid
              by the user to Felena Theory in the 12 months prior to the claim (often $0 for XP utility users).</p>
              <p><strong>Indemnification:</strong> Users agree to indemnify and hold harmless Felena Holdings LLC from any claims,
              damages, or expenses arising from their actions or misuse of the platform.</p>
              <p><strong>Reservation of Rights:</strong> Felena Theory may modify, suspend, or terminate any part of the
              platform at any time for any reason without liability.</p>
              <p><strong>No Reliance:</strong> Users agree they have not relied on any representation outside these terms.</p>
              <p><strong>Entire Agreement:</strong> This document constitutes the entire agreement between Felena Theory and the user.</p>
              <p><strong>Binding Arbitration:</strong> Any dispute shall be resolved by binding arbitration in Iowa, with no
              class actions permitted, except as required by non-waivable law.</p>
            </section>

            {/* Arbitration & Venue */}
            <section>
              <h2 className="text-xl text-cyan-400 font-bold p-2">Binding Arbitration & Venue Lock</h2>
              <p>
                Any disputes or legal concerns arising from use of Felena Theory shall be resolved through binding
                arbitration in the state of Iowa. No class actions, external court filings, or international lawsuits are
                permitted unless required by non-waivable local law. Users waive any objection to personal jurisdiction
                and venue in Iowa.
              </p>
            </section>

            {/* Updates */}
            <section className="opacity-75 text-xs mt-6">
              <p>© Felena Holdings LLC. All systems secured, versioned, and protected. Last revised {updatedAt}.</p>
            </section>

          </main>
        </div>
      </div>
    </>
  );
}