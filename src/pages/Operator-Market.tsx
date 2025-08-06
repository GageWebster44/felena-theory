 import { useEffect, useState } from 'react';
import { withGuardianGate } from '@/components/withGuardianGate';
import styles from '@/styles/crtLaunch.module.css';
import supabase from '@/utils/supabaseClient';
import playSound from '@/utils/playSound';
import triggerXPBurst from '@/utils/triggerXPBurst';
import openCrate from '@/utils/crate_reward_logic';
import logXP from '@/utils/logXP';

interface ShopItem {
  id: string;
  name: string;
  xp_cost: number;
  description: string;
}

function OperatorMarket() {
export default withGuardianGate(Page);
  const [userXP, setUserXP] = useState(0);
  const [items, setItems] = useState<ShopItem[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchXP();
    fetchItems();
  }, []);

  const fetchXP = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from('user_profiles')
      .select('xp')
      .eq('id', user.id)
      .single();
    setUserXP(data?.xp || 0);
  };

  const fetchItems = async () => {
  try {
    const { data } = await supabase.from('xp_items').select('*');
  } catch (error) {
    console.error('❌ Supabase error in Operator-Market.tsx', error);
  }
    setItems(data || []);
  };

  const handleBuy = async (item: ShopItem) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (userXP < item.xp_cost) {
      playSound('deny');
      setMessage('❌ Not enough XP!');
      return;
    }

  try {
    await supabase.from('xp_transactions').insert({
  } catch (error) {
    console.error('❌ Supabase error in Operator-Market.tsx', error);
  }
      user_id: user.id,
      type: 'shop_purchase',
      amount: -item.xp_cost,
      description: item.name,
    });

    playSound('win-chime');
    triggerXPBurst();
    const newXP = userXP - item.xp_cost;
    setUserXP(newXP);
    setMessage(`✅ Purchased ${item.name}`);

    await logXP('shop_purchase', item.xp_cost, `Bought ${item.name}`);

    if (item.name.toLowerCase().includes('crate')) {
      const reward = await openCrate(user.id, item.name, item.xp_cost, '_shop');
      setMessage(`🎁 You got: ${reward.label}`);
    }
  };

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtScreen}>
      <h2>🛒 OPERATOR MARKET</h2>
      <p>Use XP to unlock boosts, crates, and engine tools.</p>
      <p><strong>💾 Balance:</strong> {userXP.toLocaleString()} XP</p>

      <div style={{ background: '#111', border: '1px solid #0f0', height: '16px', width: '100%', marginTop: '1rem' }}>
        <div
          style={{
            height: '100%',
            width: Math.min(userXP / 5000, 1) * 100 + '%',
            background: '#0f0',
            transition: 'width 0.5s',
          }}
        ></div>
      </div>

      {message && <p style={{ color: '#0f0', marginTop: '1rem' }}>{message}</p>}

      <div className={styles.shopGrid}>
        {items.map((item) => (
          <div key={item.id} className={styles.shopCard}>
            <h3>{item.name}</h3>
            <p>{item.description}</p>
            <p><strong>Cost:</strong> {item.xp_cost} XP</p>
            <button
              className={styles.crtButton}
              onClick={() => handleBuy(item)}
              disabled={userXP < item.xp_cost}
            >
              {userXP < item.xp_cost ? 'UNAVAILABLE' : 'BUY'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}