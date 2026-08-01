'use client';

import React, { useState, useEffect } from 'react';
import { OrderHistoryEntry } from '@/types/delivery-order';
import { getRecentInvoices } from '@/lib/history';
import { History, Download, Clock } from 'lucide-react';

export const RecentHistoryPanel: React.FC = () => {
  const [history, setHistory] = useState<OrderHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadHistory = async () => {
    setIsLoading(true);
    const data = await getRecentInvoices();
    setHistory(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleDownloadBlob = (entry: OrderHistoryEntry) => {
    if (entry.pdfBlob) {
      const url = URL.createObjectURL(entry.pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `delivery-order-${entry.invoiceNumber}-${entry.deliveryDate}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      alert('No PDF file stored temporarily, please reopen the order and download it.');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 font-cairo">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100 text-[#204978]">
        <History className="w-5 h-5" />
        <h3 className="font-bold text-base">Recent 5 Downloaded Invoices (IndexedDB)</h3>
      </div>

      {isLoading ? (
        <div className="py-6 text-center text-xs text-gray-400">Loading history...</div>
      ) : history.length === 0 ? (
        <div className="py-6 text-center text-xs text-gray-400">
          No invoices downloaded yet. Downloaded invoices will be saved here (max 5).
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {history.map((entry) => (
            <div
              key={entry.id + entry.createdAt}
              className="flex justify-between items-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 text-xs transition-colors"
            >
              <div className="flex flex-col gap-1">
                <span className="font-bold text-gray-800">
                  Order #: #{entry.invoiceNumber}
                </span>
                <div className="flex items-center gap-3 text-[11px] text-gray-500">
                  <span>Delivery Date: {entry.deliveryDate}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(entry.createdAt).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleDownloadBlob(entry)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#204978] hover:bg-[#18365a] text-white rounded text-xs font-bold transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
