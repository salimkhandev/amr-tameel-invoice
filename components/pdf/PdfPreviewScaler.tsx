'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ZoomIn, ZoomOut, RotateCw } from 'lucide-react';

interface PdfPreviewScalerProps {
  children: React.ReactNode;
}

export const PdfPreviewScaler: React.FC<PdfPreviewScalerProps> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number>(1);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const A4_WIDTH = 794;
  const A4_HEIGHT = 1123;

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };

    // Set initial zoom based on device
    const isMobileDevice = window.innerWidth < 768;
    if (isMobileDevice) {
      setScale(0.5);
    }

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.1, 0.25));
  };

  const handleReset = () => {
    setScale(1);
  };

  return (
    <div className="w-full flex flex-col">
      {/* Zoom Controls */}
      <div className="flex justify-center items-center gap-2 py-2 bg-gray-100 border-b border-gray-200">
        <button
          onClick={handleZoomOut}
          className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <span className="text-sm font-medium text-gray-700 min-w-[60px] text-center">
          {Math.round(scale * 100)}%
        </span>
        <button
          onClick={handleZoomIn}
          className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleReset}
          className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          title="Reset Zoom"
        >
          <RotateCw className="w-4 h-4" />
        </button>
      </div>

      {/* Template Container */}
      <div 
        ref={containerRef} 
        className="w-full overflow-auto py-2 sm:py-4"
        style={{ maxHeight: 'calc(100vh - 200px)' }}
      >
        <div className="flex justify-center" style={{ minWidth: `${A4_WIDTH * scale}px` }}>
          <div
            style={{
              width: `${A4_WIDTH}px`,
              minHeight: `${A4_HEIGHT}px`,
              transform: `scale(${scale})`,
              transformOrigin: 'top center',
            }}
            className="transition-transform duration-150"
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
