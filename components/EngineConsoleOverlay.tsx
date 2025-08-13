// src/components/EngineConsoleOverlay.tsx
// Engine Console overlay: shows current XP, tier info, next tier, and ETA.
// Uses a mock “tick” loop when mockMode is true so you can demo progression.

import React, { useEffect, useState } from 'react';

import { getCurrentTier, estimatePayoutTime } from '../utils/progressmonitor';

type TierInfo = { name: string; xp: number };

type EngineConsoleOverlayProps = {
  /** Starting XP for the panel (default 0) */
  startXP?: number;
  /** Average XP gained per loop iteration (default 120) */
  avgXPGainPerLoop?: number;
  /** Seconds between loop iterations (default 30s) */
  loopIntervalSeconds?: number;
  /** If true, runs a mock progression loop client-side */
  mockMode?: boolean;
};

const DEFAULTS = {
  startXP: 0,
  avgXPGainPerLoop: 120,
  loopIntervalSeconds: 30,
} as const;

export default function EngineConsoleOverlay({
  startXP = DEFAULTS.startXP,
  avgXPGainPerLoop = DEFAULTS.avgXPGainPerLoop,
  loopIntervalSeconds = DEFAULTS.loopIntervalSeconds,
  mockMode = false,
}: EngineConsoleOverlayProps) {
  const [currentXP, setCurrentXP] = useState<number>(startXP);
  const [{ current, next }, setTierPair] = useState<{ current: TierInfo; next: TierInfo | null }>(
    () => {
      const pair = getCurrentTier(startXP);
      return { current: pair.current, next: pair.next ?? null };
    },
  );
  const [etaText, setEtaText] = useState<string>(() =>
    estimatePayoutTime(startXP, avgXPGainPerLoop, loopIntervalSeconds),
  );

  // Mock loop to demonstrate XP progression
  useEffect(() => {
    if (!mockMode) return;

    const ms = Math.max(1, loopIntervalSeconds) * 1000;
    const id = setInterval(() => {
      setCurrentXP((prev) => prev + avgXPGainPerLoop);
    }, ms);

    return () => clearInterval(id);
  }, [mockMode, loopIntervalSeconds, avgXPGainPerLoop]);

  // Recompute tier + ETA when XP or inputs change
  useEffect(() => {
    const pair = getCurrentTier(currentXP);
    setTierPair({ current: pair.current, next: pair.next ?? null });

    setEtaText(estimatePayoutTime(currentXP, avgXPGainPerLoop, loopIntervalSeconds));
  }, [currentXP, avgXPGainPerLoop, loopIntervalSeconds]);

  // Progress to next tier (0–100)
  const progressPct = (() => {
    if (!next) return 100;
    const span = Math.max(1, next.xp - current.xp);
    const gained = Math.max(0, currentXP - current.xp);
    return Math.min(100, Math.round((gained / span) * 100));
  })();

  return (
    <div className="p-4 bg-black/70 text-green-400 font-mono rounded-md border border-green-500 w-full max-w-3xl">
      <h2 className="text-lg font-bold mb-2">Engine Console</h2>

      <div className="space-y-1">
        <div>
          <span className="font-bold">Current XP:</span>{' '}
          <span>{currentXP.toLocaleString()} XP</span>
        </div>
        <div>
          <span className="font-bold">Current Tier:</span>{' '}
          <span>
            {current.name} ({current.xp.toLocaleString()} XP)
          </span>
        </div>

        {next ? (
          <>
            <div>
              <span className="font-bold">Next Tier:</span>{' '}
              <span>
                {next.name} ({next.xp.toLocaleString()} XP)
              </span>
            </div>
            <div className="mt-2">
              <div className="h-2 w-full bg-green-900/40 rounded">
                <div
                  className="h-2 bg-green-400 rounded"
                  style={{ width: `${progressPct}%` }}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={progressPct}
                  role="progressbar"
                />
              </div>
              <div className="text-xs mt-1">Progress: {progressPct}%</div>
            </div>
            <div className="mt-1">
              <span className="font-bold">ETA to Next Tier:</span> <span>{etaText}</span>
            </div>
          </>
        ) : (
          <div className="mt-2 text-yellow-300">Max tier reached.</div>
        )}
      </div>

      {mockMode && (
        <div className="mt-3 text-yellow-400 text-xs">
          Mock mode enabled (simulated +{avgXPGainPerLoop} XP every {loopIntervalSeconds}s).
        </div>
      )}
    </div>
  );
}
