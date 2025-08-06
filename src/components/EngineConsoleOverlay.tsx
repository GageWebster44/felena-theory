// EngineConsoleOverlay.tsx – Finalized XP HUD with glow, sound, crate, override

import { useState, useEffect } from 'react';
import { checkCrateMilestone } from '../utils/crateTrigger';
import { playCrateSound } from '../utils/playCrateSound';
import FlashXP from './FlashXP';
import XPRewardModal from './XPRewardModal';
import { checkCashoutStatus } from '../utils/xpCashoutTrigger';
import { logRewardClaim } from '../utils/rewardClaimLogger';
import { getCurrentTier, estimatePayoutTime } from '../utils/progressMonitor';

type Props = {
  currentXP: number;
  averageXPGain: number;
  userId: string;
  logs: any[]; // changed from string[] in case logs are objects
};

export default function EngineConsoleOverlay({
  currentXP,
  averageXPGain,
  userId,
  logs
}: Props) {
  const [override, setOverride] = useState(false);
  const [crateFlash, setCrateFlash] = useState(false);
  const [crateTier, setCrateTier] = useState<string | null>(null);
  const [showRedemption, setShowRedemption] = useState(false);

  useEffect(() => {
    const result = checkCrateMilestone(currentXP);
    if (result?.triggered) {
      setCrateTier(result.tier);
      setCrateFlash(true);
      setTimeout(() => setCrateFlash(false), 2000);
    }

    const cashout = checkCashoutStatus(currentXP);
    if (cashout.eligible && cashout.tier === 'Max') {
      setShowRedemption(true);
    }
  }, [currentXP]);

  const handleClaim = async () => {
    await logRewardClaim(userId, crateTier || 'Unknown');
    setShowRedemption(false);
  };

  const { etaText, nextTier } = estimatePayoutTime(currentXP, averageXPGain);

  return (
    <>
      <div style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        background: '#111',
        color: '#0f0',
        padding: '1rem',
        borderRadius: '12px',
        border: '2px solid #0f0',
        fontFamily: 'monospace',
        fontSize: '0.85rem',
        zIndex: 9999,
        boxShadow: '0 0 12px #0f0'
      }}>
        <div><strong>🧠 ENGINE CONSOLE</strong></div>
        <div>🎮 Mode: {override ? 'OVERRIDE' : 'CRUISE'}</div>
        <div>⚡ XP: {currentXP.toLocaleString()}</div>
        <div>⏳ Est. Payout ETA: {etaText} → Next: {nextTier || 'None'}</div>

        <div style={{
          marginTop: '0.75rem',
          maxHeight: '120px',
          overflowY: 'auto',
          background: '#000',
          padding: '6px',
          borderRadius: '8px',
          border: '1px solid #0f0'
        }}>
          {(logs || []).slice().reverse().map((log, i) => (
            <div key={i}>
              {typeof log === 'string' ? log : JSON.stringify(log)}
            </div>
          ))}
        </div>
      </div>

      <FlashXP trigger={crateFlash} />

      <XPRewardModal
        tier={crateTier}
        show={showRedemption}
        onClose={() => setShowRedemption(false)}
        onClaim={handleClaim}
      />
    </>
  );
}