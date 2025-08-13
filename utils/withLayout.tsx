// src/utils/withLayout.tsx
import React from 'react';
import Head from 'next/head';
import styles from '@/styles/crtLaunch.module.css';

/**
 * Wrap any page with the CRT shell/layout.
 * We intentionally avoid generic props here to keep TS from trying to
 * intersect with JSX.IntrinsicAttributes (the source of TS2322 in your build).
 */
export default function withLayout(PageComponent: React.ComponentType<any>) {
  const WrappedPage: React.FC<any> = (props) => {
    return (
      <>
        <Head>
          <title>Felena Theory</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>

        <div className={styles.crtShell}>
          <header className={styles.crtHeader}>
            <span className={styles.crtTag}>FELENA ZONE ONLINE</span>
            <span className={styles.crtStats}>
              <span>Operator:</span>
              <span> XP: </span>
              <span>Status: ONLINE</span>
            </span>
          </header>

          <main className={styles.crtMain}>
            <PageComponent {...props} />
        
        </main>
        </div>
  

        {/* FX layers */}
        <div id="xpBurst" className={styles.burstFX} />
        <div id="crateFlash" className={styles.crateFX} />
      </>
    );
  };

  WrappedPage.displayName = `WithLayout(${PageComponent.displayName ?? PageComponent.name ?? 'Component'})`;
  return WrappedPage;
}