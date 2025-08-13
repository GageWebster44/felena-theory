// Safe hooks + optional debug logging + DRY_RUN for xpEngineOrchestrator.

import { createClient } from '@supabase/supabase-js';
import type { OrchestratorHooks, EngineRunResult } from './xpEngineOrchestrator';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const DEBUG = (process.env.NEXT_PUBLIC_FELENA_DEBUG || '').toString() === '1';
const DRY_RUN = (process.env.NEXT_PUBLIC_ENGINE_DRY_RUN || '').toString() === '1';

const sb = SUPABASE_URL && SUPABASE_ANON ? createClient(SUPABASE_URL, SUPABASE_ANON) : null;

const noop = async () => {};
const dlog = (...args: any[]) => { if (DEBUG) console.log('[Orchestrator]', ...args); };

// ────────────────────────── helpers ──────────────────────────

async function safeLogEngineEvent(row: {
  user_id: string;
  engine_key?: string;
  engine_name?: string;
  xp?: number;
  profit_usd?: number | null;
  symbol?: string | null;
  position?: 'buy' | 'sell' | 'flat' | null;
  signal_count?: number;
  override_active?: boolean;
  crate_count?: number;
}) {
  dlog('logEngineEvent payload (pre-helper):', row);
  if (DRY_RUN) { dlog('[DRY_RUN] skip logEngineEvent'); return; }

  try {
    const mod = await import('@/lib/logEngineEvent');
    if (typeof (mod as any).logEngineEvent === 'function') {
      const payload: any = {
        user_id: row.user_id,
        profit_usd: row.profit_usd ?? undefined,
        xp_gain: row.xp ?? undefined,
        symbol: row.symbol ?? undefined,
        position: row.position ?? undefined,
        override: Boolean(row.override_active),
        crate_count: row.crate_count ?? undefined,
      };
      const name = row.engine_name ?? row.engine_key;
      if (name) payload.engine_name = name;

      dlog('logEngineEvent → helper:', payload);
      await (mod as any).logEngineEvent(payload as any);
      return;
    }
  } catch (e) {
    dlog('logEngineEvent helper missing/failed, falling back:', (e as Error)?.message);
  }

  if (!sb) return;
  try {
    const insert = {
      user_id: row.user_id,
      engine_key: row.engine_key ?? null,
      engine_name: row.engine_name ?? null,
      xp_gain: row.xp ?? null,
      profit_usd: row.profit_usd ?? null,
      symbol: row.symbol ?? null,
      position: row.position ?? null,
      signal_count: row.signal_count ?? null,
      override: row.override_active ?? null,
      crate_count: row.crate_count ?? null,
    } as any;
    dlog('logEngineEvent → fallback insert:', insert);
    await sb.from('engine_events').insert(insert);
  } catch (e) {
    console.error('[orchestratorHooks] engine_events insert failed:', e);
  }
}

async function safePlayCrateSound(tier?: string) {
  try {
    const mod = await import('@/utils/crate_reward_logic');
    if (typeof (mod as any).playCrateSound === 'function') {
      dlog('playCrateSound tier:', tier);
      await (mod as any).playCrateSound(tier);
    }
  } catch (e) {
    dlog('playCrateSound noop:', (e as Error)?.message);
  }
}

async function safeLogCrateUnlock(userId: string, data: { tier?: string; source?: string }) {
  if (DRY_RUN) { dlog('[DRY_RUN] skip crate unlock', { userId, data }); return; }

  try {
    const mod = await import('@/utils/logCrateUnlock');
    if (typeof (mod as any).logCrateUnlock === 'function') {
      dlog('logCrateUnlock helper:', { userId, data });
      await (mod as any).logCrateUnlock(userId, data.tier ?? 'unknown');
      return;
    }
  } catch (e) {
    dlog('logCrateUnlock helper missing/failed, fallback:', (e as Error)?.message);
  }

  if (!sb) return;
  try {
    const insert = {
      user_id: userId,
      label: data.tier ?? 'dynamic',
      source: data.source ?? 'orchestrator',
      opened: false,
    } as any;
    dlog('logCrateUnlock → fallback insert:', insert);
    await sb.from('xp_crates').insert(insert);
  } catch (e) {
    console.error('[orchestratorHooks] xp_crates insert failed:', e);
  }
}

// ────────────────────────── exported factory ──────────────────────────

