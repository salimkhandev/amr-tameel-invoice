/**
 * Client auth gate engine with Supabase integration
 * Supports both environment variable auth and Supabase user management
 */

const SESSION_KEY = 'session:active';
const USER_KEY = 'session:user';
const TOKEN_KEY = 'session:token';

const AUTH_USERNAME = process.env.NEXT_PUBLIC_AUTH_USERNAME || 'mudassir2030';
const AUTH_PASSWORD = process.env.NEXT_PUBLIC_AUTH_PASSWORD || 'mudassir2030';

export interface User {
  id?: string;
  username: string;
  email?: string;
  full_name?: string;
  role: string;
}

// Check if Supabase is configured
const isSupabaseConfigured = () => {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
};

export async function loginClient(u: string, p: string): Promise<{ success: boolean; user?: User; token?: string }> {
  if (typeof window === 'undefined') return { success: false };

  // Try Supabase authentication first
  if (isSupabaseConfigured()) {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: u, password: p })
      });

      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem(SESSION_KEY, 'true');
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        localStorage.setItem(TOKEN_KEY, data.token);
        return { success: true, user: data.user, token: data.token };
      }
    } catch (error) {
      console.error('Supabase login failed, falling back to env auth:', error);
    }
  }

  // Fallback to environment variable auth
  if (u.trim() === AUTH_USERNAME && p.trim() === AUTH_PASSWORD) {
    localStorage.setItem(SESSION_KEY, 'true');
    localStorage.setItem(USER_KEY, JSON.stringify({ username: u.trim(), role: 'admin' }));
    return { success: true, user: { username: u.trim(), role: 'admin' } };
  }

  return { success: false };
}

export function logoutClient(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(TOKEN_KEY);
}

export function isClientAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(SESSION_KEY) === 'true';
}

export function getClientSessionUser(): User | null {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem(USER_KEY);
  return userStr ? JSON.parse(userStr) : null;
}

export function getSessionToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}
