'use client';

import React, { useEffect, useRef, useState } from 'react';

import styles from '@/styles/crtLaunch.module.css';

export default function CanvasGlitchOverlay(): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const [isOffline, setIsOffline] = useState(false);

  // Keep online/offline state in sync (attach listeners only in the browser)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const update = () => setIsOffline(!navigator.onLine);
    update();

    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  // Draw “matrix rain” effect only when offline
  useEffect(() => {
    if (!isOffline) {
      // Stop any running animation when back online
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const fontSize = 16;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = new Array<number>(columns).fill(1);
    const chars = '01█▓▒░<>/\\|';

    const draw = () => {
      // Fade the canvas slightly to create trails
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#00FF99';
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i += 1) {
        const text = chars.charAt(Math.floor(Math.random() * chars.length));
        const x = i * fontSize;
        const y = drops[i] * fontSize;
        ctx.fillText(text, x, y);

        // Reset drop to top occasionally to vary streams
        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i] += 1;
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    // Start loop
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [isOffline]);

  return (
    <div className={styles.offlineOverlay} aria-live="polite">
      <canvas ref={canvasRef} />
      {isOffline && <div className={styles.offlineText}>OPERATOR OFFLINE</div>}
    </div>
  );
}
