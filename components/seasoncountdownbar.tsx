// src/components/seasoncountdownbar.tsx
// Countdown bar for the current season reset/end

import React, { useEffect, useRef, useState } from 'react';

type Props = {
  /** UTC timestamp or Date for when the current season ends/resets */
  endAt?: string | Date;
  /** Optional message when the season is over */
  endedText?: string;
};

function toDate(input: string | Date): Date {
  return typeof input === 'string' ? new Date(input) : input;
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return 'Season has ended.';
  const totalSeconds = Math.floor(ms / 1000);

  const days = Math.floor(totalSeconds / (60 * 60 * 24));
  const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
  const mins = Math.floor((totalSeconds % (60 * 60)) / 60);
  const secs = totalSeconds % 60;

  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

  return `Season resets in ${days}d ${pad(hours)}h ${pad(mins)}m ${pad(secs)}s`;
}

export default function SeasonCountdownBar({
  endAt = '2025-10-01T00:00:02Z',
  endedText = 'Season has ended.',
}: Props) {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const end = useRef<Date>(toDate(endAt));
  const timerId = useRef<number | null>(null);

  useEffect(() => {
    end.current = toDate(endAt);
  }, [endAt]);

  useEffect(() => {
    // Guard against SSR
    if (typeof window === 'undefined') return;

    const tick = () => {
      const now = Date.now();
      const diff = end.current.getTime() - now;
      setTimeLeft(diff <= 0 ? endedText : formatCountdown(diff));
    };

    // initial paint
    tick();

    // run every second
    timerId.current = window.setInterval(tick, 1000);

    return () => {
      if (timerId.current) {
        clearInterval(timerId.current);
        timerId.current = null;
      }
    };
  }, [endedText]);

  return (
    <div className="bg-black text-green-400 text-center text-sm p-2 border-b border-green-700 font-mono tracking-wider">
      {timeLeft}
    </div>
  );
}
