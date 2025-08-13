// src/components/NavMenu.tsx
// Compact top-level navigation for the CRT layout

import Link from 'next/link';

import { routes } from '@/routes';
import styles from '@/styles/crtLaunch.module.css';

export default function NavMenu() {
  return (
    <nav className={styles.crtNav} aria-label="Primary">
      <Link href={routes.core.dashboard} className={styles.navLink}>
        Dashboard
      </Link>
      <Link href={routes.xp.center} className={styles.navLink}>
        XP Center
      </Link>
      <Link href={routes.games.index} className={styles.navLink}>
        Game Room
      </Link>
      <Link href={routes.referral.invite} className={styles.navLink}>
        Invite
      </Link>
      <Link href={routes.xp.shop} className={styles.navLink}>
        Shop
      </Link>
    </nav>
  );
}
