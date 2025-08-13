import React, { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import { createClient } from '@supabase/supabase-js';
import WithRoleGuard from '@/utils/WithRoleGuard';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const DEBUG = (process.env.NEXT_PUBLIC_FELENA_DEBUG || '').toString() === '1';
const DRY_RUN = (process.env.NEXT_PUBLIC_ENGINE_DRY_RUN || '').toString() === '1';
const INTERVAL_MS = Number(process.env.NEXT_PUBLIC_ENGINE_INTERVAL_MS ?? '10000') || 10000;

// Operator/system user for loop + dashboard reads
const USER_ID = 'a391ca33-b6bc-4670-9144-c59022cc9b9e';

const sb = SUPABASE_URL && SUPABASE_ANON ? createClient(SUPABASE_URL, SUPABASE_ANON) : null;

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: 999,
        background: 'rgba(99,102,241,0.12)',
        color: '#4f46e5',
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      {children}
    </span>
  );
}

function Button({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '8px 12px',
        borderRadius: 10,
        border: '1px solid #e5e7eb',
        background: disabled ? '#f3f4f6' : '#111827',
        color: disabled ? '#9ca3af' : '#fff',
        fontSize: 13,
        fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {children}
    </button>
  );
}

function Card({
  title,
  children,
  right,
}: {
  title: string;
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: 'white',
        borderRadius: 16,
        boxShadow:
          '0 1px 2px rgba(0,0,0,0.05), 0 10px 15px -3px rgba(0,0,0,0.08)',
        padding: 16,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          marginBottom: 8,
        }}
      >
        <h3 style={{ margin: 0, fontSize: 14, color: '#374151' }}>{title}</h3>
        <div>{right}</div>
      </div>
      {children}
    </div>
  );
}

