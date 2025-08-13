import React, { useEffect, useState, useContext } from 'react';
import { withGuardianGate } from '@/components/withGuardianGate';
import Head from 'next/head';
import { createClient } from '@supabase/supabase-js';
import { UserXPContext } from '../_app';
import deployEngineToAlpaca from '@/lib/engineTransfer';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function Sandbox() {
export default withGuardianGate(Page);
  const { devKey, userXP } = useContext(UserXPContext);
  const [xp, setXP] = useState(0);
  const [walletXP, setWalletXP] = useState(0);
  const [rank, setRank] = useState('Operator I');
  const [badge, setBadge] = useState('None');
  const [log, setLog] = useState<string[]>([]);
  const [realXPOverride, setRealXPOverride] = useState(false);
  const [crateTrigger, setCrateTrigger] = useState(false);
  const [missionSim, setMissionSim] = useState(false);
  const [crateType, setCrateType] = useState<'Mini' | 'Major' | 'Max'>('Major');

  useEffect(() => {
    loadWallet();
    const syncInterval = setInterval(loadWallet, 10000);
    return () => clearInterval(syncInterval);
  }, []);

  const loadWallet = async () => {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user) return;
    const { data: wallet } = await supabase
      .from('xp_wallet')
      .select('xp')
      .eq('user_id', user.user.id)
      .single();
    setWalletXP(wallet?.xp || 0);
  };

  const simulateAction = async (label: string, delta: number) => {
    const newXP = xp + delta;
    setXP(newXP);
    setLog(prev => [`🧪 [${new Date().toLocaleTimeString()}] ${delta} XP → ${label} = total: ${newXP}`, ...prev]);

    if (realXPOverride) {
  try {
    await supabase.from('xp_log').insert({
  } catch (error) {
    console.error('❌ Supabase error in sandbox.tsx', error);
  }
        user_id: 'demo-operator',
        type: label.toLowerCase().replace(/\s/g, '_'),
        amount: delta,
        description: `${label} +${delta} XP`,
      });
  try {
    await supabase.from('xp_wallet').upsert({
  } catch (error) {
    console.error('❌ Supabase error in sandbox.tsx', error);
  }
        user_id: 'demo-operator',
        xp: newXP,
      });
      setWalletXP(newXP);
    }
  };

  const triggerCrateDrop = async () => {
    setCrateTrigger(true);
    await new Promise(r => setTimeout(r, 1200));
    setCrateTrigger(false);
    setLog(prev => [`🎁 [${new Date().toLocaleTimeString()}] Crate drop simulated: ${crateType}`, ...prev]);
  };

  const simulateMission = () => {
    setMissionSim(true);
    setLog(prev => [`🛰️ [${new Date().toLocaleTimeString()}] Mission module triggered.`, ...prev]);
    setTimeout(() => setMissionSim(false), 1000);
  };

  const injectBadge = async () => {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user) return;
  try {
    await supabase.from('xp_badges').insert({
  } catch (error) {
    console.error('❌ Supabase error in sandbox.tsx', error);
  }
      user_id: user.user.id,
      label: badge,
      issued_at: new Date().toISOString(),
    });
    setLog(prev => [`🏅 [${new Date().toLocaleTimeString()}] Badge granted: ${badge}`, ...prev]);
  };

  const simulateEngineDeploy = async () => {
    await deployEngineToAlpaca({ engine: 'jarvis', mode: 'test', xp: 123 });
    setLog(prev => [`⚙️ [${new Date().toLocaleTimeString()}] Engine deployment test fired (jarvis, 123 XP)`, ...prev]);
  };

  const exportLog = () => {
    const text = log.join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sandbox_log.txt';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!devKey) {
    return <div className="text-center p-10 text-red-500">🔴 Developer access only</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white px-6 py-10 font-mono">
      <Head><title>🧪 SANDBOX</title></Head>
      <h1 className="text-3xl text-green-400 mb-2">🧪 SANDBOX</h1>
      <p className="text-sm text-gray-400 mb-6">Dev/test mode. XP: {xp} | Wallet XP: {walletXP}</p>
      <p className="text-yellow-300 text-sm mb-4">⚠️ Developer-only simulation tools. All changes affect demo-operator unless override is enabled.</p>

      <button onClick={() => setRealXPOverride(!realXPOverride)} className={`px-4 py-2 text-sm rounded mb-4 ${realXPOverride ? 'bg-red-700' : 'bg-green-600'}`}>
        {realXPOverride ? 'REAL XP MODE ON' : 'SANDBOX ONLY'}
      </button>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <button onClick={() => simulateAction('Market Scan', 10)} className="bg-green-600 px-4 py-2 rounded">📈 Market +10 XP</button>
        <button onClick={() => simulateAction('Mission Complete', 25)} className="bg-blue-600 px-4 py-2 rounded">🎯 Mission +25 XP</button>
        <button onClick={() => simulateAction('Engine Trigger', 40)} className="bg-purple-600 px-4 py-2 rounded">⚙️ Engine +40 XP</button>
        <button onClick={() => simulateAction('PVP Victory', 75)} className="bg-red-600 px-4 py-2 rounded">🏆 PVP Win +75 XP</button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <select value={crateType} onChange={(e) => setCrateType(e.target.value as any)} className="bg-black border border-green-500 px-2 py-1 rounded">
          <option value="Mini">Mini</option>
          <option value="Major">Major</option>
          <option value="Max">Max</option>
        </select>
        <button onClick={triggerCrateDrop} className="bg-yellow-500 px-4 py-2 rounded">🎁 Simulate Crate</button>
        <button onClick={simulateMission} className="bg-cyan-500 px-4 py-2 rounded">🛰️ Trigger Mission</button>
        <button onClick={simulateEngineDeploy} className="bg-pink-500 px-4 py-2 rounded">🚀 Simulate Deploy</button>
      </div>

      <div className="mb-8">
        <label className="text-sm text-gray-400">🎖 Badge Label</label>
        <input value={badge} onChange={(e) => setBadge(e.target.value)} className="bg-black border border-green-400 px-2 rounded text-green-300 w-full" placeholder="Tactician / Overseer / etc" />
        <button onClick={injectBadge} className="bg-pink-600 px-4 py-2 rounded mt-2">🏅 Inject Badge</button>
      </div>

      <h2 className="text-xl text-green-300 mb-2">🧾 Simulation Log</h2>
      <div className="bg-black/70 border border-neutral-800 p-4 rounded h-48 overflow-y-scroll text-sm text-green-300">
        {log.length === 0 ? <p>🚫 No logs yet.</p> : log.map((l, i) => <p key={i}>{l}</p>)}
      </div>

      <button onClick={exportLog} className="text-sm text-blue-400 underline mt-4">⬇️ Export Log</button>
    </div>
  );
}