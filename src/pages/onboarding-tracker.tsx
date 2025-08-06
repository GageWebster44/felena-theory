import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { withAdminGate } from '@/components/withRoleGate';
import styles from '@/styles/crtLaunch.module.css';
import { CSVLink } from 'react-csv';

function OnboardingTracker() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('user_onboarding')
      .select('*, user_profiles(alias, email)')
      .order('completed', { ascending: true });
    if (!error) setRows(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const incomplete = rows.filter(r => !r.completed);

  const csvExport = incomplete.map(r => ({
    user_id: r.user_id,
    reviewed_manual: r.reviewed_manual,
    accepted_terms: r.accepted_terms,
    visited_dashboard: r.visited_dashboard,
    visited_ai_console: r.visited_ai_console,
    visited_case_tracker: r.visited_case_tracker,
    completed: r.completed
  }));

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtFrame}>
      <h1 className={styles.crtTitle}>Operator Onboarding Tracker</h1>

      <div className={styles.crtMenu}>
        <CSVLink data={csvExport} filename="user_onboarding_status.csv" className={styles.crtButton}>
          Export CSV
        </CSVLink>
      </div>

      {loading ? (
        <p className={styles.crtText}>Loading onboarding status...</p>
      ) : (
        <div className={styles.crtScrollBox}>
          {incomplete.map((row, i) => (
            <pre key={i} className={styles.crtLogBlock} style={{ backgroundColor: row.completed ? '#003300' : '#330000' }}>
              <a href={`/audit/${row.user_id}`} className={styles.crtLink}>
                {row.user_profiles?.alias || row.user_profiles?.email || row.user_id}
              </a>
              {'\n'}Manual: {row.reviewed_manual ? '✅' : '⬜'}
              {'\n'}Terms: {row.accepted_terms ? '✅' : '⬜'}
              {'\n'}Dashboard: {row.visited_dashboard ? '✅' : '⬜'}
              {'\n'}AI Console: {row.visited_ai_console ? '✅' : '⬜'}
              {'\n'}Case Tracker: {row.visited_case_tracker ? '✅' : '⬜'}
              {'\n'}Completed: {row.completed ? '🟢 YES' : '🔴 NO'}
            </pre>
          ))}
        </div>
      )}
    </div>
  );
}

export default withAdminGate(OnboardingTracker);