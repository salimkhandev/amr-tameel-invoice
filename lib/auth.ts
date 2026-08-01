/**
 * Client-only soft auth gate engine
 * Note: As a serverless static export, this acts as a light gate, not server-grade security.
 */

const SESSION_KEY = 'session:active';
const USER_KEY = 'session:user';

const AUTH_USERNAME = process.env.NEXT_PUBLIC_AUTH_USERNAME || 'mudassir2030';
const AUTH_PASSWORD = process.env.NEXT_PUBLIC_AUTH_PASSWORD || 'mudassir2030';

export function loginClient(u: string, p: string): boolean {
  if (typeof window === 'undefined') return false;

  if (u.trim() === AUTH_USERNAME && p.trim() === AUTH_PASSWORD) {
    localStorage.setItem(SESSION_KEY, 'true');
    localStorage.setItem(USER_KEY, u.trim());
    return true;
  }
  return false;
}

export function logoutClient(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isClientAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(SESSION_KEY) === 'true';
}

export function getClientSessionUser(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(USER_KEY);
}
