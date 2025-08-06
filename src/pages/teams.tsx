import { useEffect, useState } from 'react';
import { withGuardianGate } from '@/components/withGuardianGate';
import supabase from '@/utils/supabaseClient';
import styles from '@/styles/crtLaunch.module.css';

interface TeamMember {
  id: string;
  sector: string;
  codename: string;
  role: string;
}

function TeamPage() {
export default withGuardianGate(Page);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [sectors, setSectors] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
  try {
    const { data } = await supabase.from('team_members').select('*');
  } catch (error) {
    console.error('❌ Supabase error in teams.tsx', error);
  }
      setMembers(data || []);
      const sectorList = [...new Set((data || []).map((m) => m.sector))];
      setSectors(sectorList.length ? sectorList : DEFAULT_SECTORS);
      setLoading(false);
    };
    load();
  }, []);

  const grouped = (sector: string) =>
    members.filter((m) => m.sector === sector);

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtScreen}>
      <h1 className="text-2xl text-center mb-6 text-green-400">🧬 FELENA THEORY TEAMS</h1>
      {loading ? (
        <p>Loading grid structure...</p>
      ) : (
        sectors.map((sector, i) => (
          <div key={i} className={styles.crtBlock}>
            <h2 className="font-bold text-lg text-cyan-400">{sector}</h2>
            <ul className="mt-2 text-sm text-white">
              {grouped(sector).length > 0 ? (
                grouped(sector).map((m) => (
                  <li key={m.id} className="flex justify-between border-b border-gray-700 py-1">
                    <span>{m.codename}</span>
                    <span className="text-gray-400">{m.role}</span>
                  </li>
                ))
              ) : (
                <li className="text-gray-500 italic">No agents assigned yet.</li>
              )}
            </ul>
          </div>
        ))
      )}
    </div>
  );
}

// Fallback if Supabase is empty
const DEFAULT_SECTORS = [
  '🧠 THE ARCHITECT',
  '🛠️ MECHANICS',
  '🧠 BRAINS',
  '🦠 VIRUSES',
  '🔬 DATA FORGE',
  '🛡 OPERATORS',
];