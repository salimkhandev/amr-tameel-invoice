'use client';

import React from 'react';

interface FormSectionProps {
  title: string;
  children: React.ReactNode;
}

export const FormSection: React.FC<FormSectionProps> = ({ title, children }) => {
  return (
    <div className="flex flex-col gap-3 p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
      <div className="bg-[#204978] text-white px-3 py-2 rounded text-sm font-bold">
        <span className="font-['Roboto',sans-serif]">{title}</span>
      </div>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
};
