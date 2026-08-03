import { NextRequest, NextResponse } from 'next/server';
import { DeliveryOrder, InvoiceStatus } from '@/types/delivery-order';
import { buildQrPayload, generateCustomerInvoiceUrl, generateQrCodeUrl } from '@/lib/qr';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { order, status } = await request.json();

    if (!order) {
      return NextResponse.json(
        { error: 'Missing order data' },
        { status: 400 }
      );
    }

    // Generate QR code components on server side
    const defaultStatus: InvoiceStatus = status || 'In Transit';
    const qrPayload = buildQrPayload(order as DeliveryOrder, defaultStatus);
    const customerUrl = generateCustomerInvoiceUrl(order.id);
    const qrCodeUrl = await generateQrCodeUrl(customerUrl);

    return NextResponse.json({
      success: true,
      qrCodeUrl,
      invoiceId: order.id,
      customerUrl,
      qrPayload
    });

  } catch (error) {
    console.error('QR generation API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate QR code' },
      { status: 500 }
    );
  }
}