// src/pages/becomeanoperator/index.tsx
import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import styles from "@/styles/index.module.css";

/**
 * Become An Operator
 * ------------------------------------------------------------
 * Sign up flow for the Felena Theory app.
 * - Creates a Keycard-centric account (alias may be private).
 * - Optional broker connection (Alpaca) for bank/checking transfers (demo stub).
 * - Otherwise redemption uses PhoneBooth: gift cards & in-app routes.
 * - Minors may list a guardian; safeguards apply across hubs.
 *
 * NOTE: This file is a front-end demo. Replace localStorage with your API.
 */

export default function BecomeOperatorPage() {
  // Form state
  const [alias, setAlias] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [country, setCountry] = useState("US");
  const [ref, setRef] = useState("");
  const [isMinor, setIsMinor] = useState(false);
  const [guardian, setGuardian] = useState("");
  const [accept, setAccept] = useState(false);

  // Optional integrations
  const [connectAlpaca, setConnectAlpaca] = useState(false);
  const [alpacaApproved, setAlpacaApproved] =
    useState<"none" | "pending" | "connected">("none");

  // Result state
  const [created, setCreated] = useState(false);
  const [keycardId, setKeycardId] = useState<string>("");

  // Live counter (fun)
  const liveOperators = useMemo(() => {
    const base = 17340;
    const t = Math.floor(Date.now() / (1000 * 60));
    const drift = (t % 89) * 2 + (t % 17);
    return base + drift;
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("op_profile");
    if (saved) {
      try {
        const p = JSON.parse(saved);
        setCreated(!!p.keycardId);
        setKeycardId(p.keycardId || "");
        setAlias(p.alias || "");
        setEmail(p.email || "");
        setCountry(p.country || "US");
        setRef(p.ref || "");
        setIsMinor(!!p.isMinor);
        setGuardian(p.guardian || "");
        setAlpacaApproved(p.alpacaApproved || "none");
      } catch {}
    }
  }, []);

  function validate(): string | null {
    if (!alias || alias.length < 2) return "Please choose an alias (2+ chars).";
    if (!email || !email.includes("@")) return "Enter a valid email.";
    if (!pass || pass.length < 8) return "Password must be at least 8 characters.";
    if (isMinor && !guardian) return "Minors must list a guardian contact.";
    if (!accept) return "You must accept the Terms & Disclosures.";
    return null;
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const err = validate();
    if (err) return alert(err);

    const id = mintKeycardId(alias);
    setKeycardId(id);
    setCreated(true);

    // Simulate Alpaca onboarding (demo only)
    if (connectAlpaca) {
      setAlpacaApproved("pending");
      setTimeout(() => setAlpacaApproved("connected"), 900);
    }

    const payload = {
      keycardId: id,
      alias,
      email,
      country,
      ref,
      isMinor,
      guardian,
      alpacaApproved: connectAlpaca ? "connected" : "none",
      createdAt: Date.now(),
    };
    localStorage.setItem("op_profile", JSON.stringify(payload));
    // Mirror some Keycard values for other pages (demo)
    localStorage.setItem("op_alias", alias);
    localStorage.setItem("op_xp", String(1250));
    localStorage.setItem("op_rank", String(742));
    localStorage.setItem("op_missions", String(18));
  }

  function reset() {
    if (
      !confirm(
        "This will remove local demo data for your Operator profile on this device."
      )
    )
      return;
    setCreated(false);
    setKeycardId("");
    setAlias("");
    setEmail("");
    setPass("");
    setCountry("US");
    setRef("");
    setIsMinor(false);
    setGuardian("");
    setConnectAlpaca(false);
    setAlpacaApproved("none");
    localStorage.removeItem("op_profile");
  }

  return (
    <div className={styles.page}>
      <Head>
        <title>Become an Operator — Felena Theory</title>
        <meta
          name="description"
          content="Create your Felena Keycard account, connect optional banking via Alpaca (demo), or redeem through PhoneBooth gift cards. Your Keycard is your global identity."
        />
      </Head>

      <main className={styles.wrap}>
        {/* Hero */}
        <header className={styles.hero}>
          <h1 className={styles.title}>Become an Operator</h1>
          <p className={styles.sub}>
            One account. One <strong>Keycard</strong>. Your alias can stay private.
            All value routes through your Keycard — the system-wide identity for XP,
            redemptions, referrals, and peer transfers.
          </p>
          <div className={styles.ctaRow}>
            <Link href="/" className={styles.btn}>
              ← Back Home
            </Link>
            <Link href="/about" className={`${styles.btn} ${styles.btnGhost}`}>
              About the Company
            </Link>
          </div>
        </header>

        {/* Trust row */}
        <section
          className={styles.grid}
          style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}
        >
          <article className={styles.card}>
            <h3>Live Operators</h3>
            <p className={styles.tag}>In line & active (demo)</p>
            <div style={bigStat}>{liveOperators.toLocaleString()}</div>
          </article>
          <article className={styles.card}>
            <h3>Your Keycard</h3>
            <p>
              Futuristic identity + wallet. Control what you reveal, share via QR
              Uplink, and redeem through PhoneBooth or (optionally) bank
              transfers via Alpaca.
            </p>
            <div className={styles.ctaRow}>
              <Link href="/keycard" className={styles.cardCta}>
                Preview Keycard →
              </Link>
            </div>
          </article>
          <article className={styles.card}>
            <h3>Redemption Paths</h3>
            <p>
              <strong>Default:</strong> Digital gift cards (1 XP ≈ $1 display),
              peer-to-peer XP by Operator extension.{" "}
              <strong>Optional:</strong> Connect Alpaca to enable transfer-out to
              checking (where supported).
            </p>
            <div className={styles.ctaRow}>
              <Link href="/phonebooth" className={styles.cardCta}>
                Open PhoneBooth →
              </Link>
            </div>
          </article>
        </section>

        {/* Sign-up */}
        <section style={{ marginTop: 16 }}>
          <article className={styles.card}>
            <h3>{created ? "Operator Created" : "Create Your Operator Account"}</h3>

            {!created ? (
              <form
                onSubmit={submit}
                style={{ display: "grid", gap: 12, maxWidth: 720, margin: "0 auto" }}
              >
                <div style={twoCol}>
                  <Field
                    label="Alias"
                    hint="Can stay private. You control what you reveal."
                    value={alias}
                    onChange={setAlias}
                    placeholder="e.g., NightRelay"
                  />
                  <Field
                    label="Referral (optional)"
                    hint="If you have a code/link"
                    value={ref}
                    onChange={setRef}
                    placeholder="FEL-ABC123"
                  />
                </div>

                <div style={twoCol}>
                  <Field
                    label="Email"
                    type="email"
                    value={email}
                    onChange={setEmail}
                    placeholder="you@domain.com"
                  />
                  <Field
                    label="Password"
                    type="password"
                    value={pass}
                    onChange={setPass}
                    placeholder="Create a strong password"
                  />
                </div>

                <div style={twoCol}>
                  <Field
                    label="Country"
                    value={country}
                    onChange={setCountry}
                    placeholder="US"
                  />
                  <div>
                    <label
                      className={styles.tag}
                      style={{ display: "block", marginBottom: 6 }}
                    >
                      Minor
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <input
                        type="checkbox"
                        checked={isMinor}
                        onChange={(e) => setIsMinor(e.target.checked)}
                      />
                      <span className={styles.tag}>I am under 18</span>
                    </label>
                  </div>
                </div>

                {isMinor && (
                  <Field
                    label="Guardian Contact"
                    hint="Email or phone of legal guardian (required for minors)"
                    value={guardian}
                    onChange={setGuardian}
                    placeholder="guardian@example.com"
                  />
                )}

                <div className="divider" />

                {/* Optional Alpaca connection */}
                <div style={{ display: "grid", gap: 6 }}>
                  <h4 style={{ margin: 0 }}>Optional: Banking via Alpaca</h4>
                  <p className={styles.tag} style={{ margin: 0 }}>
                    Connect to enable transfer-out to checking where supported.
                    Otherwise, you can redeem through PhoneBooth gift cards and
                    peer transfers.
                  </p>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginTop: 6,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={connectAlpaca}
                      onChange={(e) => setConnectAlpaca(e.target.checked)}
                    />
                    <span>Connect Alpaca (demo)</span>
                  </label>
                </div>

                {/* Legal */}
                <div className="divider" />
                <h4 style={{ margin: "0 0 4px" }}>Terms & Disclosures</h4>
                <ul style={ulTight}>
                  <li>
                    <strong>Ownership & Originality:</strong> The Financial
                    Reactor™, Keycard™, QR Uplink™, Arena™, and related system
                    logic, page flows, and economic rules are proprietary to
                    Felena Holdings LLC. Usage of this system is licensed solely
                    through the Felena Theory app and services.
                  </li>
                  <li>
                    <strong>Display Parity:</strong> In-app parity uses{" "}
                    <em>1 XP ≈ $1</em> for clarity. Actual redemption value
                    depends on your selections and applicable rules at the time
                    of settlement.
                  </li>
                  <li>
                    <strong>Minors:</strong> XP earned in Learn-to-Earn routes
                    60% to locked savings and 40% to guardians until age 18
                    (configurable per jurisdiction).
                  </li>
                  <li>
                    <strong>Risk:</strong> Games and competitive modes involve
                    XP burns and variance. Play responsibly.
                  </li>
                  <li>
                    <strong>Brokerage:</strong> Alpaca connectivity in this demo
                    is illustrative only. Production connectivity, if available,
                    is subject to separate onboarding, compliance checks, and
                    regional availability.
                  </li>
                </ul>
                <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input
                    type="checkbox"
                    checked={accept}
                    onChange={(e) => setAccept(e.target.checked)}
                  />
                  <span>
                    I agree to the{" "}
                    <Link
                      href="/terms"
                      className={styles.cardCta}
                      style={{ padding: 0 }}
                    >
                      Terms & Disclosures
                    </Link>
                    .
                  </span>
                </label>

                <div className={styles.ctaRow}>
                  <button type="submit" className={styles.btn}>
                    Create Operator Account
                  </button>
                  <Link href="/terms" className={`${styles.btn} ${styles.btnGhost}`}>
                    Read Terms
                  </Link>
                </div>
              </form>
            ) : (
              <div
                style={{
                  maxWidth: 760,
                  margin: "0 auto",
                  display: "grid",
                  gap: 12,
                }}
              >
                <p style={{ fontWeight: 800, fontSize: 18, color: "#a9ffd1" }}>
                  Welcome, Operator. Your Keycard is live.
                </p>
                <SummaryRow label="Keycard ID" value={keycardId} />
                <SummaryRow label="Alias" value={alias || "Hidden"} />
                <SummaryRow label="Email" value={email} />
                <SummaryRow label="Country" value={country} />
                {isMinor && <SummaryRow label="Guardian" value={guardian || "—"} />}
                <SummaryRow
                  label="Redemption"
                  value={
                    alpacaApproved === "connected"
                      ? "Gift cards, peer transfers, & bank transfer-out (where supported)"
                      : "Gift cards & peer transfers (bank transfer not enabled)"
                  }
                />

                <div className={styles.ctaRow}>
                  <Link href="/keycard" className={styles.cardCta}>
                    Open Keycard →
                  </Link>
                  <Link href="/phonebooth" className={styles.cardCta}>
                    Manage Balance →
                  </Link>
                  <button onClick={reset} className={styles.cardCta}>
                    Remove Local Demo
                  </button>
                </div>
              </div>
            )}
          </article>
        </section>

        {/* How your Keycard powers everything */}
        <section style={{ marginTop: 16 }}>
          <h2 style={{ margin: "0 0 10px" }}>Your Keycard = Your System Identity</h2>
          <div
            className={styles.grid}
            style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}
          >
            <article className={styles.card}>
              <h3>Global Wallet</h3>
              <p>
                One balance routes across all hubs. Earn in Learn-to-Earn, stake
                in Arena, redeem in PhoneBooth — it all traces back to your
                Keycard.
              </p>
            </article>
            <article className={styles.card}>
              <h3>Private by Default</h3>
              <p>
                Keep your alias hidden or reveal it when you want. QR Uplink
                powers Keycard↔Keycard sharing without exposing personal details.
              </p>
            </article>
            <article className={styles.card}>
              <h3>Receipts Everywhere</h3>
              <p>
                If it moves value, it writes a receipt — deposits, redemptions,
                wins, losses, and transfers are logged for your records.
              </p>
            </article>
          </div>
        </section>

        {/* Footer */}
        <footer className={styles.footer}>
          <span>
            © {new Date().getFullYear()} Felena Holdings LLC — FelenaTheory@gmail.com
          </span>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link href="/terms" className={styles.cardCta}>
              Terms & Disclosures
            </Link>
            <Link href="/privacy" className={styles.cardCta}>
              Privacy
            </Link>
          </div>
        </footer>
      </main>
    </div>
  );
}

