import { DeliveryOrder } from '@/types/delivery-order';

/**
 * Builds encoded string for QR code generation
 */
export function buildQrPayload(order: Partial<DeliveryOrder>): string {
  return JSON.stringify({
    invoiceNumber: order.invoiceNumber || '',
    receiptDate: order.receiptDate || '',
    deliveryDate: order.deliveryDate || '',
    company: order.company?.nameAr || '',
    driver: order.driver?.name || '',
    load: order.load?.type || '',
  });
}
