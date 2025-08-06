// pages/admin/invite-log.tsx
import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabaseClient';
import styles from '@/styles/crtLaunch.module.css';
import { withAdminGate } from '@/components/withRoleGate';

function InviteLogPage() {
  const [invites, setInvites] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data } = await supabase
      .from('manual_invites')
      .select('*')
      .order('issued_at', { ascending: false });
    setInvites(data || []);
  };

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtFrame}>
      <h1 className={styles.crtTitle}>📋 Manual Invite Log</h1>
      <div className={styles.crtScrollBox}>
        {invites.map((invite, i) => (
          <div key={i} className={styles.crtCard}>
            <p className={styles.crtText}>IP: {invite.ip_address}</p>
            <p className={styles.crtText}>Alias: {invite.alias || '—'}</p>
            <p className={styles.crtText}>Email: {invite.email || '—'}</p>
            <p className={styles.crtText}>Status: {invite.status}</p>
            <p className={styles.crtText}>Issued: {invite.issued_at}</p>
            <p className={styles.crtText}>Approved: {invite.approved_at || '—'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default withAdminGate(InviteLogPage);