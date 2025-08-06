 // components/enginecard.tsx
// Engine display card for the Felena Theory tactical grid system

import React from 'react'
import './enginecard.css'

type EngineCardProps = {
  engineId: string
  label: string
  unlocked: boolean
  glowLevel: number
  winRate?: number
  isActive?: boolean
  onClick?: () => void
  autonomy?: boolean
}

const EngineCard: React.FC<EngineCardProps> = ({
  engineId,
  label,
  unlocked,
  glowLevel,
  winRate = 0,
  isActive = false,
  onClick,
  autonomy = false,
}) => {
  return (
    <div
      className={`engine-card ${unlocked ? 'unlocked' : 'locked'} ${isActive ? 'active' : ''}`}
      onClick={onClick}
    >
      <div className="engine-title">{label}</div>
      <div className="engine-id">{engineId.toUpperCase()}</div>

      <div className="engine-meta">
        <div className="glow">Glow: {glowLevel}</div>
        <div className="accuracy">WR: {winRate.toFixed(1)}%</div>
        {autonomy && <div className="autonomy">Autonomous</div>}
      </div>
    </div>
  )
}

export default EngineCard
