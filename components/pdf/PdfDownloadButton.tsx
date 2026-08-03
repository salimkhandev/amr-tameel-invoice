'use client';

import React, { useState } from 'react';
import { DeliveryOrder, InvoiceStatus } from '@/types/delivery-order';
import { addInvoiceToHistory } from '@/lib/history';
import { Download, Loader2 } from 'lucide-react';

interface PdfDownloadButtonProps {
  templateRef: React.RefObject<HTMLDivElement | null>;
  order: DeliveryOrder;
  status: InvoiceStatus;
  onSuccess?: () => void;
  className?: string;
}

export const PdfDownloadButton: React.FC<PdfDownloadButtonProps> = ({
  templateRef,
  order,
  status,
  onSuccess,
  className = '',
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStage, setLoadingStage] = useState<'qr' | 'pdf' | null>(null);

  const handleDownload = async () => {
    if (!templateRef.current || isGenerating) return;

    try {
      setIsGenerating(true);
      
      // ═══════════════════════════════════════════════════════════
      // STAGE 0: Fetch current status from Supabase (like RecentHistoryPanel)
      // ═══════════════════════════════════════════════════════════
      console.log('Stage 0: Fetching current status from Supabase...');
      let currentStatus: InvoiceStatus = status;
      
      try {
        const statusResponse = await fetch(`/api/invoices/${order.id}`);
        if (statusResponse.ok) {
          const statusData = await statusResponse.json();
          if (statusData.invoice?.status) {
            currentStatus = statusData.invoice.status;
            console.log('Current status fetched from Supabase:', currentStatus);
          }
        }
      } catch (statusError) {
        console.warn('Failed to fetch current status, using provided status:', statusError);
      }
      
      // ═══════════════════════════════════════════════════════════
      // STAGE 1: Generate and verify QR code
      // ═══════════════════════════════════════════════════════════
      setLoadingStage('qr');
      console.log('Stage 1: Generating QR code with status:', currentStatus);

      // Generate QR code components via server API
      let qrCodeUrl = '';
      let encryptedId = '';
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
        encryptedId = qrData.encryptedId;
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

      // ═══════════════════════════════════════════════════════════
      // STAGE 2: Prepare DOM and generate PDF
      // ═══════════════════════════════════════════════════════════
      setLoadingStage('pdf');
      console.log('Stage 2: Generating PDF...');

      // Clone template DOM
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

      // Replace static QR code with verified dynamic QR code
      const qrImages = clone.querySelectorAll('img[alt="QR Code"]');
      console.log('Found QR code images:', qrImages.length);
      
      if (qrImages.length === 0) {
        throw new Error('QR code image element not found in template');
      }

      qrImages.forEach((img) => {
        const htmlImg = img as HTMLElement;
        console.log('Replacing QR code src with verified URL:', qrCodeUrl);
        img.setAttribute('src', qrCodeUrl);
        img.setAttribute('width', '300');
        img.setAttribute('height', '300');
        
        // Force image visibility with inline styles
        htmlImg.style.display = 'block';
        htmlImg.style.visibility = 'visible';
        htmlImg.style.opacity = '1';
        
        // Ensure parent container is visible
        const parent = htmlImg.parentElement;
        if (parent) {
          const htmlParent = parent as HTMLElement;
          htmlParent.style.display = 'flex';
          htmlParent.style.visibility = 'visible';
          htmlParent.style.opacity = '1';
        }
      });

      // Convert images to base64 data URLs BEFORE getting outerHTML
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
            
            // Update the img element's src attribute BEFORE getting outerHTML
            img.setAttribute('src', base64);
            console.log('Successfully converted and updated img src:', src);
          } catch (error) {
            console.error('Failed to convert image to base64:', src, error);
            // Don't throw - continue with other images
          }
        }
      }

      // Now get the HTML content with all images converted to base64
      let htmlContent = clone.outerHTML;

      const cleanDate = order.deliveryDate ? order.deliveryDate.replace(/[/\\?%*:|"<>]/g, '-') : 'date';
      const filename = `invoice-${order.invoiceNumber}-${cleanDate}.pdf`;

      // Send to server-side PDF generation
      console.log('Sending PDF generation request to Puppeteer...');
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
      // Add to IndexedDB history
      try {
        await addInvoiceToHistory({
          id: order.id,
          invoiceNumber: order.invoiceNumber,
          deliveryDate: order.deliveryDate,
          createdAt: new Date().toISOString(),
          order: order,
          pdfBlob: blob,
          status: currentStatus,
          qrCodeUrl: customerUrl || '',
          encryptedInvoiceId: encryptedId || '',
        });
        console.log('Successfully added to history');
      } catch (historyError) {
        console.error('Failed to add to history:', historyError);
      }

      // Store invoice in Supabase - THIS IS CRITICAL FOR QR CODE TO WORK
      console.log('═══════════════════════════════════════════════════');
      console.log('SAVING TO SUPABASE - Invoice ID:', order.id);
      console.log('Status:', currentStatus);
      console.log('Customer URL:', customerUrl);
      console.log('═══════════════════════════════════════════════════');
      
      try {
        const supabasePayload = {
          id: order.id,
          order_data: order,
          status: currentStatus,
          qr_data: {
            qrCodeUrl: customerUrl || '',
            encryptedInvoiceId: encryptedId || '',
          },
        };
        
        console.log('Supabase payload:', JSON.stringify(supabasePayload, null, 2));
        
        const supabaseResponse = await fetch('/api/invoices', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(supabasePayload),
        });

        console.log('Supabase API response status:', supabaseResponse.status, supabaseResponse.statusText);
        
        const supabaseData = await supabaseResponse.json();
        console.log('Supabase storage response:', supabaseData);

        if (!supabaseResponse.ok) {
          console.error('❌ FAILED TO STORE IN SUPABASE:', supabaseData.error);
          console.error('Response:', supabaseData);
          // Show error to user if Supabase storage fails
          alert(`CRITICAL: Invoice was downloaded but FAILED to save to database!\n\nThe QR code will NOT work!\n\nError: ${supabaseData.error || 'Unknown error'}\n\nPlease try downloading again or contact support.`);
          throw new Error('Failed to save invoice to database');
        } else {
          console.log('✅ SUCCESS: Invoice stored in Supabase');
          console.log('Invoice ID:', order.id);
          console.log('Status:', status);
          console.log('QR Code will work for customer URL:', customerUrl);
        }
      } catch (supabaseError) {
        console.error('❌ EXCEPTION during Supabase storage:', supabaseError);
        alert(`CRITICAL: Invoice was downloaded but FAILED to save to database!\n\nThe QR code will NOT work!\n\nError: ${supabaseError}\n\nPlease check your internet connection and try again.`);
        throw supabaseError;
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
      setLoadingStage(null);
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
          <span className="font-cairo">
            {loadingStage === 'qr' ? 'Generating QR code...' : 'Generating PDF...'}
          </span>
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
