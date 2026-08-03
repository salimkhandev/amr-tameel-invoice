'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { OrderHistoryEntry } from '@/types/delivery-order';
import { 
  Package, 
  Truck, 
  User, 
  MapPin, 
  Phone, 
  Calendar, 
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';

// Force dynamic rendering - never cache this page
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function CustomerInvoicePage() {
  const params = useParams();
  const encryptedId = params.encryptedId as string;
  
  const [invoice, setInvoice] = useState<OrderHistoryEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadInvoice = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('═══════════════════════════════════════════════════');
        console.log('CUSTOMER PAGE - Loading invoice');
        console.log('Encrypted ID from URL:', encryptedId);
        console.log('═══════════════════════════════════════════════════');

        // Fetch invoice from API with no-cache to always get fresh data
        const apiUrl = `/api/customer/invoice/${encryptedId}`;
        console.log('Fetching from:', apiUrl);
        
        const response = await fetch(apiUrl, {
          cache: 'no-store', // Prevent caching
          headers: {
            'Cache-Control': 'no-cache',
          }
        });
        
        console.log('Response status:', response.status, response.statusText);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
        
        const data = await response.json();
        console.log('Response data:', data);

        if (!response.ok) {
          console.error('❌ API request failed:', data.error);
          setError(data.error || 'Failed to load invoice');
          return;
        }

        if (!data.success || !data.invoice) {
          console.error('❌ No invoice in response');
          setError('Invoice not found');
          return;
        }

        console.log('✅ Invoice data received from API');
        console.log('Invoice ID:', data.invoice.id);
        console.log('Status from API:', data.invoice.status);
        console.log('Updated At:', data.invoice.updated_at);
        console.log('Order Data:', data.invoice.order_data);

        // Transform Supabase data to match OrderHistoryEntry format
        const invoiceData: OrderHistoryEntry = {
          id: data.invoice.id,
          invoiceNumber: data.invoice.order_data.invoiceNumber,
          deliveryDate: data.invoice.order_data.deliveryDate,
          createdAt: data.invoice.created_at,
          order: data.invoice.order_data,
          status: data.invoice.status,
          qrCodeUrl: data.invoice.qr_data?.qrCodeUrl || '',
          encryptedInvoiceId: data.invoice.qr_data?.encryptedInvoiceId || '',
        };

        console.log('✅ Invoice transformed for display');
        console.log('Display Status:', invoiceData.status);
        console.log('═══════════════════════════════════════════════════');

        setInvoice(invoiceData);
      } catch (err) {
        console.error('❌ Exception during load:', err);
        setError('Failed to load invoice. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (encryptedId) {
      loadInvoice();
    }
  }, [encryptedId]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'In Transit':
        return <Clock className="w-5 h-5" />;
      case 'Sent':
        return <CheckCircle className="w-5 h-5" />;
      case 'Delivered':
        return <CheckCircle className="w-5 h-5" />;
      case 'Failed':
        return <XCircle className="w-5 h-5" />;
      case 'Cancelled':
        return <XCircle className="w-5 h-5" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'In Transit':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Sent':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Delivered':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Failed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center font-cairo">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#204978] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center font-cairo p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Invoice Not Found</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-2 bg-[#204978] text-white rounded-lg font-medium hover:bg-[#18365a] transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return null;
  }

  const { order, status } = invoice;

  return (
    <div className="min-h-screen bg-gray-50 font-cairo">
      {/* Header */}
      <div className="bg-[#204978] text-white py-6 px-4 shadow-md">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Invoice Details</h1>
              <p className="text-sm opacity-90">#{order.invoiceNumber}</p>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${getStatusColor(status)}`}>
              {getStatusIcon(status)}
              <span className="font-medium">{status}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Invoice Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4 text-[#204978]">
            <FileText className="w-5 h-5" />
            <h2 className="font-bold text-lg">Invoice Summary</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Invoice Number</p>
              <p className="font-medium">#{order.invoiceNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Issue Date</p>
              <p className="font-medium">{order.deliveryDate}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Due Date</p>
              <p className="font-medium">{order.receiptDate}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Current Status</p>
              <p className="font-medium">{status}</p>
            </div>
          </div>
        </div>

        {/* Shipped To */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4 text-[#204978]">
            <MapPin className="w-5 h-5" />
            <h2 className="font-bold text-lg">Shipped To</h2>
          </div>
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Receiver Name</p>
                <p className="font-medium">{order.receiver.name}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Address</p>
                <p className="font-medium">{order.receiver.address}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Mobile</p>
                <p className="font-medium">{order.receiver.mobile}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Product Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4 text-[#204978]">
            <Package className="w-5 h-5" />
            <h2 className="font-bold text-lg">Product Summary</h2>
          </div>
          
          <div className="space-y-4">
            {/* Car Information */}
            <div className="border-l-4 border-[#204978] pl-4">
              <h3 className="font-medium text-gray-800 mb-2">Car Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                <div>
                  <p className="text-gray-500">Plate Number</p>
                  <p className="font-medium">{order.car.plateNumber}</p>
                </div>
                <div>
                  <p className="text-gray-500">Owner</p>
                  <p className="font-medium">{order.car.owner}</p>
                </div>
                <div>
                  <p className="text-gray-500">ID Number</p>
                  <p className="font-medium">{order.car.idNumber}</p>
                </div>
              </div>
            </div>

            {/* Transportation Info */}
            <div className="border-l-4 border-[#204978] pl-4">
              <h3 className="font-medium text-gray-800 mb-2">Transportation Info</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                <div>
                  <p className="text-gray-500">From City</p>
                  <p className="font-medium">{order.transport.fromCity}</p>
                </div>
                <div>
                  <p className="text-gray-500">To City</p>
                  <p className="font-medium">{order.transport.toCity}</p>
                </div>
                <div>
                  <p className="text-gray-500">Order No</p>
                  <p className="font-medium">{order.transport.orderNo}</p>
                </div>
              </div>
            </div>

            {/* Driver Information */}
            <div className="border-l-4 border-[#204978] pl-4">
              <h3 className="font-medium text-gray-800 mb-2">Driver Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                <div>
                  <p className="text-gray-500">Name</p>
                  <p className="font-medium">{order.driver.name}</p>
                </div>
                <div>
                  <p className="text-gray-500">Iqama Number</p>
                  <p className="font-medium">{order.driver.iqamaNumber}</p>
                </div>
                <div>
                  <p className="text-gray-500">Mobile</p>
                  <p className="font-medium">{order.driver.mobile}</p>
                </div>
              </div>
            </div>

            {/* Load Information */}
            <div className="border-l-4 border-[#204978] pl-4">
              <h3 className="font-medium text-gray-800 mb-2">Load Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-gray-500">Load Type</p>
                  <p className="font-medium">{order.load.type}</p>
                </div>
                <div>
                  <p className="text-gray-500">Goods Weight</p>
                  <p className="font-medium">{order.load.weight}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sender Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4 text-[#204978]">
            <Truck className="w-5 h-5" />
            <h2 className="font-bold text-lg">Sender Information</h2>
          </div>
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Sender Name</p>
                <p className="font-medium">{order.company.nameAr}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Address</p>
                <p className="font-medium">{order.company.addressAr}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Mobile</p>
                <p className="font-medium">{order.company.phone}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 py-4">
          <p>Generated on {new Date(invoice.createdAt).toLocaleString()}</p>
          <p className="mt-1">For inquiries, please contact the sender.</p>
        </div>
      </div>
    </div>
  );
}