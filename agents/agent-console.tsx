// pages/agent-console.tsx
import { useEffect, useState } from 'react';
import supabase from '@/utils/supabaseClient';
import styles from '@/styles/crtLaunch.module.css';
import { withAdminGate } from '@/components/withRoleGate';
import { CSVLink } from 'react-csv';

interface AgentEvent {
  id: string;
  agent: string;
  action: string;
  confidence: number;
  target_user?: string;
  severity?: string;
  created_at: string;
}

function AgentConsole() {
  const [logs, setLogs] = useState<AgentEvent[]>([]);
  const [filter, setFilter] = useState('');
  const [agent, setAgent] = useState('all');

  useEffect(() => {
    fetchLogs();
  }, [agent]);

  const fetchLogs = async () => {
    let query = supabase.from('agent_events').select('*').order('created_at', { ascending: false });
    if (agent !== 'all') query = query.eq('agent', agent);
    const { data } = await query;
    setLogs(data || []);
  };

  const agents = ['all', 'Echo', 'Vanta', 'Synapse', 'Archivus', 'Delta', 'Vector', 'Cycle', 'Orion', 'Citadel'];

  const filtered = filter
    ? logs.filter((log) =>
        log.action.toLowerCase().includes(filter.toLowerCase()) ||
        log.target_user?.toLowerCase().includes(filter.toLowerCase())
      )
    : logs;

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtScreen}>
      <h1 className={styles.crtTitle}>🧠 EchoMind Agent Console</h1>
      <p className={styles.crtText}>Live monitoring of AI-generated actions, risk flags, bans, and decisions.</p>

      <div className={styles.crtMenu}>
        <select className={styles.crtInput} value={agent} onChange={(e) => setAgent(e.target.value)}>
          {agents.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
        <input
          className={styles.crtInput}
          placeholder="Search actions or user ID..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <CSVLink data={logs} filename="agent_events.csv" className={styles.crtButton}>
          📤 Export CSV
        </CSVLink>
      </div>

      <div className={styles.crtScrollBox}>
        {filtered.map((log, i) => (
          <div key={i} className={styles.crtCard}>
            <p><strong>🤖 Agent:</strong> {log.agent}</p>
            <p><strong>⚠️ Action:</strong> {log.action}</p>
            {log.target_user && <p><strong>🎯 Target:</strong> {log.target_user}</p>}
            <p><strong>📊 Confidence:</strong> {log.confidence}%</p>
            {log.severity && <p><strong>🔥 Severity:</strong> {log.severity}</p>}
            <p style={{ fontSize: '0.75rem', color: '#999' }}>{new Date(log.created_at).toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div className={styles.scanlines} />
    </div>
  );
}

export default withAdminGate(AgentConsole);