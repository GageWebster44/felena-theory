import styles from '@/styles/crtLaunch.module.css';

export default function TermsPage() {
  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtScreen}>
      <h1 className="text-3xl font-bold text-green-400">📜 Terms & XP Policy</h1>

      <div className="mt-4 space-y-6 text-sm text-green-300">
        <section>
          <h2 className="text-xl text-cyan-400 font-bold">1. XP as Digital Utility</h2>
          <p>
            XP (Experience Points) is a non-cash digital unit within the Felena Theory ecosystem. All XP purchases, claims,
            and transfers are final. XP is used to unlock advanced systems, enter jackpot pools, trigger crate rewards,
            or activate trading algorithms. XP holds intrinsic value in the system but is not classified as fiat currency.
          </p>
        </section>

        <section>
          <h2 className="text-xl text-cyan-400 font-bold">2. Uplink Chain Participation</h2>
          <p>
            Users may optionally share their Connect Code to receive uplink XP bonuses when others join the system. XP flows
            upward from confirmed Connects through the Uplink Chain. Chain resets occur seasonally. Operator retains root
            control and branch assignment rights.
          </p>
        </section>

        <section>
          <h2 className="text-xl text-cyan-400 font-bold">3. Crate Drops & Unlocks</h2>
          <p>
            Crates contain randomized digital rewards triggered by XP events. Some crates unlock unique algorithmic traits within
            the system. Crates cannot be resold or exchanged externally.
          </p>
        </section>

        <section>
          <h2 className="text-xl text-cyan-400 font-bold">4. XP Lottery & Jackpot Pool</h2>
          <p>
            Users may voluntarily enter the XP Lottery using XP. Jackpot pool grows in real time and resets weekly unless
            won. Winning triggers a branch payout through the uplink chain. Non-winners receive rebate XP. The Operator
            guarantees the integrity of the draw mechanism. This feature simulates digital risk-reward dynamics in a
            gamified context, not real-world gambling.
          </p>
        </section>

        <section>
          <h2 className="text-xl text-cyan-400 font-bold">5. Algorithmic Autonomy Engine</h2>
          <p>
            Deploying XP through the ATM simulator grants access to live algorithmic engines that trade using real-world
            market data. XP triggers are legally defined as software access units, not investments. Algorithms operate on
            behalf of the user and generate projected XP outputs based on engine tier and override status.
          </p>
        </section>

        <section>
          <h2 className="text-xl text-cyan-400 font-bold">6. Override & Manual Adjustments</h2>
          <p>
            Users and/or designated Admins may override XP balances for audit, reward, or punitive reasons. All
            overrides are logged and reviewed for abuse. Manual injections require a justification code and are visible
            to the Operator. This system enforces fairness without limiting momentum.
          </p>
        </section>

        <section>
          <h2 className="text-xl text-cyan-400 font-bold">7. Legal Status of Contributors & Roles</h2>
          <p>
            Developers, Admins, or collaborators do not assume equity, ownership, or employment status by contributing to the
            Felena platform. Contributions are bound under non-dilutive, non-transferable work-for-hire guidelines. All
            earnings are XP-based unless separately contracted. Felena Holdings LLC retains full rights to terminate access,
            revoke privileges, or dissolve contracts at any time.
          </p>
        </section>

        <section>
          <h2 className="text-xl text-cyan-400 font-bold">8. Intellectual Property & Contributor Waiver</h2>
          <p>
            All core systems, designs, terminology, engine behaviors, XP mechanisms, UI patterns, algorithms, crates, lottery
            logic, uplink tree structure, and override controls are proprietary intellectual property of Felena Holdings LLC.
            No contractor, contributor, developer, or third party may claim reuse, forking rights, or external monetization
            of these structures without explicit legal licensing. Use of this platform implies waiver of any creative
            ownership claim unless explicitly granted in writing.
          </p>
        </section>

        <section>
          <h2 className="text-xl text-cyan-400 font-bold">9. Trademark & Proprietary Language</h2>
          <ul className="list-disc ml-4">
            <li>"Felena Theory" is a protected name and conceptual framework under Felena Holdings LLC</li>
            <li>"Quantum Arcade" is a proprietary term representing the unique fusion of algorithmic gameplay and XP economics</li>
            <li>XP-based engine systems, tier structures, and crates are part of a protected digital game framework</li>
            <li>UI/UX terms such as Uplink Chain, Override Mode, Crate Drop, XP ATM, and Autonomy Engine are proprietary</li>
            <li>Any duplication, cloning, or representation of these systems externally will result in legal action</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl text-cyan-400 font-bold">10. Disclaimers & External Associations</h2>
          <p>
            Felena Holdings LLC is not a financial institution, broker-dealer, or investment platform. All XP systems are
            closed-loop utilities. The Felena Zone is not affiliated with the Matrix franchise or any of its rights holders;
            references are metaphorical, aesthetic, or thematic in nature. Similarly, Felena Holdings LLC is not
            affiliated with Alpaca; any API or brokerage integrations are user-initiated and independently authorized.
          </p>
        </section>

        <section>
          <h2 className="text-xl text-cyan-400 font-bold">11. Kids XP Farming & Guardian Consent</h2>
          <p>
            Access to the Kids Zone is restricted to minor users with verified guardian consent. Guardians must accept the
            official Guardian Agreement before a child account can earn or hold XP.
            <br /><br />
            70% of all XP earned by minors is automatically locked in a digital vault until the child reaches legal age.
            The remaining 30% is accessible under guardian oversight. All XP earned must originate from approved
            educational activities.
            <br /><br />
            Guardians do not own the childs XP and may not use children as financial proxies. Felena Holdings LLC enforces
            a strict non-exploitation policy and retains the right to intervene, audit, or suspend access if abuse is
            detected.
          </p>
        </section>
      </div>

      <p className="text-center mt-10 text-xs text-gray-400 italic">Last updated July 30, 2025 — All systems governed by Felena Holdings LLC.</p>
    </div>
  );
}