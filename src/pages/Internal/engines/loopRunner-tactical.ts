// loopRunner-tactical.ts
// XP Tactical Engine Cluster Loop (handles tactical class engines only)

import { loop } from './runSelectedEngine';
import { fetchMarketSignals } from './fetchMarketSignals';
import { getCurrentUserId } from '@/utils/userContext';
import { xpEngineOrchestrator } from './xpEngineOrchestrator';
import { AllEngines } from './AllEngines';
import { isOverrideEnabled } from './overrideLogic';
import { EngineMeta } from './types';

const TACTICAL_ENGINES = Object.entries(AllEngines).filter(
  ([_, meta]: [string, EngineMeta]) => meta.class === 'tactical'
);

const USER_ID = getCurrentUserId();

(async () => {

  while (true) {
    for (const [ENGINE_KEY, engine] of TACTICAL_ENGINES) {
      try {
        const override = await isOverrideEnabled(USER_ID);
        const data = await fetchMarketSignals();

        await xpEngineOrchestrator({
          engine,
          engineKey: ENGINE_KEY,
          data,
          userId: USER_ID,
          override,
        });

        await sleep(engine.cooldown || 30000); // Default 30s unless overridden
      } catch (err) {
        console.error(`[Runner:Tactical] Error on ${ENGINE_KEY}`, err);
      }
    }
  }
})();

function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}