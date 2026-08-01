'use client';

import React from 'react';
import Link from 'next/link';
import { AuthGate } from '@/components/auth/AuthGate';
import { AppHeader } from '@/components/layout/AppHeader';
import { RecentHistoryPanel } from '@/components/dashboard/RecentHistoryPanel';
import { UserManagementPanel } from '@/components/admin/UserManagementPanel';
import { PlusCircle } from 'lucide-react';

export default function DashboardPage() {
  return (
    <AuthGate>
      <div className="min-h-screen bg-gray-50 flex flex-col font-cairo">
        <AppHeader />

        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-6">
          {/* Top Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <Link
                href="/order/new"
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#204978] hover:bg-[#18365a] text-white font-bold rounded-lg shadow text-sm transition-all w-full sm:w-auto"
              >
                <PlusCircle className="w-5 h-5" />
                <span className="hidden sm:inline">Create New Delivery Order</span>
                <span className="sm:hidden">New Order</span>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Welcome Message */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 shadow-sm">
                <h2 className="font-bold text-base sm:text-lg text-[#204978] mb-3">
                  Welcome to Delivery Order System
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

              {/* User Management Panel */}
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
