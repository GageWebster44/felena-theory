import { useEffect, useState } from 'react';
import supabase from '@/utils/supabaseClient';
import styles from '@/styles/crtLaunch.module.css';

export default function LotteryPage() {
  const [userId, setUserId] = useState('');
  const [xpBalance, setXpBalance] = useState(0);
  const [entryAmount, setEntryAmount] = useState(50);
  const [ticketCount, setTicketCount] = useState(0);
  const [refTreeDepth, setRefTreeDepth] = useState(0);
  const [totalTickets, setTotalTickets] = useState(1000);
  const [jackpot, setJackpot] = useState(50000);
  const [confirmation, setConfirmation] = useState('');
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [winners, setWinners] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('xp')
        .eq('id', user.id)
        .single();
      setXpBalance(profile?.xp || 0);

      const { data: tree } = await supabase
        .from('referrals')
        .select('referred_user_id')
        .eq('referrer_id', user.id);
      setRefTreeDepth(tree?.length || 0);

      const { data: topEntrants } = await supabase
        .from('lottery_entries')
        .select('user_id, ticket_count')
        .order('ticket_count', { ascending: false })
        .limit(5);
      setLeaderboard(topEntrants || []);

      const { data: previousWinners } = await supabase
        .from('lottery_winners')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      setWinners(previousWinners || []);
    })();
  }, []);

  const enterLottery = async () => {
    if (entryAmount <= 0 || entryAmount > xpBalance) {
      setConfirmation('❌ Invalid XP amount.');
      return;
    }

    const multiplier = 1 + 0.1 * Math.floor(refTreeDepth / 10);
    const tickets = Math.floor(entryAmount * multiplier);
    setTicketCount(tickets);

  try {
    await supabase.from('lottery_entries').insert({
  } catch (error) {
    console.error('❌ Supabase error in lottery.ts', error);
  }
      user_id: userId,
      xp_spent: entryAmount,
      ticket_count: tickets,
      tree_bonus: multiplier,
      created_at: new Date().toISOString(),
    });

  try {
    await supabase.rpc('deduct_xp', { uid: userId, amount: entryAmount });
  } catch (error) {
    console.error('❌ Supabase error in lottery.ts', error);
  }

  try {
    await supabase.from('xp_log').insert({
  } catch (error) {
    console.error('❌ Supabase error in lottery.ts', error);
  }
      user_id: userId,
      amount: -entryAmount,
      reason: 'lottery_entry',
      timestamp: new Date().toISOString(),
      season: 1,
    });

    setConfirmation(`✅ You entered with ${entryAmount} XP and received ${tickets} tickets! Tree bonus: +${((multiplier - 1) * 100).toFixed(0)}%`);
    setXpBalance(xpBalance - entryAmount);
  };

  return (
    <div className={styles.crtScreen}>
      <h2>🎰 FELENA WEEKLY XP LOTTERY</h2>
      <p><strong>Jackpot:</strong> {jackpot.toLocaleString()} XP</p>
      <p><strong>Tickets in Pool:</strong> {totalTickets.toLocaleString()}</p>
      <p><strong>Your XP:</strong> {xpBalance}</p>
      <p><strong>Your Referral Chain Depth:</strong> <span className="text-green-400">{refTreeDepth}</span></p>

      <input
        type="number"
        value={entryAmount}
        onChange={(e) => setEntryAmount(Number(e.target.value))}
        className="bg-black text-green-400 border border-green-600 p-2 mt-2"
        placeholder="Enter XP amount"
      />

      <button onClick={enterLottery} className={styles.crtButton} style={{ marginTop: '1rem' }}>
        🎟 Enter Lottery
      </button>

      {confirmation && <p style={{ marginTop: '1rem', color: '#0f0' }}>{confirmation}</p>}

      <div style={{ marginTop: '2rem' }}>
        <h4>🧠 How It Works</h4>
        <ul>
          <li>➕ Spend XP to enter the jackpot pool</li>
          <li>🌲 Every 10 referrals = +100% ticket power</li>
          <li>💸 Full jackpot paid to winner = no fees, no tax cut</li>
          <li>📈 If winner has active referral chain, bonus XP split by depth</li>
          <li>🔁 Weekly reset – Lottery restarts every Sunday at midnight</li>
          <li>🧨 If no winner = pot rolls over</li>
          <li>🎁 All non-winners receive 10% XP rebate</li>
          <li>👑 Founders receive +10% ticket boost automatically</li>
        </ul>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h3>🏆 Previous Winners</h3>
        <ul>
          {winners.map((w, i) => (
            <li key={i}>{w.user_id.slice(0, 6)} won {w.xp_awarded} XP on {new Date(w.created_at).toLocaleDateString()}</li>
          ))}
        </ul>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h4>📈 Chain Payout Simulator</h4>
        <p className="text-green-300">
          If you win, your chain ({refTreeDepth} users) could receive approx <strong>{refTreeDepth * 25}</strong> XP bonus combined.
        </p>
        <p className="text-xs text-gray-400 italic mt-2">
          Bonus is split by referral depth and branch volume. <br />
          <strong>Optional Style Tip:</strong> Tree payout = (depth + 25) XP
        </p>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h3>🔥 Top Entrants This Week</h3>
        <ul>
          {leaderboard.map((u, i) => (
            <li key={i}>{u.user_id.slice(0, 6)} 🎟 {u.ticket_count} tickets</li>
          ))}
        </ul>
      </div>

      <div className={styles.scanlines}></div>
    </div>
  );
}