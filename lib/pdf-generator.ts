import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export interface GeneratePdfResult {
  pdf: jsPDF;
  blob: Blob;
  filename: string;
}

/**
 * Capture HTML element and generate high quality A4 PDF
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

  // High quality settings - scale 2 for good balance of quality and performance
  const canvas = await html2canvas(element, {
    scale: 2, // 200 DPI equivalent - good quality without performance issues
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
    allowTaint: true,
    letterRendering: true,
    imageTimeout: 15000, // 15 second timeout
    removeContainer: true,
  });

  // Use JPEG with high quality for better performance
  const imgData = canvas.toDataURL('image/jpeg', 0.95);
  
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

  pdf.addImage(imgData, 'JPEG', x, y, imgWidth, imgHeight);

  const cleanDate = deliveryDate ? deliveryDate.replace(/[/\\?%*:|"<>]/g, '-') : 'date';
  const filename = `delivery-order-${invoiceNumber}-${cleanDate}.pdf`;

  const blob = pdf.output('blob');

  return {
    pdf,
    blob,
    filename,
  };
}
