// Engine loop runner with toggleable debug logging, slow-mode knob, and dry-run.

import xpEngineOrchestrator, {
  type EngineRunResult as EngineResult,
  type EngineLike,
  type OrchestratorHooks,
} from './xpEngineOrchestrator';

export type MarketSnapshot = unknown;

const DEBUG = (process.env.NEXT_PUBLIC_FELENA_DEBUG || '').toString() === '1';
const DRY_RUN = (process.env.NEXT_PUBLIC_ENGINE_DRY_RUN || '').toString() === '1';
const ENV_INTERVAL = Number(process.env.NEXT_PUBLIC_ENGINE_INTERVAL_MS ?? '10000');
const INTERVAL_MS = Number.isFinite(ENV_INTERVAL) && ENV_INTERVAL > 0 ? ENV_INTERVAL : 10_000;

const dlog = (...args: any[]) => { if (DEBUG) console.log('[LoopEngine]', ...args); };

// Small preview to avoid dumping huge payloads when debugging
function preview(obj: unknown, maxItems = 3): any {
  if (!DEBUG) return undefined;
  try {
    if (Array.isArray(obj)) return obj.slice(0, maxItems);
    if (obj && typeof obj === 'object') {
      const entries = Object.entries(obj as Record<string, unknown>).slice(0, maxItems);
      const out: Record<string, unknown> = {};
      for (const [k, v] of entries) {
        out[k] = typeof v === 'string'
          ? (v.length > 64 ? v.slice(0, 61) + '...' : v)
          : v;
      }
      return out;
    }
  } catch { /* ignore */ }
  return obj;
}

// Engines list — adjust keys to match your engine configs
export const ENGINES = ['jarvis', 'snowbase', 'synapse'] as const;
export type EngineKey = (typeof ENGINES)[number];

// Replace with real user or system account
const USER_ID = 'a391ca33-b6bc-4670-9144-c59022cc9b9e';

// XP conversion helper
function dollarsToXP(profitUSD: number | null | undefined): number {
  const n = typeof profitUSD === 'number' && Number.isFinite(profitUSD) ? profitUSD : 0;
  return Math.max(0, Math.floor(n));
}

// Hooks needed for orchestration
export interface LoopHooks {
  fetchMarketSignals: () => Promise<MarketSnapshot>;
  getUserXP: (userId: string) => Promise<number>;
  addUserXP: (userId: string, delta: number) => Promise<void>;
  checkAndDropCrate: (userId: string, newTotalXP: number) => Promise<void>;
  logEngineEvent: (row: {
    user_id: string;
    engine_name: string;
    symbol?: string;
    position?: 'buy' | 'sell' | 'flat';
    profit_usd?: number;
    xp_gain?: number;
    override?: boolean;
    crate_count?: number;
  }) => Promise<void>;
  orchestratorHooks?: Partial<OrchestratorHooks>;
}

const noop = async () => {};

// Default no-op hooks so file compiles even if not wired up
const defaultHooks: LoopHooks = {
  fetchMarketSignals: async () => ({}),
  getUserXP: async () => 0,
  addUserXP: noop,
  checkAndDropCrate: noop,
  logEngineEvent: noop,
  orchestratorHooks: {},
};

// ────────────────────────── Single step ──────────────────────────

export async function runEngineStep(
  engineKey: EngineKey,
  engine: EngineLike,
  hooks: Partial<LoopHooks> = {},
): Promise<void> {
  const h = { ...defaultHooks, ...hooks };
  dlog(`=== Step start: ${engineKey} | DRY_RUN=${DRY_RUN} | INTERVAL_MS=${INTERVAL_MS} ===`);

  // 1) Pull XP + market snapshot
  const currentXP = await h.getUserXP(USER_ID);
  const marketData = await h.fetchMarketSignals();
  dlog('Market snapshot preview:', preview(marketData));

  // 2) Run engine through orchestrator
  const result: EngineResult = await xpEngineOrchestrator(
    { engine, engineKey, userId: USER_ID, data: marketData, override: false },
    h.orchestratorHooks ?? {},
  );

  dlog('Engine result:', preview({
    profitUSD: result.profitUSD,
    crates: result.crates,
    signals: result.signals?.length,
    override: result.override,
    symbol: result.symbol,
    position: result.position,
  }));

  // 3) Convert to XP
  const xpEarned = dollarsToXP(result.profitUSD);
  dlog('XP earned:', xpEarned);

  // 4) Update XP + crates
  if (!DRY_RUN && xpEarned > 0) {
    await h.addUserXP(USER_ID, xpEarned);
    await h.checkAndDropCrate(USER_ID, currentXP + xpEarned);
  } else if (DRY_RUN && xpEarned > 0) {
    dlog('[DRY_RUN] Skipping addUserXP & checkAndDropCrate');
  }

  // 5) Log engine event (skip on dry-run)
  if (!DRY_RUN) {
    await h.logEngineEvent({
      user_id: USER_ID,
      engine_name: engineKey,
      symbol: result.symbol ?? undefined,
      position: (result.position as any) ?? undefined,
      profit_usd: result.profitUSD ?? undefined,
      xp_gain: xpEarned ?? undefined,
      override: result.override ?? undefined,
      crate_count: result.crates ?? undefined,
    });
  } else {
    dlog('[DRY_RUN] Skipping logEngineEvent');
  }

  dlog(`=== Step end: ${engineKey} ===`);
}

// ────────────────────────── Continuous loop ──────────────────────────

export async function startLoopEngine(
  engineFactory: (key: EngineKey) => EngineLike,
  hooks: Partial<LoopHooks> = {},
): Promise<never> {
  let activeEngineIndex = 0;

  dlog('Starting loop with engines:', ENGINES, '| DRY_RUN=', DRY_RUN);

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const engineKey = ENGINES[activeEngineIndex];
    try {
      dlog(`Loop index ${activeEngineIndex}, engine: ${engineKey}`);
      const engine = engineFactory(engineKey);
      await runEngineStep(engineKey, engine, hooks);
    } catch (err) {
      console.error('[LoopEngine] Runner Error:', err);
    }

    activeEngineIndex = (activeEngineIndex + 1) % ENGINES.length;
    dlog(`Sleeping ${INTERVAL_MS / 1000}s until next engine...`);
    await new Promise((r) => setTimeout(r, INTERVAL_MS));
  }
}

