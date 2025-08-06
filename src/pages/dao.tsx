import React, { useEffect, useState, useContext } from 'react';
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { UserXPContext } from './_app';
import HUDFrame from '../components/HUDFrame';
import './styles/dao.css';

const DAOControl = () => {
  const [proposals, setProposals] = useState<any[]>([]);
  const { userXP } = useContext(UserXPContext);

  const TIER_THRESHOLD = 5000; // Tier 3: Override access

  useEffect(() => {
    const sound = new Audio('/sounds/dao_interface_online.mp3');
    sound.volume = 0.5;
    sound.play();

    const fetchProposals = async () => {
      const supabase = createBrowserSupabaseClient();
      const { data } = await supabase
        .from('dao_proposals')
        .select('*')
        .order('created_at', { ascending: false });
      if (data) setProposals(data);
    };

    if (userXP >= TIER_THRESHOLD) {
      fetchProposals();
    }
  }, [userXP]);

  if (userXP < TIER_THRESHOLD) {
    return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

      <HUDFrame>
        <div className="dao-container tactical-ui" style={{ background: '#000', color: '#ff4444', padding: '3rem', fontFamily: 'Orbitron' }}>
          <h1>🛑 ACCESS DENIED</h1>
          <p>This DAO interface requires Tier 3 (Override) or higher.</p>
        </div>
      </HUDFrame>
    );
  }

  return (
    <HUDFrame>
      <div className="dao-container tactical-ui" style={{ fontFamily: 'Orbitron', padding: '2rem', position: 'relative' }}>
        {/* Operator HUD */}
        <div style={{ position: 'absolute', top: 20, right: 20, textAlign: 'right' }}>
          <p style={{ color: '#ffffff', fontWeight: 'bold' }}>XP: {userXP.toLocaleString()}</p>
          <p style={{ color: '#888' }}>Clearance: Tier {getTierFromXP(userXP)}</p>
        </div>

        <h1 className="dao-header">🛡 DAO Intelligence Node</h1>
        <p className="dao-description">
          This classified interface grants access to DAO voting logs, governance input, and strategic coordination feeds.
        </p>

        {/* Active Proposals */}
        <section className="dao-frame-block" style={glowBox}>
          <h2>🗳 Active Proposals</h2>
          <p>Operators can view and track system-wide vote activity in real-time.</p>
          {proposals.length === 0 ? (
            <p style={{ color: '#888' }}>No proposals available.</p>
          ) : (
            proposals.map((p) => (
              <div key={p.id} className="dao-proposal-tile">
                <h3>Proposal #{p.id}: {p.title}</h3>
                <p>{p.description}</p>
                <p className="dao-meta">🧠 Created: {new Date(p.created_at).toLocaleDateString()}</p>
              </div>
            ))
          )}
        </section>

        {/* Tactical Voting HUD */}
        <section className="dao-frame-block" style={glowBox}>
          <h2>🛰 Tactical Voting HUD</h2>
          <p>All decision logs are cryptographically timestamped and immutable.</p>
          <p className="dao-warning">Read-only view. Voting occurs in <code>dao-vote.tsx</code>.</p>
        </section>

        {/* Signal Coordination */}
        <section className="dao-frame-block" style={glowBox}>
          <h2>📈 Signal Coordination</h2>
          <p>DAO outcomes route to engine directives for autonomous optimization across grid layers.</p>
        </section>
      </div>
    </HUDFrame>
  );
};

const getTierFromXP = (xp: number): string => {
  if (xp >= 50000) return '6: Final Ascension';
  if (xp >= 25000) return '5: Dominator';
  if (xp >= 10000) return '4: Legendary';
  if (xp >= 5000) return '3: Override';
  if (xp >= 1000) return '2: Operator';
  if (xp >= 100) return '1: Initiate';
  return '0: Observer';
};

const glowBox: React.CSSProperties = {
  background: '#111',
  border: '1px solid #333',
  borderRadius: '12px',
  padding: '1rem',
  marginBottom: '2rem',
  boxShadow: '0 0 12px rgba(0,255,255,0.1)'
};

export default DAOControl;