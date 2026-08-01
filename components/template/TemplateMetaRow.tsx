'use client';

import React from 'react';

interface TemplateMetaRowProps {
  invoiceNumber: string;
  receiptDate: string;
  deliveryDate: string;
  onInvoiceNumberChange?: (v: string) => void;
  onReceiptDateChange?: (v: string) => void;
  onDeliveryDateChange?: (v: string) => void;
}

/** Inline-editable span helper */
function EditableCell({
  value,
  onChange,
  dir = 'ltr',
}: {
  value: string;
  onChange?: (v: string) => void;
  dir?: 'ltr' | 'rtl';
}) {
  return (
    <span
      contentEditable={!!onChange}
      suppressContentEditableWarning
      dir={dir}
      className={`outline-none block w-full min-h-[1em] font-['Roboto',sans-serif] ${
        onChange
          ? 'focus:bg-blue-50 focus:ring-1 focus:ring-blue-400 rounded cursor-text'
          : ''
      }`}
      onBlur={(e) => onChange?.(e.currentTarget.textContent ?? '')}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          (e.currentTarget as HTMLElement).blur();
        }
      }}
    >
      {value}
    </span>
  );
}

export const TemplateMetaRow: React.FC<TemplateMetaRowProps> = ({
  invoiceNumber,
  receiptDate,
  deliveryDate,
  onInvoiceNumberChange,
  onReceiptDateChange,
  onDeliveryDateChange,
}) => {
  return (
    <div className="w-full border border-gray-400 text-[13px] c35603">
      <div className="flex w-full min-h-[42px] c35606">
        {/* Col 1: Invoice Number Label */}
        <div className="w-[210px] bg-[#f0f0f0] border-r border-gray-400 p-[6px] px-[8px] flex items-center font-bold text-gray-800 c35636">
          <span dir="auto" className="font-['Roboto',sans-serif] c35648">
            Invoice Number
          </span>
        </div>
        {/* Col 1: Value */}
        <div className="w-[70px] border-r border-gray-400 p-[6px] flex items-center justify-center font-bold text-gray-900 c36114">
          <EditableCell value={invoiceNumber} onChange={onInvoiceNumberChange} />
        </div>

        {/* Col 2: Receipt Date Label */}
        <div className="w-[220px] bg-[#f0f0f0] border-r border-gray-400 p-[6px] px-[8px] flex items-center font-bold text-gray-800 c36408">
          <span dir="auto" className="font-['Roboto',sans-serif] c36420">
            Receipt Date
          </span>
        </div>
        {/* Col 2: Value */}
        <div className="w-[110px] border-r border-gray-400 p-[6px] flex items-center justify-center font-bold text-gray-800 c36886">
          <EditableCell value={receiptDate} onChange={onReceiptDateChange} />
        </div>

        {/* Col 3: Delivery Date Label */}
        <div className="w-[210px] bg-[#f0f0f0] border-r border-gray-400 p-[6px] px-[8px] flex items-center font-bold text-gray-800 c37180">
          <span dir="auto" className="font-['Roboto',sans-serif] c37192">
            Delivery Date
          </span>
        </div>
        {/* Col 3: Value */}
        <div className="w-[114px] p-[6px] flex items-center justify-center font-bold text-gray-800 c37658">
          <EditableCell value={deliveryDate} onChange={onDeliveryDateChange} />
        </div>
      </div>
    </div>
  );
};
