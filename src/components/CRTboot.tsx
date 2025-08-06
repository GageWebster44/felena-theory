import { useEffect, useState } from 'react';
import styles from '@/styles/crtLaunch.module.css';
import { useRouter } from 'next/router';

export default function CRTBoot() {
  const [booted, setBooted] = useState(false);
  const [index, setIndex] = useState(0);
  const router = useRouter();

  const messages = [
    'THEY MADE THE RULES. WE MONETIZED THE GLITCH.',
    'INITIALIZING...',
    'LOADING SYSTEM MEMORY BANKS…',
    'ACTIVATING FELENA ENGINES…',
    'UNLOCKING UPLINK CHAIN ACCESS...',
    'ENGAGING MULTI-DIMENSIONAL VORTEX...',
    'DISPATCHER IS PATCHING YOU THROUGH NOW.',
    'WELCOME, OPERATOR.',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => {
        if (i < messages.length - 1) return i + 1;
        clearInterval(interval);
        return i;
      });
    }, 1000);

    const timeout = setTimeout(() => {
      setBooted(true);
    }, messages.length * 1000 + 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    const msg = messages[index];

    if (msg === 'DISPATCHER IS PATCHING YOU THROUGH NOW.') {
      const glitch = new Audio('/sounds/glitch.wav');
      glitch.play();
      document.body.classList.add(styles.flickerFX);
      setTimeout(() => document.body.classList.remove(styles.flickerFX), 600);
    }

    if (msg === 'WELCOME, OPERATOR.') {
      const unlock = new Audio('/sounds/unlock.wav');
      unlock.play();
    }
  }, [index]);

  useEffect(() => {
    if (booted) router.push('/dashboard');
  }, [booted]);

  return (
    <div className={styles.crtScreen}>
      <h1 className={styles.glitch} style={{ fontSize: '2rem', color: '#0f0' }}>
        {messages[index]}
      </h1>
      <div className={styles.scanlines}></div>
    </div>
  );
}