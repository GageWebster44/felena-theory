import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { withAdminGate } from '@/components/withRoleGate';
import styles from '@/styles/crtLaunch.module.css';
import { CSVLink } from 'react-csv';

function EchoMindAnomalyScanner() {
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('');
  const [aiLog, setAiLog] = useState([]);

  const fetchAnomalies = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('xp_log')
      .select('user_id, reason, xp, timestamp')
      .order('timestamp', { ascending: false })
      .limit(1000);

    if (error || !data) {
      setFlags([]);
      setAiLog([]);
      setLoading(false);
      return;
    }

    const grouped = {};
    data.forEach(({ user_id, reason, xp, timestamp }) => {
      if (!grouped[user_id]) grouped[user_id] = [];
      grouped[user_id].push({ reason, xp, timestamp });
    });

    const anomalies = [];
    const aiTrace = [];
    const now = new Date();

    for (const [user, logs] of Object.entries(grouped)) {
      const highXP = logs.filter(l => l.xp >= 1000);
      const spikes = logs.filter((l, i, arr) => i > 0 && l.xp > 3 * arr[i - 1].xp);
      const repeatReasons = {};
      logs.forEach(l => {
        repeatReasons[l.reason] = (repeatReasons[l.reason] || 0) + 1;
      });
      const repeated = Object.entries(repeatReasons).filter(([_, count]) => count >= 3);

      const score = highXP.length * 2 + repeated.length + spikes.length;

      aiTrace.push({ user_id: user, score, highXP: highXP.length, spikes: spikes.length, repeats: repeated.length });

      if (score >= 4) {
        anomalies.push({
          user_id: user,
          highXP: highXP.length,
          repeatedReasons: repeated.map(([r]) => r),
          spikeCount: spikes.length,
          score,
          totalEntries: logs.length,
          lastSeen: logs[0].timestamp
        });

  try {
    await supabase.from('audit_logs').insert({
  } catch (error) {
    console.error('❌ Supabase error in echomind-anamoly.tsx', error);
  }
          user_id: 'echomind',
          action: `Flagged anomaly: ${user} [score=${score}]`,
          timestamp: now.toISOString()
        });
      }
    }

    setFlags(anomalies);
    setAiLog(aiTrace.sort((a, b) => b.score - a.score));
    setLoading(false);
  };

  useEffect(() => {
    fetchAnomalies();
  }, []);

  const filteredFlags = filter
    ? flags.filter(f => JSON.stringify(f).toLowerCase().includes(filter.toLowerCase()))
    : flags;

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtFrame}>
      <h1 className={styles.crtTitle}>EchoMind Anomaly Scanner</h1>

      <input
        type="text"
        placeholder="Filter user or reason..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className={styles.crtInput}
      />

      {loading ? (
        <p className={styles.crtText}>Scanning recent XP logs...</p>
      ) : filteredFlags.length === 0 ? (
        <p className={styles.crtText}>No anomalies detected.</p>
      ) : (
        <div className={styles.crtScrollBox}>
          {filteredFlags.map((f, i) => (
            <pre key={i} className={styles.crtLogBlock}>
              🤖 {f.user_id} | AI Score: {f.score}
              {'\n'}• 🔥 {f.highXP} high XP logs
              {'\n'}• 📈 {f.spikeCount} XP spikes
              {'\n'}• ♻️ Repeats: {f.repeatedReasons.join(', ') || '—'}
              {'\n'}• 📊 {f.totalEntries} total entries
              {'\n'}• ⏱ Last activity: {new Date(f.lastSeen).toLocaleTimeString()}
            </pre>
          ))}
        </div>
      )}

      {aiLog.length > 0 && (
        <>
          <h2 className={styles.crtTitle}>EchoMind Signal Map</h2>
          <div className={styles.crtMenu}>
            <CSVLink data={aiLog} filename={`echomind_signal_map.csv`} className={styles.crtButton}>Export AI Signals</CSVLink>
          </div>
          <div className={styles.crtScrollBox}>
            {aiLog.slice(0, 20).map((log, i) => (
              <pre key={i} className={styles.crtText}>
                {log.user_id} — 🧠 Score: {log.score} | 🔥{log.highXP} | 📈{log.spikes} | ♻️{log.repeats}
              </pre>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default withAdminGate(EchoMindAnomalyScanner);