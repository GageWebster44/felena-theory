 // components/NavMenu.tsx
import Link from 'next/link';
import { routes } from '@/routes';
import styles from '@/styles/crtLaunch.module.css';

export default function NavMenu() {
  return (
    <nav className={styles.crtNav}>
      <Link href={routes.core.dashboard}>🧠 Dashboard</Link>
      <Link href={routes.xp.center}>🎁 XP Center</Link>
      <Link href={routes.games.index}>🎮 Game Room</Link>
      <Link href={routes.referral.invite}>👥 Invite</Link>
      <Link href={routes.xp.shop}>🛒 Shop</Link>
    </nav>
  );
}