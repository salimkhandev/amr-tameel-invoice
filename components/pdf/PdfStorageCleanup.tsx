'use client';

import { useEffect } from 'react';
import { cleanupExpiredPdfs } from '@/lib/history';

export function PdfStorageCleanup() {
  useEffect(() => {
    // Cleanup expired PDFs on app load
    const cleanup = async () => {
      try {
        await cleanupExpiredPdfs();
        console.log('Expired PDFs cleaned up');
      } catch (error) {
        console.error('Failed to cleanup expired PDFs:', error);
      }
    };

    cleanup();

    // Also cleanup every 30 minutes
    const interval = setInterval(cleanup, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return null;
}