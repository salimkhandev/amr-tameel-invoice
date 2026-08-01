'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from '@/hooks/useSession';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { FileText, PlusCircle, LogOut, WifiOff, Menu, X } from 'lucide-react';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { PwaInstallButton } from '@/components/pwa/PwaInstallButton';

export const AppHeader: React.FC = () => {
  const { logout, user } = useSession();
  const isOnline = useOnlineStatus();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
    setMobileMenuOpen(false);
    setShowLogoutModal(false);
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
    setMobileMenuOpen(false);
  };

  return (
    <header className="w-full bg-[#204978] text-white shadow-md font-cairo border-b border-[#18365a]">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* Left: Brand & PWA Install */}
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg hover:opacity-90">
            <FileText className="w-6 h-6 text-blue-300" />
            <span className="hidden sm:inline">Amar Tameel</span>
            <span className="sm:hidden">AT</span>
          </Link>

          {/* PWA Install Button */}
          <PwaInstallButton />
        </div>

        {/* Right: Actions & Mobile Menu Toggle */}
        <div className="flex items-center gap-3">
          {/* Desktop Navigation */}
          <nav className="hidden sm:flex items-center gap-4 text-sm font-semibold">
            <Link
              href="/dashboard"
              className="hover:text-blue-200 transition-colors"
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

          {/* Offline Indicator */}
          {!isOnline && (
            <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 bg-amber-500/20 text-amber-200 text-xs rounded border border-amber-500/40">
              <WifiOff className="w-3.5 h-3.5" />
              <span>Offline</span>
            </div>
          )}

          {/* Desktop Logout */}
          <button
            onClick={handleLogoutClick}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs bg-white/10 hover:bg-white/20 rounded transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden p-2 text-white hover:bg-white/10 rounded transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-[#18365a] border-t border-[#204978]">
          <nav className="flex flex-col p-4 gap-3">
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-4 py-3 hover:bg-white/10 rounded-lg transition-colors"
            >
              <FileText className="w-5 h-5" />
              <span>Dashboard</span>
            </Link>
            <Link
              href="/order/new"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-4 py-3 hover:bg-white/10 rounded-lg transition-colors"
            >
              <PlusCircle className="w-5 h-5" />
              <span>New Order</span>
            </Link>
            
            {!isOnline && (
              <div className="flex items-center gap-2 px-4 py-3 bg-amber-500/20 text-amber-200 rounded-lg border border-amber-500/40">
                <WifiOff className="w-5 h-5" />
                <span>Offline Mode</span>
              </div>
            )}

            <button
              onClick={handleLogoutClick}
              className="flex items-center gap-2 px-4 py-3 hover:bg-white/10 rounded-lg transition-colors text-left"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </nav>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        title="Confirm Logout"
        message="Are you sure you want to logout? You will need to login again to access the system."
        confirmText="Logout"
        cancelText="Cancel"
        type="warning"
      />
    </header>
  );
};
