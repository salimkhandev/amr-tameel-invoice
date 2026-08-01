'use client';

import React, { useState } from 'react';
import { DeliveryOrder } from '@/types/delivery-order';
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

      // Get the HTML content from the template
      let htmlContent = templateRef.current.outerHTML;
      
      // Convert images to base64 data URLs
      const images = templateRef.current.querySelectorAll('img');
      for (const img of Array.from(images)) {
        const src = img.getAttribute('src');
        if (src && !src.startsWith('data:')) {
          try {
            const response = await fetch(src);
            const blob = await response.blob();
            const reader = new FileReader();
            await new Promise((resolve, reject) => {
              reader.onload = resolve;
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            });
            const base64 = reader.result as string;
            htmlContent = htmlContent.replace(src, base64);
          } catch (error) {
            console.error('Failed to convert image to base64:', src, error);
          }
        }
      }
      
      const cleanDate = order.deliveryDate ? order.deliveryDate.replace(/[/\\?%*:|"<>]/g, '-') : 'date';
      const filename = `delivery-order-${order.invoiceNumber}-${cleanDate}.pdf`;

      // Send to server-side PDF generation
      const response = await fetch('/api/render-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          html: htmlContent,
          filename: filename,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      // Get the PDF blob
      const blob = await response.blob();

      // Trigger download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

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
