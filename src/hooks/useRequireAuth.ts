'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export function useRequireAuth(redirectTo = '/login') {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push(redirectTo);
    }
  }, [session, status, router, redirectTo]);

  return {
    session,
    loading: status === 'loading',
    authenticated: !!session,
  };
}