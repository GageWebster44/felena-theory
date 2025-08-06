 // components/CRTPanelGrid.tsx
import CRTPanelTile from './CRTPanelTile';
import styles from '@/styles/crtLaunch.module.css';

const panels = [
  { label: 'LIVE MARKET FEED', route: '/live-feed', locked: false },
  { label: 'ENGINE GRID', route: '/engine-grid', locked: false },
  { label: 'GAME ROOM', route: '/game-room', locked: false },
  { label: 'AI SIMULATOR', route: '/simulator', locked: true, xpRequired: 500 },
  { label: 'ALGO ANOMALY RADAR', route: '/anomaly-radar', locked: false },
  { label: 'XP SHOP', route: '/xp-shop', locked: false },
  { label: 'SETTINGS CONSOLE', route: '/settings', locked: false },
  { label: 'LEADERBOARD SYSTEM', route: '/leaderboard', locked: false },
  { label: 'OVERRIDE PANEL', route: '/override', locked: true, adminOnly: true },
];

export default function CRTPanelGrid() {
  return (
    <div className={styles.crtGridContainer}>
      {panels.map((panel, idx) => (
        <div
          key={idx}
          className={styles.crtGridItem}
          onClick={() => {
            if (!panel.locked) {
              window.location.href = panel.route;
            }
          }}
        >
          <CRTPanelTile
            label={panel.label}
            locked={panel.locked}
            xpRequired={panel.xpRequired}
            adminOnly={panel.adminOnly}
          />
        </div>
      ))}
    </div>
  );
}
