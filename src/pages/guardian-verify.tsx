import { useState } from 'react';
import { withGuardianGate } from '@/components/withGuardianGate';
import { useRouter } from 'next/router';
import supabase from '@/utils/supabaseClient';
import styles from '@/styles/crtLaunch.module.css';

function GuardianVerifyPage() {
export default withGuardianGate(Page);
  const router = useRouter();
  const [form, setForm] = useState({
    childEmail: '',
    guardianEmail: '',
    name: '',
    relation: '',
    agreed: false,
  });
  const [status, setStatus] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('');

    if (!form.agreed) {
      setStatus('❌ Consent must be given to continue.');
      return;
    }

    const { error } = await supabase.from('guardian_consent').insert({
      child_email: form.childEmail,
      email: form.guardianEmail,
      name: form.name,
      relation: form.relation,
      timestamp: new Date().toISOString(),
      agreed: true,
    });

    if (error) {
      console.error(error);
      setStatus('❌ Submission failed. Try again.');
    } else {
      setStatus('✅ Consent logged successfully.');
      localStorage.setItem('guardianVerified', 'true');
      router.push('/dashboard');
    }
  };

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtScreen}>
      <h1 className="text-2xl font-bold text-center text-green-400 mb-4">🛡 GUARDIAN VERIFICATION</h1>
      <p className="text-center text-sm text-cyan-300 mb-6">
        A guardian must approve access for minors. This verifies intent and legal compliance.
      </p>

      <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-4 font-mono">
        <input
          className={styles.crtInput}
          type="email"
          name="childEmail"
          placeholder="Child's Email"
          value={form.childEmail}
          onChange={handleChange}
          required
        />
        <input
          className={styles.crtInput}
          type="email"
          name="guardianEmail"
          placeholder="Guardian's Email"
          value={form.guardianEmail}
          onChange={handleChange}
          required
        />
        <input
          className={styles.crtInput}
          type="text"
          name="name"
          placeholder="Guardian Name"
          value={form.name}
          onChange={handleChange}
          required
        />
        <select
          name="relation"
          className={styles.crtInput}
          value={form.relation}
          onChange={handleChange}
          required
        >
          <option value="">Select Relation</option>
          <option value="Parent">Parent</option>
          <option value="Legal Guardian">Legal Guardian</option>
          <option value="Relative">Relative</option>
          <option value="Other">Other</option>
        </select>

        <label className="text-sm text-gray-400">
          <input
            type="checkbox"
            name="agreed"
            checked={form.agreed}
            onChange={handleChange}
            className="mr-2"
          />
          I consent to allow the above child to use this platform for educational and gamified purposes.
        </label>

        <button type="submit" className={`${styles.crtButton} w-full`}>
          ✅ Submit Guardian Consent
        </button>

        {status && (
          <p className="mt-2 text-center" style={{ color: status.startsWith('✅') ? '#0f0' : '#f44' }}>
            {status}
          </p>
        )}
      </form>

      <div className="mt-10 text-xs text-center text-gray-500 max-w-md mx-auto">
        Felena Theory complies with digital guardian standards. Submissions are stored and timestamped.
      </div>
    </div>
  );
}