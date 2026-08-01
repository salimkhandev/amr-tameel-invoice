'use client';

import React, { useState } from 'react';
import { DeliveryOrder } from '@/types/delivery-order';
import { generatePdf } from '@/lib/pdf-generator';
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

      const { pdf, blob, filename } = await generatePdf(
        templateRef.current,
        order.invoiceNumber,
        order.deliveryDate
      );

      // Primary Path: Web Share API with files
      const file = new File([blob], filename, { type: 'application/pdf' });
      if (
        typeof navigator !== 'undefined' &&
        navigator.canShare &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({
          title: filename,
          text: `Delivery Order #${order.invoiceNumber}`,
          files: [file],
        });
        return;
      }

      // Fallback Path: Download PDF + open wa.me link (without specific number for contact selection)
      pdf.save(filename);
      const msg = encodeURIComponent(
        `Delivery Order #${order.invoiceNumber} - PDF file attached.`
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
