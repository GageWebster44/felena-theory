 import { useEffect, useState } from 'react';
import { withGuardianGate } from '@/components/withGuardianGate';
import supabase from '@/utils/supabaseClient';
import styles from '@/styles/crtLaunch.module.css';
import { Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  ArcElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(LineElement, ArcElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

interface XPLog {
  type: string;
  amount: number;
  created_at: string;
  description: string;
}

interface MissionStat {
  mission_id: string;
  count: number;
}

function AnalyticsPage() {
export default withGuardianGate(Page);
  const [xpLogs, setXPLogs] = useState<XPLog[]>([]);
  const [missionStats, setMissionStats] = useState<MissionStat[]>([]);
  const [crateStats, setCrateStats] = useState<{ totalXP: number; count: number }>({ totalXP: 0, count: 0 });
  const [xpProjection, setXPProjection] = useState<number>(0);
  const [xpGraph, setXPGraph] = useState<{ date: string; net: number }[]>([]);
  const [xpByType, setXPByType] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: logs } = await supabase
        .from('xp_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at');

      setXPLogs(logs || []);

      // Crate ROI
      const { data: crates } = await supabase
        .from('xp_crates')
        .select('xp_value')
        .eq('user_id', user.id)
        .eq('opened', true);

      const totalXP = crates?.reduce((sum, c) => sum + c.xp_value, 0) || 0;
      const count = crates?.length || 0;
      setCrateStats({ totalXP, count });

      // Mission stats
      const { data: missionClaims } = await supabase
        .from('mission_claims')
        .select('mission_id');

      const freq: Record<string, number> = {};
      (missionClaims || []).forEach((c) => {
        freq[c.mission_id] = (freq[c.mission_id] || 0) + 1;
      });

      const topMissions = Object.entries(freq)
        .map(([id, count]) => ({ mission_id: id, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);

      setMissionStats(topMissions);

      // XP graph & projection
      const grouped: Record<string, number> = {};
      logs?.forEach((log) => {
        const date = new Date(log.created_at).toLocaleDateString();
        grouped[date] = (grouped[date] || 0) + log.amount;
      });

      const plot = Object.entries(grouped).map(([date, net]) => ({ date, net }));
      setXPGraph(plot);

      const total = logs?.reduce((sum, l) => sum + l.amount, 0) || 0;
      const types: Record<string, number> = {};
      logs?.forEach((l) => {
        types[l.type] = (types[l.type] || 0) + l.amount;
      });
      setXPByType(types);

      // Autonomy projection
      const xpToday = plot.slice(-1)[0]?.net || 0;
      const remaining = Math.max(100000 - total, 0);
      const days = xpToday > 0 ? Math.ceil(remaining / xpToday) : -1;
      setXPProjection(days);
    };

    fetchData();
  }, []);

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtScreen}>
      <h2>📊 OPERATOR ANALYTICS</h2>
      <p>Performance breakdown and projection toward Autonomy.</p>

      {/* XP Trend Line */}
      {xpGraph.length > 0 && (
        <>
          <h3>📈 XP Gained Over Time</h3>
          <Line
            data={{
              labels: xpGraph.map((d) => d.date),
              datasets: [
                {
                  label: 'Net XP',
                  data: xpGraph.map((d) => d.net),
                  fill: false,
                  borderColor: '#00ff99',
                },
              ],
            }}
            options={{
              scales: {
                y: { beginAtZero: true, ticks: { color: '#fff' }, grid: { color: '#444' } },
                x: { ticks: { color: '#fff' }, grid: { color: '#444' } },
              },
              plugins: {
                legend: { labels: { color: '#fff' } },
            }}}
          />
        </>
      )}

      {/* XP Breakdown */}
      <div style={{ marginTop: '2rem' }}>
        <h3>💸 XP by Source</h3>
        <Pie
          data={{
            labels: Object.keys(xpByType),
            datasets: [{
              data: Object.values(xpByType),
              backgroundColor: ['#00ff99', '#ffcc00', '#3399ff', '#ff6699', '#aaaaaa']
            }]
          }}
          options={{
            plugins: {
              legend: { labels: { color: '#fff' } }
            }
          }}
        />
      </div>

      {/* Autonomy projection */}
      <div style={{ marginTop: '2rem' }}>
        <h3>🧠 Autonomy ETA</h3>
        {xpProjection < 0 ? (
          <p>📉 No XP gain today. ETA unavailable.</p>
        ) : (
          <p>📆 Estimated unlock in <strong>{xpProjection}</strong> day(s)</p>
        )}
      </div>

      {/* Crate efficiency */}
      <div style={{ marginTop: '2rem' }}>
        <h3>📦 Crate Efficiency</h3>
        <p>Opened: {crateStats.count} crates</p>
        <p>Total XP earned: {crateStats.totalXP}</p>
        <p>Average per crate: {crateStats.count > 0 ? Math.round(crateStats.totalXP / crateStats.count) : 0} XP</p>
      </div>

      {/* Most claimed missions */}
      <div style={{ marginTop: '2rem' }}>
        <h3>🎯 Top Missions Claimed</h3>
        {missionStats.length === 0 ? (
          <p>No mission claims found.</p>
        ) : (
          <ul>
            {missionStats.map((m) => (
              <li key={m.mission_id}>
                Mission ID: <strong>{m.mission_id}</strong> – {m.count} claim(s)
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}