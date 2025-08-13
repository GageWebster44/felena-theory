import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { withAdminGate } from '@/components/withRoleGate';
import styles from '@/styles/crtLaunch.module.css';

function AdminFeed() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('');

  const fetchFeed = async () => {
    setLoading(true);
    const [logins, redemptions, referrals, guardians] = await Promise.all([
      supabase.from('login_logs').select('email, ip_address, timestamp').order('timestamp', { ascending: false }).limit(10),
      supabase.from('xp_redemptions').select('user_id, redeemed_xp, timestamp').order('timestamp', { ascending: false }).limit(10),
      supabase.from('referral_logs').select('referrer_email, referred_email, timestamp').order('timestamp', { ascending: false }).limit(10),
      supabase.from('guardian_consent').select('child_email, guardian_email, created_at').order('created_at', { ascending: false }).limit(10),
    ]);

    const combined = [
      ...(logins.data || []).map(e => ({ type: 'login', ...e })),
      ...(redemptions.data || []).map(e => ({ type: 'redemption', ...e })),
      ...(referrals.data || []).map(e => ({ type: 'referral', ...e })),
      ...(guardians.data || []).map(e => ({ type: 'guardian', ...e })),
    ];

    const sorted = combined.sort((a, b) =>
      new Date(b.timestamp || b.created_at) - new Date(a.timestamp || a.created_at)
    );

    setEvents(sorted);
    setLoading(false);
  };

  useEffect(() => {
    fetchFeed();
    const interval = setInterval(fetchFeed, 30000); // Auto-refresh every 30s
    return () => clearInterval(interval);
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

  }, []);

  const renderEvent = (e, i) => {
    const time = new Date(e.timestamp || e.created_at).toLocaleTimeString();
    switch (e.type) {
      case 'login':
        return <pre key={i}>🕒 {time}  🔐 Login → {e.email} @ {e.ip_address}</pre>;
      case 'redemption':
        return <pre key={i}>🕒 {time}  🎁 Redemption → {e.user_id} (-{e.redeemed_xp} XP)</pre>;
      case 'referral':
        return <pre key={i}>🕒 {time}  🤝 Referral → {e.referrer_email} invited {e.referred_email}</pre>;
      case 'guardian':
        return <pre key={i}>🕒 {time}  👨‍👩‍👧 Guardian Request → {e.child_email} linked to {e.guardian_email}</pre>;
      default:
        return null;
    }
  };

  const filtered = filter
    ? events.filter(e => JSON.stringify(e).toLowerCase().includes(filter.toLowerCase()))
    : events;

  return (
    <div className={styles.crtFrame}>
      <h1 className={styles.crtTitle}>Live Admin Feed</h1>

      <input
        type="text"
        placeholder="Filter events..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className={styles.crtInput}
      />

      {loading && <p className={styles.crtText}>Refreshing feed...</p>}

      <div className={styles.crtScrollBox}>
        {filtered.length === 0 ? (
          <p className={styles.crtText}>No recent activity</p>
        ) : (
          filtered.map(renderEvent)
        )}
      </div>
    </div>
  );
}

export default withAdminGate(AdminFeed);