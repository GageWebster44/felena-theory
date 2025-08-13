// src/utils/xpEngineOrchestrator.ts
//
// Coordinates a single engine loop: runs engine, awards XP (rule: $1 profit = 1 XP),
// logs session, triggers crates/milestones/cashout, and updates engine health.
//
// NOTE: This file is self-contained. All side-effects are injected via hooks so
// there are NO broken imports. Wire your real implementations as needed.

export type Side = 'buy' | 'sell' | 'flat';

export interface EngineSignal {
  confidence: number; // 0..1
  symbol?: string;
  position?: Side; // current/target
}

export interface EngineRunResult {
  signals?: EngineSignal[];
  profitUSD?: number;   // realized P&L (can be negative)
  symbol?: string;      // last traded symbol
  position?: Side;      // resulting position
  crates?: number;      // engine-produced crate count (optional)
  override?: boolean;   // engine forced action flag
}

export interface EngineLike {
  // Implementations may use executeTrade + updateXP for side‑effects.
  runEngine: (
    data: unknown,
    executeTrade: OrchestratorHooks['executeTrade'],
    updateXP: (args: AwardXPArgs) => Promise<void>,
    userId: string,
  ) => Promise<EngineRunResult>;
}

interface OrchestratorArgs {
  engine: EngineLike;
  engineKey: string; // e.g., 'jarvis'
  data: unknown;     // market/context blob
  userId: string;
  override?: boolean; // manual override switch
}

// ---------------- Hooks (injected side-effects) ----------------

export type AwardXPArgs = {
  userId: string;
  xp: number;
  engineKey: string;
};

export type NotifyArgs = {
  userId: string;
  message: string;
};

export interface OrchestratorHooks {
  // Core actions
  executeTrade: (order: unknown) => Promise<unknown>;
  updateXP: (args: AwardXPArgs) => Promise<void>;

  // Logs/telemetry (best-effort)
  logSessionEvent: (payload: {
    userId: string;
    engineKey: string;
    xp: number;
    signalCount: number;
    overrideActive: boolean;
    profitUSD?: number;
    symbol?: string;
    position?: Side;
  }) => Promise<void>;

  logDailyXP: (userId: string, xp: number) => Promise<void>;
  logEngineStats: (userId: string, engineKey: string, result: EngineRunResult) => Promise<void>;
  auditXPIntegrity: (userId: string) => Promise<void>;
  trackBehaviorAnomaly: (userId: string, result: EngineRunResult) => Promise<void>;
  trackUplinkXP: (userId: string, xp: number) => Promise<void>;
  watchErrorSignals: (engineKey: string, result: EngineRunResult) => Promise<void>;

  // Rewards & milestones
  checkCrateMilestone: (xp: number) => Promise<{ triggered: boolean; tier?: string }>;
  logCrateUnlock: (userId: string, data: { tier?: string; source?: string }) => Promise<void>;
  playCrateSound: (tier?: string) => Promise<void>;
  assignDynamicCrate: (userId: string, engineKey: string, xp: number) => Promise<null | { tier?: string; source?: string }>;

  // Cashout pipeline
  checkCashoutStatus: (xp: number) => Promise<{ eligible: boolean; tier?: string }>;
  logRewardClaim: (userId: string, tier?: string) => Promise<void>;

  // Health
  updateEngineHealthScore: (engineKey: string, confidenceAvg: number, result: EngineRunResult) => Promise<void>;

  // UX
  notifyUser: (args: NotifyArgs) => Promise<void>;
}

// Safe no‑op defaults so this file compiles & runs out of the box.
const noop = async () => {};
const defaultHooks: OrchestratorHooks = {
  executeTrade: async () => ({}),
  updateXP: noop,
  logSessionEvent: noop,
  logDailyXP: noop,
  logEngineStats: noop,
  auditXPIntegrity: noop,
  trackBehaviorAnomaly: noop,
  trackUplinkXP: noop,
  watchErrorSignals: noop,
  checkCrateMilestone: async () => ({ triggered: false }),
  logCrateUnlock: noop,
  playCrateSound: noop,
  assignDynamicCrate: async () => null,
  checkCashoutStatus: async () => ({ eligible: false }),
  logRewardClaim: noop,
  updateEngineHealthScore: noop,
  notifyUser: noop,
};

