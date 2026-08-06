'use client';

import React from 'react';
import { DeliveryOrder } from '@/types/delivery-order';
import { PdfDownloadButton } from '@/components/pdf/PdfDownloadButton';

interface BottomActionBarProps {
  templateRef: React.RefObject<HTMLDivElement | null>;
  order: DeliveryOrder;
  status?: string;
  onSuccess?: () => void;
}

export const BottomActionBar: React.FC<BottomActionBarProps> = ({
  templateRef,
  order,
  status = 'In Transit',
  onSuccess,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-200 p-3 shadow-lg flex items-center justify-center gap-3 md:hidden">
      <PdfDownloadButton
        templateRef={templateRef}
        order={order}
        status={status as any}
        onSuccess={onSuccess}
        className="flex-1 py-2 text-xs"
      />
    </div>
  );
};
