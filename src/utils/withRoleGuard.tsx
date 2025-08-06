 // utils/withRoleGuard.tsx
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import supabase from './supabaseClient';

export function withRoleGuard(Component, allowedRoles = []) {
  return function ProtectedComponent(props) {
    const router = useRouter();

    useEffect(() => {
      async function checkAccess() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return router.push('/onboarding');

        const { data: profile } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (!allowedRoles.includes(profile?.role)) {
          router.push('/dashboard');
        }
      }
      checkAccess();
    }, []);

    return <Component {...props} />;
  };
}