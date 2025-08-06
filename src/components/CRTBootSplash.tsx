 'use client';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import logo from '@/felena-brand-kit/felena-logo-final.png';
import styles from '@/styles/crtBootSplash.module.css';

export default function CRTBootSplash() {
  const router = useRouter();
  const [muted, setMuted] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('bootMuted') === 'true';
    }
    return false;
  });

  const [rebooting, setRebooting] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!rebooting) {
      const audio = new Audio('/sounds/boot.wav');
      audio.volume = muted ? 0 : 0.5;
      audio.play();
      audioRef.current = audio;

      const timeout = setTimeout(() => {
        router.push('/dashboard');
      }, 2500);

      return () => {
        clearTimeout(timeout);
        audio.pause();
      };
    }
  }, [muted, rebooting]);

  const handleAudioToggle = () => {
    const newMuted = !muted;
    setMuted(newMuted);
    localStorage.setItem('bootMuted', newMuted.toString());
    if (audioRef.current) {
      audioRef.current.volume = newMuted ? 0 : 0.5;
    }
  };

  const triggerReboot = () => {
    setRebooting(true);
    setTimeout(() => {
      setRebooting(false);
    }, 1800);
  };

  return (
    <div className={`${styles.bootScreen} ${rebooting ? styles.reboot : ''}`}>
      {rebooting ? (
        <h1 className={styles.errorText}>SYSTEM ERROR: REBOOTING...</h1>
      ) : (
        <>
          <Image src={logo} alt="The Felena Theory" width={256} height={256} priority />
          <h1>System Initializing...</h1>
          <div className={styles.controls}>
            <button onClick={handleAudioToggle}>
              {muted ? '🔇 Mute' : '🔊 Sound'}
            </button>
            <button onClick={triggerReboot}>♻️ Reboot</button>
          </div>
        </>
      )}
    </div>
  );
}