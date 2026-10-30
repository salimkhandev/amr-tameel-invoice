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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gradient-to-br from-[#0e2238] via-[#1a3c63] to-[#204978]">
      <div
        className="text-center flex flex-col items-center px-4 font-cairo"
        style={{
          opacity: opacity,
          transition: 'opacity 0.5s ease-out',
        }}
      >
        {/* Animated Brand Emblem */}
        <div className="w-36 h-36 sm:w-44 sm:h-44 mx-auto rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 p-4 flex flex-col items-center justify-center shadow-2xl relative mb-6">
          <div className="absolute -inset-2 bg-blue-400/20 rounded-3xl blur-xl animate-pulse" />
          <img
            src="/amar-logo.png"
            alt="Zakir Tahmeel"
            className="w-full h-full object-contain filter brightness-0 invert relative z-10"
          />
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-white text-center tracking-wide drop-shadow-md">
          Zakir Tahmeel
        </h1>
        <p className="text-sm font-semibold text-blue-200 mt-1 drop-shadow">
          Logistics Delivery Order System
        </p>

        {userName && (
          <div className="mt-4 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-white text-sm font-semibold">
            Welcome, {userName}
          </div>
        )}
      </div>
    </div>
  );
};
