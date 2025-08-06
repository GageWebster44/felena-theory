import { useState } from 'react';
import styles from '@/styles/crtLaunch.module.css';
import withGuardianGate from '@/components/withGuardianGate';

function BusinessOwnerSim() {
  const [revenue, setRevenue] = useState(0);
  const [inventory, setInventory] = useState(100);
  const [marketing, setMarketing] = useState(1);
  const [customers, setCustomers] = useState(0);
  const [log, setLog] = useState<string[]>([]);

  const tickSimulation = () => {
    const newCustomers = Math.floor(Math.random() * 10 * marketing);
    const sales = Math.min(newCustomers, inventory);
    const saleAmount = sales * 5;

    setCustomers(newCustomers);
    setInventory(prev => Math.max(prev - sales, 0));
    setRevenue(prev => prev + saleAmount);

    setLog(prev => [
      `👥 Customers: ${newCustomers}, Sales: ${sales}, Revenue: +$${saleAmount}`,
      ...prev.slice(0, 4)
    ]);
  };

  const restock = () => {
    setInventory(prev => prev + 50);
    setRevenue(prev => prev - 100);
    setLog(prev => [
      `📦 Restocked inventory (-$100)`,
      ...prev.slice(0, 4)
    ]);
  };

  const boostMarketing = () => {
    setMarketing(prev => prev + 0.5);
    setRevenue(prev => prev - 50);
    setLog(prev => [
      `📢 Marketing boost (+${marketing * 0.5}x) (-$50)`,
      ...prev.slice(0, 4)
    ]);
  };

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtScreen}>
      <h1>📊 Business Owner Simulator</h1>
      <p>Run your own XP-side hustle. Buy inventory, attract customers, grow revenue.</p>

      <div style={{ marginTop: '1rem' }}>
        <p><strong>💰 Revenue:</strong> ${revenue}</p>
        <p><strong>📦 Inventory:</strong> {inventory} units</p>
        <p><strong>📢 Marketing Power:</strong> {marketing}x</p>
      </div>

      <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
        <button className={styles.crtButton} onClick={tickSimulation}>🔁 Simulate Day</button>
        <button className={styles.crtButton} onClick={restock}>📦 Restock (-$100)</button>
        <button className={styles.crtButton} onClick={boostMarketing}>📢 Boost Marketing (-$50)</button>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h3>📝 Activity Log</h3>
        <ul>
          {log.map((entry, i) => (
            <li key={i} style={{ fontSize: '0.9rem', color: '#0ff' }}>{entry}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default withGuardianGate(BusinessOwnerSim);