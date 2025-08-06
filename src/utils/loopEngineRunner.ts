 import { loopEngine } from '@/lib/runSelectedEngine';
import { fetchMarketSignals } from '@/lib/fetchMarketSignals';
import { getUserXP, logXP, updateUserXP } from '@/lib/xpSystem';
import { checkAndDropCrate } from '@/lib/crateLogic';
import { logEngineEvent } from '@/lib/logEngineEvent'; // ✅ NEW

const ENGINES = ['jarvis', 'snubnose', 'synapse'];

// ✅ DEV OVERRIDE — Hardcoded Operator ID
const USER_ID = 'fa931643-b0b6-4e70-9144-c8590ac2b9be';

const INTERVAL_MS = 10000; // 10 seconds between engines

async function run() {

  let activeEngineIndex = 0;

  while (true) {
    const ENGINE_KEY = ENGINES[activeEngineIndex];

    const currentXP = await getUserXP(USER_ID);
    const marketData = await fetchMarketSignals();

    const result = await loopEngine(ENGINE_KEY, USER_ID, marketData);

    if (result && result.profitUSD > 0) {
      const xpEarned = Math.floor(result.profitUSD * 100); // 1 XP = $0.01

      await logXP(USER_ID, xpEarned, ENGINE_KEY);
      await updateUserXP(USER_ID, xpEarned);

      await checkAndDropCrate(USER_ID, currentXP + xpEarned);

      // ✅ NEW: Log full engine activity to Supabase
      await logEngineEvent({
        user_id: USER_ID,
        engine_name: ENGINE_KEY,
        symbol: result.symbol,
        position: result.position,
        profit_usd: result.profitUSD,
        xp_gain: xpEarned,
        override: result.override || false,
        crate_count: result.crates || 0,
      });

    }

    activeEngineIndex = (activeEngineIndex + 1) % ENGINES.length;
    await new Promise((r) => setTimeout(r, INTERVAL_MS));
  }
}

run().catch((err) => console.error('[Runner Error]', err));