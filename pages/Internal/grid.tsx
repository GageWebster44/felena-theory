 import React, { useContext, useEffect, useState } from 'react';
import { withGuardianGate } from '@/components/withGuardianGate';
import '@/utils/loopEngineRunner'; 
 import HUDFrame from '../../components/HUDFrame';
import EngineConsoleOverlay from '@/components/EngineConsoleOverlay';
import { UserXPContext } from '../_app';
import { GridOrchestrator } from '@/engine/GridOrchestrator';
import { GridMeta } from '@/engine/GridMeta';
import GridExport from '@/components/GridExport';

function GridPage() {
export default withGuardianGate(Page);
  const { userXP } = useContext(UserXPContext);
  const [results, setResults] = useState<any[]>([]);
  const [engineLogs, setEngineLogs] = useState<string[]>([]);
  const [filterClass, setFilterClass] = useState('');
  const [filterStrategy, setFilterStrategy] = useState('');
  const [reorderByXP, setReorderByXP] = useState(false);

  useEffect(() => {
    const load = async () => {
      const audio = new Audio('/sounds/grid_interface_online.mp3');
      audio.volume = 0.5;
      audio.play();

      const { summary } = await GridOrchestrator.runGrid({});
      setResults(summary);
      setEngineLogs(logs => [...logs, '[Grid Boot] Grid Orchestrator initialized.']);
    };
    load();
  }, []);

  const filtered = results.filter(r =>
    (!filterClass || r.class === filterClass) &&
    (!filterStrategy || r.strategy === filterStrategy)
  );

  const displayed = reorderByXP
    ? [...filtered].sort((a, b) => parseFloat(b.avgConfidence) - parseFloat(a.avgConfidence))
    : filtered;

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <HUDFrame>
      <div style={container}>
        {/* HUD Stats */}
        <div style={{ position: 'absolute', top: 20, right: 20, textAlign: 'right' }}>
          <p style={{ color: '#ffffff', fontWeight: 'bold' }}>OPERATOR ONLINE</p>
          <p style={{ color: '#00ff99' }}>XP: {userXP.toLocaleString()}</p>
        </div>

        <h1 style={header}>🧠 INTERNAL ENGINE GRID</h1>
        <p style={{ marginBottom: '2rem' }}>
          Real-time activity feed from all autonomous quant engines. Apply filters or reorder dynamically.
        </p>

        {/* Filters */}
        <div style={filterRow}>
          <select onChange={(e) => setFilterClass(e.target.value)} value={filterClass}>
            <option value="">All Classes</option>
            <option value="tactical">Tactical</option>
            <option value="behavioral">Behavioral</option>
            <option value="infrastructure">Infrastructure</option>
            <option value="strategic">Strategic</option>
            <option value="expansion">Expansion</option>
            <option value="control">Control</option>
          </select>

          <select onChange={(e) => setFilterStrategy(e.target.value)} value={filterStrategy}>
            <option value="">All Strategies</option>
            {Array.from(new Set(GridMeta.map(m => m.strategy))).map(strategy => (
              <option key={strategy} value={strategy}>{strategy}</option>
            ))}
          </select>

          <button
            onClick={() => setReorderByXP(!reorderByXP)}
            style={{ marginLeft: '1rem', padding: '0.5rem 1rem' }}
          >
            {reorderByXP ? '🔄 Reset Order' : '⚡ Reorder by XP Impact'}
          </button>
        </div>

        {/* Engine Grid */}
        <div style={grid}>
          {displayed.map((engine, idx) => (
            <div key={idx} style={cell}>
              <h2 style={{ color: '#fff' }}>{engine.engine}</h2>
              <p style={{ color: '#ccc' }}>{engine.description}</p>
              <p>Signals: {engine.count}</p>
              <p>Top: {engine.topSignal}</p>
              <p>Confidence: {engine.avgConfidence}%</p>
            </div>
          ))}
        </div>

<GridExport data={displayed} />

        {/* Console Overlay */}
        <EngineConsoleOverlay
          currentXP={userXP}
          averageXPGain={8}
          userId={"user.id"} // replace with actual user.id
          logs={engineLogs}
        />
      </div>
    </HUDFrame>
  );
}

// Styles
const container = {
  padding: '3rem',
  fontFamily: 'Orbitron',
  color: '#00ff99',
  minHeight: '100vh',
  position: 'relative'
};

const header = {
  fontSize: '2rem',
  color: '#0f0',
  textShadow: '0 0 8px #0f0',
  marginBottom: '1rem'
};

const filterRow = {
  display: 'flex',
  gap: '1rem',
  marginBottom: '2rem',
  alignItems: 'center'
};

const grid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
  gap: '1.5rem'
};

const cell = {
  background: '#111',
  border: '1px solid #333',
  borderRadius: '12px',
  padding: '1rem',
  boxShadow: '0 0 6px #00ff99'
};