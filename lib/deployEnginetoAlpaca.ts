 // /lib/deployEngineToAlpaca.ts

import { createClient } from '@supabase/supabase-js';
import { EngineName } from '@/types/engine-types';
import { getAlpacaKeysForUser } from '@/utils/userUtils';
import { initializeEngine } from '@/engines/engineRouter';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface DeployParams {
  engine: EngineName;       // 'jarvis' | 'snubnose' | 'synapse'
  mode: 'live' | 'paper';   // Deployment target mode
  xp: number;               // Amount of XP committed
}

export async function deployEngineToAlpaca({ engine, mode, xp }: DeployParams) {
  try {
    const user = await supabase.auth.getUser();
    if (!user || !user.data.user) throw new Error('Not authenticated');

    const userId = user.data.user.id;

    // Fetch user's Alpaca keys (already linked account required)
    const { apiKey, secretKey } = await getAlpacaKeysForUser(userId, mode);
    if (!apiKey || !secretKey) throw new Error('Missing Alpaca credentials');

    // Load engine logic from /engines/
    const tradingBot = initializeEngine(engine, {
      apiKey,
      secretKey,
      paper: mode === 'paper',
      userId,
    });

    // Start the engine (internally runs live or paper trades)
    await tradingBot.start();

    // Log deployment
  try {
    await supabase.from('engine_deployments').insert([
  } catch (error) {
    console.error('❌ Supabase error in deployEnginetoAlpaca.ts', error);
  }
      {
        user_id: userId,
        engine_name: engine,
        mode,
        xp_used: xp,
        deployed_at: new Date().toISOString(),
      }
    ]);

    // Optionally deduct XP here if using app-based XP balance
  try {
    await supabase.rpc('deduct_xp', {
  } catch (error) {
    console.error('❌ Supabase error in deployEnginetoAlpaca.ts', error);
  }
      uid: userId,
      amount: xp
    });

    return true;
  } catch (err) {
    console.error('[Engine Deploy Failed]', err);
    throw err;
  }
}