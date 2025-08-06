// components/TacticalEngineCard.tsx
// Dev/internal-use engine tile with animated glow, win rate, and autonomy badge

import React from 'react';
import styles from './enginecard.module.css';

type TacticalEngineCardProps = {
  engineId: string;
  label: string;
  glowLevel: number;
  winRate: number;
  autonomy?: boolean;
};

export default function TacticalEngineCard({
  engineId,
  label,
  glowLevel,
  winRate,
  autonomy = false,
}: TacticalEngineCardProps) {
  const glowColor = glowLevel > 75 ? '#0f0' : glowLevel > 50 ? '#ff0' : '#f44';

  return (
    <div className={styles.tacticalCard} style={{ boxShadow: `0 0 12px ${glowColor}` }}>
      <div className={styles.label}>
        {label}
        {autonomy && <span className={styles.autonomyBadge}>AUTO</span>}
      </div>
      <div className={styles.idText}>{engineId}</div>
      <div className={styles.stat}>⚡ Glow: {glowLevel}%</div>
      <div className={styles.stat}>🎯 Win Rate: {winRate}%</div>
    </div>
  );
}