'use client';

import React, { useState } from 'react';
import { DeliveryOrder } from '@/types/delivery-order';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { Share2, Loader2, WifiOff } from 'lucide-react';

interface ShareToWhatsAppButtonProps {
  templateRef: React.RefObject<HTMLDivElement | null>;
  order: DeliveryOrder;
  className?: string;
}

export const ShareToWhatsAppButton: React.FC<ShareToWhatsAppButtonProps> = ({
  templateRef,
  order,
  className = '',
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const isOnline = useOnlineStatus();

  const handleShare = async () => {
    if (!templateRef.current || isProcessing || !isOnline) return;

    try {
      setIsProcessing(true);

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
      const filename = `invoice-${order.invoiceNumber}-${cleanDate}.pdf`;

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

      // Primary Path: Web Share API with files
      const file = new File([blob], filename, { type: 'application/pdf' });
      if (
        typeof navigator !== 'undefined' &&
        navigator.canShare &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({
          title: filename,
          text: `Invoice #${order.invoiceNumber}`,
          files: [file],
        });
        return;
      }

      // Fallback Path: Download PDF + open wa.me link (without specific number for contact selection)
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      const msg = encodeURIComponent(
        `Invoice #${order.invoiceNumber} - PDF file attached.`
      );
      // Using wa.me without phone number to let user select contact
      const whatsappUrl = `https://wa.me/?text=${msg}`;
      window.open(whatsappUrl, '_blank');
      alert('File downloaded, you can attach it in the WhatsApp conversation that opens now.');
    } catch (err) {
      console.error('WhatsApp share failed:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      disabled={isProcessing || !isOnline}
      title={!isOnline ? 'WhatsApp sharing requires internet connection' : ''}
      className={`flex items-center justify-center gap-2 px-5 py-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold rounded-lg shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {isProcessing ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="font-cairo">Preparing share...</span>
        </>
      ) : !isOnline ? (
        <>
          <WifiOff className="w-5 h-5" />
          <span className="font-cairo text-xs">Requires internet</span>
        </>
      ) : (
        <>
          <Share2 className="w-5 h-5" />
          <span className="font-cairo">Share via WhatsApp</span>
        </>
      )}
    </button>
  );
};
