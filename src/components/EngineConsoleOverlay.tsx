
// EngineConsoleOverlay.tsx – Finalized XP HUD with glow, sound, crate, override

import { useEffect, useState } from 'react';
import { checkCrateMilestone } from '@/utils/crateTrigger';
import { playCrateSound } from '@/utils/playCrateSound';
import FlashXP from '@/components/FlashXP';
import XPRewardModal from '@/components/XPRewardModal';
import { checkCashoutStatus } from '@/utils/xpCashoutTrigger';
import { logRewardClaim } from '@/utils/rewardClaimLogger';

type Props = {
  currentXP: number;
  averageXPGain: number;
  userId: string;
  logs: string[];
};

export default function EngineConsoleOverlay({ currentXP, averageXPGain, userId, logs }: Props) {
  const [override, setOverride] = useState(false);
  const [crateFlash, setCrateFlash] = useState(false);
  const [crateTier, setCrateTier] = useState<string | null>(null);
  const [showRedemption, setShowRedemption] = useState(false);

  useEffect(() => {
    const result = checkCrateMilestone(currentXP);
    if (result.triggered) {
      playCrateSound(result.tier);
      setCrateFlash(true);
      setCrateTier(result.tier);
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
        width: '360px',
        fontFamily: 'monospace',
        fontSize: '0.85rem',
        zIndex: 9999,
        boxShadow: '0 0 12px #0f0'
      }}>
        <div><strong>💻 ENGINE CONSOLE</strong></div>
        <div>🧠 Mode: {override ? 'OVERRIDE' : 'CRUISE'}</div>
        <div>💰 XP: {currentXP.toLocaleString()}</div>
        <div>⏱ Est. Payout ETA: {Math.ceil((1000 - currentXP) / averageXPGain * 30 / 60)} min</div>

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

      <FlashXP trigger={crateFlash} />
      <XPRewardModal tier={crateTier} />
      {showRedemption && (
        <XPRewardModal
          tier={'Max'}
          onClaim={handleClaim}
          onClose={() => setShowRedemption(false)}
        />
      )}
    </>
  );
}
