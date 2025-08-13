'use client';

import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';

import logo from '@/felena-brand-kit/felena-logo-final.png';
import styles from '@/styles/crtBootSplash.module.css';

export default function CRTBootSplash() {
  const router = useRouter();

  // Persisted audio mute state (defaults to true on first load)
  const [muted, setMuted] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem('bootMuted') === 'true';
  });

  // Brief visual reboot animation
  const [rebooting, setRebooting] = useState(false);

  // Audio element (created on mount)
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create the audio instance on mount
    const audio = new Audio('/sounds/boot.wav');
    audio.volume = muted ? 0 : 0.5;
    audioRef.current = audio;
    audio.play().catch(() => {
      // Autoplay may be blocked; ignore
    });

    // Schedule redirect to dashboard
    const t = setTimeout(() => {
      router.push('/dashboard');
    }, 2500);

    return () => {
      clearTimeout(t);
      audio.pause();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once

  // Toggle audio mute and persist to localStorage
  const handleAudioToggle = () => {
    const newMuted = !muted;
    setMuted(newMuted);
    if (typeof window !== 'undefined') {
      localStorage.setItem('bootMuted', String(newMuted));
    }
    if (audioRef.current) {
      audioRef.current.volume = newMuted ? 0 : 0.5;
    }
  };

  // Trigger a brief reboot animation
  const triggerReboot = () => {
    setRebooting(true);
    setTimeout(() => setRebooting(false), 1800);
  };

  return (
    <div className={`${styles.bootScreen} ${rebooting ? styles.reboot : ''}`}>
      {rebooting ? (
        <h1 className={styles.errorText}>SYSTEM ERROR: REBOOTING…</h1>
      ) : (
        <>
          <Image src={logo} alt="The Felena Theory" width={256} height={256} priority />
          <h1 className={styles.errorText}>System Initializing…</h1>

          <div className={styles.controls}>
            <button onClick={handleAudioToggle}>{muted ? 'Enable Sound' : 'Mute Sound'}</button>
            <button onClick={triggerReboot}>Reboot</button>
          </div>
        </>
      )}
    </div>
  );
}
