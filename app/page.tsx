'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/hooks/useSession';
import { AppLoader } from '@/components/ui/AppLoader';

export default function RootPage() {
  const { isAuthenticated, isLoading } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <AppLoader
      fullscreen
      message="Entering system..."
      subMessage="Zakir Tahmeel • Logistics Delivery Order"
      size="lg"
    />
  );
}
