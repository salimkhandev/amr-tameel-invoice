import { NextRequest, NextResponse } from 'next/server';
import { verifyEncryptedInvoiceId } from '@/lib/qr';
import { createClient } from '@supabase/supabase-js';

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

    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase credentials');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch invoice from Supabase
    const { data: invoice, error: fetchError } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .single();

    if (fetchError) {
      console.error('Supabase fetch error:', fetchError);
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      invoice
    });

  } catch (error) {
    console.error('Customer invoice API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}