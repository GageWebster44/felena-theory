import { useUser } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export function withAdminGate(Component: any) {
  return function ProtectedRoute(props: any) {
    const user = useUser();
    const router = useRouter();

    useEffect(() => {
      if (user && user.user_metadata?.role !== 'admin') {
        router.replace('/404');
      }
    }, [user]);

    if (!user || user.user_metadata?.role !== 'admin') return null;
    return <Component {...props} />;
  };
}