// ---------------- Helpers ----------------

/** Clamp a number to [0, 1]. */
function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

/** Average of a numeric array (safe). */
function avg(nums: number[]): number {
  if (!nums.length) return 0;
  const s = nums.reduce((b, a) => b + a, 0);
  return s / nums.length;
}

/** Convert USD profit to XP. New rule: $1 profit = 1 XP. */
function usdToXP(usd?: number): number {
  const dollars = Number.isFinite(usd) ? (usd as number) : 0;
  // Keep XP integral; prevent weird rounding. No negative XP from losses.
  return Math.floor(Math.max(0, dollars));
}

// ---------------- Orchestrator ----------------

export default async function xpEngineOrchestrator(
  {
    engine,
    engineKey,
    data,
    userId,
    override = false,
  }: OrchestratorArgs,
  hooks: Partial<OrchestratorHooks> = {},
): Promise<EngineRunResult> {
  const h = { ...defaultHooks, ...hooks };

  // 1) Run the engine (may place trades via executeTrade, award XP via updateXP)
  const result = await engine.runEngine(data, h.executeTrade, h.updateXP, userId);

  const signals = result?.signals ?? [];
  const signalCount = signals.length;
  const avgConfidence = avg(signals.map((s) => clamp01(s.confidence)));

  // 2) Determine XP to award from realized profit (or force with override)
  const xpFromProfit = usdToXP(result?.profitUSD ?? 0);
  const xp = override ? Math.max(1, xpFromProfit) : xpFromProfit; // force at least 1 if override

  // 3) If there was meaningful activity, award XP and write logs
  if (signalCount > 0 && xp > 0) {
    await h.updateXP({ userId, xp, engineKey });
  }

  await h.logSessionEvent({
    userId,
    engineKey,
    xp,
    signalCount,
    overrideActive: override,
    profitUSD: result?.profitUSD,
    symbol: result?.symbol,
    position: result?.position,
  }).catch(() => {});

  // 4) Daily XP totals table
  if (xp > 0) {
    await h.logDailyXP(userId, xp).catch(() => {});
  }

  // 5) Meta telemetry & safety checks (best‑effort; non‑blocking)
  h.watchErrorSignals(engineKey, result).catch(() => {});
  h.logEngineStats(userId, engineKey, result).catch(() => {});
  h.auditXPIntegrity(userId).catch(() => {});
  h.trackBehaviorAnomaly(userId, result).catch(() => {});
  h.trackUplinkXP(userId, xp).catch(() => {});

  // 6) Crate milestones by XP-increment
  try {
    const milestone = await h.checkCrateMilestone(xp);
    if (milestone?.triggered) {
      // UX feedback first; then record unlock
      await h.playCrateSound(milestone.tier).catch(() => {});
      await h.logCrateUnlock(userId, { tier: milestone.tier, source: 'milestone' }).catch(() => {});
    }
  } catch { /* swallow */ }

  // 7) Dynamic crate assignment (performance/health‑based)
  try {
    const dynamicCrate = await h.assignDynamicCrate(userId, engineKey, xp);
    if (dynamicCrate) {
      await h.logCrateUnlock(userId, dynamicCrate).catch(() => {});
    }
  } catch { /* swallow */ }

  // 8) XP milestones/cashout pipeline (UX notifications only here)
  try {
    const cashout = await h.checkCashoutStatus(xp);
    if (cashout?.eligible) {
      h.notifyUser({ userId, message: `XP threshold met for ${cashout.tier ?? 'a'} cashout!` }).catch(() => {});
      // Optional telemetry
      h.logRewardClaim(userId, cashout.tier).catch(() => {});
    }
  } catch { /* swallow */ }

  // 9) Update engine health score (confidence proxy + outcome summary)
  await h.updateEngineHealthScore(engineKey, avgConfidence, result).catch(() => {});

  return result;
}