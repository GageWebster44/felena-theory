import { useUser } from '@supabase/auth-helpers-react';
import { withGuardianGate } from '@/components/withGuardianGate';
import { useEffect } from 'react';
import { markOnboardingStep } from '@/utils/onboarding-progress';
import styles from '@/styles/crtLaunch.module.css';

function TermsPage() {
export default withGuardianGate(Page);
  const user = useUser();

  useEffect(() => {
    if (user) markOnboardingStep(user.id, 'accepted_terms');
  }, [user]);

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtScreen}>
      <h1 className="text-3xl font-bold text-center text-green-400">📜 Terms of Use & XP Policy</h1>

      <div className="mt-6 space-y-6 text-cyan-300 font-mono text-sm">
        <section>
          <h2 className="text-xl text-cyan-400 font-bold">1. XP as Digital Utility</h2>
          <p>XP (Experience Points) is a digital access mechanism within the Felena Theory grid. XP is non-cash, non-tokenized, and not exchangeable for fiat or crypto. XP is purely used for internal system actions such as unlocking features, triggering simulations, or accessing digital tools. All XP logic is sandboxed, user-initiated, and stateless outside the grid.</p>
        </section>

        <section>
          <h2 className="text-xl text-cyan-400 font-bold">2. Legal Structure & Tax Positioning</h2>
          <p>Felena Holdings LLC operates a utility-based digital simulation platform. XP is not subject to taxation as income, winnings, or capital gains. All XP systems are internally simulated and classified as non-reportable under IRS guidelines due to lack of redeemable value. Crate rewards, engine outcomes, jackpots, and ladder bonuses are non-taxable symbolic logic loops. Felena Holdings LLC will never issue a 1099 or W-2 in relation to XP accrual or use. Users are prohibited from misrepresenting XP value externally.</p>
        </section>

        <section>
          <h2 className="text-xl text-cyan-400 font-bold">3. Guardian Compliance & Child Labor Protections</h2>
          <p>Minors are permitted to use the Kids Grid under full guardian consent (COPPA-compliant). All youth XP is segmented and governed by a 70/30 XP split system. Felena Theory enforces strict protections to ensure XP engagement by minors is educational and non-monetary. There is no labor exchange or real-world compensation for youth participants. Guardians maintain full control of payouts and account actions.</p>
        </section>

        <section>
          <h2 className="text-xl text-cyan-400 font-bold">4. AI Governance & Regulatory Grandfathering</h2>
          <p>All current and future iterations of Felena Theory, including AI, algorithmic, and autonomous branches, fall under a legally protected intellectual structure registered under Felena Holdings LLC. Should future laws evolve in regard to AI regulation, user data, algorithmic payouts, or synthetic incentives, Felena Holdings LLC claims perpetual grandfathered operation status for all systems launched before January 1st, 2026. This includes XP logic, digital badge issuance, and uplink structures.</p>
        </section>

        <section>
          <h2 className="text-xl text-cyan-400 font-bold">5. Proprietary Logic & Integration Protection</h2>
          <p>All XP ladder structures, crate mechanics, override dashboards, AI orchestration, engine behavior, and uplink-chain referral systems are proprietary. Any clone, mimicry, or derivative implementation is strictly prohibited and constitutes intellectual property theft. All interactions, transactions, and behavioral flows within Felena Theory are considered confidential IP. This includes system simulations triggered by XP, guardian-verified access controls, and quantum engine unlocks.</p>
        </section>

        <section>
          <h2 className="text-xl text-cyan-400 font-bold">6. Platform Enforcement & Federal Action</h2>
          <p>Any unauthorized access, scraping, forking, reproduction, or reverse engineering of the Felena system will be pursued to the fullest extent of the law, including but not limited to CFAA, DMCA, trade secret misappropriation, and breach of digital use terms. Legal venue shall be established in the state of Iowa, United States. Felena Holdings LLC reserves the right to deploy automated and/or AI-driven legal action tracking for violations.</p>
        </section>

        <section>
          <h2 className="text-xl text-cyan-400 font-bold">7. Crates, Engines, Jackpots, and Game Systems</h2>
          <p>All crates, jackpot simulations, algorithmic engines, and casino-style XP games (slots, blackjack, crash, roulette) operate within a sealed XP grid. They do not provide real-world prizes, payouts, or cash. All rewards are algorithmic XP or cosmetic digital objects. These mechanics simulate chance and skill-based interactions for operator progression within the system only.</p>
        </section>

        <section>
          <h2 className="text-xl text-cyan-400 font-bold">8. $ > XP Conversion Path</h2>
          <p>The system may offer XP acquisition through voluntary Stripe checkout interactions. These are not financial investments. They are digital unlocks into simulated XP units used solely within the Felena Theory system. XP purchased cannot be resold, refunded, or transferred. Converting dollars into XP constitutes agreement to the simulation-only access policy. There is no legal claim on future value or profit.</p>
        </section>

        <section>
          <h2 className="text-xl text-cyan-400 font-bold">9. Umbrella Structure & Internal IP Contracts</h2>
          <p>All affiliated apps, games, and modules — including Kids Grid, Quantum Arcade, EchoMind Console, XP Hub, and Override Panel — are operated as modular divisions under Felena Holdings LLC. All team members, contributors, agents, and collaborators agree to internal non-competition clauses and waive ownership rights to any derivative logic created using the Felena stack unless granted license. Felena Holdings LLC retains full IP authority.</p>
        </section>

        <section>
          <h2 className="text-xl text-cyan-400 font-bold">10. Binding Arbitration & Venue Lock</h2>
          <p>Any disputes or legal complaints arising from use of Felena Theory shall be resolved through binding arbitration in the state of Iowa. No class action claims, external court filings, or international lawsuits will be recognized. These terms constitute the full agreement between user and operator. Terms are enforced under U.S. Federal and Iowa commercial IP code.</p>
        </section>

        <p className="text-center mt-10 text-xs text-gray-400 italic">
          © Felena Holdings LLC — All systems secured, audited, and protected. Last revised August 5, 2025.
        </p>
    </div>
  );
}