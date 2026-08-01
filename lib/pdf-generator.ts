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
 */
export async function generatePdf(
  element: HTMLElement,
  invoiceNumber: string,
  deliveryDate: string
): Promise<GeneratePdfResult> {
  // Ensure fonts are loaded before capture
  if (typeof document !== 'undefined' && document.fonts) {
    await document.fonts.ready;
  }

  // Calculate optimal scale with safety cap for large content
  const maxDimension = 8000; // Safe across browsers
  const targetScale = 4; // 384 DPI equivalent - print quality
  const estimatedHeight = element.scrollHeight * targetScale;
  const scale = estimatedHeight > maxDimension 
    ? maxDimension / element.scrollHeight 
    : targetScale;

  // High quality settings for professional PDF output
  const canvas = await html2canvas(element, {
    scale: scale, // Dynamic scale up to 4 (384 DPI) for sharp output
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
    allowTaint: true,
    letterRendering: true, // Improve text rendering
    imageTimeout: 30000, // 30 second timeout for complex rendering
    removeContainer: true,
    // Force explicit dimensions to avoid viewport issues
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
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
