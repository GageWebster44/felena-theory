// src/components/CRTPanelTile.tsx
// Clickable dashboard tile with optional lock state and HUD spark FX.

import { useRouter } from 'next/router';

import styles from '../../styles/crtLaunch.module.css';
import playSound from '../../utils/playSound';

export interface CRTPanelTileProps {
  label: string;
  route?: string;
  locked?: boolean;
  xpRequired?: number;
  adminOnly?: boolean;
}

/**
 * CRTPanelTile — clickable card used on the main console grid.
 * - Shows a lock overlay when `locked`
 * - Optionally displays XP requirement and/or ADMIN tag
 * - Triggers a brief spark-ring HUD effect on click
 */
export default function CRTPanelTile({
  label,
  route = '/',
  locked = false,
  xpRequired,
  adminOnly = false,
}: CRTPanelTileProps) {
  const router = useRouter();

  // Small HUD spark flash effect on click
  const triggerSparkFX = () => {
    const spark = document.createElement('div');
    spark.className = styles.sparkFlash; // ensure class exists in crtLaunch.module.css
    document.body.appendChild(spark);

    // Auto-remove after CSS animation ends
    setTimeout(() => {
      spark.remove();
    }, 600);
  };

  const handleClick = () => {
    if (locked) {
      playSound('deny-glitch');
      return;
    }

    playSound('tile-click');
    triggerSparkFX();
    if (route) router.push(route);
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      className={`${styles.tile} ${locked ? styles.locked : ''}`}
      onClick={handleClick}
      onMouseEnter={() => playSound('hover')}
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-disabled={locked}
      aria-label={label}
    >
      {/* Locked glitch overlay */}
      {locked && <div className={styles.glitchOverlay} />}

      {/* Unlocked spark ring */}
      {!locked && <div className={styles.sparkRing} />}

      <div className={styles.tileLabel}>{label}</div>

      {locked && (
        <div className={styles.xpRequirement}>{adminOnly ? 'ADMIN' : `${xpRequired ?? 0} XP`}</div>
      )}
    </div>
  );
}
