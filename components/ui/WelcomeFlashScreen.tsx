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
  const [scale, setScale] = useState(0.8);
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    // Animate in
    const timer1 = setTimeout(() => {
      setScale(1);
      setOpacity(1);
    }, 100);

    // Animate out and complete
    const timer2 = setTimeout(() => {
      setScale(1.1);
      setOpacity(0);
    }, 2000);

    const timer3 = setTimeout(() => {
      setIsVisible(false);
      onComplete();
    }, 2500);

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
          transform: `scale(${scale})`,
          opacity: opacity,
          transition: 'transform 0.5s ease-out, opacity 0.5s ease-out',
        }}
      >
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 font-cairo">
          Welcome
        </h1>
        <p className="text-2xl sm:text-3xl font-semibold text-blue-200 font-cairo">
          {userName}
        </p>
        <div className="mt-8">
          <div className="w-16 h-1 bg-white/30 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-white animate-[progress_2s_ease-in-out_forwards]" />
          </div>
        </div>
      </div>
    </div>
  );
};
