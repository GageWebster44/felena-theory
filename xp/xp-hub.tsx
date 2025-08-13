import { useEffect, useState } from 'react';
import { withGuardianGate } from '@/components/withGuardianGate';
import { useRouter } from 'next/router';
import supabase from '@/utils/supabaseClient';
import styles from '@/styles/crtLaunch.module.css';
import playSound from '@/utils/playSound';
import { openCrate } from '@/utils/crate_reward_logic';
import { triggerXPBurst } from '@/utils/triggerXPBurst';
import logXP from '@/utils/logXP';
import Link from 'next/link';

interface ShopItem {
  id: string;
  label: string;
  xp_cost: number;
  tier: string;
  available: boolean;
  limit_per_user?: number;
  expires_at?: string;
  description?: string;
}

const tableGames = [/* ... same as before ... */];
const xpTiers = [5, 10, 20, 50, 100, 250, 500, 1000, 2500, 5000, 10000, 15000, 20000, 25000, 50000, 75000, 100000];

function XPHubPage() {
export default withGuardianGate(Page);
  const [userXP, setUserXP] = useState(0);
  const [items, setItems] = useState<ShopItem[]>([]);
  const [message, setMessage] = useState('');
  const [animating, setAnimating] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [crates, setCrates] = useState<any[]>([]);
  const [userId, setUserId] = useState('');
  const [role, setRole] = useState('');
  const [dailyUnlocked, setDailyUnlocked] = useState(false);
  const [selectedXP, setSelectedXP] = useState(100);
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user?.user) return router.push('/login');
      setUserId(user.user.id);

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('xp, role, devkey')
        .eq('id', user.user.id)
        .single();

      if (!profile) return;
      if (profile.role !== 'felena_vision' && !profile.devkey) return router.push('/preorder');

      setUserXP(profile.xp || 0);
      setRole(profile.role || 'public');

      fetchItems();
      fetchHistory();
      fetchCrates();
    };

    init();
  }, []);

  const fetchItems = async () => {
    const { data } = await supabase
      .from('xp_shop_items')
      .select('*')
      .eq('available', true);
    setItems(data || []);
  };

  const fetchHistory = async () => {
    const { data } = await supabase
      .from('xp_transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(12);
    setHistory(data || []);
  };

  const fetchCrates = async () => {
    const { data } = await supabase
      .from('xp_crates')
      .select('*')
      .eq('user_id', userId);
    setCrates(data || []);
  };

  const handleStripeCheckout = async () => {
    const res = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, xp: selectedXP }),
    });
    const data = await res.json();
    if (data