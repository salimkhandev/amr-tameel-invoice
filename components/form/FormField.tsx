'use client';

import React from 'react';

interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  dir?: 'rtl' | 'ltr';
  placeholder?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  type = 'text',
  value,
  onChange,
  error,
  dir = 'ltr',
  placeholder,
}) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      <label className="text-sm font-semibold text-gray-700">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        dir={dir}
        placeholder={placeholder}
        className={`w-full px-3 py-2 border rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#204978] transition-colors ${
          dir === 'rtl' ? 'text-right font-cairo' : 'font-[' + "'Roboto',sans-serif" + '] text-left'
        } ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'}`}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
};
