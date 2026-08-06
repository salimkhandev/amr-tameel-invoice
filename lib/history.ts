import { get, set, del, keys } from 'idb-keyval';
import { OrderHistoryEntry, InvoiceStatus } from '@/types/delivery-order';

const HISTORY_KEY_PREFIX = 'history_invoice_';
const PDF_SHARE_KEY_PREFIX = 'pdf_share_';
const MAX_HISTORY_ITEMS = 5;
const PDF_SHARE_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

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
        // Ensure new fields exist for backward compatibility, but don't use stored status
        const normalizedEntry: OrderHistoryEntry = {
          ...item,
          status: null as any, // Status will be fetched from Supabase
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
    
    // Ensure required fields are present, but don't store status
    const normalizedEntry: OrderHistoryEntry = {
      ...entry,
      status: null as any, // Don't store status in IndexedDB
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
 * Fetch invoice status from Supabase
 */
export async function fetchInvoiceStatusFromSupabase(invoiceId: string): Promise<InvoiceStatus | null> {
  if (typeof window === 'undefined') return null;
  try {
    const response = await fetch(`/api/invoices/${invoiceId}`);
    if (!response.ok) {
      console.error('Failed to fetch invoice status from Supabase:', response.status);
      return null;
    }
    const data = await response.json();
    return data.invoice?.status || null;
  } catch (err) {
    console.error('Failed to fetch invoice status:', err);
    return null;
  }
}

/**
 * Update invoice status in IndexedDB only (for UI consistency during updates)
 * Note: This is temporary - actual status should come from Supabase
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

/**
 * Store PDF blob for sharing with 1-hour expiry
 */
export async function storePdfForSharing(invoiceId: string, pdfBlob: Blob): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const key = `${PDF_SHARE_KEY_PREFIX}${invoiceId}`;
    const expiryTime = Date.now() + PDF_SHARE_EXPIRY_MS;
    
    await set(key, {
      blob: pdfBlob,
      expiry: expiryTime,
      createdAt: Date.now()
    });
    
    console.log('PDF stored for sharing, expires at:', new Date(expiryTime).toISOString());
  } catch (err) {
    console.error('Failed to store PDF for sharing:', err);
  }
}

/**
 * Retrieve PDF blob for sharing (if not expired)
 */
export async function getPdfForSharing(invoiceId: string): Promise<{ blob: Blob; url: string } | null> {
  if (typeof window === 'undefined') return null;
  try {
    const key = `${PDF_SHARE_KEY_PREFIX}${invoiceId}`;
    const data = await get<{ blob: Blob; expiry: number; createdAt: number }>(key);
    
    if (!data) {
      console.log('PDF not found in local storage');
      return null;
    }
    
    // Check if expired
    if (Date.now() > data.expiry) {
      console.log('PDF expired, cleaning up');
      await del(key);
      return null;
    }
    
    // Create object URL from stored blob
    const url = URL.createObjectURL(data.blob);
    return { blob: data.blob, url };
  } catch (err) {
    console.error('Failed to retrieve PDF for sharing:', err);
    return null;
  }
}

/**
 * Clean up expired PDFs from storage
 */
export async function cleanupExpiredPdfs(): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const allKeys = await keys();
    const pdfKeys = allKeys.filter((k) => String(k).startsWith(PDF_SHARE_KEY_PREFIX));
    
    for (const key of pdfKeys) {
      const data = await get<{ blob: Blob; expiry: number }>(key);
      if (data && Date.now() > data.expiry) {
        await del(key);
        console.log('Cleaned up expired PDF:', key);
      }
    }
  } catch (err) {
    console.error('Failed to cleanup expired PDFs:', err);
  }
}

/**
 * Clean up specific PDF by invoice ID
 */
export async function cleanupPdf(invoiceId: string): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const key = `${PDF_SHARE_KEY_PREFIX}${invoiceId}`;
    await del(key);
    console.log('Cleaned up PDF:', invoiceId);
  } catch (err) {
    console.error('Failed to cleanup PDF:', err);
  }
}
