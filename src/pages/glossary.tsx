 import React, { useEffect, useState, useContext } from 'react';
import { withGuardianGate } from '@/components/withGuardianGate';
import Head from 'next/head';
import HUDFrame from '../components/HUDFrame';
import { UserXPContext } from '../_app';
import supabase from '@/utils/supabaseClient';
import logXP from '@/utils/logXP';

function GlossaryPage() {
export default withGuardianGate(Page);
  const { userXP, userPrestige } = useContext(UserXPContext);
  const [rewardClaimed, setRewardClaimed] = useState(false);

  useEffect(() => {
    const checkClaim = async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('glossary_claims')
        .select('*')
        .eq('user_id', user.user.id)
        .single();

      if (data) setRewardClaimed(true);
    };

    const audio = new Audio('/sounds/glossary_access_online.mp3');
    audio.volume = 0.4;
    audio.play();

    checkClaim();
  }, []);

  const claimReward = async () => {
    const { data: user } = await supabase.auth.getUser();
    if (!user || rewardClaimed) return;

  try {
    await supabase.from('glossary_claims').insert({
  } catch (error) {
    console.error('❌ Supabase error in glossary.tsx', error);
  }
      user_id: user.user.id,
      claimed: true,
    });

    await logXP('glossary_reward', 50, 'Reviewed glossary for XP');
    setRewardClaimed(true);
  };

  return (
    <HUDFrame>
      <Head>
        <title>Glossary | Felena Theory</title>
      </Head>

      {/* HUD Overlay */}
      <div style={hudStyle}>
        <p style={{ color: '#fff' }}>
          🧑‍🚀OPERATOR: <strong>{userXP.toLocaleString()}</strong>
        </p>
        <p style={{ color: '#00ff99' }}>XP: {userXP}</p>
        <p style={{ color: '#888' }}>CLEARANCE: Prestige {userPrestige}</p>
      </div>

      <h1 style={header}>📖 FELENA GLOSSARY</h1>
      <p style={{ marginBottom: '1.5rem' }}>
        Definitions and protocol terms across the XP and engine system. Studying the glossary earns rewards.
      </p>

      <div style={glossaryBox}>
        <h3 style={{ color: '#00fffc' }}>▶️ Example Entries</h3>
        <ul>
          <li><strong>Operator:</strong> An authorized user in Felena Theory, assigned a unique alias.</li>
          <li><strong>XP:</strong> Simulation currency used to unlock games, engines, and tools.</li>
          <li><strong>Glow Ring:</strong> Visual rating of your win activity and signal strength.</li>
          <li><strong>Engine:</strong> A quant strategy tool unlockable via XP.</li>
          <li><strong>DAO:</strong> Governance module used to vote or override.</li>
        </ul>
      </div>

      {!rewardClaimed && (
        <button style={rewardBtn} onClick={claimReward}>
          🎁 CLAIM 50 XP REWARD
        </button>
      )}

      {rewardClaimed && (
        <p style={{ color: '#00ff99', marginTop: '1rem' }}>
          ✅ Reward claimed. +50 XP logged to your account.
        </p>
      )}
    </HUDFrame>
  );
}

// Styles
const header: React.CSSProperties = {
  fontSize: '2rem',
  color: '#0ff0',
  textShadow: '0 0 8px #0ff0',
  marginBottom: '1rem',
};

const hudStyle: React.CSSProperties = {
  position: 'absolute',
  top: 20,
  right: 20,
  textAlign: 'right',
};

const glossaryBox: React.CSSProperties = {
  background: '#111',
  border: '1px solid #333',
  borderRadius: '10px',
  padding: '1.5rem',
  maxWidth: '600px',
};

const rewardBtn: React.CSSProperties = {
  marginTop: '2rem',
  background: '#00ffcc',
  color: '#000',
  padding: '0.8rem 1.5rem',
  border: 'none',
  borderRadius: '6px',
  fontFamily: 'Orbitron',
  fontWeight: 'bold',
  cursor: 'pointer',
};