import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, order_data, status, qr_data } = body;

    console.log('Received invoice storage request:', { id, status });

    if (!id || !order_data) {
      console.error('Missing required fields:', { id, hasOrderData: !!order_data });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
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

    // Check if invoice already exists
    const { data: existingInvoice, error: checkError } = await supabase
      .from('invoices')
      .select('id')
      .eq('id', id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Supabase check error:', checkError);
      return NextResponse.json(
        { error: 'Failed to check existing invoice' },
        { status: 500 }
      );
    }

    if (existingInvoice) {
      console.log('Invoice already exists, updating:', id);
      // Update existing invoice
      const { error: updateError } = await supabase
        .from('invoices')
        .update({
          order_data,
          status,
          qr_data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (updateError) {
        console.error('Supabase update error:', updateError);
        return NextResponse.json(
          { error: 'Failed to update invoice' },
          { status: 500 }
        );
      }

      console.log('Invoice updated successfully:', id);
      return NextResponse.json({
        success: true,
        message: 'Invoice updated successfully',
      });
    }

    console.log('Creating new invoice:', id);
    // Insert new invoice
    const { error: insertError } = await supabase
      .from('invoices')
      .insert({
        id,
        order_data,
        status,
        qr_data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error('Supabase insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to create invoice', details: insertError.message },
        { status: 500 }
      );
    }

    console.log('Invoice created successfully:', id);
    return NextResponse.json({
      success: true,
      message: 'Invoice created successfully',
    });

  } catch (error) {
    console.error('Invoice API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}