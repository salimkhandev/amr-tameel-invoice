import { NextRequest, NextResponse } from 'next/server';
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
        { error: 'Missing invoice ID' },
        { status: 400 }
      );
    }

    console.log('Fetching invoice for invoiceId:', encryptedId);

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

    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: {
          'Cache-Control': 'no-cache'
        }
      }
    });

    // Fetch invoice from Supabase
    const { data: invoice, error: fetchError } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', encryptedId)
      .single();

    if (fetchError) {
      console.error('Supabase fetch error:', fetchError);
      return NextResponse.json(
        { error: 'Invoice not found', details: fetchError.message },
        { status: 404 }
      );
    }

    if (!invoice) {
      console.error('Invoice not found in database for ID:', encryptedId);
      return NextResponse.json(
        { error: 'Invoice not found', invoiceId: encryptedId },
        { status: 404 }
      );
    }

    console.log('Successfully fetched invoice:', invoice.id, 'Status:', invoice.status);

    return NextResponse.json({
      success: true,
      invoice
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });

  } catch (error) {
    console.error('Customer invoice API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}