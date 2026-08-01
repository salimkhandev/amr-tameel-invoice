import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export interface GeneratePdfResult {
  pdf: jsPDF;
  blob: Blob;
  filename: string;
}

/**
 * Capture HTML element and generate high quality A4 PDF
 * Optimized for print quality with high DPI and lossless compression
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

  // High quality settings for professional PDF output
  const canvas = await html2canvas(element, {
    scale: 3, // 300 DPI equivalent - much higher quality for print
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
    allowTaint: true,
    // Improve text rendering
    letterRendering: true,
    // Better image quality
    imageTimeout: 0,
    // Remove scrollbars
    removeContainer: true,
    // Improve canvas quality
    foreignObjectRendering: true,
  });

  // Use PNG for lossless quality (higher quality than JPEG)
  const imgData = canvas.toDataURL('image/png', 1.0);
  
  // Use mm units for better print quality
  const pdf = new jsPDF('p', 'mm', 'a4');

  // A4 dimensions in mm
  const a4Width = 210;
  const a4Height = 297;

  // Calculate dimensions to maintain aspect ratio
  const imgWidth = a4Width;
  const imgHeight = (canvas.height * a4Width) / canvas.width;

  // Center the image on the page
  const x = 0;
  const y = 0;

  pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight, undefined, 'FAST');

  const cleanDate = deliveryDate ? deliveryDate.replace(/[/\\?%*:|"<>]/g, '-') : 'date';
  const filename = `delivery-order-${invoiceNumber}-${cleanDate}.pdf`;

  const blob = pdf.output('blob');

  return {
    pdf,
    blob,
    filename,
  };
}
