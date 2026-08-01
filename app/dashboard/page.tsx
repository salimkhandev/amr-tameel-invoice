'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AuthGate } from '@/components/auth/AuthGate';
import { AppHeader } from '@/components/layout/AppHeader';
import { RecentHistoryPanel } from '@/components/dashboard/RecentHistoryPanel';
import { UserManagementPanel } from '@/components/admin/UserManagementPanel';
import { WelcomeFlashScreen } from '@/components/ui/WelcomeFlashScreen';
import { useSession } from '@/hooks/useSession';
import { PlusCircle } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useSession();
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    // Check if this is a fresh login (not a page refresh)
    const hasShownWelcome = sessionStorage.getItem('welcomeShown');
    if (!hasShownWelcome && user) {
      setShowWelcome(true);
      sessionStorage.setItem('welcomeShown', 'true');
    }
  }, [user]);

  const handleWelcomeComplete = () => {
    setShowWelcome(false);
  };

  return (
    <AuthGate>
      {showWelcome && user && (
        <WelcomeFlashScreen
          userName={user.full_name || user.username}
          onComplete={handleWelcomeComplete}
        />
      )}
      <div className="min-h-screen bg-gray-50 flex flex-col font-cairo">
        <AppHeader />

        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Welcome Message */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 shadow-sm">
                <h2 className="font-bold text-base sm:text-lg text-[#204978] mb-3">
                  Welcome, {user?.full_name || user?.username}!
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Click "Create New Delivery Order" to generate a new delivery order. 
                  When you download the PDF, it will be automatically saved to your recent downloads list.
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="font-semibold">Note:</span>
                  <span>Only the 5 most recent downloads are stored for quick access.</span>
                </div>
              </div>

              {/* User Management Panel - Only for admins */}
              <UserManagementPanel />
            </div>

            {/* Right Column: Recent Invoices IndexedDB Panel */}
            <div className="lg:col-span-1">
              <RecentHistoryPanel />
            </div>
          </div>
        </main>
      </div>
    </AuthGate>
  );
}
