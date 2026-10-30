'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/hooks/useSession';
import { LoginForm } from '@/components/auth/LoginForm';
import { AppLoader } from '@/components/ui/AppLoader';

export default function LoginPage() {
  const { isAuthenticated, isLoading } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <AppLoader
        fullscreen
        message="Loading login..."
        subMessage="Zakir Tahmeel • Logistics Delivery Order"
        size="md"
      />
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 p-4">
      <LoginForm />
    </main>
  );
}
