// src/utils/progressMonitor.ts

// ---- Types ----
export type CrateTier = {
  name: string;
  xp: number;
};

// ---- Config: official XP tiers (ascending) ----
export const CRATE_TIERS: CrateTier[] = [
  { name: 'Mini', xp: 100 },
  { name: 'Minor', xp: 250 },
  { name: 'Standard', xp: 500 },
  { name: 'Major', xp: 1_000 },
  { name: 'Elite', xp: 2_500 },
  { name: 'Override', xp: 5_000 },
  { name: 'Quantum', xp: 10_000 },
  { name: 'Singularity', xp: 15_000 },
  { name: 'Orbit', xp: 20_000 },
  { name: 'Cortex', xp: 25_000 },
  { name: 'Velocity', xp: 50_000 },
  { name: 'Overlord', xp: 75_000 },
  { name: 'Architect', xp: 100_000 },
];

// ---- Helpers ----
/** Clamp to non‑negative integer. */
const nz = (n: number) => Math.max(0, Math.floor(n || 0));

/** Format seconds into ~Xm or ~X.Y hrs */
export function formatETASeconds(totalSeconds: number): string {
  const secs = nz(totalSeconds);
  const mins = Math.ceil(secs / 60);
  if (mins < 60) return `~${mins} min`;
  return `~${(mins / 60).toFixed(1)} hrs`;
}

/** Current tier (<= xp) and the next tier (> xp). */
export function getCurrentTier(xp: number): {
  current: CrateTier;
  next: CrateTier | null;
} {
  const val = nz(xp);

  // Find first tier strictly above current XP
  const next = CRATE_TIERS.find((t) => val < t.xp) ?? null;

  // If there is no "next", we're at max tier
  if (!next) {
    return { current: CRATE_TIERS[CRATE_TIERS.length - 1], next: null };
  }

  // Current is the previous tier or "None"
  const idx = CRATE_TIERS.indexOf(next);
  const current = idx > 0 ? CRATE_TIERS[idx - 1] : ({ name: 'None', xp: 0 } as CrateTier);

  return { current, next };
}

/**
 * Estimate time to reach the next tier.
 * @param currentXP            current XP
 * @param avgXPGainPerLoop     average XP you add each loop/run
 * @param loopIntervalSeconds  seconds per loop/run (defaults 30s)
 */
export function estimatePayoutTime(
  currentXP: number,
  avgXPGainPerLoop: number,
  loopIntervalSeconds = 30,
): {
  etaText: string;
  nextTier: string | null;
  loopsNeeded: number;
  xpRemaining: number;
} {
  const { next } = getCurrentTier(currentXP);
  if (!next) {
    return {
      etaText: 'Max crate unlocked',
      nextTier: null,
      loopsNeeded: 0,
      xpRemaining: 0,
    };
  }

  const perLoop = Math.max(0, avgXPGainPerLoop);
  const xpRemaining = Math.max(0, next.xp - nz(currentXP));

  if (perLoop === 0) {
    return {
      etaText: 'Add XP/loop to estimate',
      nextTier: next.name,
      loopsNeeded: Infinity,
      xpRemaining,
    };
  }

  const loopsNeeded = Math.max(1, Math.ceil(xpRemaining / perLoop));
  const totalSeconds = loopsNeeded * Math.max(1, loopIntervalSeconds);

  return {
    etaText: formatETASeconds(totalSeconds),
    nextTier: next.name,
    loopsNeeded,
    xpRemaining,
  };
}

/** Convenience: get a tier object by name (case‑insensitive). */
export function getTierByName(name: string): CrateTier | undefined {
  const n = (name || '').toLowerCase();
  return CRATE_TIERS.find((t) => t.name.toLowerCase() === n);
}

/** Export a default bundle for apps that import default */
const ProgressMonitor = {
  CRATE_TIERS,
  getCurrentTier,
  estimatePayoutTime,
  formatETASeconds,
  getTierByName,
};
export default ProgressMonitor;
