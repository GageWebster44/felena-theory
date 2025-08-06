import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { withAdminGate } from '@/components/withRoleGate';
import styles from '@/styles/crtLaunch.module.css';

function ResendLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('user_id', 'delta')
      .or(`action.ilike.%Resend success:%,action.ilike.%Resend failed:%`)
      .order('timestamp', { ascending: false })
      .limit(100);
    if (!error) setLogs(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtFrame}>
      <h1 className={styles.crtTitle}>Resend Email Attempt Log</h1>
      {loading ? <p className={styles.crtText}>Loading resend attempts...</p> : (
        <div className={styles.crtScrollBox}>
          {logs.map((log, i) => (
            <pre key={i} className={styles.crtLogBlock}>
              {log.timestamp} — {log.action}
            </pre>
          ))}
        </div>
      )}
    </div>
  );
}

export default withAdminGate(ResendLog);