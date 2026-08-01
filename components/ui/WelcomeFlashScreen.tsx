'use client';

import React, { useEffect, useState } from 'react';

interface WelcomeFlashScreenProps {
  userName: string;
  onComplete: () => void;
}

export const WelcomeFlashScreen: React.FC<WelcomeFlashScreenProps> = ({
  userName,
  onComplete,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    // Animate in
    const timer1 = setTimeout(() => {
      setOpacity(1);
    }, 100);

    // Animate out and complete
    const timer2 = setTimeout(() => {
      setOpacity(0);
    }, 1500);

    const timer3 = setTimeout(() => {
      setIsVisible(false);
      onComplete();
    }, 2000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#204978]">
      <div
        className="text-center"
        style={{
          opacity: opacity,
          transition: 'opacity 0.5s ease-out',
        }}
      >
        {/* Logo/Icon */}
        <div className="w-32 h-32 sm:w-40 sm:h-40 mx-auto rounded-2xl bg-white/10 backdrop-blur-sm border-2 border-white/20 flex items-center justify-center shadow-2xl">
          <span className="text-3xl sm:text-4xl font-bold text-white text-center leading-tight px-2">Amar Tameel</span>
        </div>
      </div>
    </div>
  );
};
