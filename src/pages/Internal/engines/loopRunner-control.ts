import controlEngines from '@/engines/control/AllControlEngines';
import { runEngine } from '@/utils/engineRunner';
import delay from '@/utils/delay';

export default async function loopControlEngines() {

  for (const engine of controlEngines) {
    try {
      await runEngine(engine);
    } catch (err) {
      console.error(`❌ Error in ${engine.name}:`, err);
    }

    await delay(10000); // 10 sec cooldown
  }

}

loopControlEngines();