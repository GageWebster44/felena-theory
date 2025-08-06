import expansionEngines from '@/engines/expansion/AllExpansionEngines';
import { runEngine } from '@/utils/engineRunner';
import delay from '@/utils/delay';

export default async function loopExpansionEngines() {

  for (const engine of expansionEngines) {
    try {
      await runEngine(engine);
    } catch (err) {
      console.error(`❌ Engine Error in ${engine.name}:`, err);
    }

    await delay(12000); // Slightly longer cooldown for expansion strategies
  }

}

loopExpansionEngines();