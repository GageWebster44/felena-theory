import * as React from 'react';
import Link from 'next/link';

export type HUDFrameProps = {
  /** Page content goes here */
  children: React.ReactNode;
  /** Optional title in the HUD header */
  title?: string;
  /** Optional right‑side status chip text, e.g. "ONLINE" */
  status?: string;
  /** Optional custom header (overrides the default HUD header if provided) */
  headerSlot?: React.ReactNode;
  /** Optional footer region under main content */
  footerSlot?: React.ReactNode;
  /** Extra className for the outer wrapper */
  className?: string;
  /** Extra styles for the outer wrapper */
  style?: React.CSSProperties;
};

const HUDFrame: React.FC<HUDFrameProps> = ({
  children,
  title = 'Felena Theory',
  status,
  headerSlot,
  footerSlot,
  className,
  style,
}) => {
  const env =
    process.env.NODE_ENV === 'production'
      ? 'PRODUCTION'
      : (process.env.VERCEL_ENV?.toUpperCase() || 'DEV');

  const statusText = status ?? (env === 'PRODUCTION' ? 'ONLINE' : env === 'PREVIEW' ? 'PREVIEW' : 'DEV');

  return (
    <div style={{ ...root, ...style }} className={className}>
      {/* Subtle grid + scanlines */}
      <div aria-hidden style={bgGrid} />
      <div aria-hidden style={scanlines} />

      {/* HUD chrome */}
      <div style={shell}>
        {/* Header */}
        {headerSlot ?? (
          <header style={headerBar}>
            <div style={brandLeft}>
              <Link href="/" style={brandLink}>
                <span style={brandDot} />
                <span>{title}</span>
              </Link>
            </div>

            <nav style={nav}>
              <Link href="/dashboard" style={navLink}>Dashboard</Link>
              <Link href="/onboarding" style={navLink}>Onboarding</Link>
              <Link href="/onboarding/broker-kyc-step" style={navLink}>Broker KYC</Link>
              <Link href="/api/legal/agreement" style={navLink}>Agreement</Link>
            </nav>

            <div style={statusWrap}>
              <span style={{ ...chip, ...(statusTextStyle(statusText)) }}>
                <span style={{ ...chipDot, background: chipDotColor(statusText) }} />
                {statusText}
              </span>
            </div>
          </header>
        )}

        {/* Main content */}
        <main style={mainPane}>{children}</main>

        {/* Footer */}
        {footerSlot ? (
          <footer style={footerPane}>{footerSlot}</footer>
        ) : (
          <footer style={footerPane}>
            <span style={footText}>
              © {new Date().getFullYear()} Felena Holdings LLC • XP is in‑app only — cashout requires broker KYC.
            </span>
          </footer>
        )}
      </div>
    </div>
  );
};

export default HUDFrame;

/* ───────── Styles (inline to avoid external CSS deps) ───────── */

const root: React.CSSProperties = {
  position: 'relative',
  minHeight: '100vh',
  background: 'radial-gradient(1200px 600px at 50% -10%, #0d1b2a 0%, #0a0f17 55%, #070b10 100%)',
  color: '#d9f2ff',
  overflowX: 'hidden',
  fontFamily: 'Orbitron, system-ui, -apple-system, Segoe UI, Roboto, Inter, Arial, sans-serif',
};

const shell: React.CSSProperties = {
  position: 'relative',
  zIndex: 1,
  maxWidth: 1240,
  margin: '0 auto',
  padding: '1.0rem 1.0rem 2.0rem',
};

const bgGrid: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  backgroundImage:
    'linear-gradient(transparent 31px, rgba(0,255,255,0.06) 32px), linear-gradient(90deg, transparent 31px, rgba(0,255,255,0.06) 32px)',
  backgroundSize: '32px 32px, 32px 32px',
  opacity: 0.25,
  pointerEvents: 'none',
};

const scanlines: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background:
    'repeating-linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,0) 2px, rgba(0,0,0,0.09) 3px)',
  mixBlendMode: 'multiply',
  pointerEvents: 'none',
  opacity: 0.6,
};

const headerBar: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr auto 1fr',
  alignItems: 'center',
  gap: '0.75rem',
  border: '1px solid #1b2a3a',
  background: 'rgba(8,12,18,0.7)',
  backdropFilter: 'blur(4px)',
  borderRadius: 14,
  padding: '0.75rem 0.9rem',
  boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
};

const brandLeft: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '0.6rem' };

const brandLink: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.55rem',
  color: '#c9f3ff',
  textDecoration: 'none',
  fontWeight: 800,
  letterSpacing: '0.03em',
};

const brandDot: React.CSSProperties = {
  width: 10,
  height: 10,
  borderRadius: '50%',
  background: '#0bffcc',
  boxShadow: '0 0 0 3px rgba(11,255,204,0.18)',
};

const nav: React.CSSProperties = { display: 'flex', gap: '0.9rem', justifyContent: 'center' };

const navLink: React.CSSProperties = {
  color: '#9bdcff',
  textDecoration: 'none',
  padding: '0.35rem 0.6rem',
  borderRadius: 8,
  border: '1px solid transparent',
};
const statusWrap: React.CSSProperties = { display: 'flex', justifyContent: 'flex-end' };

const chip: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  padding: '0.3rem 0.55rem',
  borderRadius: 999,
  border: '1px solid #203040',
  background: '#0b1220',
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: '0.02em',
  color: '#c7d2fe',
};

const chipDot: React.CSSProperties = {
  width: 8,
  height: 8,
  borderRadius: '50%',
  boxShadow: '0 0 0 2px rgba(255,255,255,0.06)',
};

const mainPane: React.CSSProperties = {
  marginTop: '1.0rem',
  border: '1px solid #1b2a3a',
  background: 'rgba(7,11,16,0.8)',
  borderRadius: 14,
  padding: '1.25rem',
  minHeight: '60vh',
  boxShadow: '0 20px 40px rgba(0,0,0,0.35)',
};

const footerPane: React.CSSProperties = {
  marginTop: '1.0rem',
  display: 'flex',
  justifyContent: 'center',
  padding: '0.9rem',
  border: '1px solid #1b2a3a',
  background: 'rgba(8,12,18,0.7)',
  borderRadius: 14,
};

const footText: React.CSSProperties = { color: '#7aa7c7', fontSize: 12 };

/* ───────── small helpers ───────── */

function chipDotColor(s: string) {
  const u = s.toUpperCase();
  if (u.includes('ONLINE') || u.includes('PRODUCTION') || u.includes('ACTIVE')) return '#22c55e';
  if (u.includes('PREVIEW')) return '#eab308';
  return '#38bdf8'; // DEV/Fallback
}

function statusTextStyle(s: string): React.CSSProperties {
  const u = s.toUpperCase();
  if (u.includes('ONLINE') || u.includes('PRODUCTION') || u.includes('ACTIVE')) {
    return { borderColor: '#1e3a2f', boxShadow: '0 0 0 2px rgba(34,197,94,0.08) inset', color: '#bbf7d0' };
  }
  if (u.includes('PREVIEW')) {
    return { borderColor: '#3a341e', boxShadow: '0 0 0 2px rgba(234,179,8,0.08) inset', color: '#fde68a' };
  }
  return { borderColor: '#1b2a3a', boxShadow: '0 0 0 2px rgba(56,189,248,0.08) inset', color: '#bae6fd' };
}