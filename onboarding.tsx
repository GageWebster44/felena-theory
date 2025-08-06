 // pages/onboarding.tsx
import React, { useContext, useEffect, useState } from 'react';
import { UserXPContext } from './_app';
import HUDFrame from '../components/HUDFrame';
import playSound from '@/utils/playSound';
import logXP from '@/utils/logXP';
import openCrate from '@/utils/crate_reward_logic';
import triggerXPBurst from '@/utils/triggerXPBurst';
import triggerSparkFlash from '@/utils/triggerSparkFlash';

const rewards = [
  { id: 'boost-24h', name: '⚡ 24h XP Boost', xp: 500 },
  { id: 'glow-upgrade', name: '💡 Glow Ring Upgrade', xp: 1000 },
  { id: 'crate-drop', name: '🎁 Crate Drop (Random)', xp: 1500 },
  { id: 'arena-token', name: '🎯 Arena Token', xp: 2000 },
  { id: 'dao-invite', name: '🗳 DAO Vote Invite', xp: 2500 },
  { id: 'engine-skin', name: '🛠 Engine Skin Pack', xp: 3000 }
];

export default function XPShop() {
  const { userXP, setUserXP } = useContext(UserXPContext);
  const [claimed, setClaimed] = useState<string[]>([]);
  const [cooldown, setCooldown] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const boot = new Audio('/sounds/xp_shop_online.mp3');
    boot.volume = 0.4;
    boot.play();
  }, []);

  const handleClaim = async (itemId: string, cost: number) => {
    const eligible = userXP >= cost;
    const isCrate = itemId.includes('crate');

    if (!eligible || claimed.includes(itemId) || cooldown[itemId]) {
      playSound('xp_denied');
      return;
    }

    // ⏳ Set cooldown lock
    setCooldown(prev => ({ ...prev, [itemId]: true }));
    setTimeout(() => {
      setCooldown(prev => ({ ...prev, [itemId]: false }));
    }, 5000);

    // Deduct XP + mark claimed
    setUserXP(prev => prev - cost);
    setClaimed(prev => [...prev, itemId]);

    // 🎉 Visual & audio feedback
    triggerSparkFlash();
    triggerXPBurst();
    playSound('xp-rain');

    // 🧾 Log to Supabase
    await logXP('xp_terminal', cost, `Claimed ${itemId}`);

    // 🎁 Crate logic
    if (isCrate) {
      const reward = await openCrate();
      alert(`🎁 You unlocked: ${reward.label}`);
    } else {
      alert(`✅ Claimed ${itemId} for ${cost} XP`);
    }
  };

  return (
    <HUDFrame>
      <div style={container}>
        <h1 style={header}>📦 XP REWARD TERMINAL</h1>
        <p style={{ marginBottom: '2rem' }}>
          Spend XP on tactical unlocks, boosts, cosmetics, and upgrades.
        </p>
        <div style={grid}>
          {rewards.map(({ id, name, xp }) => {
            const eligible = userXP >= xp;
            const locked = claimed.includes(id);
            const onCooldown = cooldown[id];

            return (
              <div key={id} style={card}>
                <h3 style={{ color: '#fff' }}>{name}</h3>
                <p>🧬 Cost: {xp.toLocaleString()} XP</p>
                <p>
                  Status:{' '}
                  {locked ? (
                    <span style={{ color: '#aaa' }}>✔️ Redeemed</span>
                  ) : onCooldown ? (
                    <span style={{ color: '#ffcc00' }}>⏳ Cooldown</span>
                  ) : eligible ? (
                    <span style={{ color: '#00ffcc' }}>✅ Available</span>
                  ) : (
                    <span style={{ color: '#ff4444' }}>🔒 Locked</span>
                  )}
                </p>
                <button
                  onClick={() => handleClaim(id, xp)}
                  disabled={!eligible || locked || onCooldown}
                  style={{
                    ...button,
                    background: locked
                      ? '#444'
                      : eligible && !onCooldown
                      ? '#00ffcc'
                      : '#222',
                    cursor: locked || onCooldown ? 'not-allowed' : 'pointer'
                  }}
                >
                  {locked
                    ? '✔️ REDEEMED'
                    : onCooldown
                    ? '⏳ WAIT'
                    : '🎯 REDEEM'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </HUDFrame>
  );
}

// Styles
const container: React.CSSProperties = {
  padding: '3rem',
  fontFamily: 'Orbitron',
  color: '#00ffcc',
  minHeight: '100vh',
  position: 'relative'
};

const header: React.CSSProperties = {
  fontSize: '2rem',
  marginBottom: '1.5rem',
  color: '#00ff99'
};

const grid: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '2rem'
};

const card: React.CSSProperties = {
  background: '#111',
  padding: '1.5rem',
  border: '1px solid #333',
  borderRadius: '8px',
  width: '250px',
  minHeight: '180px'
};

const button: React.CSSProperties = {
  marginTop: '1rem',
  color: '#000',
  fontWeight: 'bold',
  fontFamily: 'Orbitron',
  padding: '0.6rem 1.5rem',
  border: 'none',
  borderRadius: '6px'