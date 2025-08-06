// loopRunner-behavioral.ts
// Executes behavioral-class XP engines using orchestrated loop logic

import { loopEngine } from './runSelectedEngine';
import { fetchMarketSignals } from './fetchMarketSignals';
import { getCurrentUserId } from '@/utils/userContext';
import { xpEngineOrchestrator } from './xpEngineOrchestrator';
import { AllEngines } from './AllEngines';
import { isOverrideEnabled } from './overrideLogic';

const USER_ID = getCurrentUserId();

(async () => {
  const override = await isOverrideEnabled(USER_ID);
  const behavioralEngines = Object.entries(AllEngines)
    .filter(([_, engine]) => engine.class === 'behavioral')
    .map(([key, engine]) => ({ key, engine }));

  for (const { key: ENGINE_KEY, engine } of behavioralEngines) {

    setInterval(async () => {
      const data = await fetchMarketSignals();
      if (!engine) return;

      await xpEngineOrchestrator({
        engine,
        engineKey: ENGINE_KEY,
        data,
        userId: USER_ID,
        override,
      });
    }, engine.cooldown || 30000); // Use custom cooldown or default to 30s
  }
})();