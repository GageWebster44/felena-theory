 import { useEffect, useState } from 'react';
import { withGuardianGate } from '@/components/withGuardianGate';
import styles from '@/styles/crtLaunch.module.css';
import playSound from '@/utils/playSound';
import logXP from '@/utils/logXP';

interface Anomaly {
  id: string;
  label: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: string;
  description: string;
}

const mockEvents: Anomaly[] = [
  { id: 'a1', label: 'Spoof Wall', severity: 'high', description: 'Large ask wall vanished at 9:32am', timestamp: '' },
  { id: 'a2', label: 'Hidden Bid', severity: 'medium', description: 'Hidden order revealed on pullback', timestamp: '' },
  { id: 'a3', label: 'Signal Jam', severity: 'low', description: 'Odd fluctuation in mid-quote zone', timestamp: '' },
];

function AnomalyRadar() {
export default withGuardianGate(Page);
  const [feed, setFeed] = useState<Anomaly[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const index = Math.floor(Math.random() * mockEvents.length);
      const anomaly = {
        ...mockEvents[index],
        timestamp: new Date().toLocaleTimeString(),
        id: Math.random().toString(36).substring(7)
      };
      setFeed((prev) => [anomaly, ...prev].slice(0, 10));
      playSound('ping-scan');
    }, 8000);

    return () => clearInterval(interval);
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

  }, []);

  const handleSendToSim = async (anomaly: Anomaly) => {
    playSound('beep-confirm');
    await logXP('anomaly_flag', 0, `Sent to simulator: ${anomaly.label}`);
    alert(`🧠 ${anomaly.label} dispatched to AI system`);
  };

  return (
    <div className={styles.crtScreen}>
      <h2>🧠 ANOMALY RADAR</h2>
      <p>Tracking spoof walls, volume traps, signal jamming & more.</p>

      <div className={styles.anomalyFeed} style={{ marginTop: '2rem' }}>
        {feed.map((a) => (
          <div key={a.id} className={`${styles.anomalyItem} ${styles['sev_' + a.severity]}`}>
            <h4>{a.label} <span style={{ fontSize: '0.75rem', color: '#aaa' }}>({a.severity.toUpperCase()})</span></h4>
            <p>{a.description}</p>
            <p className={styles.timestamp}>{a.timestamp}</p>
            <button className={styles.crtButton} onClick={() => handleSendToSim(a)}>
              Send to Simulator
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}