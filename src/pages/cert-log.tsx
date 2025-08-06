import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabaseClient';
import styles from '@/styles/crtLaunch.module.css';
import { withAdminGate } from '@/components/withRoleGate';
import { CSVLink } from 'react-csv';

function CertLog() {
  const [tab, setTab] = useState<'issued' | 'viewed'>('issued');
  const [issued, setIssued] = useState<any[]>([]);
  const [viewed, setViewed] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    Promise.all([
      supabase.from('cert_issued').select('user_id, cert_type, issued_at, user_profiles(alias, xp)').order('issued_at', { ascending: false }),
      supabase.from('cert_views').select('user_id, cert_type, viewed_at, user_profiles(alias)').order('viewed_at', { ascending: false })
    ]).then(([issuedRes, viewedRes]) => {
      setIssued(issuedRes.data || []);
      setViewed(viewedRes.data || []);
      setLoading(false);
    });
  }, []);

  const filteredIssued = filter ? issued.filter(l => JSON.stringify(l).toLowerCase().includes(filter.toLowerCase())) : issued;
  const filteredViewed = filter ? viewed.filter(l => JSON.stringify(l).toLowerCase().includes(filter.toLowerCase())) : viewed;

  const csvExport = filteredIssued.map(l => ({
    user_id: l.user_id,
    alias: l.user_profiles?.alias || '—',
    cert_type: l.cert_type,
    xp: l.user_profiles?.xp ?? 0,
    issued_at: l.issued_at
  }));

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtFrame}>
      <h1 className={styles.crtTitle}>📜 Certificate Logs</h1>
      <div className={styles.crtMenu}>
        <button className={styles.crtButton} onClick={() => setTab('issued')}>📤 Issued</button>
        <button className={styles.crtButton} onClick={() => setTab('viewed')}>👁️ Viewed</button>
        <input
          type="text"
          placeholder="Search..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className={styles.crtInput}
        />
      </div>

      {loading ? <p className={styles.crtText}>Loading logs...</p> : (
        <>
          {tab === 'issued' && (
            <>
              <div className={styles.crtMenu}>
                <CSVLink data={csvExport} filename="cert_log.csv" className={styles.crtButton}>
                  📁 Export CSV
                </CSVLink>
                <p className={styles.crtText}>Total: {filteredIssued.length} certs</p>
              </div>
              <div className={styles.crtScrollBox}>
                {filteredIssued.map((log, i) => (
                  <div key={i} className={styles.crtCard}>
                    <p><strong>👤</strong> {log.user_profiles?.alias || log.user_id}</p>
                    <p><strong>🪪</strong> {log.cert_type}</p>
                    <p><strong>📅</strong> {new Date(log.issued_at).toLocaleString()}</p>
                    <p><strong>💠</strong> {log.user_profiles?.xp?.toLocaleString() ?? 0} XP</p>
                    <a
                      href={`/api/keycard-pdf?user_id=${log.user_id}&view=1`}
                      target="_blank"
                      className={styles.crtButton}
                    >
                      📥 Download PDF
                    </a>
                  </div>
                ))}
              </div>
            </>
          )}

          {tab === 'viewed' && (
            <div className={styles.crtScrollBox}>
              <p className={styles.crtText}>Total Views: {filteredViewed.length}</p>
              {filteredViewed.map((log, i) => (
                <div key={i} className={styles.crtCard}>
                  <p><strong>👤</strong> {log.user_profiles?.alias || log.user_id}</p>
                  <p><strong>📄</strong> {log.cert_type}</p>
                  <p><strong>🕒</strong> {new Date(log.viewed_at).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default withAdminGate(CertLog);