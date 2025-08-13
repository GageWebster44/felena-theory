// loopRunner-infrastructure.ts
// Executes all infrastructure-level engines responsible for system maintenance, latency tests, API heartbeat, and failover logic.

import infrastructureEngines from '@/engines/infrastructure/AllInfrastructureEngines';
import { runEngine } from '@/utils/engineRunner';
import delay from '@/utils/delay';

export default async function loopInfrastructureEngines() {

  for (const engine of infrastructureEngines) {
    try {
      await runEngine(engine);
    } catch (err) {
      console.error(`🚨 Error in ${engine.name}:`, err);
    }

    await delay(6000); // Faster refresh for infrastructure engines
  }

}

loopInfrastructureEngines();