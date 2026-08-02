'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { generateOrderId } from '@/lib/id';
import { DEFAULT_DELIVERY_ORDER } from '@/lib/constants';
import { DeliveryOrder } from '@/types/delivery-order';
import { getRecentInvoices } from '@/lib/history';

export default function NewOrderPage() {
  const router = useRouter();
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    const setupNewOrder = async () => {
      const newId = generateOrderId();
      const now = new Date().toISOString();
      const today = new Date();
      const todayFormatted = today.toISOString().split('T')[0];
      
      // Calculate receipt date (5 days from today)
      const receiptDate = new Date(today);
      receiptDate.setDate(receiptDate.getDate() + 5);
      const receiptDateFormatted = receiptDate.toISOString().split('T')[0];

      // Get the next incremental invoice number
      let nextInvoiceNumber = DEFAULT_DELIVERY_ORDER.invoiceNumber;
      try {
        const recentInvoices = await getRecentInvoices();
        if (recentInvoices.length > 0) {
          // Find the highest invoice number
          const highestInvoice = recentInvoices.reduce((max, invoice) => {
            const currentNum = parseInt(invoice.invoiceNumber, 10);
            const maxNum = parseInt(max.invoiceNumber, 10);
            return currentNum > maxNum ? invoice : max;
          }, recentInvoices[0]);
          
          const highestNum = parseInt(highestInvoice.invoiceNumber, 10);
          const nextNum = highestNum + 1;
          nextInvoiceNumber = nextNum.toString().padStart(5, '0');
        }
      } catch (error) {
        console.error('Failed to get recent invoices for incremental number:', error);
      }

      const newOrder: DeliveryOrder = {
        ...DEFAULT_DELIVERY_ORDER,
        id: newId,
        createdAt: now,
        updatedAt: now,
        invoiceNumber: nextInvoiceNumber,
        receiptDate: receiptDateFormatted,
        deliveryDate: todayFormatted,
      };

      // Store order in sessionStorage for the edit page
      sessionStorage.setItem('currentOrder', JSON.stringify(newOrder));
      setOrderId(newId);
    };

    setupNewOrder();
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
