
// EngineConsoleOverlay.tsx – Tactical HUD Overlay for Engine Ops

import { useState, useEffect } from 'react';
import { getCurrentTier, estimatePayoutTime } from '@/utils/progressMonitor';
import { isOverrideEnabled, enableOverride } from '@/utils/overrideLogic';
import { checkCrateMilestone } from '@/utils/crateTrigger';
type Props = {
  currentXP: number;
  averageXPGain: number;
  userId: string;
  logs: string[];
};

export default function EngineConsoleOverlay({ currentXP, averageXPGain, userId, logs }: Props) {
  const [override, setOverride] = useState(false);
  const { current, next } = getCurrentTier(currentXP);
  const { etaText } = estimatePayoutTime(currentXP, averageXPGain);

  useEffect(() => {
  const result = checkCrateMilestone(currentXP);
  if (result.triggered) {
  }
}, [currentXP]);

  useEffect(() => {
    const check = async () => {
      const active = await isOverrideEnabled(userId);
      setOverride(active);
    };
    check();
  }, [userId]);

  const handleEnableOverride = async () => {
    const success = await enableOverride(userId);
    if (success) setOverride(true);
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: 20,
      right: 20,
      background: '#111',
      color: '#0f0',
      padding: '1rem',
      borderRadius: '12px',
      width: '360px',
      fontFamily: 'monospace',
      fontSize: '0.85rem',
      zIndex: 9999,
      boxShadow: '0 0 12px #0f0'
    }}>
      <div><strong>💻 ENGINE CONSOLE</strong></div>
      <div>🧠 Mode: {override ? 'OVERRIDE' : 'CRUISE'}</div>
      <div>💰 XP: {currentXP} ({current?.name})</div>
      <div>🎯 Next: {next?.name || 'MAX'} @ {next?.xp || '∞'} XP</div>
      <div>⏱ ETA: {etaText}</div>

      {!override && (
        <button
          onClick={handleEnableOverride}
          style={{
            marginTop: '0.5rem',
            background: '#0f0',
            color: '#000',
            fontWeight: 'bold',
            border: 'none',
            padding: '6px 12px',
            cursor: 'pointer',
            borderRadius: '8px'
          }}
        >
          ENABLE OVERRIDE (25 XP)
        </button>
      )}

      <div style={{
        marginTop: '0.75rem',
        maxHeight: '120px',
        overflowY: 'auto',
        background: '#000',
        padding: '6px',
        borderRadius: '8px',
        border: '1px solid #0f0'
      }}>
        {logs.slice(-6).reverse().map((log, i) => (
          <div key={i}>▶ {log}</div>
        ))}
      </div>
    </div>
  );
}
