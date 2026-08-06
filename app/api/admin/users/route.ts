import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import bcrypt from 'bcryptjs';

export async function GET(request: NextRequest) {
  try {
    // Dynamically import supabaseAdmin to avoid build-time issues
    const { supabaseAdmin } = await import('@/lib/supabase');
    
    // Verify admin access
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get current user to check if they are seed admin
    const { data: currentUser, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, username, is_seed')
      .eq('username', payload.username)
      .single();

    if (userError || !currentUser) {
      return NextResponse.json({ error: 'Failed to verify current user' }, { status: 500 });
    }

    // Get all users (excluding seed users)
    let query = supabaseAdmin
      .from('users')
      .select('id, username, full_name, role, is_active, is_seed, created_at, updated_at')
      .eq('is_seed', false)
      .order('created_at', { ascending: false });

    // If current user is NOT seed admin, filter out themselves from the list
    if (!currentUser.is_seed) {
      query = query.neq('id', currentUser.id);
    }

    const { data: users, error } = await query;

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Dynamically import supabaseAdmin to avoid build-time issues
    const { supabaseAdmin } = await import('@/lib/supabase');
    
    // Verify admin access
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { username, password, full_name, role = 'user' } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('username', username)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Create user
    const { data: newUser, error } = await supabaseAdmin
      .from('users')
      .insert({
        username,
        password_hash,
        full_name: full_name || null,
        role,
        is_active: true,
        is_seed: false
      })
      .select('id, username, full_name, role, is_active, created_at')
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      user: newUser 
    });
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
