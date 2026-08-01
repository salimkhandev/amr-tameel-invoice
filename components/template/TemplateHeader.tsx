'use client';

import React from 'react';
import { CompanyInfo } from '@/types/delivery-order';

interface TemplateHeaderProps {
  company: CompanyInfo;
  invoiceNumber: string;
  onCompanyChange?: (field: keyof CompanyInfo, value: string) => void;
}

/** Inline-editable span helper */
function EditableSpan({
  value,
  onChange,
  className = '',
  dir = 'auto',
}: {
  value: string;
  onChange?: (v: string) => void;
  className?: string;
  dir?: string;
}) {
  return (
    <span
      contentEditable={!!onChange}
      suppressContentEditableWarning
      dir={dir}
      className={`outline-none ${
        onChange
          ? 'focus:bg-blue-50 focus:ring-1 focus:ring-blue-400 rounded cursor-text'
          : ''
      } ${className}`}
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

export const TemplateHeader: React.FC<TemplateHeaderProps> = ({
  company,
  onCompanyChange,
}) => {
  return (
    <div className="flex justify-between items-start w-full pt-[6px] pb-[10px] c33424">
      {/* Left Header: Truck Logo Box */}
      <div
        className="flex flex-col items-center justify-center w-[130px]"
        style={{
          width: '138px',
          height: '103px',
        }}
      >
        <div
          className="w-[110px] h-[85px] rounded-[4px] flex flex-col items-center justify-center p-[6px]"
          style={{
            width: '130px',
            height: '115px',
          }}
        >
          {/* eslint-disable-next-html-element-for-img */}
          <img
            src="/amar-logo.png"
            alt="Company Logo"
            className="w-full h-full object-contain"
            style={{ width: '216px', height: '152px' }}
          />
        </div>
      </div>

      {/* Right Header: Company Info + QR Code */}
      <div className="flex items-start gap-[16px]">
        {/* Text Info */}
        <div className="text-left flex flex-col justify-center pt-[2px] c34016">
          <h1
            dir="auto"
            className="text-[20px] font-extrabold text-black c34028 font-cairo"
            style={{ fontSize: '20px' }}
          >
            <EditableSpan
              value={company.nameAr}
              onChange={onCompanyChange ? (v) => onCompanyChange('nameAr', v) : undefined}
              className="font-extrabold"
            />
          </h1>

          <p
            dir="auto"
            className="text-[15px] font-bold text-gray-800 mt-[4px] c34120 font-cairo"
            style={{ fontSize: '20px' }}
          >
            <EditableSpan
              value={company.addressAr}
              onChange={onCompanyChange ? (v) => onCompanyChange('addressAr', v) : undefined}
            />
          </p>

          <p
            dir="auto"
            className="text-[15px] font-bold text-gray-800 mt-[4px] c34212 font-cairo"
            style={{ fontSize: '20px' }}
          >
            <EditableSpan
              value={company.phone}
              onChange={onCompanyChange ? (v) => onCompanyChange('phone', v) : undefined}
              dir="ltr"
            />
          </p>
        </div>

        {/* QR Code Image */}
        <div className="w-[92px] h-[92px] border-gray-300 rounded-[2px] overflow-hidden p-[2px] bg-white flex items-center justify-center">
          {/* eslint-disable-next-html-element-for-img */}
          <img
            src="/qr-code.png"
            alt="QR Code"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};
