'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from '@/hooks/useSession';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { FileText, PlusCircle, LogOut, WifiOff } from 'lucide-react';

export const AppHeader: React.FC = () => {
  const { logout, user } = useSession();
  const isOnline = useOnlineStatus();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="w-full bg-[#204978] text-white shadow-md font-cairo border-b border-[#18365a]">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* Left: Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-white/10 hover:bg-white/20 rounded transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>

          {!isOnline && (
            <div className="flex items-center gap-1 px-2.5 py-1 bg-amber-500/20 text-amber-200 text-xs rounded border border-amber-500/40">
              <WifiOff className="w-3.5 h-3.5" />
              <span>Offline Mode</span>
            </div>
          )}
        </div>

        {/* Center/Right: Navigation & Brand */}
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg hover:opacity-90">
            <FileText className="w-6 h-6 text-blue-300" />
            <span>Delivery Order</span>
          </Link>

          <nav className="flex items-center gap-4 text-sm font-semibold">
            <Link
              href="/dashboard"
              className="hover:text-blue-200 transition-colors hidden sm:inline"
            >
              Dashboard
            </Link>
            <Link
              href="/order/new"
              className="flex items-center gap-1 bg-blue-500/30 hover:bg-blue-500/40 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>New Order</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};
