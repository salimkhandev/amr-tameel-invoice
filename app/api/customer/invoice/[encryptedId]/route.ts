import { NextRequest, NextResponse } from 'next/server';
import { verifyEncryptedInvoiceId } from '@/lib/qr';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { encryptedId: string } }
) {
  try {
    const { encryptedId } = params;

    if (!encryptedId) {
      return NextResponse.json(
        { error: 'Missing encrypted invoice ID' },
        { status: 400 }
      );
    }

    // Verify and decrypt the encrypted ID
    const invoiceId = verifyEncryptedInvoiceId(encryptedId);
    if (!invoiceId) {
      return NextResponse.json(
        { error: 'Invalid or expired invoice link' },
        { status: 401 }
      );
    }

    // Since we're using IndexedDB client-side storage, we can't directly access it from the server
    // For now, return a message indicating the invoice ID is valid but needs client-side access
    // In a production environment, you would store invoices in a database (Supabase, PostgreSQL, etc.)
    
    return NextResponse.json({
      success: true,
      invoiceId,
      message: 'Invoice ID is valid. Access the customer page to view full details.',
      customerUrl: `${request.nextUrl.origin}/customer/invoice/${encryptedId}`
    });

  } catch (error) {
    console.error('Customer invoice API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}