import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    // Dynamically import supabaseAdmin to avoid build-time issues
    const { supabaseAdmin } = await import('@/lib/supabase');
    
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const filename = formData.get('filename') as string | null;

    if (!file || !filename) {
      return NextResponse.json({ error: 'Missing file or filename' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const path = `invoices/${Date.now()}-${filename}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from('invoices')
      .upload(path, buffer, { contentType: 'application/pdf', upsert: false });

    if (uploadError) {
      console.error('Storage upload failed:', uploadError);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // Signed URL, valid 30 days — enough time for the customer to open it
    const { data: signedData, error: signError } = await supabaseAdmin.storage
      .from('invoices')
      .createSignedUrl(path, 60 * 60 * 24 * 30);

    if (signError || !signedData) {
      console.error('Failed to create signed URL:', signError);
      return NextResponse.json({ error: 'Failed to create shareable link' }, { status: 500 });
    }

    return NextResponse.json({ url: signedData.signedUrl, path });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('upload-invoice-pdf failed:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}