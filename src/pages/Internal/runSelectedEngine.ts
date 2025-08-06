 import { executeTrade } from '@/utils/executeTrade';
import { updateXP } from '@/utils/updateXP';
import { AllEngines } from './AllEngines';
import '@/utils/loopEngineRunner'; // add this at the top
import { logSessionEvent } from '@/utils/logSessionToSupabase';

type EngineKey = keyof typeof AllEngines;

export async function runSelectedEngine(
  engineKey: EngineKey,
  data: any[],
  executeTrade: Function,
  updateXP: Function,
  userId: string
) {
  const engine = AllEngines[engineKey];

  if (!engine || !engine.runEngine) {
    console.error(`[EngineRouter] No engine found for key: ${engineKey}`);
    return { error: "Invalid engine key." };
  }

  try {
    const result = await engine.runEngine(data, executeTrade, updateXP, userId);
    return result;
  } catch (err: any) {
    console.error(`[EngineRouter] Error running engine ${engineKey}:`, err);
    return { error: err.message || "Engine execution failed." };
  }
}

// 🔁 Autonomous Loop Trigger
export async function loopEngine(
  engineKey: EngineKey,
  userId: string,
  fetchSignalData: () => Promise<any[]>
) {

  setInterval(async () => {
    const signalData = await fetchSignalData();

    if (signalData?.length > 0) {
      await runSelectedEngine(engineKey, signalData, executeTrade, updateXP, userId);
    } else {
    }
  }, 30000); // Runs every 30 seconds
}