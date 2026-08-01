'use client';

import React, { useRef } from 'react';

interface LogoUploadFieldProps {
  currentLogoUrl?: string;
  onLogoChange: (dataUrl: string) => void;
}

export const LogoUploadField: React.FC<LogoUploadFieldProps> = ({
  currentLogoUrl,
  onLogoChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Downscale and compress logo on client side using Canvas (max 300x300)
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 300;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/png', 0.85);
          onLogoChange(compressedDataUrl);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <label className="text-sm font-semibold text-gray-800 font-cairo">
        Company Logo
      </label>
      <div className="flex items-center gap-4 p-3 border border-dashed border-gray-300 rounded-lg bg-gray-50">
        <div className="w-16 h-16 rounded border bg-white flex items-center justify-center overflow-hidden">
          {currentLogoUrl ? (
            /* eslint-disable-next-html-element-for-img */
            <img src={currentLogoUrl} alt="Logo preview" className="w-full h-full object-contain" />
          ) : (
            <span className="text-xs text-gray-400">No logo</span>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-[#204978] hover:bg-[#18365a] rounded transition-colors"
          >
            Change Logo
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <span className="text-[11px] text-gray-500">
            Logo will be automatically compressed for performance
          </span>
        </div>
      </div>
    </div>
  );
};
