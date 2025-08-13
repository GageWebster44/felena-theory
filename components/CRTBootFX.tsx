// src/components/CRTBootFX.tsx
import React, { useEffect, useRef, useState } from 'react';

import styles from '@/styles/crtLaunch.module.css';

const DEFAULT_LINES: string[] = [
  'WELCOME TO FELENA THEORY.',
  'THIS IS NOT A GAME. THIS IS A SYSTEM.',
  'BUILT TO WORK OUTSIDE THEIR RULES AND INSIDE EVERY LEGAL LOOPHOLE.',
  'NO BOSSES. NO HR. NO CORPORATE CHAINS.',
  'XP IS CURRENCY HERE — AND IT SPENDS.',
  'BUY XP. EARN XP. GAMBLE XP. TRADE XP.',
  'XP TURNS INTO CASH VIA ENGINE DEPLOYMENTS.',
  'RUN ALGORITHMIC TRADING BOTS THAT PAY YOU OUT.',
  'CASINO MODULES: SLOTS, ROULETTE, CRASH, HIGH-ROLLERS, TABLE GAMES.',
  'SPORTS BETTING + WEEKLY LOTTERIES BUILT INTO THE GRID.',
  'MISSIONS PAY XP FOR COMPLETING TASKS.',
  'CHAIN INVITES STACK PASSIVE XP INTO YOUR ACCOUNT.',
  'QR UPLINKS RECRUIT NEW OPERATORS WHILE YOU SLEEP.',
  'RUN ENGINES BUILT FOR STOCKS, CRYPTO, AND MARKET EVENTS.',
  'SWAP XP INTO REAL-WORLD CASH THROUGH THE AUTONOMY BRIDGE.',
  'XP SHOP FOR DIGITAL GOODS, UPGRADES, AND POWER BOOSTS.',
  'KIDS MODE: EARN XP BY LEARNING REAL TRADES AND SKILLS.',
  '70/30 FAMILY XP SPLIT — 70% SAVINGS FOR THE FUTURE, 30% IMMEDIATE USE.',
  'EVERY CHILD’S EARNINGS ARE LOCKED AND PROTECTED UNTIL AGE 18.',
  'MULTI-LAYER FRAUD AND FREEZE SYSTEM — WE WATCH EVERYTHING.',
  'BADGE + ROLE PROGRESSION UNLOCKS ENGINES, GAMES, AND MARKETS.',
  'XP TIERS CLIMB FROM OBSERVER TO QUANTUM PRIME.',
  'EVERY ACTION IS LOGGED. EVERY MOVE IS TRACKED.',
  'PLAY HARD, EARN FAST, CASH OUT SMART.',
  'THIS IS A SYSTEM THAT PRINTS VALUE ON YOUR TERMS.',
  'WELCOME TO THE NEW ERA OF INNOVATIVE AND AUTONOMOUS INCOME.',
];

type Props = {
  /** Called once after the final line renders + holdMs delay */
  onComplete?: () => void;
  /** Milliseconds between lines appearing */
  speedMs?: number;
  /** Milliseconds to hold after the last line before calling onComplete */
  holdMs?: number;
  /** Override the boot script */
  lines?: string[];
};

const CRTBootFX: React.FC<Props> = ({
  onComplete,
  speedMs = 150,
  holdMs = 1500,
  lines = DEFAULT_LINES,
}) => {
  const [index, setIndex] = useState(0);
  const doneRef = useRef(false);

  useEffect(() => {
    if (index < lines.length) {
      const t = setTimeout(() => setIndex((i) => i + 1), speedMs);
      return () => clearTimeout(t);
    }
    if (!doneRef.current) {
      doneRef.current = true;
      const t = setTimeout(() => onComplete?.(), holdMs);
      return () => clearTimeout(t);
    }
  }, [index, lines.length, speedMs, holdMs, onComplete]);

  return (
    <div className={styles.crtScreen}>
      <pre className={styles.bootText}>{lines.slice(0, index).join('\n')}</pre>
      <div className={styles.scanlines} />
    </div>
  );
};

export default CRTBootFX;
