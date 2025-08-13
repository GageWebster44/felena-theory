// pages/admin-xp-inject.tsx
import { useEffect, useState } from 'react';
import { withAdminGate } from '@/components/withRoleGate';
import { supabase } from '@/utils/supabaseClient';
import styles from '@/styles/crtLaunch.module.css';
import { toast } from 'react-toastify';

function AdminXPInject() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [type, setType] = useState('manual');
  const [status, setStatus] = useState('');
  const [bulkData, setBulkData] = useState('');
  const [role, setRole] = useState('public');
  const [manualHistory, setManualHistory] = useState<any[]>([]);
  const [flaggedReasons, setFlaggedReasons] = useState<string[]>([]);
  const MAX_XP = role === 'developer' ? 50000 : 10000;

  const reasonPresets = [
    'Reward: Weekly Mission',
    'Referral Bonus',
    'XP Override',
    'Bug Bounty',
    'Shop Purchase Refund'
  ];

  useEffect(() => {
    checkRole();
    if (query.length < 3) return;
    const timeout = setTimeout(async () => {
      const { data } = await supabase
        .from('user_profiles')
        .select('id, alias, xp')
        .ilike('alias', `%${query}%`);
      setResults(data || []);
    }, 300);
    return () => clearTimeout(timeout);
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

  }, [query]);

  const checkRole = async () => {
    const { data: session } = await supabase.auth.getUser();
    setRole(session?.user?.user_metadata?.role || 'public');
  };

  const loadHistory = async (userId: string) => {
    const { data } = await supabase
      .from('xp_log')
      .select('id, xp, reason, timestamp')
      .eq('user_id', userId)
      .eq('type', 'manual')
      .order('timestamp', { ascending: false })
      .limit(5);
    setManualHistory(data || []);

    const { data: repeated } = await supabase
      .from('xp_log')
      .select('reason, timestamp')
      .eq('type', 'manual');

    const today = new Date().toISOString().split('T')[0];
    const freqMap: Record<string, number> = {};
    repeated?.forEach((r) => {
      const date = new Date(r.timestamp).toISOString().split('T')[0];
      if (date === today) {
        freqMap[r.reason] = (freqMap[r.reason] || 0) + 1;
      }
    });
    const flags = Object.keys(freqMap).filter(k => freqMap[k] > 3);
    setFlaggedReasons(flags);
  };

  const injectXP = async () => {
    if (!selectedUser || !amount || !reason.trim()) return setStatus('❌ Missing fields');
    const xp = parseInt(amount);
    if (isNaN(xp) || xp <= 0 || xp > MAX_XP) return setStatus(`❌ Invalid XP amount (Max ${MAX_XP})`);

  try {
    await supabase.from('xp_log').insert({
  } catch (error) {
    console.error('❌ Supabase error in admin-xp-inject.tsx', error);
  }
      user_id: selectedUser.id,
      xp,
      type,
      reason,
      timestamp: new Date().toISOString()
    });

  try {
    await supabase.from('audit_logs').insert({
  } catch (error) {
    console.error('❌ Supabase error in admin-xp-inject.tsx', error);
  }
      user_id: 'admin',
      action: `Injected ${xp} XP to ${selectedUser.id} as ${type} – ${reason}` + (xp >= 5000 ? ' ⚠️ HIGH-VALUE' : ''),
      timestamp: new Date().toISOString()
    });

    setStatus(`✅ ${xp} XP injected to ${selectedUser.alias}`);
    toast.success(`✅ ${xp} XP injected to ${selectedUser.alias}`);
    setAmount('');
    setReason('');
    refreshUser();
    loadHistory(selectedUser.id);
  };

  const injectBulk = async () => {
    const lines = bulkData.trim().split('\n');
    const entries = lines.map(line => {
      const [user_id, amt, type, reason] = line.split(',');
      return {
        user_id: user_id.trim(),
        xp: parseInt(amt),
        type: type.trim(),
        reason: reason.trim(),
        timestamp: new Date().toISOString()
      };
    }).filter(e => e.user_id && !isNaN(e.xp) && e.xp > 0 && e.xp <= MAX_XP);

    if (entries.length === 0) return setStatus('❌ No valid bulk rows');
  try {
    await supabase.from('xp_log').insert(entries);
  } catch (error) {
    console.error('❌ Supabase error in admin-xp-inject.tsx', error);
  }
  try {
    await supabase.from('audit_logs').insert({
  } catch (error) {
    console.error('❌ Supabase error in admin-xp-inject.tsx', error);
  }
      user_id: 'admin',
      action: `Bulk injected ${entries.length} XP entries`,
      timestamp: new Date().toISOString()
    });
    setStatus(`✅ Bulk injected ${entries.length} entries.`);
    toast.success(`✅ Bulk injected ${entries.length} entries.`);
    setBulkData('');
  };

  const refreshUser = async () => {
    if (!selectedUser) return;
  try {
    const { data } = await supabase.from('user_profiles').select('id, alias, xp').eq('id', selectedUser.id).single();
  } catch (error) {
    console.error('❌ Supabase error in admin-xp-inject.tsx', error);
  }
    if (data) setSelectedUser(data);
  };

  return (
    <div className={styles.crtFrame}>
      <h1 className={styles.crtTitle}>Admin XP Injection Console</h1>

      <input
        className={styles.crtInput}
        placeholder="Search alias..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {results.map((u, i) => (
        <div key={i} className={styles.crtCard}>
          <p><strong>{u.alias}</strong> — {u.xp} XP</p>
          <button onClick={() => { setSelectedUser(u); loadHistory(u.id); }} className={styles.crtButton}>Select</button>
        </div>
      ))}

      {selectedUser && (
        <div className={styles.crtCard}>
          <h2>Inject XP to {selectedUser.alias}</h2>
          <p className={styles.crtText}>Current XP: {selectedUser.xp?.toLocaleString()}</p>
          <input
            className={styles.crtInput}
            placeholder="XP amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <select value={type} onChange={(e) => setType(e.target.value)} className={styles.crtInput}>
            <option value="manual">✍️ Manual</option>
            <option value="mission">🎯 Mission</option>
            <option value="crate">📦 Crate</option>
            <option value="badge">🏅 Badge</option>
            <option value="shop">🛒 Shop</option>
          </select>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className={styles.crtInput}
            style={{ marginTop: '0.5rem' }}
          >
            <option value="">Custom reason...</option>
            {reasonPresets.map((r, i) => (
              <option key={i} value={r}>{r}</option>
            ))}
          </select>
          <input
            className={styles.crtInput}
            placeholder="Custom reason (if not using preset)"
            value={reasonPresets.includes(reason) ? '' : reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <button onClick={injectXP} className={styles.crtButton}>Inject XP</button>
          <p style={{ color: '#6f6', marginTop: '0.5rem' }}>{status}</p>
          {manualHistory.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <h3 className={styles.crtText}>🧾 Recent Manual Grants:</h3>
              <ul className={styles.crtText}>
                {manualHistory.map((log, i) => (
                  <li key={i}>
                    +{log.xp} XP — {log.reason} @ {new Date(log.timestamp).toLocaleString()}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {flaggedReasons.length > 0 && (
            <div className={styles.crtText} style={{ marginTop: '1rem', color: '#ff0' }}>
              ⚠️ Repeated Today: {flaggedReasons.join(', ')}
            </div>
          )}
        </div>
      )}

      <div className={styles.crtCard}>
        <h2>Bulk Injection (CSV format)</h2>
        <p className={styles.crtText}>Format: user_id, amount, type, reason</p>
        <textarea
          value={bulkData}
          onChange={(e) => setBulkData(e.target.value)}
          rows={6}
          className={styles.crtInput}
        />
        <button onClick={injectBulk} className={styles.crtButton}>Inject Bulk</button>
      </div>
    </div>
  );
}

export default withAdminGate(AdminXPInject);