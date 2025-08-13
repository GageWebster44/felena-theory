'use client';

import React from 'react';
import './enginecard.css';

export type EngineCardProps = {
  engineId: string;
  label: string;
  unlocked?: boolean; // if false, shows "locked" styling
  glowLevel?: number; // 0–100
  winRate?: number; // 0–100
  isActive?: boolean; // highlights active card
  autonomy?: boolean; // shows "Autonomous" badge
  onClick?: () => void; // click handler
};

export default function EngineCard({
  engineId,
  label,
  unlocked = false,
  glowLevel = 0,
  winRate = 0,
  isActive = false,
  autonomy = false,
  onClick,
}: EngineCardProps) {
  const className = ['engine-card', unlocked ? 'unlocked' : 'locked', isActive ? 'active' : '']
    .filter(Boolean)
    .join(' ');

  const clamp0to100 = (n: number) => Math.max(0, Math.min(100, n));

  return (
    <div
      className={className}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClick?.();
      }}
    >
      <div className="engine-title">{label}</div>
      <div className="engine-id">{engineId.toUpperCase()}</div>

      <div className="engine-meta">
        <div className="glow">Glow: {clamp0to100(glowLevel).toFixed(0)}</div>
        <div className="accuracy">WR: {clamp0to100(winRate).toFixed(1)}%</div>
        {autonomy && <div className="autonomy">Autonomous</div>}
      </div>
    </div>
  );
}
