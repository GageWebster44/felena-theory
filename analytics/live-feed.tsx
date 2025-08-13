 import { useEffect, useState } from 'react';
import { withGuardianGate } from '@/components/withGuardianGate';
import styles from '@/styles/crtLaunch.module.css';

function LiveFeed() {
export default withGuardianGate(Page);
  const [quotes, setQuotes] = useState<string[]>([]);

  useEffect(() => {
    const symbols = ['TSLA', 'AAPL', 'NVDA', 'SPY'];
    const interval = setInterval(() => {
      const newQuotes = symbols.map((symbol) => {
        const price = (Math.random() * 1000).toFixed(2);
        const change = Math.random() > 0.5 ? '▲' : '▼';
        return `${symbol} ${change} ${price}`;
      });
      setQuotes(newQuotes);
    }, 2500);

    return () => clearInterval(interval);
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

  }, []);

  return (
    <div className={styles.crtScreen}>
      <h2>📡 LIVE MARKET FEED</h2>
      <div className={styles.tickerTape}>
        {quotes.map((quote, i) => (
          <div key={i} className={styles.quoteItem}>{quote}</div>
        ))}
      </div>
    </div>
  );
}