import { useRouter } from 'next/router';
import { useState } from 'react';
import { withGuardianGate } from '@/components/withGuardianGate';
import CRTBootFX from '@/components/CRTBootFX';

function IndexPage() {
export default withGuardianGate(Page);
  const router = useRouter();
  const [booted, setBooted] = useState(false);

  if (!booted) {
    return <CRTBootFX onComplete={() => setBooted(true)} />;
  }

  // Redirect after boot completes
  router.push('/crtLauncher');
  return null;
}