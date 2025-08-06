// components/withGuardianGate.tsx

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import styles from '@/styles/crtLaunch.module.css';

export default function withGuardianGate(WrappedComponent: React.ComponentType<any>) {
  return function GuardianWrapper(props: any) {
    const router = useRouter();
    const [allowed, setAllowed] = useState(false);
    const [checked, setChecked] = useState(false);

    useEffect(() => {
      const verified = localStorage.getItem('isChild') === 'true';
      if (!verified) {
        router.replace('/guardian-gate');
      } else {
        setAllowed(true);
      }
      setChecked(true);
    }, []);

    if (!checked) {
      return (
        <div className={styles.crtScreen}>
          <p>🔐 Verifying guardian gate...</p>
        </div>
      );
    }

    return allowed ? <WrappedComponent {...props} /> : null;
  };
}