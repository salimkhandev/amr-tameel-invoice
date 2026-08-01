'use client';

import React from 'react';

export interface ColumnItem {
  key: string;
  label: string;
  value: string;
  isRtlValue?: boolean;
  isNumericValue?: boolean;
  /** Called with the new value when user finishes editing inline */
  onChange?: (value: string) => void;
}

interface TemplateSectionProps {
  title: string;
  columns: ColumnItem[];
}

export const TemplateSection: React.FC<TemplateSectionProps> = ({
  title,
  columns,
}) => {
  const isTwoCol = columns.length === 2;
  const colWidthClass = isTwoCol ? 'w-[50%]' : 'w-[33.33%]';

  return (
    <div className="w-full border border-gray-400">
      {/* Navy Header Bar */}
      <div className="bg-[#204978] text-white px-[12px] py-[5px] flex items-center text-[15px] font-bold">
        <span dir="auto" className="font-['Roboto',sans-serif]">
          {title}
        </span>
      </div>

      {/* Table */}
      <div className="w-full text-[13px]">
        {/* Label Row */}
        <div className="flex w-full bg-[#f0f0f0] border-b border-gray-400 font-bold text-gray-800">
          {columns.map((col, idx) => {
            const isLast = idx === columns.length - 1;
            return (
              <div
                key={col.key + '_label'}
                className={`${colWidthClass} ${
                  !isLast ? 'border-r border-gray-400' : ''
                } p-[6px] px-[10px] text-left font-['Roboto',sans-serif]`}
              >
                {col.label}
              </div>
            );
          })}
        </div>

        {/* Value Row — inline editable */}
        <div className="flex w-full font-bold text-gray-900 bg-white">
          {columns.map((col, idx) => {
            const isLast = idx === columns.length - 1;
            const valueClass = col.isRtlValue
              ? 'font-cairo text-right'
              : "font-['Roboto',sans-serif] text-left";

            return (
              <div
                key={col.key + '_value'}
                className={`${colWidthClass} ${
                  !isLast ? 'border-r border-gray-400' : ''
                } p-[6px] px-[10px] ${valueClass} group relative`}
              >
                <span
                  contentEditable={!!col.onChange}
                  suppressContentEditableWarning
                  dir={col.isRtlValue ? 'rtl' : 'ltr'}
                  /* Blue outline on focus to hint it's editable */
                  className={`outline-none block w-full min-h-[1em] ${
                    col.onChange
                      ? 'focus:bg-blue-50 focus:ring-1 focus:ring-blue-400 rounded cursor-text'
                      : ''
                  }`}
                  onBlur={(e) =>
                    col.onChange?.(e.currentTarget.textContent ?? '')
                  }
                  onKeyDown={(e) => {
                    // Prevent newlines — commit on Enter
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      (e.currentTarget as HTMLElement).blur();
                    }
                  }}
                >
                  {col.value}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
