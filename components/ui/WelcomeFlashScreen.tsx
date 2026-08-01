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
  const [textOpacity, setTextOpacity] = useState(0);

  useEffect(() => {
    // Animate in
    const timer1 = setTimeout(() => {
      setScale(1);
      setOpacity(1);
    }, 100);

    const timer2 = setTimeout(() => {
      setTextOpacity(1);
    }, 300);

    // Animate out and complete
    const timer3 = setTimeout(() => {
      setScale(1.1);
      setOpacity(0);
      setTextOpacity(0);
    }, 2500);

    const timer4 = setTimeout(() => {
      setIsVisible(false);
      onComplete();
    }, 3000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gradient-to-br from-[#204978] via-[#18365a] to-[#0f2440]">
      <div
        className="text-center"
        style={{
          transform: `scale(${scale})`,
          opacity: opacity,
          transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.6s ease-out',
        }}
      >
        {/* Logo/Icon */}
        <div className="mb-6">
          <div 
            className="w-24 h-24 mx-auto rounded-2xl bg-white/10 backdrop-blur-sm border-2 border-white/20 flex items-center justify-center shadow-2xl"
            style={{
              opacity: textOpacity,
              transition: 'opacity 0.5s ease-out 0.2s',
            }}
          >
            <span className="text-5xl font-bold text-white">AT</span>
          </div>
        </div>

        {/* Welcome Text */}
        <h1 
          className="text-4xl sm:text-5xl font-bold text-white mb-4 font-cairo tracking-wide"
          style={{
            opacity: textOpacity,
            transition: 'opacity 0.5s ease-out 0.3s',
          }}
        >
          Welcome
        </h1>

        {/* User Name */}
        <p 
          className="text-2xl sm:text-3xl font-semibold text-blue-200 font-cairo mb-8"
          style={{
            opacity: textOpacity,
            transition: 'opacity 0.5s ease-out 0.4s',
          }}
        >
          {userName}
        </p>

        {/* Progress Bar */}
        <div 
          className="w-48 h-1.5 bg-white/20 rounded-full mx-auto overflow-hidden"
          style={{
            opacity: textOpacity,
            transition: 'opacity 0.5s ease-out 0.5s',
          }}
        >
          <div 
            className="h-full bg-gradient-to-r from-blue-300 to-white rounded-full"
            style={{
              animation: 'progress 2.5s ease-in-out forwards',
            }}
          />
        </div>

        {/* Subtitle */}
        <p 
          className="text-sm text-blue-300/70 mt-6 font-cairo"
          style={{
            opacity: textOpacity,
            transition: 'opacity 0.5s ease-out 0.6s',
          }}
        >
          Amar Tameel
        </p>
      </div>
    </div>
  );
};
