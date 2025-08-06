import strategicEngines from '@/engines/strategic/AllStrategicEngines';
import { runEngine } from '@/utils/engineRunner';
import delay from '@/utils/delay';

export default async function loopStrategicEngines() {

  for (const engine of strategicEngines) {
    try {
      await runEngine(engine);
    } catch (error) {
      console.error(`❌ Error in ${engine.name}:`, error);
    }

    await delay(15000); // ⏱️ 15 seconds between each engine
  }

}

loopStrategicEngines();