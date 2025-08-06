import { useEffect, useState } from 'react';
import supabase from '@/utils/supabaseClient';
import styles from '@/styles/crtLaunch.module.css';
import withGuardianGate from '@/components/withGuardianGate';

export default withGuardianGate(function SettingsPage() {
  const [alias, setAlias] = useState('');
  const [originalAlias, setOriginalAlias] = useState('');
  const [status, setStatus] = useState('');
  const [available, setAvailable] = useState<boolean | null>(null);
  const [engineKey, setEngineKey] = useState('');
  const [badges, setBadges] = useState<string[]>([]);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user) return;

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('alias, engine_key')
      .eq('id', user.user.id)
      .single();

    if (profile) {
      setAlias(profile.alias || '');
      setOriginalAlias(profile.alias || '');
      setEngineKey(profile.engine_key || '');
    }

    const { data: badgeList } = await supabase
      .from('xp_badges')
      .select('label')
      .eq('user_id', user.user.id);

    if (badgeList) setBadges(badgeList.map((b) => b.label));
  };

  const containsBannedWords = (text: string) => {
    const banned = ['hate', 'kill', 'nazi', 'terror', 'rape', 'bomb', 'hitler'];
    return banned.some((word) => text.toLowerCase().includes(word));
  };

  const checkAvailability = async () => {
  try {
    const { data } = await supabase.from('user_profiles').select('id').eq('alias', alias);
  } catch (error) {
    console.error('❌ Supabase error in settings.tsx', error);
  }
    if (data?.length === 0 || (data?.length === 1 && alias === originalAlias)) {
      setAvailable(true);
    } else {
      setAvailable(false);
    }
  };

  const saveAlias = async () => {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user || alias.trim() === '' || containsBannedWords(alias)) {
      setStatus('❌ Invalid alias. Please choose something appropriate.');
      return;
    }

    if (alias === originalAlias) {
      setStatus('⚠️ No changes to save.');
      return;
    }

    const { error } = await supabase
      .from('user_profiles')
      .update({ alias })
      .eq('id', user.user.id);

    if (error) {
      setStatus('❌ Failed to save alias.');
    } else {
      setOriginalAlias(alias);
      setStatus('✅ Alias saved successfully.');
    }
  };

  const saveEngineKey = async () => {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user) return;

    const { error } = await supabase
      .from('user_profiles')
      .update({ engine_key: engineKey })
      .eq('id', user.user.id);

    if (error) {
      setStatus('❌ Engine update failed.');
    } else {
      setStatus('✅ Engine updated.');
    }
  };

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtScreen}>
      <h1>🛠️ OPERATOR SETTINGS</h1>
      <p className="text-yellow-400 text-sm mt-2">
        🎮 Your alias is your public-facing operator tag – like a gamertag inside the system.<br />
        ⚠️ Choose wisely. Offensive, hateful, or misleading usernames are strictly forbidden and subject to removal.
      </p>

      <div style={{ marginTop: '2rem' }}>
        <label className={styles.crtInputLabel}>🎭 Alias / Gamertag</label>
        <input
          className={styles.crtInput}
          value={alias}
          onChange={(e) => setAlias(e.target.value)}
          placeholder="Enter your unique operator name"
        />
        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
          <button onClick={checkAvailability} className={styles.crtButton}>🔍 Check Availability</button>
          <button onClick={saveAlias} className={styles.crtButton}>💾 Save Alias</button>
        </div>
        {available !== null && (
          <p style={{ color: available ? '#0f0' : '#f00' }}>
            {available ? '✅ Alias is available!' : '❌ Alias is taken'}
          </p>
        )}
      </div>

      <div style={{ marginTop: '2rem' }}>
        <label className={styles.crtInputLabel}>🧬 Override Engine Key</label>
        <input
          className={styles.crtInput}
          value={engineKey}
          onChange={(e) => setEngineKey(e.target.value)}
          placeholder="snubnose | jarvis | synapse | comet | vector"
        />
        <button onClick={saveEngineKey} className={styles.crtButton} style={{ marginTop: '0.5rem' }}>
          💾 Save Engine
        </button>
      </div>

      <div style={{ marginTop: '2.5rem' }}>
        <h3 className={styles.crtTitle}>🏅 Badge Preview</h3>
        {badges.length > 0 ? (
          <ul style={{ paddingLeft: '1rem', color: '#0f0' }}>
            {badges.map((b, i) => <li key={i}>✅ {b}</li>)}
          </ul>
        ) : (
          <p style={{ color: '#888' }}>🚫 No badges earned yet.</p>
        )}
      </div>

      {status && (
        <p style={{ marginTop: '2rem', color: status.startsWith('✅') ? '#0f0' : '#f00' }}>
          {status}
        </p>
      )}
    </div>
  );
});