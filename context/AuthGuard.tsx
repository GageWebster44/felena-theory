 // context/AuthGuard.tsx

import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useOperator } from './OperatorContext';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const operator = useOperator();
  const router = useRouter();

  // Prevent infinite redirect if already on /auth
  useEffect(() => {
    if (!operator && router.pathname !== '/auth') {
      router.push('/auth'); // Redirect if not signed in
    }
  }, [operator, router]);

  // Optional: prevent flash of blank screen by showing a loader
  if (operator === undefined) {
    return <div style={{ color: '#0ff', textAlign: 'center' }}>🔐 Checking credentials...</div>;
  }

  // If still not authenticated, and on /auth, allow auth page to render
  if (!operator && router.pathname === '/auth') {
    return children;
  }

  // If not logged in but not on /auth, block rendering
  if (!operator) return null;

  return children;
}