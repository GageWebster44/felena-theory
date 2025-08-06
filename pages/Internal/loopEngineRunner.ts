import { fetchMarketSignals } from './fetchMarketSignals';
import { getCurrentUserId } from '@/utils/userContext';
import { GridOrchestrator } from './GridOrchestrator';
import { logXP } from '@/utils/logXP';

(async () => {
  const USER_ID = getCurrentUserId();


  setInterval(async () => {
    try {
      const data = await fetchMarketSignals();
      const { summary, allSignals } = await GridOrchestrator.runGrid(data);

      for (const engine of summary) {
        if (engine.count > 0) {
          const xpEarned = Math.floor(parseFloat(engine.avgConfidence) * engine.count);

          await logXP(`grid_${engine.engine}`, xpEarned, `XP Engine Grid: ${engine.engine}`);
        }
      }

    } catch (err) {
      console.warn('⚠️ XP Engine Grid loop failed', err);
    }
  }, 30000); // every 30 seconds
})();