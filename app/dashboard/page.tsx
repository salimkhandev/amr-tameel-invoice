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
              <div className="relative overflow-hidden bg-gradient-to-br from-[#1b3d64] via-[#204978] to-[#153152] p-5 sm:p-7 rounded-2xl text-white shadow-lg border border-blue-900/30">
                <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-blue-400/10 rounded-full blur-2xl pointer-events-none" />
                <div className="relative z-10 flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-200 text-xs font-semibold border border-blue-400/30">
                      Main Dashboard
                    </span>
                    <span className="text-xs text-blue-200">Zakir Tahmeel</span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-wide">
                    Welcome back, {user?.full_name || user?.username}!
                  </h2>
                  <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed max-w-xl">
                    Logistics delivery order and shipment management platform. Click "Create New Delivery Order" to generate, edit, and print official invoices.
                  </p>
                </div>
              </div>

              {/* Create Invoice Button */}
              <Link
                href="/order/new"
                className="group flex items-center justify-center gap-3 px-6 py-3.5 bg-gradient-to-r from-[#204978] to-[#1a3c63] hover:from-[#18365a] hover:to-[#122740] text-white font-extrabold rounded-xl shadow-md hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 text-sm sm:text-base border border-blue-900/40"
              >
                <PlusCircle className="w-5 h-5 text-blue-300 group-hover:rotate-90 transition-transform duration-300" />
                <span>Create New Delivery Order</span>
              </Link>

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
