'use client';

import React, { useState } from 'react';
import { DeliveryOrder } from '@/types/delivery-order';
import { generatePdf } from '@/lib/pdf-generator';
import { addInvoiceToHistory } from '@/lib/history';
import { Download, Loader2 } from 'lucide-react';

interface PdfDownloadButtonProps {
  templateRef: React.RefObject<HTMLDivElement | null>;
  order: DeliveryOrder;
  onSuccess?: () => void;
  className?: string;
}

export const PdfDownloadButton: React.FC<PdfDownloadButtonProps> = ({
  templateRef,
  order,
  onSuccess,
  className = '',
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    if (!templateRef.current || isGenerating) return;

    try {
      setIsGenerating(true);

      const { pdf, blob, filename } = await generatePdf(
        templateRef.current,
        order.invoiceNumber,
        order.deliveryDate
      );

      // Trigger download
      pdf.save(filename);

      // Add to IndexedDB top-5 rolling history only
      await addInvoiceToHistory({
        id: order.id,
        invoiceNumber: order.invoiceNumber,
        deliveryDate: order.deliveryDate,
        createdAt: new Date().toISOString(),
        order: order,
        pdfBlob: blob,
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('PDF Generation failed:', err);
      alert('An error occurred while downloading the invoice, please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={isGenerating}
      className={`flex items-center justify-center gap-2 px-5 py-2.5 bg-[#204978] hover:bg-[#18365a] text-white font-bold rounded-lg shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {isGenerating ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="font-cairo">Generating PDF...</span>
        </>
      ) : (
        <>
          <Download className="w-5 h-5" />
          <span className="font-cairo">Download PDF</span>
        </>
      )}
    </button>
  );
};
