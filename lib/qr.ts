import { DeliveryOrder, InvoiceStatus } from '@/types/delivery-order';
import QRCode from 'qrcode';

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
 * Generate customer-facing invoice URL using plain invoice ID
 */
export function generateCustomerInvoiceUrl(invoiceId: string): string {
  return `${CUSTOMER_BASE_URL}/${invoiceId}`;
}

/**
 * Generate QR code data URL using local library
 * This avoids external API caching issues
 */
export async function generateQrCodeUrl(data: string): Promise<string> {
  try {
    const dataUrl = await QRCode.toDataURL(data, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });
    return dataUrl;
  } catch (error) {
    console.error('Failed to generate QR code:', error);
    throw new Error('Failed to generate QR code');
  }
}
