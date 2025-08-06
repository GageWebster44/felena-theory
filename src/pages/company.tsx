import { useState, useEffect } from 'react';
import { withGuardianGate } from '@/components/withGuardianGate';
import styles from '@/styles/crtLaunch.module.css';
import supabase from '@/utils/supabaseClient';

const sectors = [
  {
    name: 'Mechanics',
    description: 'Front-end and back-end developers who build and maintain the app’s infrastructure.',
    roles: ['Frontend Engineer', 'Backend Engineer', 'Full Stack Developer', 'DevOps']
  },
  {
    name: 'Brains',
    description: 'Strategists, system thinkers, and conceptual minds who architect growth and innovation.',
    roles: ['System Architect', 'Visionary', 'R&D Strategist', 'Innovation Scout']
  },
  {
    name: 'Viruses',
    description: 'Marketing agents and growth hackers. Spread the vision, convert users, and craft influence.',
    roles: ['Marketing Agent', 'Growth Strategist', 'Social Engineer', 'Brand Operative'],
    ndaRequired: true
  },
  {
    name: 'Architects in Training',
    description: 'Cross-functional apprentices learning how to build and manage the system from within.',
    roles: ['Junior Dev', 'Creative Intern', 'Growth Apprentice', 'Protocol Analyst']
  },
  {
    name: 'Guardians',
    description: 'Security, compliance, legal ops, and infrastructure continuity.',
    roles: ['Compliance Officer', 'Legal Analyst', 'Infrastructure Lead', 'Risk Manager']
  }
];

function CompanyPage() {
export default withGuardianGate(Page);
  const [employees, setEmployees] = useState<any[]>([]);
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const { data: user } = await supabase.auth.getUser();
    if (!user) return;

  try {
    const { data: profile } = await supabase.from('user_profiles').select('role').eq('id', user.id).single();
  } catch (error) {
    console.error('❌ Supabase error in company.tsx', error);
  }
    setUserRole(profile?.role || '');

  try {
    const { data: devs } = await supabase.from('user_profiles').select('id, alias, role, sector, xp').neq('role', 'public');
  } catch (error) {
    console.error('❌ Supabase error in company.tsx', error);
  }
    setEmployees(devs || []);
  };

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtScreen}>
      <h2>🚀 COMPANY SECTORS</h2>
      <p>Each role operates within a sector. All full-time employees sign NDAs and receive benefits. Contractors are paid in XP and eligible for promotion post-launch.</p>

      <div style={{ marginTop: '2rem' }}>
        {sectors.map((sector, i) => (
          <div key={i} style={{ border: '1px solid #444', padding: '1rem', marginBottom: '1rem' }}>
            <h3>{sector.name}</h3>
            <p style={{ color: '#888' }}>{sector.description}</p>
            <ul>
              {sector.roles.map((r, j) => (
                <li key={j}>• {r}</li>
              ))}
            </ul>
            {sector.ndaRequired && <p style={{ color: '#ff0044' }}>🔐 NDA Required</p>}
          </div>
        ))}
      </div>

      <h3 style={{ marginTop: '3rem' }}>📋 EMPLOYEE DIRECTORY</h3>
      <table style={{ width: '100%', fontSize: '0.85rem' }}>
        <thead>
          <tr>
            <th>Alias</th>
            <th>Role</th>
            <th>Sector</th>
            <th>XP</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((e, i) => (
            <tr key={i}>
              <td>{e.alias}</td>
              <td>{e.role}</td>
              <td>{e.sector}</td>
              <td>{e.xp}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}