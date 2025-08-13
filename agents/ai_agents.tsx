import { useEffect, useState } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { markOnboardingStep } from '@/utils/onboarding-progress';
import { withAdminGate } from '@/components/withRoleGate';
import { supabase } from '@/utils/supabaseClient';
import styles from '@/styles/crtLaunch.module.css';
import { CSVLink } from 'react-csv';

const agents = [
  { id: 'echomind', name: 'Echo', role: 'Anomaly Detection' },
  { id: 'vanta', name: 'Vanta', role: 'Case Generation / Compliance' },
  { id: 'synapse', name: 'Synapse', role: 'Signal Routing / Alerts' },
  { id: 'archivus', name: 'Archivus', role: 'Data Archiving / Logs' },
  { id: 'delta', name: 'Delta', role: 'Notifications / Messaging' },
  { id: 'citadel', name: 'Citadel', role: 'Security / Access Bans' },
  { id: 'vector', name: 'Vector', role: 'Network Pattern Detection' },
  { id: 'orion', name: 'Orion', role: 'Dashboard Insights / Intelligence' },
  { id: 'cycle', name: 'Cycle', role: 'Automated Task Runner' }
];

function AIAgents() {
  const user = useUser();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('');
  const [statusMap, setStatusMap] = useState({});
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [agentCounts, setAgentCounts] = useState({});

  const fetchLogs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('audit_logs')
      .select('user_id, action, timestamp')
      .in('user_id', agents.map(a => a.id))
      .order('timestamp', { ascending: false })
      .limit(200);

    if (!error) {
      setLogs(data);
      const counts = {};
      data.forEach(log => {
        counts[log.user_id] = (counts[log.user_id] || 0) + 1;
      });
      setAgentCounts(counts);
    }
    setLoading(false);
  };

  const toggleAgent = async (agentId: string) => {
    const current = statusMap[agentId] || 'active';
    const nextStatus = current === 'paused' ? 'active' : 'paused';
    const updatedMap = { ...statusMap, [agentId]: nextStatus };
    setStatusMap(updatedMap);

  try {
    await supabase.from('audit_logs').insert({
  } catch (error) {
    console.error('❌ Supabase error in ai_agents.tsx', error);
  }
      user_id: 'cycle',
      action: `Admin toggled ${agentId} to ${nextStatus}`,
      timestamp: new Date().toISOString()
    });
  };

  const filtered = filter
    ? logs.filter(l => JSON.stringify(l).toLowerCase().includes(filter.toLowerCase()))
    : logs;

  const csvExport = logs.map(l => ({
    timestamp: l.timestamp,
    agent: l.user_id,
    action: l.action
  }));

  useEffect(() => {
    fetchLogs();
    if (user) markOnboardingStep(user.id, 'visited_ai_console');
  }, [user]);

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtFrame}>
      <h1 className={styles.crtTitle}>EchoMind AI Agent Console</h1>

      <div className={styles.crtGrid}>
        {agents.map((a, i) => (
          <div key={i} className={styles.crtCard}>
            <h2>{a.name} ({a.id})</h2>
            <p className={styles.crtText}>{a.role}</p>
            <p className={styles.crtText}>Status: {statusMap[a.id] || 'active'}</p>
            <p className={styles.crtText}>Logs: {agentCounts[a.id] || 0}</p>
            <button onClick={() => toggleAgent(a.id)} className={styles.crtButton}>
              {statusMap[a.id] === 'paused' ? '▶ Resume' : '⏸ Pause'}
            </button>
            <button onClick={() => setSelectedAgent(a.id)} className={styles.crtButton}>
              🔍 View Logs
            </button>
          </div>
        ))}
      </div>

      <h2 className={styles.crtTitle}>Recent Agent Activity</h2>
      <div className={styles.crtMenu}>
        <input
          type="text"
          placeholder="Filter logs..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className={styles.crtInput}
        />
        <CSVLink data={csvExport} filename="ai_agent_logs.csv" className={styles.crtButton}>
          Export Logs
        </CSVLink>
      </div>

      {loading ? (
        <p className={styles.crtText}>Loading logs...</p>
      ) : (
        <div className={styles.crtScrollBox}>
          {filtered.map((log, i) => (
            <pre key={i} className={styles.crtText}>
              {log.timestamp} — {log.user_id} → {log.action}
            </pre>
          ))}
        </div>
      )}

      {selectedAgent && (
        <div className={styles.crtOverlay}>
          <div className={styles.crtCard}>
            <h2>Logs for {selectedAgent}</h2>
            <div className={styles.crtScrollBox}>
              {logs.filter(l => l.user_id === selectedAgent).map((log, i) => (
                <pre key={i} className={styles.crtText}>
                  {log.timestamp} — {log.action}
                </pre>
              ))}
            </div>
            <div className={styles.crtMenu}>
              <button onClick={() => setSelectedAgent(null)} className={styles.crtButton}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default withAdminGate(AIAgents);