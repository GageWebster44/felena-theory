// src/components/PayoutProjection.tsx
import React, { useMemo } from 'react';

type Props = {
  /** Current XP balance used as the base for projections */
  xp: number;

  /** Cashout rate (e.g., 0.01 => $0.01 per XP) */
  cashoutRate: number;

  /** Weekly/period cap for public users' cashable amount (in dollars). Omit for no cap. */
  publicCashoutCapUSD?: number;

  /** When true, projections will be clamped to the public cashout policy */
  isPublic?: boolean;
};

type ScenarioKey = 'low' | 'medium' | 'high';

const LABELS: Record<ScenarioKey, string> = {
  low: 'Conservative',
  medium: 'Standard Engine',
  high: 'Override Mode',
};

const MULTIPLIER: Record<ScenarioKey, number> = {
  low: 2, // 2x return estimate
  medium: 5, // 5x return estimate
  high: 20, // 20x projection
};

export default function PayoutProjection({
  xp,
  cashoutRate,
  publicCashoutCapUSD,
  isPublic = true,
}: Props) {
  const projections = useMemo(() => {
    const baseXP = Math.max(0, xp || 0);

    const make = (m: number) => {
      // raw projected XP
      const projXP = Math.floor(baseXP * m);

      // convert to USD at the configured rate
      const rawUSD = projXP * cashoutRate;

      // if user is public and a cap is present, clamp to cap
      const cappedUSD =
        isPublic && publicCashoutCapUSD != null ? Math.min(rawUSD, publicCashoutCapUSD) : rawUSD;

      // Back-derive XP so the XP display always matches the cashable amount.
      // (Prevents UI from suggesting more XP than can be cashed out.)
      const alignedXP = Math.floor(cappedUSD / (cashoutRate || 1));

      return {
        xp: alignedXP,
        usd: Math.round(cappedUSD * 100) / 100, // round to cents
        capped: cappedUSD < rawUSD,
      };
    };

    return {
      low: make(MULTIPLIER.low),
      medium: make(MULTIPLIER.medium),
      high: make(MULTIPLIER.high),
    };
  }, [xp, cashoutRate, publicCashoutCapUSD, isPublic]);

  const note =
    isPublic && publicCashoutCapUSD != null
      ? `Public cashout cap applied: up to $${publicCashoutCapUSD.toLocaleString()} per payout window.`
      : 'Projections are hypothetical algorithmic estimates and may change.';

  return (
    <div className="bg-zinc-900 border border-green-600 rounded-lg p-4 text-white space-y-3 mt-6">
      <h2 className="text-green-400 text-xl font-mono">XP Deployment Projections</h2>

      <ScenarioRow
        label={LABELS.low}
        xp={projections.low.xp}
        usd={projections.low.usd}
        capped={projections.low.capped}
      />
      <ScenarioRow
        label={LABELS.medium}
        xp={projections.medium.xp}
        usd={projections.medium.usd}
        capped={projections.medium.capped}
      />
      <ScenarioRow
        label={LABELS.high}
        xp={projections.high.xp}
        usd={projections.high.usd}
        capped={projections.high.capped}
      />

      <p className="text-xs text-gray-500 italic">{note}</p>
    </div>
  );
}

function ScenarioRow({
  label,
  xp,
  usd,
  capped,
}: {
  label: string;
  xp: number;
  usd: number;
  capped: boolean;
}) {
  return (
    <div className="text-sm text-gray-300">
      <span className="font-bold text-green-300">{label}:</span>{' '}
      <span className="text-white">{xp.toLocaleString()} XP</span>{' '}
      <span className="text-gray-400">
        (~${usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
      </span>
      {capped && <span className="ml-2 text-yellow-400">(capped)</span>}
    </div>
  );
}
