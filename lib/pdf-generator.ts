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

  // Scale 1.5 = 150 DPI equivalent — crisp for A4 print, half the canvas area vs 2x
  const canvas = await html2canvas(element, {
    scale: 1.5,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
  });

  // JPEG at 0.88 quality is visually identical to PNG but ~75% smaller in file size
  const imgData = canvas.toDataURL('image/jpeg', 0.88);
  const pdf = new jsPDF('p', 'px', 'a4');

  const pageWidth = pdf.internal.pageSize.getWidth();
  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * pageWidth) / canvas.width;

  pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);

  const cleanDate = deliveryDate ? deliveryDate.replace(/[/\\?%*:|"<>]/g, '-') : 'date';
  const filename = `delivery-order-${invoiceNumber}-${cleanDate}.pdf`;

  const blob = pdf.output('blob');

  return {
    pdf,
    blob,
    filename,
  };
}
