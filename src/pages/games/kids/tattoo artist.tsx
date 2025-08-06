import { useState } from 'react';
import styles from '@/styles/crtLaunch.module.css';
import withGuardianGate from '@/components/withGuardianGate';

function TattooArtistSim() {
  const [selectedTool, setSelectedTool] = useState<'none' | 'outline' | 'fill' | 'shade'>('none');
  const [outlineComplete, setOutlineComplete] = useState(false);
  const [fillComplete, setFillComplete] = useState(false);
  const [shadingComplete, setShadingComplete] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  const handleToolUse = (tool: 'outline' | 'fill' | 'shade') => {
    let newLog = '';
    setSelectedTool(tool);

    if (tool === 'outline') {
      setOutlineComplete(true);
      newLog = '🖊 Outline done.';
    } else if (tool === 'fill') {
      if (!outlineComplete) {
        newLog = '❌ Complete the outline first!';
      } else {
        setFillComplete(true);
        newLog = '🧪 Fill complete.';
      }
    } else if (tool === 'shade') {
      if (!fillComplete) {
        newLog = '❌ Fill must be done before shading!';
      } else {
        setShadingComplete(true);
        newLog = '🌫 Shading complete. Tattoo finished!';
      }
    }

    setLog((prev) => [newLog, ...prev]);
  };

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtScreen}>
      <h1>🎨 Tattoo Artist Simulator</h1>
      <p>Learn the fundamentals of tattooing: setup, technique, and aftercare.</p>

      <section style={{ marginTop: '2rem' }}>
        <h3>🛠 Select Tool:</h3>
        <div className={styles.crtGridResponsive}>
          <button onClick={() => handleToolUse('outline')} className={styles.crtButton}>Outline</button>
          <button onClick={() => handleToolUse('fill')} className={styles.crtButton}>Fill</button>
          <button onClick={() => handleToolUse('shade')} className={styles.crtButton}>Shade</button>
        </div>
      </section>

      <section style={{ marginTop: '2rem' }}>
        <h3>📋 Progress Log</h3>
        <div style={{ background: '#111', padding: '1rem', minHeight: '100px' }}>
          {log.length === 0 ? <p>No actions yet.</p> : (
            <ul style={{ fontSize: '0.9rem', color: '#0ff' }}>
              {log.map((entry, idx) => <li key={idx}>{entry}</li>)}
            </ul>
          )}
        </div>
      </section>

      {outlineComplete && fillComplete && shadingComplete && (
        <div style={{ marginTop: '2rem', color: '#00ff99' }}>
          <h3>✅ Tattoo Complete! Great job, apprentice!</h3>
        </div>
      )}
    </div>
  );
}

export default withGuardianGate(TattooArtistSim);