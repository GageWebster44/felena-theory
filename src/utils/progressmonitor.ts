// progressMonitor.ts – Tracks XP totals, progress to payout tiers

const CRATE_TIERS = [
  { name: 'Mini', xp: 100 },
  { name: 'Minor', xp: 200 },
  { name: 'Major', xp: 500 },
  { name: 'Max', xp: 1000 }
];

export function getCurrentTier(xp: number) {
  let current = null;
  let next = null;

  for (let i = 0; i < CRATE_TIERS.length; i++) {
    if (xp < CRATE_TIERS[i].xp) {
      next = CRATE_TIERS[i];
      current = CRATE_TIERS[i - 1] || { name: 'None', xp: 0 };
      break;
    }
  }

  if (!next) {
    current = CRATE_TIERS[CRATE_TIERS.length - 1];
    next = null;
  }

  return { current, next };
}

export function estimatePayoutTime(
  currentXP: number,
  avgXPGainPerLoop: number,
  loopIntervalSeconds: number = 30
) {
  const { next } = getCurrentTier(currentXP);

  if (!next) {
    return { etaMinutes: 0, etaText: 'Max crate unlocked', nextTier: null };
  }

  const xpRemaining = next.xp - currentXP;
  const loopsNeeded = Math.ceil(xpRemaining / avgXPGainPerLoop);
  const totalSeconds = loopsNeeded * loopIntervalSeconds;

  const etaMinutes = Math.ceil(totalSeconds / 60);
  const etaText =
    etaMinutes < 60
      ? `${etaMinutes} min`
      : `${(etaMinutes / 60).toFixed(1)} hrs`;

  return {
    etaMinutes,
    etaText,
    nextTier: next.name
  };
}