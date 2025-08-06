import { ReactNode } from 'react';
import Head from 'next/head';
import styles from '@/styles/crtLaunch.module.css';

type Props = {
  children: ReactNode;
};

export default function withLayout(PageComponent: any) {
  return function WrappedPage(props: Props) {
    return (
      <>
        <Head>
          <title>Felena Theory</title>
        </Head>

        <div className={styles.crtShell}>
          <header className={styles.crtHeader}>
            <span className={styles.crtTag}>FELENA ZONE ONLINE</span>
            <div className={styles.crtStats}>
              <span>🧠 Operator</span>
              <span>🎮 XP: LIVE</span>
              <span>📡 Status: ONLINE</span>
            </div>
          </header>

          <main className={styles.crtMain}>
            <PageComponent {...props} />
          </main>

          <div id="xpBurst" className={styles.burstFX}></div>
          <div id="crateFlash" className={styles.crateFX}></div>
        </div>
      </>
    );
  };
}