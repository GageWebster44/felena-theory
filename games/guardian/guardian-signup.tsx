import { useState } from 'react';
import { withGuardianGate } from '@/components/withGuardianGate';
import { useRouter } from 'next/router';
import { supabase } from '@/utils/supabaseClient';
import styles from '@/styles/crtLaunch.module.css';

function GuardianSignup() {
export default withGuardianGate(Page);
  const [childEmail, setChildEmail] = useState('');
  const [guardianEmail, setGuardianEmail] = useState('');
  const [relation, setRelation] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    if (!childEmail || !guardianEmail || !relation || !agreed) {
      setErrorMsg('❌ Please complete all fields and agree to terms.');
      setLoading(false);
      return;
    }

    const { error } = await supabase.from('guardian_consent').insert({
      child_email: childEmail,
      guardian_email: guardianEmail,
      relation,
      agreed: true,
      verified: false,
      timestamp: new Date().toISOString()
    });

    if (error) {
      setErrorMsg('❌ Submission failed. Please try again.');
      setLoading(false);
      return;
    }

    router.push('/guardian-gate'); // redirect to holding or instructions screen
  };

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtScreen}>
      <h2>👨‍👩‍👧 GUARDIAN SIGN-UP</h2>
      <p className="text-sm text-yellow-400">
        Parental/guardian approval is required for continued access.
      </p>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <input
          className={styles.crtInput}
          placeholder="Child's Email"
          value={childEmail}
          onChange={(e) => setChildEmail(e.target.value)}
          required
        />
        <input
          className={styles.crtInput}
          placeholder="Guardian Email"
          value={guardianEmail}
          onChange={(e) => setGuardianEmail(e.target.value)}
          required
        />
        <input
          className={styles.crtInput}
          placeholder="Relation (e.g., Parent, Legal Guardian)"
          value={relation}
          onChange={(e) => setRelation(e.target.value)}
          required
        />

        <label className="flex items-center space-x-2 text-sm">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
          />
          <span>I approve this account under Felena Theory’s guardian protocol.</span>
        </label>

        <button
          type="submit"
          className={styles.crtButton}
          disabled={loading}
        >
          {loading ? '⏳ Sending...' : '✅ Submit Consent'}
        </button>

        {errorMsg && <p className="text-red-500 text-sm mt-2">{errorMsg}</p>}
      </form>

      <div className="text-xs text-gray-400 mt-6">
        This form is logged securely. No personal data is used beyond verification.
      </div>
    </div>
  );
}