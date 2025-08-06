
// sandboxengine.tsx – XP Engine Dev Mode Simulator

import { useEffect, useState } from 'react';
import { withGuardianGate } from '@/components/withGuardianGate';
import HUDFrame from '@/components/HUDFrame';
import EngineConsoleOverlay from '@/components/EngineConsoleOverlay';
import { fetchMarketSignals } from '@/utils/fetchMarketSignals';
import { AllEngines } from '@/engine/AllEngines';
import { xpEngineOrchestrator } from '@/utils/xpEngineOrchestrator';
import { isOverrideEnabled } from '@/utils/overrideLogic';

function SandboxEnginePage() {
export default withGuardianGate(Page);
  const [userXP, setUserXP] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [engineKey] = useState('Snubnose');
  const [override, setOverride] = useState(false);
  const [userId] = useState('test-user-001');

  useEffect(() => {
    const init = async () => {
      const ov = await isOverrideEnabled(userId);
      setOverride(ov);
    };
    init();

    const interval = setInterval(async () => {
      const data = await fetchMarketSignals();
      const engine = AllEngines[engineKey];

      const result = await xpEngineOrchestrator({
        engine,
        engineKey,
        data,
        userId,
        override
      });

      if (result?.signals?.length) {
        const entry = `[${engineKey}] +${result.signals.length} signals → XP flow`;
        setLogs(l => [...l.slice(-10), entry]);
        setUserXP(prev => prev + Math.floor(Math.random() * 20 + 10));
      }
    }, 30000);

    return () => clearInterval(interval);
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

  }, [engineKey, override, userId]);

  return (
    <HUDFrame>
      <div style={container}>
        <h1 style={header}>🧪 XP Engine Simulator</h1>
        <p>Running <strong>{engineKey}</strong> in dev/test mode. Logs below:</p>
        <pre style={logBox}>
          {logs.map((log, i) => <div key={i}>▶ {log}</div>)}
        </pre>
        <EngineConsoleOverlay
          currentXP={userXP}
          averageXPGain={15}
          userId={userId}
          logs={logs}
        />
      </div>
    </HUDFrame>
  );
}

const container = {
  padding: '2rem',
  color: '#0f0',
  fontFamily: 'Orbitron',
  minHeight: '100vh'
};

const header = {
  fontSize: '1.75rem',
  marginBottom: '1rem'
};

const logBox = {
  background: '#111',
  border: '1px solid #333',
  padding: '1rem',
  borderRadius: '8px',
  height: '240px',
  overflowY: 'auto'
};