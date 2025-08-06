import { useEffect, useState } from 'react';
import { withGuardianGate } from '@/components/withGuardianGate';
import styles from '@/styles/crtLaunch.module.css';
import supabase from '@/utils/supabaseClient';
import Link from 'next/link';
import playSound from '@/utils/playSound';

function CRTLauncher() {
export default withGuardianGate(Page);
  const [alias, setAlias] = useState('Operator');
  const [xp, setXP] = useState(0);
  const [tier, setTier] = useState('Observer');

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user?.id) return;

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('alias, xp')
        .eq('id', user.user.id)
        .single();

      const xpVal = profile?.xp || 0;
      setAlias(profile?.alias || 'Operator');
      setXP(xpVal);
      setTier(getTier(xpVal));
    };
    fetchProfile();
  }, []);

  const getTier = (xp: number) => {
    if (xp >= 50000) return 'Final Ascension';
    if (xp >= 25000) return 'Dominator';
    if (xp >= 10000) return 'Legendary Protocol';
    if (xp >= 5000) return 'Override Access';
    if (xp >= 1000) return 'Operator';
    if (xp >= 100) return 'Initiate';
    return 'Observer';
  };

  const gridRoutes = [
    { label: '📊 DASHBOARD', href: '/dashboard' },
    { label: '🎁 XP CENTER', href: '/xp-center' },
    { label: '🎮 GAME ROOM', href: '/game-room' },
    { label: '📈 ENGINE GRID', href: '/engine-grid' },
    { label: '🚨 ADMIN PANEL', href: '/admin' },
    { label: '🧑‍💻 APPLY', href: '/apply' },
    { label: '📜 TERMS', href: '/terms' },
  ];

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtScreen} style={{ position: 'relative' }}>
      <h1 style={{ fontSize: '2rem', color: '#0f0', textAlign: 'center' }}>📟 FELENA COMMAND TERMINAL</h1>
      <p style={{ color: '#999', textAlign: 'center' }}>Welcome, {alias} — Tier: {tier} — XP: {xp.toLocaleString()}</p>

      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <p style={{ color: '#ccc', fontSize: '0.9rem' }}>
          Select a protocol. All actions are recorded. The deeper your rank, the more damage you can do.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.2rem',
        marginTop: '2.5rem',
        justifyContent: 'center'
      }}>
        {gridRoutes.map((tile, i) => (
          <Link
            href={tile.href}
            key={i}
            className={styles.crtButton}
            onClick={() => playSound('tile-click')}
            style={{
              fontSize: '1.2rem',
              padding: '1.2rem',
              border: '2px solid #00ff99',
              background: '#000',
              boxShadow: '0 0 10px #00ff99',
              textAlign: 'center',
              borderRadius: '8px',
              transition: 'all 0.2s ease-in-out',
              display: 'block'
            }}
          >
            {tile.label}
          </Link>
        ))}
      </div>

      <div className={styles.scanlines} />
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        background: 'radial-gradient(circle, rgba(0,255,0,0.07), transparent 60%)',
        pointerEvents: 'none'
      }}>
        <video
          src="/animations/binary-vortex.webm"
          autoPlay
          muted
          loop
          playsInline
          style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.04 }}
        />
      </div>
    </div>
  );
}