// pages/games/kids/bakery.tsx

import { useState } from 'react';
import styles from '@/styles/crtLaunch.module.css';
import playSound from '@/utils/playSound';
import withGuardianGate from '@/components/withGuardianGate';

interface Ingredient {
  name: string;
  selected: boolean;
  required: boolean;
}

const baseIngredients: Ingredient[] = [
  { name: 'Flour', selected: false, required: true },
  { name: 'Sugar', selected: false, required: true },
  { name: 'Eggs', selected: false, required: true },
  { name: 'Milk', selected: false, required: true },
  { name: 'Baking Powder', selected: false, required: false },
  { name: 'Butter', selected: false, required: true },
  { name: 'Vanilla', selected: false, required: false },
];

function BakeryGame() {
  const [ingredients, setIngredients] = useState<Ingredient[]>(baseIngredients);
  const [message, setMessage] = useState('');
  const [bakeCount, setBakeCount] = useState(0);
  const [score, setScore] = useState(0);

  const toggleIngredient = (name: string) => {
    setIngredients((prev) =>
      prev.map((ing) =>
        ing.name === name ? { ...ing, selected: !ing.selected } : ing
      )
    );
  };

  const handleBake = () => {
    const missing = ingredients.filter((i) => i.required && !i.selected);
    const extras = ingredients.filter((i) => !i.required && i.selected);

    if (missing.length === 0 && extras.length <= 1) {
      setMessage('✅ Perfect recipe! XP +10');
      playSound('xp-rain');
      setScore((score) => score + 10);
    } else {
      setMessage(`❌ Try again. Missing: ${missing.map((i) => i.name).join(', ')}`);
    }

    setBakeCount((count) => count + 1);
    setTimeout(() => setMessage(''), 3000);
  };

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtScreen}>
      <h1>👩‍🍳 KIDS ZONE 🍰 BAKERY LAB</h1>
      <p>Select the correct ingredients to make a basic cake batter. Learn to mix and measure.</p>

      <div className={styles.crtGridContainer}>
        {ingredients.map((ing, i) => (
          <div
            key={i}
            className={styles.crtPanelTile}
            onClick={() => toggleIngredient(ing.name)}
            style={{
              backgroundColor: ing.selected ? '#003' : '#111',
              cursor: 'pointer',
            }}
          >
            {ing.name}
          </div>
        ))}
      </div>

      <button onClick={handleBake} className={styles.crtButton} style={{ marginTop: '2rem' }}>
        🍞 Mix & Bake
      </button>

      {message && (
        <p style={{ color: '#0ff', marginTop: '1rem', fontSize: '0.9rem' }}>{message}</p>
      )}

      <div style={{ marginTop: '2rem', color: '#aaa', fontSize: '0.9rem' }}>
        <p>🧁 Cakes Baked: <strong>{bakeCount}</strong></p>
        <p>⭐ XP Earned: <strong>{score}</strong></p>
      </div>
    </div>
  );
}

export default withGuardianGate(BakeryGame);