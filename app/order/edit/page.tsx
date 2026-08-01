'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthGate } from '@/components/auth/AuthGate';
import { AppHeader } from '@/components/layout/AppHeader';
import { BottomActionBar } from '@/components/layout/BottomActionBar';
import { DeliveryOrderTemplate } from '@/components/template/DeliveryOrderTemplate';
import { PdfPreviewScaler } from '@/components/pdf/PdfPreviewScaler';
import { PdfDownloadButton } from '@/components/pdf/PdfDownloadButton';
import { ShareToWhatsAppButton } from '@/components/pdf/ShareToWhatsAppButton';
import { DeliveryOrder } from '@/types/delivery-order';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

function OrderEditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const templateRef = useRef<HTMLDivElement>(null);

  const [order, setOrder] = useState<DeliveryOrder | null>(null);

  useEffect(() => {
    if (id) {
      // Try to get order from sessionStorage (for new orders only)
      const sessionOrder = sessionStorage.getItem('currentOrder');
      if (sessionOrder) {
        const parsed = JSON.parse(sessionOrder);
        if (parsed.id === id) {
          setOrder(parsed);
          return;
        }
      }
      
      // If not in sessionStorage, redirect to dashboard (no editing of previous orders)
      router.replace('/dashboard');
    } else {
      router.replace('/dashboard');
    }
  }, [id, router]);

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 font-cairo">
        <div className="w-8 h-8 border-4 border-[#204978] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleOrderChange = (updated: DeliveryOrder) => {
    setOrder(updated);
    // Update sessionStorage
    sessionStorage.setItem('currentOrder', JSON.stringify(updated));
  };

  return (
    <AuthGate>
      <div className="min-h-screen bg-slate-300 flex flex-col font-cairo">
        <AppHeader />

        {/* Toolbar */}
        <div className="bg-white border-b border-gray-200 py-2 sm:py-3 px-4 shadow-sm sticky top-0 z-40">
          <div className="max-w-5xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                title="Back to Dashboard"
              >
                <ArrowRight className="w-5 h-5" />
              </Link>
              <div className="flex flex-col">
                <h1 className="font-bold text-gray-900 text-sm sm:text-base">
                  Invoice #{order.invoiceNumber}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2 hidden md:flex">
              <PdfDownloadButton templateRef={templateRef} order={order} />
              <ShareToWhatsAppButton templateRef={templateRef} order={order} />
            </div>
          </div>
        </div>

        {/* WYSIWYG — A4 template is the editor */}
        <main className="flex-1 flex flex-col items-center py-2 sm:py-6 pb-24">
          <PdfPreviewScaler>
            {/* onOrderChange enables inline editing directly on the template */}
            <DeliveryOrderTemplate
              ref={templateRef}
              order={order}
              onOrderChange={handleOrderChange}
            />
          </PdfPreviewScaler>
        </main>

        <BottomActionBar templateRef={templateRef} order={order} />
      </div>
    </AuthGate>
  );
}

export default function OrderEditorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 font-cairo">
        <div className="w-8 h-8 border-4 border-[#204978] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <OrderEditorContent />
    </Suspense>
  );
}
