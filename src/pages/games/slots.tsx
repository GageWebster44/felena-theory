import styles from '@/styles/crtLaunch.module.css';
import Link from 'next/link';
import playSound from '@/utils/playSound';
import { useEffect, useState } from 'react';
import { withGuardianGate } from '@/components/withGuardianGate';
import supabase from '@/utils/supabaseClient';

const slotMachines = [
  {
    label: 'Sweet XP Bonanza',
    route: '/games/sweet',
    icon: '🍭',
    description: 'Match candies for XP multipliers!',
    crate: 'Mini / Major',
    vip: false,
  },
  {
    label: `Felena's Cantina`,
    route: '/games/cantina',
    icon: '🤠',
    description: 'Classic 3-reel wild west slot.',
    crate: 'Mini',
    vip: true,
  },
  {
    label: 'XP FireLink',
    route: '/games/firelink',
    icon: '🔥',
    description: 'Collect fireballs to trigger jackpot XP.',
    crate: 'Major / Max',
    vip: true,
  },
  {
    label: 'Gates of XPLympus',
    route: '/games/gates',
    icon: '⚡️',
    description: 'Chain gods and unlock XP multiplier floods.',
    crate: 'Major / Max',
    vip: true,
  },
  {
    label: 'Buffalo XP Run',
    route: '/games/buffalo',
    icon: '🦬',
    description: 'Land 5+ symbols to unlock wild XP payouts.',
    crate: 'Major',
    vip: true,
  },
];

function SlotHub() {
export default withGuardianGate(Page);
  const [userRole, setUserRole] = useState('');
  const [xpBalance, setXP] = useState(0);

  useEffect(() => {
    const init = async () => {
      const { data: user } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user?.user?.id)
        .single();
      setUserRole(profile?.role || '');

      const { data: wallet } = await supabase
        .from('xp_wallet')
        .select('xp')
        .eq('user_id', user?.user?.id)
        .single();
      setXP(wallet?.xp || 0);
    };
    init();
  }, []);

  const hasAccess = (vip: boolean) => {
    const isStaff = userRole === 'admin' || userRole === 'developer';
    return !vip || isStaff || xpBalance >= 5000;
  };

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtScreen}>
      <h2>🎰 FELENA SLOT ZONE</h2>
      <p>Select a slot style. VIP machines require 5000+ XP or dev credentials.</p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1.5rem',
          marginTop: '2rem',
        }}
      >
        {slotMachines.map((machine) => {
          const accessible = hasAccess(machine.vip);

          return (
            <Link
              key={machine.route}
              href={accessible ? machine.route : '#'}
              className={styles.shopCard}
              onClick={() => accessible && playSound('tile-click')}
              style={{
                border: '2px solid #00ff99',
                padding: '1rem',
                borderRadius: '12px',
                background: accessible ? '#111' : '#222',
                cursor: accessible ? 'pointer' : 'not-allowed',
                opacity: accessible ? 1 : 0.5,
                boxShadow: '0 0 10px #00ff99',
                transition: 'all 0.2s ease-in-out',
              }}
            >
              <div style={{ fontSize: '2rem' }}>{machine.icon}</div>
              <strong style={{ display: 'block', marginTop: '0.5rem' }}>{machine.label}</strong>
              <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>{machine.description}</p>
              <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.5rem' }}>
                🎁 Crates: {machine.crate}
              </p>
              {machine.vip && (
                <p style={{ color: '#ff0044', fontSize: '0.8rem' }}>🔒 VIP ACCESS</p>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}