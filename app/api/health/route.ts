import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Log health check to Supabase to keep it alive
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      await supabase.rpc('log_health_check');
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
