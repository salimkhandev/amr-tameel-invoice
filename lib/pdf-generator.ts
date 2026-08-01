import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export interface GeneratePdfResult {
  pdf: jsPDF;
  blob: Blob;
  filename: string;
}

/**
 * Capture HTML element and generate high quality A4 PDF
 * Optimized for print quality with high DPI and proper scaling
 * Includes Arabic text support improvements
 */
export async function generatePdf(
  element: HTMLElement,
  invoiceNumber: string,
  deliveryDate: string
): Promise<GeneratePdfResult> {
  // Ensure fonts are loaded before capture - critical for Arabic text
  if (typeof document !== 'undefined' && document.fonts) {
    await document.fonts.ready;
  }

  // Force font loading by checking if our Arabic font is loaded
  if (typeof document !== 'undefined') {
    const testText = document.createElement('div');
    testText.style.fontFamily = 'Cairo, sans-serif';
    testText.style.opacity = '0';
    testText.textContent = 'اختبار';
    document.body.appendChild(testText);
    await new Promise(resolve => setTimeout(resolve, 100));
    document.body.removeChild(testText);
  }

  // Calculate optimal scale with safety cap for large content
  const maxDimension = 8000; // Safe across browsers
  const targetScale = 3; // Reduced to 3 for better Arabic text rendering
  const estimatedHeight = element.scrollHeight * targetScale;
  const scale = estimatedHeight > maxDimension 
    ? maxDimension / element.scrollHeight 
    : targetScale;

  // High quality settings with Arabic text support
  const canvas = await html2canvas(element, {
    scale: scale, // Scale 3 for better Arabic text rendering
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
    allowTaint: true,
    letterRendering: false, // Disabled for better Arabic ligature support
    imageTimeout: 30000,
    removeContainer: true,
    // Force explicit dimensions to avoid viewport issues
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
    // Improved text rendering for Arabic
    onclone: (clonedDoc) => {
      const clonedElement = clonedDoc.body.querySelector('[data-html2canvas-ignore]');
      if (clonedElement) {
        clonedElement.remove();
      }
      // Force font application
      const allElements = clonedDoc.body.getElementsByTagName('*');
      for (let i = 0; i < allElements.length; i++) {
        const element = allElements[i] as HTMLElement;
        const computedStyle = window.getComputedStyle(element);
        if (computedStyle.fontFamily) {
          (element as HTMLElement).style.fontFamily = computedStyle.fontFamily;
        }
      }
    },
  });

  // Use PNG for lossless quality (sharper text and QR codes)
  const imgData = canvas.toDataURL('image/png');
  
  // Use mm units for proper print quality
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  // A4 dimensions in mm
  const imgWidthMm = 210; // A4 width
  const pxPerMm = canvas.width / imgWidthMm;
  const imgHeightMm = canvas.height / pxPerMm;

  // Add image with proper DPI-matched dimensions
  pdf.addImage(imgData, 'PNG', 0, 0, imgWidthMm, imgHeightMm, undefined, 'FAST');

  const cleanDate = deliveryDate ? deliveryDate.replace(/[/\\?%*:|"<>]/g, '-') : 'date';
  const filename = `delivery-order-${invoiceNumber}-${cleanDate}.pdf`;

  const blob = pdf.output('blob');

  return {
    pdf,
    blob,
    filename,
  };
}
