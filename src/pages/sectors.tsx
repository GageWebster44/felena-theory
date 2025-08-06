
import React from 'react';
import { withGuardianGate } from '@/components/withGuardianGate';
import styles from '@/styles/crtLaunch.module.css';

const sectors = [
  {
    title: 'Mechanics',
    description:
      'Front-end & back-end developers responsible for building, fixing, and deploying the Felena Zone infrastructure.',
    roles: ['Frontend Engineer', 'Backend Engineer', 'Full Stack Engineer', 'UI/UX Technician'],
    color: 'green',
  },
  {
    title: 'Brains',
    description:
      'Strategists and conceptual designers who craft the theoretical backbone of systems, narratives, and revenue loops.',
    roles: ['System Architect', 'Game Theorist', 'Narrative Strategist', 'Feature Inventor'],
    color: 'blue',
  },
  {
    title: 'Viruses',
    description:
      'Marketing operatives focused on viral spread. All members sign strict NDAs and are assigned to marketing warfare and social engineering.',
    roles: ['NDA Operative', 'Social Hacker', 'Community Strategist', 'Campaign Agent'],
    color: 'red',
  },
  {
    title: 'Architects in Training',
    description:
      'Cross-functional apprentices being trained in system design, development, operations, and theoretical modeling.',
    roles: ['Finance Mechanic', 'Junior Strategist', 'Mission Builder', 'XP Loop Analyst'],
    color: 'purple',
  },
  {
    title: 'Guardians',
    description:
      'Security, compliance, and core infrastructure protectors. Ensure the Felena Theory stays legally bulletproof and technologically stable.',
    roles: ['Legal Shield', 'Infrastructure Ops', 'Compliance Auditor', 'Data Sentinel'],
    color: 'gold',
  },
];

function SectorsPage() {
export default withGuardianGate(Page);
  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtScreen}>
      <h2>SECTOR STRUCTURE</h2>
      <p>
        Felena Holdings LLC is divided into 5 core sectors. Each holds 4 elite operational roles.
        Full-time roles come with NDAs and benefit packages. Contractors are promoted by XP.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem',
          marginTop: '2rem',
        }}
      >
        {sectors.map((sector) => (
          <div
            key={sector.title}
            style={{
              border: `2px solid ${sector.color}`,
              padding: '1rem',
              borderRadius: '12px',
              background: '#111',
            }}
          >
            <h3 style={{ color: sector.color }}>{sector.title}</h3>
            <p style={{ marginTop: '1rem', color: '#ccc' }}>{sector.description}</p>
            <ul style={{ marginTop: '1rem' }}>
              {sector.roles.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}