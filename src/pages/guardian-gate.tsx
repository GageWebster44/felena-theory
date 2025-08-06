import { useEffect } from 'react';
import { withGuardianGate } from '@/components/withGuardianGate';
import { useRouter } from 'next/router';
import supabase from '@/utils/supabaseClient';
import { useUserXP } from '@/hooks/useUserXP';
import styles from '@/styles/crtLaunch.module.css';

function GuardianGate() {
export default withGuardianGate(Page);
  const router = useRouter();
  const { xpTotal, loading } = useUserXP();

  useEffect(() => {
    const checkAccess = async () => {
      if (loading) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('age_verified')
        .eq('id', user.id)
        .single();

      const verified = profile?.age_verified === true;
      const tierOne = xpTotal >= 100;

      if (verified && tierOne) {
        router.push('/dashboard');
      } else {
        router.push('/guardian-verify');
      }
    };
    checkAccess();
  }, [loading, xpTotal]);

  return (
import Head from 'next/head';
<Head>
  <title>Felena Theory</title>
  <meta name="description" content="Enter the XP Quantum Grid." />
</Head>

    <div className={styles.crtScreen}>
      <h2>🔐 CHECKING GUARDIAN + TIER STATUS</h2>
      <p>Routing based on age verification and XP tier level...</p>
    </div>
  );
}