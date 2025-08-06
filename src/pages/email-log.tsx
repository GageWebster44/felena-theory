import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { withAdminGate } from '@/components/withRoleGate';
import styles from '@/styles/crtLaunch.module.css';

function EmailLogViewer() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('email_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(200);
    if (!error) setLogs(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filtered = filter
    ? logs.filter(l => JSON.stringify(l).toLowerCase().includes(filter.toLowerCase()))
    : logs;

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtFrame}>
      <h1 className={styles.crtTitle}>Outbound Email Log</h1>

      <input
        type="text"
        placeholder="Search by email, subject, or ID..."
        value={filter}
        onChange={(e) => {
          const value = e.target.value;
          clearTimeout(window.filterDebounce);
          window.filterDebounce = setTimeout(() => setFilter(value), 150);
        }}
        className={styles.crtInput}
      />

      {loading ? (
        <p className={styles.crtText}>Loading email log...</p>
      ) : (
        <div className={styles.crtScrollBox}>
          {filtered.map((entry, i) => (
            <pre key={i} className={styles.crtLogBlock}>
              📬 {entry.timestamp}
              {'
'}To: {entry.recipient}
              {'
'}Subject: {entry.subject}
              {'
'}From: {entry.sent_by || 'system'}
              {'
'}Link: {entry.link || '—'}
              {'
'}User ID: {entry.user_id || '—'}
              {'
'}
              <button
                onClick={async () => {
                  try {
                  const r = await fetch('/api/send-audit-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ user_id: entry.user_id })
                  });
                  if (r.ok) {
  try {
    await supabase.from('audit_logs').insert({
  } catch (error) {
    console.error('❌ Supabase error in email-log.tsx', error);
  }
                    user_id: 'delta',
                    action: `Resend success: user ${entry.user_id}`,
                    timestamp: new Date().toISOString()
                  });
                  alert(`✅ Email resent for user ${entry.user_id}`);
                  } else {
  try {
    await supabase.from('audit_logs').insert({
  } catch (error) {
    console.error('❌ Supabase error in email-log.tsx', error);
  }
                    user_id: 'delta',
                    action: `Resend failed: user ${entry.user_id}`,
                    timestamp: new Date().toISOString()
                  });
                  alert(`❌ Failed to resend email for ${entry.user_id}`);
                  }
                } catch (e) {
                  alert(`❌ Error: ${e.message}`);
                }
                }}
                className={styles.crtButton}
              >
                📤 Resend
              </button>
            </pre>
          ))}
        </div>
      )}
    </div>
  );
}

export default withAdminGate(EmailLogViewer);