/**
 * Generate unique order ID using crypto.randomUUID or fallback
 */
export function generateOrderId(): string {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  return 'ord_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
}
