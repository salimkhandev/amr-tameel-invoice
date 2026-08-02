'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { generateOrderId } from '@/lib/id';
import { DEFAULT_DELIVERY_ORDER } from '@/lib/constants';
import { DeliveryOrder } from '@/types/delivery-order';

export default function NewOrderPage() {
  const router = useRouter();
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    const newId = generateOrderId();
    const now = new Date().toISOString();
    const today = new Date();
    const todayFormatted = today.toISOString().split('T')[0];
    
    // Calculate receipt date (5 days from today)
    const receiptDate = new Date(today);
    receiptDate.setDate(receiptDate.getDate() + 5);
    const receiptDateFormatted = receiptDate.toISOString().split('T')[0];

    const newOrder: DeliveryOrder = {
      ...DEFAULT_DELIVERY_ORDER,
      id: newId,
      createdAt: now,
      updatedAt: now,
      receiptDate: receiptDateFormatted,
      deliveryDate: todayFormatted,
    };

    // Store order in sessionStorage for the edit page
    sessionStorage.setItem('currentOrder', JSON.stringify(newOrder));
    setOrderId(newId);
  }, []);

  useEffect(() => {
    if (orderId) {
      router.replace(`/order/edit?id=${orderId}`);
    }
  }, [orderId, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 font-cairo">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-[#204978] border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-semibold text-gray-600">Preparing new invoice...</span>
      </div>
    </div>
  );
}
