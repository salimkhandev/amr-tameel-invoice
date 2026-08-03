import { get, set, del, keys } from 'idb-keyval';
import { OrderHistoryEntry, InvoiceStatus } from '@/types/delivery-order';

const HISTORY_KEY_PREFIX = 'history_invoice_';
const MAX_HISTORY_ITEMS = 5;

/**
 * Retrieve all recent invoices sorted by createdAt descending
 */
export async function getRecentInvoices(): Promise<OrderHistoryEntry[]> {
  if (typeof window === 'undefined') return [];
  try {
    const allKeys = await keys();
    const historyKeys = allKeys.filter((k) => String(k).startsWith(HISTORY_KEY_PREFIX));
    
    const entries: OrderHistoryEntry[] = [];
    for (const key of historyKeys) {
      const item = await get<any>(key);
      if (item) {
        // Ensure new fields exist for backward compatibility
        const normalizedEntry: OrderHistoryEntry = {
          ...item,
          status: item.status || 'In Transit',
          qrCodeUrl: item.qrCodeUrl || '',
          encryptedInvoiceId: item.encryptedInvoiceId || '',
        };
        entries.push(normalizedEntry);
      }
    }

    // Sort newest first
    return entries.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (err) {
    console.error('Failed to fetch recent invoices from IndexedDB:', err);
    return [];
  }
}

/**
 * Add invoice to top 5 history cache with FIFO eviction
 */
export async function addInvoiceToHistory(entry: OrderHistoryEntry): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const key = `${HISTORY_KEY_PREFIX}${entry.id}`;
    
    // Ensure required fields are present
    const normalizedEntry: OrderHistoryEntry = {
      ...entry,
      status: entry.status || 'In Transit',
      qrCodeUrl: entry.qrCodeUrl || '',
      encryptedInvoiceId: entry.encryptedInvoiceId || '',
    };
    
    // Check if item already exists (update in place)
    const existing = await get<any>(key);
    if (existing) {
      await set(key, { ...normalizedEntry, createdAt: new Date().toISOString() });
      return;
    }

    const currentHistory = await getRecentInvoices();

    // FIFO eviction: if 5 entries exist, delete the oldest
    if (currentHistory.length >= MAX_HISTORY_ITEMS) {
      const oldest = currentHistory[currentHistory.length - 1];
      if (oldest) {
        await del(`${HISTORY_KEY_PREFIX}${oldest.id}`);
      }
    }

    await set(key, { ...normalizedEntry, createdAt: new Date().toISOString() });
  } catch (err) {
    console.error('Failed to add invoice to history in IndexedDB:', err);
  }
}

/**
 * Update invoice status
 */
export async function updateInvoiceStatus(invoiceId: string, newStatus: InvoiceStatus): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  try {
    const key = `${HISTORY_KEY_PREFIX}${invoiceId}`;
    const existing = await get<any>(key);
    
    if (existing) {
      const updated: OrderHistoryEntry = {
        ...existing,
        status: newStatus,
      };
      await set(key, updated);
      return true;
    }
    return false;
  } catch (err) {
    console.error('Failed to update invoice status:', err);
    return false;
  }
}

/**
 * Get invoice by encrypted ID
 */
export async function getInvoiceByEncryptedId(encryptedId: string): Promise<OrderHistoryEntry | null> {
  if (typeof window === 'undefined') return null;
  try {
    const allInvoices = await getRecentInvoices();
    return allInvoices.find(invoice => invoice.encryptedInvoiceId === encryptedId) || null;
  } catch (err) {
    console.error('Failed to get invoice by encrypted ID:', err);
    return null;
  }
}

/**
 * Clear all history entries
 */
export async function clearInvoiceHistory(): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const allKeys = await keys();
    const historyKeys = allKeys.filter((k) => String(k).startsWith(HISTORY_KEY_PREFIX));
    for (const key of historyKeys) {
      await del(key);
    }
  } catch (err) {
    console.error('Failed to clear invoice history:', err);
  }
}
