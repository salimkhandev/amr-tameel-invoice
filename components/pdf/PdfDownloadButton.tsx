'use client';

import React, { useState } from 'react';
import { DeliveryOrder, InvoiceStatus } from '@/types/delivery-order';
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

      // Clone template DOM so we can clean up interactive inputs for PDF rendering
      const clone = templateRef.current.cloneNode(true) as HTMLElement;

      // Show QR code in PDF (hidden in browser) - remove inline display: none
      const qrContainer = clone.querySelector('#qr-code') as HTMLElement;
      if (qrContainer) {
        qrContainer.style.display = 'flex';
        console.log('QR container display set to flex');
      } else {
        console.error('QR container not found in clone');
      }

      // Replace all input elements with plain spans with width: auto to prevent digit truncation
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

      // Generate QR code components via server API to avoid client-side JWT issues
      let qrCodeUrl = '/qr-code.png'; // fallback to static QR code
      let encryptedId = '';
      let customerUrl = '';
      
      try {
        console.log('Requesting QR code generation from server...');
        const qrResponse = await fetch('/api/generate-qr', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            order: order,
            status: 'In Transit'
          }),
        });

        if (qrResponse.ok) {
          const qrData = await qrResponse.json();
          qrCodeUrl = qrData.qrCodeUrl;
          encryptedId = qrData.encryptedId;
          customerUrl = qrData.customerUrl;
          console.log('QR code generated successfully:', customerUrl);
        } else {
          console.error('QR generation API failed:', qrResponse.status);
        }
      } catch (qrError) {
        console.error('QR code generation failed:', qrError);
        // Continue with static QR code if generation fails
      }

      // Replace static QR code with dynamic one (or fallback)
      const qrImages = clone.querySelectorAll('img[alt="QR Code"]');
      console.log('Found QR code images:', qrImages.length);
      qrImages.forEach((img) => {
        const oldSrc = img.getAttribute('src');
        console.log('Replacing QR code src from:', oldSrc, 'to:', qrCodeUrl);
        img.setAttribute('src', qrCodeUrl);
        // Also update width/height to match new QR code size
        img.setAttribute('width', '300');
        img.setAttribute('height', '300');
        // Ensure the parent container is visible
        const parent = img.parentElement;
        if (parent) {
          parent.style.display = 'flex';
          parent.style.visibility = 'visible';
          parent.style.opacity = '1';
        }
      });

      let htmlContent = clone.outerHTML;

      // Convert images to base64 data URLs (including the new QR code)
      const images = clone.querySelectorAll('img');
      console.log('Processing images for base64 conversion:', images.length);
      for (const img of Array.from(images)) {
        const src = img.getAttribute('src');
        if (src && !src.startsWith('data:')) {
          try {
            console.log('Converting image to base64:', src);
            const response = await fetch(src);
            
            if (!response.ok) {
              console.error('Failed to fetch image:', src, response.status);
              continue;
            }
            
            const blob = await response.blob();
            console.log('Image blob size:', blob.size, 'type:', blob.type);
            
            const reader = new FileReader();
            await new Promise((resolve, reject) => {
              reader.onload = resolve;
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            });
            const base64 = reader.result as string;
            console.log('Base64 length:', base64.length);
            htmlContent = htmlContent.replace(src, base64);
            console.log('Successfully converted:', src);
          } catch (error) {
            console.error('Failed to convert image to base64:', src, error);
          }
        }
      }

      const cleanDate = order.deliveryDate ? order.deliveryDate.replace(/[/\\?%*:|"<>]/g, '-') : 'date';
      const filename = `invoice-${order.invoiceNumber}-${cleanDate}.pdf`;

      // Send to server-side PDF generation
      console.log('Sending PDF generation request...');
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

      console.log('Response status:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('PDF generation failed:', errorText);
        throw new Error(`Failed to generate PDF: ${response.status} ${response.statusText}`);
      }

      console.log('Getting PDF blob...');
      // Get the PDF blob
      const blob = await response.blob();
      console.log('PDF blob received, size:', blob.size, 'type:', blob.type);

      // Trigger download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      console.log('Adding to history with QR data...');
      // Add to IndexedDB top-5 rolling history with new fields
      try {
        await addInvoiceToHistory({
          id: order.id,
          invoiceNumber: order.invoiceNumber,
          deliveryDate: order.deliveryDate,
          createdAt: new Date().toISOString(),
          order: order,
          pdfBlob: blob,
          status: 'In Transit' as InvoiceStatus,
          qrCodeUrl: customerUrl || '',
          encryptedInvoiceId: encryptedId || '',
        });
        console.log('Successfully added to history');
      } catch (historyError) {
        console.error('Failed to add to history:', historyError);
        // Don't fail the download if history storage fails
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('PDF Generation failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      alert(`An error occurred while downloading the invoice: ${errorMessage}. Please try again.`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={isGenerating}
      className={`flex items-center justify-center gap-2 px-3 py-2 sm:px-5 sm:py-2.5 bg-[#204978] hover:bg-[#18365a] text-white font-bold rounded-lg shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base ${className}`}
    >
      {isGenerating ? (
        <>
          <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
          <span className="font-cairo">Generating...</span>
        </>
      ) : (
        <>
          <Download className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="font-cairo">Download</span>
        </>
      )}
    </button>
  );
};
