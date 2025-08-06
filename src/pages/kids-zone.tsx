import { useEffect, useState } from 'react';
import { withGuardianGate } from '@/components/withGuardianGate';
import { useRouter } from 'next/router';
import styles from '@/styles/crtLaunch.module.css';
import playSound from '@/utils/playSound';

const skillList = [
  'Bakery', 'Barber', 'Business Owner', 'Racecar Driver', 'Carpentry', 'Childcare',
  'CNC', 'Concrete', 'Cosmetology', 'Culinary', 'Detective',
  'Drywall', 'Electric', 'Engineering', 'Equipment Operator', 'Farming',
  'Firefighter', 'HVAC', 'Landscaping', 'Mechanic', 'Painting',
  'Plumbing', 'Roofing', 'Security', 'Tattoo Artist', 'Truck Driver', 'Welding'
];

function KidsZone() {
export default withGuardianGate(Page);
  const router = useRouter();
  const [ageVerified, setAgeVerified] = useState(false);

  useEffect(() => {
    const verified = localStorage.getItem('isChild') === 'true';
    setAgeVerified(verified);
  }, []);

  if (!ageVerified) {
    return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

      <div className={styles.crtScreen}>
        <h1 className="text-red-500 text-xl">🔒 KIDS ZONE LOCKED</h1>
        <p>You must complete the guardian verification to access this zone.</p>
      </div>
    );
  }

  return (
    <div className={styles.crtScreen}>
      <h1 className="text-green-400 text-2xl">🎓 KIDS ZONE – LEARN & EARN</h1>
      <p className="text-sm text-yellow-300 mb-4">📚 Pick a skill to explore. Each one can earn you XP and real-world knowledge.</p>

      <div className={styles.crtGridContainer}>
        {skillList.map((skill, idx) => (
          <div
            key={idx}
            className={styles.crtPanelTile}
            onClick={() => {
              playSound('tile-click');
              router.push(`/kids/${skill.toLowerCase().replace(/\s+/g, '-').replace('tattoo-artist', 'tattoo')}`);
            }}
          >
            <div className="text-lg font-bold">{skill}</div>
            <p className="text-sm text-gray-300">Start quiz or game</p>
          </div>
        ))}
      </div>
    </div>
  );
}