export function getDefaultOrchestratorHooks(): Partial<OrchestratorHooks> {
  return {
    executeTrade: async (_order: unknown) => {
      dlog('executeTrade noop (wire your broker adapter here)');
      return {};
    },

    updateXP: async ({ userId, xp, engineKey }) => {
      if (xp <= 0) return;
      dlog('updateXP', { userId, xp, engineKey, DRY_RUN });
      if (DRY_RUN || !sb) return;

      try {
        await sb.from('xp_log').insert({
          user_id: userId,
          amount: xp,
          source: engineKey ?? 'engine',
          reason: 'engine_profit',
        } as any);
        dlog('xp_log insert ok');
      } catch (e) {
        console.error('[orchestratorHooks] xp_log insert failed:', e);
      }

      try {
        const { data } = await sb
          .from('xp_balance')
          .select('amount')
          .eq('user_id', userId)
          .maybeSingle();

        const current = Number((data as any)?.amount ?? 0);
        const next = Math.max(0, Math.floor(current + xp));
        dlog('xp_balance upsert', { current, next });

        await sb
          .from('xp_balance')
          .upsert({ user_id: userId, amount: next } as any, { onConflict: 'user_id' } as any);
      } catch (e) {
        console.error('[orchestratorHooks] xp_balance upsert failed:', e);
      }
    },

    logSessionEvent: async (p) => {
      dlog('logSessionEvent', p);
      await safeLogEngineEvent({
        user_id: p.userId,
        engine_key: p.engineKey,
        xp: p.xp,
        profit_usd: p.profitUSD ?? undefined,
        symbol: p.symbol ?? undefined,
        position: (p.position as any) ?? undefined,
        signal_count: p.signalCount,
        override_active: p.overrideActive,
      });
    },

    logDailyXP: async (userId, xp) => {
      if (DRY_RUN || !sb) { dlog('[DRY_RUN] skip daily_xp_totals upsert'); return; }
      try {
        const today = new Date().toISOString().slice(0, 10);
        const { data } = await sb
          .from('daily_xp_totals')
          .select('xp')
          .eq('user_id', userId)
          .eq('date', today)
          .maybeSingle();

        const current = Number((data as any)?.xp ?? 0);
        dlog('daily_xp_totals upsert', { today, current, add: xp, next: current + xp });

        await sb.from('daily_xp_totals').upsert(
          { user_id: userId, date: today, xp: current + xp } as any,
          { onConflict: 'user_id,date' } as any
        );
      } catch (e) {
        console.error('[orchestratorHooks] daily_xp_totals upsert failed:', e);
      }
    },

    logEngineStats: async (userId, engineKey, result: EngineRunResult) => {
      if (DRY_RUN || !sb) { dlog('[DRY_RUN] skip engine_stats insert'); return; }
      try {
        const insert = {
          user_id: userId,
          engine_key: engineKey,
          profit_usd: result.profitUSD ?? null,
          symbol: result.symbol ?? null,
          position: result.position ?? null,
          signal_count: (result.signals ?? []).length,
          override: result.override ?? null,
        } as any;
        dlog('engine_stats insert:', insert);
        await sb.from('engine_stats').insert(insert);
      } catch (e) {
        console.error('[orchestratorHooks] engine_stats insert failed:', e);
      }
    },

    auditXPIntegrity: async () => dlog('auditXPIntegrity'),
    trackBehaviorAnomaly: async (_userId, result) => dlog('trackBehaviorAnomaly', { signals: result.signals?.length ?? 0, override: result.override }),
    trackUplinkXP: async (userId, xp) => dlog('trackUplinkXP', { userId, xp }),

    watchErrorSignals: async (engineKey) => {
      try {
        const mod = await import('@/utils/errorSignalWatcher');
        if (typeof (mod as any).updateSignalTimestamp === 'function') {
          dlog('watchErrorSignals → updateSignalTimestamp', { engineKey });
          await (mod as any).updateSignalTimestamp(engineKey);
        }
      } catch (e) {
        dlog('watchErrorSignals noop:', (e as Error)?.message);
      }
    },

    checkCrateMilestone: async (xp) => {
      const triggered = xp >= 50;
      const tier = triggered ? (xp >= 200 ? 'gold' : xp >= 100 ? 'silver' : 'bronze') : undefined;
      dlog('checkCrateMilestone', { xp, triggered, tier });
      return { triggered, tier };
    },

    logCrateUnlock: async (userId, data) => {
      dlog('logCrateUnlock', { userId, data });
      await safeLogCrateUnlock(userId, { ...data, source: data.source ?? 'milestone' });
    },

    playCrateSound: async (tier) => { dlog('playCrateSound', { tier }); await safePlayCrateSound(tier); },

    assignDynamicCrate: async (_userId, engineKey, xp) => {
      const give = xp >= 25 && /e$/.test(engineKey) && Math.random() < 0.1;
      dlog('assignDynamicCrate', { engineKey, xp, give });
      return give ? { tier: 'bonus', source: 'dynamic' } : null;
    },

    checkCashoutStatus: async (xp) => {
      const res = xp >= 1000 ? { eligible: true, tier: 'T2' } :
                  xp >= 100  ? { eligible: true, tier: 'T1' } :
                               { eligible: false };
      dlog('checkCashoutStatus', { xp, res });
      return res;
    },

    logRewardClaim: async () => dlog('logRewardClaim'),

    updateEngineHealthScore: async (engineKey, confidenceAvg, result) => {
      if (DRY_RUN || !sb) { dlog('[DRY_RUN] skip engine_status upsert'); return; }
      try {
        const up = {
          engine_key: engineKey,
          confidence: confidenceAvg,
          last_profit_usd: result.profitUSD ?? null,
          last_updated: new Date().toISOString(),
        } as any;
        dlog('updateEngineHealthScore upsert:', up);
        await sb.from('engine_status').upsert(up, { onConflict: 'engine_key' } as any);
      } catch (e) {
        console.error('[orchestratorHooks] engine_status upsert failed:', e);
      }
    },

    notifyUser: async ({ userId, message }) => {
      if (DRY_RUN || !sb) { dlog('[DRY_RUN] skip notification'); return; }
      try {
        const insert = { user_id: userId, message, channel: 'inbox', read: false } as any;
        dlog('notifyUser insert:', insert);
        await sb.from('notifications').insert(insert);
      } catch (e) {
        console.error('[orchestratorHooks] notifications insert failed:', e);
      }
    },
  };
}