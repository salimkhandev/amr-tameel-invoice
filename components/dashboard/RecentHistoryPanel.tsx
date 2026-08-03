'use client';

import React, { useState, useEffect } from 'react';
import { OrderHistoryEntry, InvoiceStatus } from '@/types/delivery-order';
import { getRecentInvoices, updateInvoiceStatus, fetchInvoiceStatusFromSupabase } from '@/lib/history';
import { History, Download, Clock, Edit } from 'lucide-react';

export const RecentHistoryPanel: React.FC = () => {
  const [history, setHistory] = useState<OrderHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<OrderHistoryEntry | null>(null);
  const [statuses, setStatuses] = useState<Record<string, InvoiceStatus>>({});

  const loadHistory = async () => {
    setIsLoading(true);
    const data = await getRecentInvoices();
    setHistory(data);
    
    // Fetch status for each invoice from Supabase
    const statusMap: Record<string, InvoiceStatus> = {};
    await Promise.all(
      data.map(async (entry) => {
        const status = await fetchInvoiceStatusFromSupabase(entry.id);
        if (status) {
          statusMap[entry.id] = status;
        }
      })
    );
    setStatuses(statusMap);
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
      a.download = `invoice-${entry.invoiceNumber}-${entry.deliveryDate}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      alert('No PDF file stored temporarily, please reopen the invoice and download it.');
    }
  };

  const handleStatusUpdate = async (newStatus: InvoiceStatus) => {
    if (!selectedInvoice) return;

    console.log('Updating status for invoice:', selectedInvoice.id, 'to:', newStatus);

    // Update Supabase first
    try {
      const response = await fetch(`/api/invoices/${selectedInvoice.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();
      console.log('Supabase status update response:', data);

      if (!response.ok) {
        console.error('Failed to update Supabase status:', data.error);
        alert('Failed to update status in database: ' + (data.error || 'Unknown error'));
        return;
      }

      console.log('Successfully updated status in Supabase');
      
      // Update local status state immediately for UI responsiveness
      setStatuses(prev => ({ ...prev, [selectedInvoice.id]: newStatus }));
      
      // Reload history to refresh statuses
      await loadHistory();
      setShowStatusModal(false);
      setSelectedInvoice(null);
    } catch (supabaseError) {
      console.error('Failed to update Supabase status:', supabaseError);
      alert('Failed to update status in database. Please check your connection.');
    }
  };

  const getStatusColor = (status: InvoiceStatus): string => {
    switch (status) {
      case 'In Transit':
        return 'bg-blue-100 text-blue-800';
      case 'Sent':
        return 'bg-green-100 text-green-800';
      case 'Delivered':
        return 'bg-emerald-100 text-emerald-800';
      case 'Failed':
        return 'bg-red-100 text-red-800';
      case 'Cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const statusOptions: InvoiceStatus[] = ['In Transit', 'Sent', 'Delivered', 'Failed', 'Cancelled'];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 font-cairo">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100 text-[#204978]">
        <History className="w-5 h-5" />
        <h3 className="font-bold text-sm sm:text-base">Recent 5 Downloaded Invoices</h3>
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
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 text-xs transition-colors"
            >
              <div className="flex flex-col gap-1 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-800 truncate">
                    Invoice #: #{entry.invoiceNumber}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(statuses[entry.id] || 'In Transit')}`}>
                    {statuses[entry.id] || 'In Transit'}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] text-gray-500">
                  <span>Delivery: {entry.deliveryDate}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(entry.createdAt).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  onClick={() => {
                    setSelectedInvoice(entry);
                    setShowStatusModal(true);
                  }}
                  className="flex items-center justify-center gap-1.5 px-2 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded text-xs font-bold transition-colors"
                  title="Update Status"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDownloadBlob(entry)}
                  className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#204978] hover:bg-[#18365a] text-white rounded text-xs font-bold transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Download PDF</span>
                  <span className="sm:hidden">Download</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="font-bold text-lg mb-4 text-[#204978]">Update Invoice Status</h3>
            <p className="text-sm text-gray-600 mb-4">
              Invoice #{selectedInvoice.invoiceNumber} - {selectedInvoice.deliveryDate}
            </p>
            <div className="flex flex-col gap-2">
              {statusOptions.map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusUpdate(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    (statuses[selectedInvoice.id] || 'In Transit') === status
                      ? 'bg-[#204978] text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                setShowStatusModal(false);
                setSelectedInvoice(null);
              }}
              className="mt-4 w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-sm font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
