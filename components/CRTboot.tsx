'use client';

// src/components/CRTboot.tsx
import { useRouter } from 'next/router';
import { useEffect, useMemo, useRef, useState } from 'react';

import styles from '@/styles/crtLaunch.module.css';

const MESSAGES: string[] = [
  'THEY MADE THE RULES. WE MONETIZED THE GLITCH.',
  'INITIALIZING…',
  'LOADING SYSTEM MEMORY BANKS…',
  'ACTIVATING FELENA ENGINES…',
  'UNLOCKING UPLINK CHAIN ACCESS…',
  'ENGAGING MULTI-DIMENSIONAL VORTEX…',
  'DISPATCHER IS PATCHING YOU THROUGH NOW.',
  'WELCOME, OPERATOR.',
];

type SoundMap = {
  glitch?: HTMLAudioElement;
  unlock?: HTMLAudioElement;
};

export default function CRTboot() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [booted, setBooted] = useState(false);

  // Lazily create <audio> elements only on the client
  const sounds = useRef<SoundMap>({});
  useEffect(() => {
    if (typeof window === 'undefined') return;
    sounds.current.glitch = new Audio('/sounds/glitch.wav');
    sounds.current.unlock = new Audio('/sounds/unlock.wav');
  }, []);

  // Step through messages on a fixed cadence
  const speedMs = 1000; // per-line cadence
  const holdAfterLastMs = 1000; // pause on final line before redirect

  useEffect(() => {
    if (index >= MESSAGES.length - 1) {
      // On last line: schedule boot complete
      const done = setTimeout(() => setBooted(true), holdAfterLastMs);
      return () => clearTimeout(done);
    }

    const t = setTimeout(() => setIndex((i) => i + 1), speedMs);
    return () => clearTimeout(t);
  }, [index]);

  // Play SFX + optional CSS flicker at specific cues
  useEffect(() => {
    const msg = MESSAGES[index];
    if (!msg) return;

    if (msg === 'DISPATCHER IS PATCHING YOU THROUGH NOW.') {
      sounds.current.glitch?.play();
      document.body.classList.add(styles.flickerFX);
      const r = setTimeout(() => {
        document.body.classList.remove(styles.flickerFX);
      }, 600);
      return () => clearTimeout(r);
    }

    if (msg === 'WELCOME, OPERATOR.') {
      sounds.current.unlock?.play();
    }
  }, [index]);

  // Navigate when boot completes
  useEffect(() => {
    if (!booted) return;
    // small delay to let audio finish
    const nav = setTimeout(() => {
      // Use push; replace is fine too if you don’t want back nav
      router.push('/dashboard');
    }, 250);
    return () => clearTimeout(nav);
  }, [booted, router]);

  // Render
  const line = useMemo(() => MESSAGES[index] ?? '', [index]);

  return (
    <div className={styles.crtScreen}>
      <h1 className={styles.glitch} style={{ fontSize: '2rem', color: '#0f0' }}>
        {line}
      </h1>
      <div className={styles.scanlines} />
    </div>
  );
}
