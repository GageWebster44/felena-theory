import { useEffect, useState } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { markOnboardingStep } from '@/utils/onboarding-progress';
import { supabase } from '@/utils/supabaseClient';
import { withAdminGate } from '@/components/withRoleGate';
import styles from '@/styles/crtLaunch.module.css';
import { CSVLink } from 'react-csv';

function CaseTracker() {
  const user = useUser();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('');
  const [noteDraft, setNoteDraft] = useState('');
  const [activeCaseId, setActiveCaseId] = useState(null);

  const fetchCases = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('mod_cases').select('*').order('created_at', { ascending: false });
    if (!error) setCases(data);
    setLoading(false);
  };

  const updateStatus = async (id, status) => {
  try {
    await supabase.from('mod_cases').update({ status }).eq('id', id);
  } catch (error) {
    console.error('❌ Supabase error in cases.tsx', error);
  }
    fetchCases();
  };

  const saveNote = async () => {
    if (!activeCaseId || !noteDraft.trim()) return;
  try {
    await supabase.from('mod_cases').update({ notes: noteDraft }).eq('id', activeCaseId);
  } catch (error) {
    console.error('❌ Supabase error in cases.tsx', error);
  }
    setNoteDraft('');
    setActiveCaseId(null);
    fetchCases();
  };

  const filtered = filter
    ? cases.filter(c => JSON.stringify(c).toLowerCase().includes(filter.toLowerCase()))
    : cases;

  const csvExport = cases.map((c) => ({
    id: c.id,
    user_id: c.user_id,
    ai_score: c.ai_score,
    status: c.status,
    reason: c.reason,
    notes: c.notes,
    assigned_to: c.assigned_to,
    created_at: c.created_at
  }));

  useEffect(() => {
    fetchCases();
    if (user) markOnboardingStep(user.id, 'visited_case_tracker');
  }, [user]);

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtFrame}>
      <h1 className={styles.crtTitle}>Case Review Tracker</h1>

      <div className={styles.crtMenu}>
        <input
          type="text"
          placeholder="Search cases..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className={styles.crtInput}
        />
        <CSVLink data={csvExport} filename="mod_cases_export.csv" className={styles.crtButton}>
          Export All Cases
        </CSVLink>
      </div>

      {loading ? <p className={styles.crtText}>Loading cases...</p> : (
        <div className={styles.crtScrollBox}>
          {filtered.map((c, i) => (
            <pre key={i} className={styles.crtLogBlock}>
              🗂️ Case #{c.id}
              {'\n'}👤 {c.user_id}
              {'\n'}🧠 Score: {c.ai_score} | Status: {c.status}
              {'\n'}📋 Reason: {c.reason || 'N/A'}
              {'\n'}🧾 Notes: {c.notes || '—'}
              {'\n'}🧑‍⚖️ Assigned: {c.assigned_to || '—'}
              {'\n'}🕒 Opened: {new Date(c.created_at).toLocaleString()}
              <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button onClick={() => updateStatus(c.id, 'open')} className={styles.crtButton}>Reopen</button>
                <button onClick={() => updateStatus(c.id, 'under_review')} className={styles.crtButton}>Reviewing</button>
                <button onClick={() => updateStatus(c.id, 'closed')} className={styles.crtButton}>Close</button>
                <button onClick={() => { setActiveCaseId(c.id); setNoteDraft(c.notes || ''); }} className={styles.crtButton}>📝 Add/Edit Note</button>
              </div>
            </pre>
          ))}
        </div>
      )}

      {activeCaseId && (
        <div className={styles.crtOverlay}>
          <div className={styles.crtCard}>
            <h2>Edit Case #{activeCaseId} Notes</h2>
            <textarea
              className={styles.crtInput}
              rows={4}
              value={noteDraft}
              onChange={(e) => setNoteDraft(e.target.value)}
            />
            <div className={styles.crtMenu}>
              <button onClick={saveNote} className={styles.crtButton}>💾 Save Note</button>
              <button onClick={() => setActiveCaseId(null)} className={styles.crtButton}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default withAdminGate(CaseTracker);