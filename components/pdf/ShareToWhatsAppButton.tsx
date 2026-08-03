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

      // Fetch current status from Supabase first
      let currentStatus = 'In Transit';
      try {
        const statusResponse = await fetch(`/api/invoices/${order.id}?t=${Date.now()}`, {
          cache: 'no-store',
        });
        if (statusResponse.ok) {
          const statusData = await statusResponse.json();
          if (statusData.invoice?.status) {
            currentStatus = statusData.invoice.status;
            console.log('Current status fetched from Supabase:', currentStatus);
          }
        }
      } catch (statusError) {
        console.warn('Failed to fetch current status, using default:', statusError);
      }

      // Generate QR code with current status and plain invoice ID
      let qrCodeUrl = '';
      let customerUrl = '';
      try {
        const qrResponse = await fetch('/api/generate-qr', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            order: order,
            status: currentStatus,
          }),
        });

        if (!qrResponse.ok) {
          throw new Error(`QR generation API failed: ${qrResponse.status}`);
        }

        const qrData = await qrResponse.json();
        qrCodeUrl = qrData.qrCodeUrl;
        customerUrl = qrData.customerUrl;
        console.log('QR code URL generated:', customerUrl);
      } catch (qrError) {
        console.error('QR code generation failed:', qrError);
        throw new Error('Failed to generate QR code. Please try again.');
      }

      // Pre-load and verify QR code image before proceeding
      console.log('Verifying QR code image loads...');
      await new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          console.log('QR code image verified loaded successfully');
          resolve();
        };
        img.onerror = () => {
          console.error('QR code image failed to load');
          reject(new Error('QR code image failed to load'));
        };
        img.src = qrCodeUrl;
        
        // Timeout after 10 seconds
        setTimeout(() => reject(new Error('QR code image load timeout')), 10000);
      });

      // Get the HTML content from the template
      // Clone template DOM to insert QR code
      const clone = templateRef.current.cloneNode(true) as HTMLElement;

      // Show QR code in PDF - use off-screen positioning instead of display:none
      const qrContainer = clone.querySelector('#qr-code') as HTMLElement;
      if (qrContainer) {
        // Make visible with inline styles (CSS backup still applies)
        qrContainer.style.display = 'flex';
        qrContainer.style.visibility = 'visible';
        qrContainer.style.opacity = '1';
        console.log('QR container made visible with inline styles');
      } else {
        console.error('QR container not found in clone');
        throw new Error('QR container not found in template');
      }

      // Replace all input elements with plain spans
      const inputs = clone.querySelectorAll('input');
      inputs.forEach((input) => {
        const span = document.createElement('span');
        span.textContent = input.value;
        const dirAttr = input.getAttribute('dir');
        if (dirAttr) span.setAttribute('dir', dirAttr);
        span.style.display = 'inline-block';
        span.style.width = 'auto';
        span.style.whiteSpace = 'nowrap';
        input.parentNode?.replaceChild(span, input);
      });

      let htmlContent = clone.outerHTML;
      
      // Convert images to base64 data URLs
      const images = clone.querySelectorAll('img');
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
      className={`flex items-center justify-center gap-2 px-3 py-2 sm:px-5 sm:py-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold rounded-lg shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base ${className}`}
    >
      {isProcessing ? (
        <>
          <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
          <span className="font-cairo">Preparing...</span>
        </>
      ) : !isOnline ? (
        <>
          <WifiOff className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="font-cairo text-xs">Offline</span>
        </>
      ) : (
        <>
          <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="font-cairo">WhatsApp</span>
        </>
      )}
    </button>
  );
};
