import { useState } from 'react';
import { withGuardianGate } from '@/components/withGuardianGate';
import styles from '@/styles/crtLaunch.module.css';
import { supabase } from '@/utils/supabaseClient';
import { useRouter } from 'next/router';

function GuardianPage() {
export default withGuardianGate(Page);
  const [form, setForm] = useState({ name: '', email: '', relation: '', agree: false });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.relation || !form.agree) {
      return alert('Please complete all fields and agree to continue.');
    }
    setSubmitting(true);

    const user = await supabase.auth.getUser();
    if (!user?.data?.user?.id) return alert('User not found');

    const { error } = await supabase.from('guardian_consent').insert([
      {
        user_id: user.data.user.id,
        name: form.name,
        email: form.email,
        relation: form.relation,
        agreed: form.agree,
        timestamp: new Date().toISOString(),
      },
    ]);

    if (error) {
      alert('Error saving agreement.');
    } else {
      setSubmitted(true);
      setTimeout(() => router.push('/xp-kids'), 1500);
    }
    setSubmitting(false);
  };

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtScreen}>
      <h1>👨‍👩‍👧 Guardian Onboarding</h1>
      <p>This agreement protects your child’s earnings and guarantees their XP is safely held for the future.</p>

      <label>
        Full Name:
        <input
          className={styles.crtInput}
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
        />
      </label>

      <label>
        Email Address:
        <input
          className={styles.crtInput}
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
        />
      </label>

      <label>
        Relationship to Child:
        <input
          className={styles.crtInput}
          type="text"
          name="relation"
          value={form.relation}
          onChange={handleChange}
        />
      </label>

      <label>
        <input
          type="checkbox"
          name="agree"
          checked={form.agree}
          onChange={handleChange}
        />{' '}
        I agree that 70% of my child’s XP will remain locked until they are of legal age. I understand this system is built to empower, not exploit.
      </label>

      <button
        className={styles.crtButton}
        onClick={handleSubmit}
        disabled={submitting || !form.agree}
        style={{ marginTop: '1rem' }}
      >
        {submitting ? 'Submitting...' : 'Submit & Continue'}
      </button>

      {submitted && <p style={{ marginTop: '1rem', color: '#00ff99' }}>✔️ Agreement recorded. Redirecting...</p>}

      <div style={{ marginTop: '2rem', fontSize: '0.85rem', color: '#aaa' }}>
        <p>🔐 This agreement establishes digital custody of your child’s XP wallet.</p>
        <p>All XP earned inside the Kids Zone is locked in their name — not yours — and will only become fully accessible once verified as legal age.</p>
        <p>✅ This helps guarantee your child’s early contributions are protected — not harvested or withdrawn.</p>
        <p>💡 You can return to this panel in the future to monitor XP progress or submit updates.</p>
      </div>
    </div>
  );
}