/* ————— Components ————— */

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  hint?: string;
}) {
  return (
    <div>
      <label className={styles.tag} style={{ display: "block", marginBottom: 6 }}>
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={label}
        type={type}
        style={fieldStyle}
      />
      {hint && <p className={styles.tag} style={{ marginTop: 4 }}>{hint}</p>}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "160px 1fr",
        gap: 8,
        padding: "8px 10px",
        border: "1px solid rgba(0,255,136,.18)",
        borderRadius: 10,
        background: "linear-gradient(180deg, rgba(0,20,8,.2), rgba(0,0,0,.35))",
      }}
    >
      <span className={styles.tag}>{label}</span>
      <span style={{ fontWeight: 800 }}>{value}</span>
    </div>
  );
}

/* ————— Styles ————— */

const fieldStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid rgba(0,255,136,.25)",
  background: "rgba(0,20,8,.35)",
  color: "#eaffe9",
  boxShadow: "inset 0 0 14px rgba(0,255,136,.08)",
};

const bigStat: React.CSSProperties = {
  fontWeight: 900,
  fontSize: 28,
  color: "#a9ffd1",
  textShadow: "0 0 10px rgba(0,255,136,.35)",
  lineHeight: 1,
};

const twoCol: React.CSSProperties = {
  display: "grid",
  gap: 12,
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
};

const ulTight: React.CSSProperties = {
  margin: 0,
  paddingLeft: 18,
  display: "grid",
  gap: 6,
  listStyle: "disc",
  color: "#c6ffe0",
};

/* ————— Helpers ————— */

function mintKeycardId(alias: string) {
  // Short, readable ID: FEL-XXXXXX (based on alias + time)
  const base = (alias || "OP").toLowerCase() + "|" + Date.now();
  let h = 2166136261 >>> 0;
  for (let i = 0; i < base.length; i++) {
    h ^= base.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const hex = (h >>> 0).toString(16).slice(0, 6).toUpperCase();
  return `FEL-${hex}`;
}