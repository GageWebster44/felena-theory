import { useContext, useState } from 'react';
import { withGuardianGate } from '@/components/withGuardianGate';
import { UserXPContext } from './_app';
import styles from '@/styles/crtLaunch.module.css';
import playSound from '@/utils/playSound';
import { logXP } from '@/utils/logXP';
import triggerXPBurst from '@/utils/triggerXPBurst';

function OverridePanel() {
export default withGuardianGate(Page);
  const { devKey, role } = useContext(UserXPContext);
  const [logs, setLogs] = useState<string[]>([]);
  const [xp, setXP] = useState(100);
  const [status, setStatus] = useState('');

  const isAuthorized = devKey || role === 'admin' || role === 'dev';

  const handleInjectXP = async () => {
    setLogs(prev => [`🧬 Injected ${xp} XP`, ...prev]);
    setStatus(`✅ Injected ${xp} XP`);
    playSound('xp-rain');
    triggerXPBurst();
    await logXP('override_inject', xp, 'Manual override injection');
  };

  const handleTriggerSignal = () => {
    const sig = `🔺 Simulated Signal ${Math.floor(Math.random() * 999)}`;
    setLogs(prev => [sig, ...prev]);
    setStatus(sig);
    playSound('ping-alert');
  };

  const handleDownloadLogs = () => {
    const blob = new Blob([logs.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'override_logs.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isAuthorized) {
    return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

      <div className={styles.crtScreen} style={{ color: '#f44' }}>
        <h1>❌ ACCESS DENIED</h1>
        <p>This override panel is restricted to developers or system operators.</p>
      </div>
    );
  }

  return (
    <div className={styles.crtScreen}>
      <h2>🔐 MANUAL OVERRIDE PANEL</h2>
      <p>Developer access to system controls, XP injections, and test triggers.</p>

      {status && <p style={{ color: '#0f0' }}>{status}</p>}

      <div className={styles.overrideGrid}>
        <div className={styles.overrideCard}>
          <h3>🧬 Inject XP</h3>
          <input
            type="number"
            value={xp}
            onChange={(e) => setXP(parseInt(e.target.value))}
            className={styles.crtInput}
          />
          <button onClick={handleInjectXP} className={styles.crtButton}>
            Inject XP
          </button>
        </div>

        <div className={styles.overrideCard}>
          <h3>📡 Trigger Signal</h3>
          <button onClick={handleTriggerSignal} className={styles.crtButton}>
            Simulate Signal
          </button>
        </div>

        <div className={styles.overrideCard}>
          <h3>🧾 Logs</h3>
          <button onClick={handleDownloadLogs} className={styles.crtButton}>
            Download Logs
          </button>
        </div>
      </div>

      <div className={styles.overrideLog}>
        <h4>🧠 Console Log</h4>
        <ul>
          {logs.map((log, idx) => (
            <li key={idx} style={{ fontSize: '0.85rem', color: '#0ff' }}>
              {log}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}