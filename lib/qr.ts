import { DeliveryOrder, InvoiceStatus } from '@/types/delivery-order';
import jwt from 'jsonwebtoken';

const QR_SECRET = process.env.QR_SECRET || 'your-qr-secret-change-in-production';
const CUSTOMER_BASE_URL = process.env.NEXT_PUBLIC_CUSTOMER_BASE_URL || 'https://amr-tameel-invoice.vercel.app/customer/invoice';

/**
 * Builds comprehensive QR payload with all invoice information
 */
export function buildQrPayload(order: DeliveryOrder, status: InvoiceStatus): string {
  const payload = {
    invoice: {
      number: order.invoiceNumber,
      issueDate: order.deliveryDate,
      dueDate: order.receiptDate,
      status: status,
    },
    shippedTo: {
      name: order.receiver.name,
      address: order.receiver.address,
      mobile: order.receiver.mobile,
    },
    productSummary: {
      service: 'Transport Service',
      carInfo: {
        plateNumber: order.car.plateNumber,
        owner: order.car.owner,
        idNumber: order.car.idNumber,
      },
      transportInfo: {
        fromCity: order.transport.fromCity,
        toCity: order.transport.toCity,
        orderNo: order.transport.orderNo,
      },
      driverInfo: {
        name: order.driver.name,
        iqamaNumber: order.driver.iqamaNumber,
        mobile: order.driver.mobile,
      },
      loadInfo: {
        type: order.load.type,
        weight: order.load.weight,
      },
    },
    senderInfo: {
      name: order.company.nameAr,
      address: order.company.addressAr,
      mobile: order.company.phone,
    },
    receiverInfo: {
      name: order.receiver.name,
      address: order.receiver.address,
      mobile: order.receiver.mobile,
    },
  };

  return JSON.stringify(payload);
}

/**
 * Generate encrypted invoice ID for URL
 */
export function generateEncryptedInvoiceId(invoiceId: string): string {
  try {
    const payload = { invoiceId, timestamp: Date.now() };
    const token = jwt.sign(payload, QR_SECRET, { expiresIn: '30d' });
    return token;
  } catch (error) {
    console.error('Failed to generate encrypted invoice ID:', error);
    throw new Error('Failed to generate secure invoice ID');
  }
}

/**
 * Verify and decrypt encrypted invoice ID
 */
export function verifyEncryptedInvoiceId(encryptedId: string): string | null {
  try {
    const decoded = jwt.verify(encryptedId, QR_SECRET) as { invoiceId: string };
    return decoded.invoiceId;
  } catch (error) {
    console.error('Failed to verify encrypted invoice ID:', error);
    return null;
  }
}

/**
 * Generate customer-facing invoice URL
 */
export function generateCustomerInvoiceUrl(encryptedId: string): string {
  return `${CUSTOMER_BASE_URL}/${encryptedId}`;
}

/**
 * Generate QR code data URL using a third-party API
 * This avoids client-side library dependencies
 */
export async function generateQrCodeUrl(data: string): Promise<string> {
  const encodedData = encodeURIComponent(data);
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodedData}`;
}
