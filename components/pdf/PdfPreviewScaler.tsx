'use client';

import React, { useState, useEffect, useRef } from 'react';

interface PdfPreviewScalerProps {
  children: React.ReactNode;
}

export const PdfPreviewScaler: React.FC<PdfPreviewScalerProps> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number>(1);
  const A4_WIDTH = 794;
  const A4_HEIGHT = 1123;

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const parentWidth = containerRef.current.clientWidth;
        // Apply scaling if container is smaller than 794px width
        if (parentWidth < A4_WIDTH) {
          const calculatedScale = parentWidth / A4_WIDTH;
          setScale(calculatedScale);
        } else {
          setScale(1);
        }
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div ref={containerRef} className="w-full flex justify-center overflow-hidden py-1 sm:py-2">
      <div
        style={{
          width: `${A4_WIDTH}px`,
          minHeight: `${A4_HEIGHT}px`,
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
          height: scale < 1 ? `${A4_HEIGHT * scale}px` : 'auto',
        }}
        className="transition-transform duration-150"
      >
        {children}
      </div>
    </div>
  );
};
