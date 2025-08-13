import { useState } from 'react';
import { withGuardianGate } from '@/components/withGuardianGate';
import styles from '@/styles/crtLaunch.module.css';
import { supabase } from '@/utils/supabaseClient';

function GuardianSignup() {
export default withGuardianGate(Page);
  const [form, setForm] = useState({
    child_email: '',
    guardian_email: '',
    child_name: '',
    child_age: '',
    guardian_name: '',
    relation: '',
    agreed: false,
  });
  const [message, setMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    const { error } = await supabase.from('guardian_consent').insert({
      ...form,
      verified: false,
    });

    if (error) {
      setMessage('❌ Submission failed. Please try again.');
    } else {
      setMessage('✅ Submitted! Guardian consent recorded.');
    }
  };

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtScreen}>
      <h2>👨‍👩‍👧 Guardian Consent Form</h2>
      <p>Fill out this form to allow your child to use Felena Kids Zone XP programs.</p>
      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        <input className={styles.crtInput} name="child_email" placeholder="Child's Email" onChange={handleChange} required />
        <input className={styles.crtInput} name="child_name" placeholder="Child's Name" onChange={handleChange} required />
        <input className={styles.crtInput} name="child_age" type="number" placeholder="Child's Age" onChange={handleChange} required />
        <input className={styles.crtInput} name="guardian_email" placeholder="Guardian Email" onChange={handleChange} required />
        <input className={styles.crtInput} name="guardian_name" placeholder="Guardian Full Name" onChange={handleChange} required />
        <select name="relation" className={styles.crtInput} onChange={handleChange} required>
          <option value="">Select Relationship</option>
          <option value="Parent">Parent</option>
          <option value="Guardian">Guardian</option>
          <option value="Grandparent">Grandparent</option>
        </select>
        <label className="text-sm text-yellow-400">
          <input type="checkbox" name="agreed" onChange={handleChange} required className="mr-2" />
          I consent to my child participating in XP-based educational programs.
        </label>
        <button type="submit" className={styles.crtButton}>Submit Consent</button>
        {message && <p className="mt-2 text-green-400">{message}</p>}
      </form>
    </div>
  );
}