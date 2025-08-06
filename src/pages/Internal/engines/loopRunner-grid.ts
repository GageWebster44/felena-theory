// loopRunner-grid.ts
import { runEngine } from '@/utils/engineRunner';
import gridEngines from '@/engines/grid/AllGridEngines';
import delay from '@/utils/delay';

export default async function loopGridEngines() {
  for (const engine of gridEngines) {
    try {
      await runEngine(engine);
    } catch (err) {
      console.error(`❌ Grid Error (${engine.name}):`, err);
    }
    await delay(10000);
  }
}
loopGridEngines();