// src/components/TacticalEngineCard.tsx
// Dev/internal-use engine tile with animated glow, win rate, and autonomy badge

import React from 'react';

import styles from './enginecard.module.css';

type TacticalEngineCardProps = {
  engineId: string;
  label: string;
  glowLevel: number; // 0–100
  winRate: number; // 0–100
  autonomy?: boolean;
  onClick?: () => void;
};

const TacticalEngineCard: React.FC<TacticalEngineCardProps> = ({
  engineId,
  label,
  glowLevel,
  winRate,
  autonomy = false,
  onClick,
}) => {
  // traffic‑light glow
  const glowColor = glowLevel > 75 ? '#0f0' : glowLevel > 50 ? '#ff0' : '#f44';

  return (
    <div
      className={styles.tacticalCard}
      style={{ boxShadow: `0 0 12px ${glowColor}` }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClick?.();
      }}
    >
      <div className={styles.label}>
        {label}
        {autonomy && <span className={styles.autonomyBadge}>AUTO</span>}
      </div>

      <div className={styles.idText}>{engineId}</div>

      <div className={styles.stat}>Glow: {glowLevel}%</div>
      <div className={styles.stat}>Win Rate: {winRate}%</div>
    </div>
  );
};

export default TacticalEngineCard;
