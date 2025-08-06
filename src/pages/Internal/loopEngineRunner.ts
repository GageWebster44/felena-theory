// loopEngineRunner.ts – Finalized with tier-based cooldowns + override logic
import { loopEngine } from './runSelectedEngine';
import { fetchMarketSignals } from './fetchMarketSignals';
import { getCurrentUserId, getUserProfile, getUserTier } from '@/utils/userContext';
import { xpEngineOrchestrator } from './xpEngineOrchestrator';
import { AllEngines } from './AllEngines';
import { isOverrideEnabled } from './overrideLogic';

const ENGINE_KEY = 'Snubnose'; // Can be rotated or assigned dynamically
const USER_ID = getCurrentUserId();

(async () => {

  const override = await isOverrideEnabled(USER_ID);
  const userTier = await getUserTier(USER_ID);

  const cooldown = override || userTier >= 3 ? 15000 : 30000; // Tier 3+ or override = 15s, else 30s

  setInterval(async () => {
    try {
      const data = await fetchMarketSignals();
      const engine = AllEngines[ENGINE_KEY];
      if (!engine) return;

      await xpEngineOrchestrator({
        engine,
        engineKey: ENGINE_KEY,
        data,
        userId: USER_ID,
        override,
      });
    } catch (err) {
      console.error(`[Runner] Loop error for ${ENGINE_KEY}:`, err);
    }
  }, cooldown);
})();