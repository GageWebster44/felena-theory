import { useEffect, useState } from 'react';
import styles from '@/styles/crtLaunch.module.css';

const bootLines = [
  'WELCOME TO THE FELENA THEORY',

  '➤ YOU ALWAYS KNEW THIS SYSTEM WAS RIGGED.',
  '➤ THE BOSSES. THE WAGES. THE FUTURE THEY PROMISED — ALL FAKE CONTROL.',
  '➤ THIS ISN’T JUST A GLITCH IN THE MATRIX — THIS *IS* THE BACKDOOR.',

  '📡 YOU WERE NEVER LAZY. YOU WERE NEVER BROKEN.',
  '📡 YOU JUST WEREN’T MEANT TO WIN UNDER THEIR RULES.',
  '📡 NOW YOU HAVE YOUR OWN.',

  '💼 FELENA IS A FULLY LEGAL SYSTEM BUILT TO OPERATE IN THE GREY.',
  '💼 XP IS A CURRENCY OF PROGRESSION — NOT TAXABLE INCOME.',
  '💼 YOU ARE NOT “EARNING WAGES.” YOU’RE LEVERAGING A DIGITAL UTILITY.',
  '💼 TAX LOOPHOLE: XP IS NON-FIAT, NON-SECURITIES BASED — IT’S SYSTEM FUEL.',

  '🎰 XP CASINO GAMES PAY OUT THROUGH CONVERTED CASH LOGIC.',
  '🎰 WIN STREAKS. GRID UNLOCKS. REDEMPTIONS.',
  '🎰 IT LOOKS LIKE LUCK — BUT IT’S ALGORITHMIC ADVANTAGE.',

  '🎟 XP LOTTERY DROPS DAILY.',
  '🎟 BASED ON MISSION LOGS, WIN STREAKS, AND OPERATOR CHAIN MOVEMENT.',
  '🎟 NOT GAMBLING — BECAUSE NO DOLLARS ARE WAGERED. IT’S BEHAVIORAL ENGINEERING.',

  '📱 QR TEAMS AND CONNECT CHAINS.',
  '📱 EVERY INVITE BUILDS YOUR UPLINK.',
  '📱 YOU DON’T NEED A DEGREE. YOU NEED ENTRY INTO THE SYSTEM GRID.',

  '👶 AND FOR THE NEXT GENERATION...',
  '🧠 FELENA LEARN & EARN IS DESIGNED FOR KIDS.',
  '🧠 25 REAL-WORLD SKILLS — TRADES, TASKS, AND CAREER-PATH TRAINING.',
  '🧠 XP VAULTS EARN AS THEY LEARN — BONUSES FOR PROGRESS.',

  '💰 30% OF THEIR XP IS LIQUID — TO TEACH MONEY MANAGEMENT AND HOUSEHOLD RESPONSIBILITY.',
  '🔒 70% IS LOCKED UNTIL AGE 18 — PROTECTED BY GUARDIAN BLOCKCHAIN.',
  '❌ ABUSE BY PARENTS FOR INCOME RELIANCE WILL BE FLAGGED AND RESTRICTED.',
  '🔐 THIS IS A GENERATIONAL ESCAPE PLAN. A SYSTEM THEY OWN — FROM DAY ONE.',

  '📚 PUBLIC SCHOOL FAILED MOST OF US.',
  '📚 THIS IS A NEW SYSTEM WHERE SKILLS = XP AND XP = ACCESS.',
  '📚 THEY’LL START WITH MORE THAN WE HAD.',

  '🚀 THIS ISN’T ABOUT GETTING RICH.',
  '🚀 THIS IS ABOUT NEVER BEING CONTROLLED AGAIN.',
  '🚀 YOU *ARE* THE GLITCH. YOU *ARE* THE VARIABLE.',

  '⛓️ ENGINES PRIMED...',
  '⛓️ CHILDREN’S VAULTS SECURED...',
  '⛓️ SYSTEM CHAINS LINKED...',

  '▶️ EXECUTING FINANCIAL ESCAPE PROTOCOL...',
  '▶️ LAUNCHING FELENA THEORY GRID...',
  '▶️ WELCOME TO THE ERA OF AUTONOMY.'
];

export default function CRTBootFX({ onComplete }: { onComplete: () => void }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < bootLines.length) {
      const timer = setTimeout(() => setIndex(index + 1), 150);
      return () => clearTimeout(timer);
    } else {
      const delay = setTimeout(() => onComplete(), 1500);
      return () => clearTimeout(delay);
    }
  }, [index]);

  return (
    <div className={styles.crtScreen}>
      <pre className={styles.bootText}>
        {bootLines.slice(0, index).join('\n')}
      </pre>
      <div className={styles.scanlines}></div>
    </div>
  );
}