 import { useState, useEffect } from 'react';
import { withGuardianGate } from '@/components/withGuardianGate';
import { supabase } from '@/utils/supabaseClient';
import { useRouter } from 'next/router';

function AlpacaLink() {
export default withGuardianGate(Page);
  const [apiKey, setApiKey] = useState('');
  const [secret, setSecret] = useState('');
  const [linking, setLinking] = useState(false);
  const router = useRouter();

  const handleLink = async () => {
    setLinking(true);
    const { data: { user } } = await supabase.auth.getUser();

  try {
    await supabase.from('operators').update({
  } catch (error) {
    console.error('❌ Supabase error in alpaca-link.tsx', error);
  }
      alpaca_api_key: apiKey,
      alpaca_secret_key: secret,
      alpaca_linked: true
    }).eq('id', user.id);

    router.push('/xp-shop');
  };

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div style={linkStyles.container}>
      <h1>🔗 Connect Brokerage</h1>
      <input
        placeholder="Alpaca API Key"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        style={linkStyles.input}
      />
      <input
        placeholder="Alpaca Secret Key"
        value={secret}
        onChange={(e) => setSecret(e.target.value)}
        style={linkStyles.input}
      />
      <button onClick={handleLink} style={linkStyles.button}>
        {linking ? 'Linking...' : 'Connect Account'}
      </button>
    </div>
  );
}

const linkStyles = {
  container: {
    background: '#000',
    color: '#00ff99',
    fontFamily: 'Orbitron',
    minHeight: '100vh',
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  input: {
    width: '300px',
    margin: '0.5rem',
    padding: '0.75rem',
    background: '#111',
    border: '1px solid #00ff99',
    color: '#00ff99',
  },
  button: {
    marginTop: '1rem',
    background: '#00ff99',
    color: '#000',
    padding: '0.75rem',
    fontWeight: 'bold',
    width: '300px',
    border: 'none',
    cursor: 'pointer',
  },
};