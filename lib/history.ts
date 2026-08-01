import { get, set, del, keys } from 'idb-keyval';
import { OrderHistoryEntry } from '@/types/delivery-order';

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
      const item = await get<OrderHistoryEntry>(key);
      if (item) {
        entries.push(item);
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
    
    // Check if item already exists (update in place)
    const existing = await get<OrderHistoryEntry>(key);
    if (existing) {
      await set(key, { ...entry, createdAt: new Date().toISOString() });
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

    await set(key, { ...entry, createdAt: new Date().toISOString() });
  } catch (err) {
    console.error('Failed to add invoice to history in IndexedDB:', err);
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