function EngineStatusPage({ role }: { role?: string }) {
  const [xp, setXP] = useState<number>(0);
  const [status, setStatus] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [manualRuns, setManualRuns] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [err, setErr] = useState<string>('');
  const [ping, setPing] = useState<any>(null);
  const [busy, setBusy] = useState<boolean>(false);

  const isAdmin = role === 'admin';
  const pollingMs = useMemo(
    () => Math.max(3000, Math.min(30000, INTERVAL_MS || 10000)),
    []
  );

  useEffect(() => {
    let alive = true;

    async function loadAll() {
      if (!sb) {
        setErr('Supabase client not configured');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);

        // XP balance
        const { data: xpRow } = await sb
          .from('xp_balance')
          .select('amount')
          .eq('user_id', USER_ID)
          .maybeSingle();
        const amt = Number((xpRow as any)?.amount ?? 0);
        if (alive) setXP(Number.isFinite(amt) ? Math.max(0, amt) : 0);

        // Last engine status
        const { data: st } = await sb
          .from('engine_status')
          .select('*')
          .order('last_updated', { ascending: false })
          .limit(1);
        if (alive) setStatus(st?.[0] ?? null);

        // Recent engine events
        const { data: ev } = await sb
          .from('engine_events')
          .select(
            'created_at, engine_name, engine_key, profit_usd, xp_gain, symbol, position, signal_count, override'
          )
          .order('created_at', { ascending: false })
          .limit(10);
        if (alive) setEvents(Array.isArray(ev) ? ev : []);

        // Recent manual run audits
        const { data: mr } = await sb
          .from('engine_manual_runs')
          .select('created_at, user_id, role, engine_key, notes')
          .order('created_at', { ascending: false })
          .limit(20);
        if (alive) setManualRuns(Array.isArray(mr) ? mr : []);

        // Ping API (server flags)
        const resp = await fetch('/api/engine/ping');
        const pj = await resp.json().catch(() => null);
        if (alive) setPing(pj);
      } catch (e: any) {
        if (alive) setErr(e?.message ?? 'Unknown error');
      } finally {
        if (alive) setLoading(false);
      }
    }

    loadAll();
    const t = setInterval(loadAll, pollingMs);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [pollingMs]);

  // Admin-only: audit + run-once trigger
  async function runOnce() {
    if (DEBUG) {
      console.log(`[Run Once Triggered] by role: ${role || 'unknown'}`);
    }

    // Write an audit row before triggering the run
    if (sb && role) {
      try {
        await sb.from('engine_manual_runs').insert({
          user_id: USER_ID,
          role,
          engine_key: status?.engine_key || null,
          notes: 'Triggered from /engine-status UI',
        } as any);
        if (DEBUG) console.log('[Run Once] Audit log inserted');
      } catch (e) {
        console.error('[Run Once] Audit insert failed:', e);
      }
    }

    setBusy(true);
    setErr('');
    try {
      const resp = await fetch('/api/engine/run-once');
      const pj = await resp.json().catch(() => null);
      if (!resp.ok) throw new Error(pj?.error || 'run-once failed');
      // refresh shortly after
      setTimeout(() => window.location.reload(), 500);
    } catch (e: any) {
      setErr(e?.message ?? 'Run once failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Head>
        <title>Engine Status • Felena</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div
        style={{
          minHeight: '100vh',
          background:
            'linear-gradient(180deg, #f8fafc 0%, #f3f4f6 60%, #eef2ff 100%)',
          padding: 24,
        }}
      >
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <header
            style={{
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
            }}
          >
            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: 22,
                  fontWeight: 800,
                  letterSpacing: -0.2,
                  color: '#111827',
                }}
              >
                Engine Status
              </h1>
              <p style={{ margin: '6px 0 0', color: '#6b7280', fontSize: 14 }}>
                Live snapshot of engine loop, XP, and recent events.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {isAdmin && (
                <Button onClick={runOnce} disabled={busy}>
                  {busy ? 'Running…' : 'Run once'}
                </Button>
              )}
              <a href="/api/engine/ping" target="_blank" rel="noreferrer">
                <Button>Ping</Button>
              </a>
            </div>
          </header>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 16,
              marginBottom: 16,
            }}
          >
            <Card title="Runtime Flags" right={<Badge>client</Badge>}>
              <div style={{ display: 'grid', gap: 8 }}>
                <Row k="DEBUG" v={DEBUG ? 'ON' : 'OFF'} />
                <Row k="DRY_RUN" v={DRY_RUN ? 'ON' : 'OFF'} />
                <Row k="INTERVAL_MS" v={`${INTERVAL_MS} ms`} />
                <Row k="Ping ok" v={ping?.ok ? 'yes' : 'no'} />
              </div>
            </Card>

            <Card title="XP Balance">
              <BigNumber value={xp} suffix=" XP" />
            </Card>

            <Card
              title="Engine Health (latest)"
              right={
                status?.engine_key ? <Badge>{status.engine_key}</Badge> : null
              }
            >
              {status ? (
                <div style={{ display: 'grid', gap: 6, fontSize: 14 }}>
                  <Row k="Confidence" v={fmtNum(status.confidence, 3)} />
                  <Row k="Last Profit (USD)" v={fmtNum(status.last_profit_usd)} />
                  <Row k="Updated" v={fmtTime(status.last_updated)} />
                </div>
              ) : (
                <Muted>no rows</Muted>
              )}
            </Card>
          </div>

          <Card title="Recent Engine Events" right={<Badge>last 10</Badge>}>
            {loading ? (
              <Muted>loading…</Muted>
            ) : events.length === 0 ? (
              <Muted>no events yet</Muted>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'separate',
                    borderSpacing: 0,
                    fontSize: 13,
                  }}
                >
                  <thead>
                    <tr style={{ textAlign: 'left', color: '#6b7280' }}>
                      <Th>Time</Th>
                      <Th>Engine</Th>
                      <Th>Symbol</Th>
                      <Th>Pos</Th>
                      <Th>Signals</Th>
                      <Th>Profit $</Th>
                      <Th>XP</Th>
                      <Th>Override</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((e, i) => (
                      <tr key={i} style={{ borderTop: '1px solid #eef2f7' }}>
                        <Td>{fmtTime(e.created_at)}</Td>
                        <Td>{e.engine_name || e.engine_key || '—'}</Td>
                        <Td>{e.symbol ?? '—'}</Td>
                        <Td>{e.position ?? '—'}</Td>
                        <Td>{e.signal_count ?? '—'}</Td>
                        <Td>{fmtNum(e.profit_usd)}</Td>
                        <Td>{fmtNum(e.xp_gain)}</Td>
                        <Td>{e.override ? 'yes' : 'no'}</Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          <div style={{ height: 12 }} />

          <Card title="Manual Runs (audit)" right={<Badge>last 20</Badge>}>
            {loading ? (
              <Muted>loading…</Muted>
            ) : manualRuns.length === 0 ? (
              <Muted>no manual runs yet</Muted>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'separate',
                    borderSpacing: 0,
                    fontSize: 13,
                  }}
                >
                  <thead>
                    <tr style={{ textAlign: 'left', color: '#6b7280' }}>
                      <Th>Time</Th>
                      <Th>User</Th>
                      <Th>Role</Th>
                      <Th>Engine</Th>
                      <Th>Notes</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {manualRuns.map((r, i) => (
                      <tr key={i} style={{ borderTop: '1px solid #eef2f7' }}>
                        <Td>{fmtTime(r.created_at)}</Td>
                        <Td style={{ fontFamily: 'monospace' }}>
                          {r.user_id?.slice?.(0, 8) || '—'}
                        </Td>
                        <Td>{r.role ?? '—'}</Td>
                        <Td>{r.engine_key ?? '—'}</Td>
                        <Td>{r.notes ?? '—'}</Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {err && (
            <div
              style={{
                marginTop: 16,
                padding: 12,
                borderRadius: 12,
                background: '#fef2f2',
                color: '#7f1d1d',
                fontSize: 13,
              }}
            >
              <strong>Error:</strong> {err}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
      <span style={{ color: '#6b7280' }}>{k}</span>
      <span style={{ fontWeight: 600, color: '#111827' }}>{v}</span>
    </div>
  );
}

function BigNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
      <span style={{ fontSize: 32, fontWeight: 900, letterSpacing: -0.5 }}>
        {Intl.NumberFormat().format(value)}
      </span>
      <span style={{ color: '#6b7280' }}>{suffix}</span>
    </div>
  );
}

function Muted({ children }: { children: React.ReactNode }) {
  return <div style={{ color: '#6b7280' }}>{children}</div>;
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th style={{ fontWeight: 600, padding: '8px 8px' }}>
      {children}
    </th>
  );
}

function Td({ children }: { children: React.ReactNode }) {
  return (
    <td style={{ padding: '10px 8px', color: '#111827' }}>
      {children}
    </td>
  );
}

function fmtNum(n: any, digits = 2) {
  const num = Number(n);
  if (!Number.isFinite(num)) return '—';
  return num.toFixed(digits);
}

function fmtTime(t: any) {
  if (!t) return '—';
  try {
    const d = new Date(t);
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
  } catch {
    return String(t);
  }
}

export default WithRoleGuard(EngineStatusPage, ['admin', 'guardian']);