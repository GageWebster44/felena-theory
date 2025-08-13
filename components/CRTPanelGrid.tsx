// src/components/CRTPanelGrid.tsx
// Grid of launch tiles for the CRT boot/home screen

import { useRouter } from 'next/router';
import React from 'react';

import CRTPanelTile from './CRTPanelTile';

import styles from '@/styles/crtLaunch.module.css';

type Panel = {
  label: string;
  route: string;
  locked?: boolean; // hard lock (e.g., feature off)
  xpRequired?: number; // lock if user XP < xpRequired
  adminOnly?: boolean; // lock unless isAdmin
};

type Props = {
  userXp?: number; // pass current user XP if you want XP locks to apply
  isAdmin?: boolean; // pass true to unlock admin tiles
};

const PANELS: Panel[] = [
  { label: 'LIVE MARKET FEED', route: '/live-feed' },
  { label: 'ENGINE GRID', route: '/engine-grid' },
  { label: 'GAME ROOM', route: '/game-room' },
  { label: 'AI SIMULATOR', route: '/simulator', xpRequired: 500 },
  { label: 'ANOMALY RADAR', route: '/anomaly-radar' },
  { label: 'XP SHOP', route: '/xp-shop' },
  { label: 'SETTINGS CONSOLE', route: '/settings' },
  { label: 'LEADERBOARD SYSTEM', route: '/leaderboard' },
  // Admin/ops tiles
  { label: 'OVERRIDE PANEL', route: '/override', locked: true, adminOnly: true },
];

export default function CRTPanelGrid({ userXp = 0, isAdmin = false }: Props) {
  const router = useRouter();

  // derive the effective lock for each tile
  const tiles = PANELS.map((p) => {
    const xpLocked = typeof p.xpRequired === 'number' ? userXp < p.xpRequired : false;
    const adminLocked = p.adminOnly ? !isAdmin : false;
    return {
      ...p,
      locked: Boolean(p.locked || xpLocked || adminLocked),
    };
  });

  return (
    <div className={styles.crtGridContainer}>
      {tiles.map((panel) => (
        <div key={panel.route} className={styles.crtGridItem}>
          <CRTPanelTile
            label={panel.label}
            route={panel.route}
            locked={panel.locked ?? false}
            xpRequired={panel.xpRequired ?? 0}
            adminOnly={panel.adminOnly ?? false}
          />
        </div>
      ))}
    </div>
  );
}
