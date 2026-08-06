import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Only attempt Supabase health check if credentials are available
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const { supabaseAdmin } = await import('@/lib/supabase');
        await supabaseAdmin.rpc('log_health_check');
      } catch (supabaseError) {
        console.warn('Supabase health check failed (non-critical):', supabaseError);
        // Continue anyway - health check endpoint should still return OK
      }
    }

    return NextResponse.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      service: 'amr-tameel-invoice'
    });
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      { status: 'error', timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
}
