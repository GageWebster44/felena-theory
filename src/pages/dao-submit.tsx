import { useState, useEffect } from 'react';
import { withGuardianGate } from '@/components/withGuardianGate';
import supabase from '@/utils/supabaseClient';
import styles from '@/styles/crtLaunch.module.css';
import playSound from '@/utils/playSound';

function DAOSubmit() {
export default withGuardianGate(Page);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('');
  const [role, setRole] = useState('');
  const [xp, setXP] = useState(0);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role, xp')
        .eq('id', user.id)
        .single();

      if (profile) {
        setRole(profile.role);
        setXP(profile.xp || 0);
      }
    })();
  }, []);

  const handleSubmit = async () => {
    if (!title || !description) {
      setStatus('❌ Title and description required.');
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('dao_proposals').insert({
      title,
      description,
      user_id: user.id,
    });

    if (error) {
      setStatus('❌ Error submitting proposal.');
    } else {
      playSound('win-chime');
      setStatus('✅ Proposal submitted.');
      setTitle('');
      setDescription('');
    }
  };

  if (role !== 'admin' && role !== 'developer' && xp < 1000) {
    return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

      <div className={styles.crtScreen}>
        <h2>🚫 Access Restricted</h2>
        <p>You need 1000+ XP or elevated role to submit DAO proposals.</p>
      </div>
    );
  }

  return (
    <div className={styles.crtScreen}>
      <h2>📨 SUBMIT DAO PROPOSAL</h2>
      <p>Propose a new rule, feature, or policy to be voted on by qualified Operators.</p>

      <input
        className={styles.crtInput}
        placeholder="Proposal Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        className={styles.crtInput}
        placeholder="Describe your proposal in detail..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={5}
      />

      <button className={styles.crtButton} onClick={handleSubmit}>Submit Proposal</button>

      {status && <p style={{ marginTop: '1rem', color: status.startsWith('✅') ? '#0f0' : '#f00' }}>{status}</p>}
    </div>
  );
}