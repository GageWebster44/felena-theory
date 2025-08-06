 'use client';
import { useEffect, useRef, useState } from 'react';
import styles from '@/styles/crtLaunch.module.css';

export default function CanvasGlitchOverlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const updateStatus = () => setIsOffline(!navigator.onLine);
    updateStatus();

    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);

    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
    };
  }, []);

  useEffect(() => {
    if (!isOffline || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    const chars = '01';
    const fontSize = 16;
    const columns = canvas.width / fontSize;
    const drops = Array.from({ length: columns }, () => 1);

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#00FF99';
      ctx.font = `${fontSize}px monospace`;

      drops.forEach((y, x) => {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, x * fontSize, y * fontSize);
        drops[x] = y * fontSize > canvas.height && Math.random() > 0.975 ? 0 : y + 1;
      });
    };

    const interval = setInterval(draw, 35);
    return () => clearInterval(interval);
  }, [isOffline]);

  if (!isOffline) return null;

  return (
    <div className={styles.offlineOverlay}>
      <canvas ref={canvasRef} width={window.innerWidth} height={window.innerHeight} />
      <div className={styles.offlineText}>OPERATOR OFFLINE</div>
    </div>
  );
}