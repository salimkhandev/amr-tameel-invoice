'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/hooks/useSession';

import { AppLoader } from '@/components/ui/AppLoader';

interface AuthGateProps {
  children: React.ReactNode;
}

export const AuthGate: React.FC<AuthGateProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <AppLoader
        fullscreen
        message="التحقق من تسجيل الدخول..."
        subMessage="ذاكر تحميل • Zakir Tahmeel"
        size="md"
      />
    );
  }

  return <>{children}</>;
};
