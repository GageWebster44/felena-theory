 import { useState } from 'react';
import { withGuardianGate } from '@/components/withGuardianGate';
import styles from '@/styles/crtLaunch.module.css';
import playSound from '@/utils/playSound';
import { logXP } from '@/utils/logXP';
import { triggerXPBurst } from '@/utils/triggerXPBurst';

const suits = ['♠️', '♥️', '♦️', '♣️'];
const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

function getRandomCard() {
  const suit = suits[Math.floor(Math.random() * suits.length)];
  const value = values[Math.floor(Math.random() * values.length)];
  return `${value}${suit}`;
}

function getCardStrength(card: string): number {
  const value = card.slice(0, -1);
  return values.indexOf(value);
}

function XPCardsGame() {
export default withGuardianGate(Page);
  const [playerCard, setPlayerCard] = useState('❓');
  const [opponentCard, setOpponentCard] = useState('❓');
  const [message, setMessage] = useState('');

  const play = async () => {
    playSound('tile-click');

    const player = getRandomCard();
    const opponent = getRandomCard();

    setPlayerCard(player);
    setOpponentCard(opponent);

    const playerStrength = getCardStrength(player);
    const opponentStrength = getCardStrength(opponent);

    if (playerStrength > opponentStrength) {
      setMessage(`WINNER: ${player} beats ${opponent} → +50 XP`);
      playSound('win-chime');
      triggerXPBurst();
      await logXP('cards_win', 50, `Won with ${player} vs ${opponent}`);
    } else if (playerStrength < opponentStrength) {
      setMessage(`LOSS: ${opponent} beats ${player}`);
      playSound('deny-glitch');
      await logXP('cards_loss', -15, `Lost with ${player} vs ${opponent}`);
    } else {
      setMessage(`DRAW: ${player} ties ${opponent}`);
      await logXP('cards_draw', 0, `Drew with ${player}`);
    }
  };

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtScreen}>
      <h2>♠️ HIGH ROLLERS CARD DUEL ♠️</h2>
      <p>Draw a card. Beat your opponent. Only for the elite.</p>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '5rem',
          margin: '2rem 0',
          fontSize: '3rem'
        }}
      >
        <div className={styles.gameCard}>{playerCard}</div>
        <div className={styles.gameCard}>{opponentCard}</div>
      </div>
      <button onClick={play} className={styles.crtButton}>
        DRAW
      </button>
      {message && (
        <div className={styles.successNote} style={{ marginTop: '1rem' }}>
          {message}
        </div>
      )}
    </div>
  );
}