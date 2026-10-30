'use client';

import React from 'react';

interface AppLoaderProps {
  message?: string;
  subMessage?: string;
  fullscreen?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const AppLoader: React.FC<AppLoaderProps> = ({
  message = 'جاري التحميل...',
  subMessage = 'ذاكر تحميل • Zakir Tahmeel',
  fullscreen = false,
  size = 'md',
}) => {
  const isSm = size === 'sm';
  const isLg = size === 'lg';

  const content = (
    <div className="flex flex-col items-center justify-center gap-4 text-center select-none font-cairo">
      {/* SVG Animated Logistics Loader */}
      <div className="relative flex items-center justify-center">
        {/* Ambient Glowing Halo */}
        <div className="absolute -inset-3 bg-gradient-to-r from-blue-500/20 via-sky-400/20 to-indigo-500/20 rounded-full blur-xl animate-pulse" />

        <svg
          className={`${
            isSm ? 'w-16 h-16' : isLg ? 'w-28 h-28' : 'w-24 h-24'
          } drop-shadow-md`}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="loaderGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#204978" />
              <stop offset="50%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
            <linearGradient id="truckGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1e3a8a" />
              <stop offset="100%" stopColor="#204978" />
            </linearGradient>
          </defs>

          {/* Outer Dashed Orbit Ring - Rotating Clockwise */}
          <circle
            cx="50"
            cy="50"
            r="44"
            stroke="url(#loaderGrad1)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="40 18 20 18"
            className="origin-center animate-[spin_3s_linear_infinite]"
          />

          {/* Inner Reverse Track Ring */}
          <circle
            cx="50"
            cy="50"
            r="38"
            stroke="#93c5fd"
            strokeWidth="1.5"
            strokeDasharray="6 8"
            strokeOpacity="0.6"
            className="origin-center animate-[spin_6s_linear_infinite_reverse]"
          />

          {/* Inner Center Circle with Subtle Glow */}
          <circle cx="50" cy="50" r="32" fill="#ffffff" fillOpacity="0.95" />

          {/* Logistics Delivery Truck Vector */}
          <g className="origin-center animate-[bounce_2s_ease-in-out_infinite]">
            {/* Cargo Box */}
            <path
              d="M32 37 H47 V53 H32 Z"
              fill="url(#truckGrad)"
              rx="1.5"
            />
            {/* Horizontal ribbed lines on cargo box */}
            <line x1="34" y1="41" x2="45" y2="41" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.7" />
            <line x1="34" y1="45" x2="45" y2="45" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.7" />
            <line x1="34" y1="49" x2="45" y2="49" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.7" />

            {/* Cabin */}
            <path
              d="M47 41 H56 C57 41 58 42 59 44 L63 50 C63.5 50.8 63.5 52 63.5 53 H47 V41 Z"
              fill="#204978"
            />
            {/* Cabin Window */}
            <path
              d="M50 43 H55 L58.5 48 H50 V43 Z"
              fill="#93c5fd"
              fillOpacity="0.9"
            />
            {/* Headlight */}
            <circle cx="62" cy="52" r="1.2" fill="#fbbf24" />

            {/* Rear Wheels */}
            <circle cx="37" cy="56" r="3.5" fill="#1e293b" />
            <circle cx="37" cy="56" r="1.5" fill="#ffffff" />
            <circle cx="44" cy="56" r="3.5" fill="#1e293b" />
            <circle cx="44" cy="56" r="1.5" fill="#ffffff" />

            {/* Front Wheel */}
            <circle cx="58" cy="56" r="3.5" fill="#1e293b" />
            <circle cx="58" cy="56" r="1.5" fill="#ffffff" />

            {/* Moving Road Dashes below truck */}
            <line x1="28" y1="62" x2="68" y2="62" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="5 4" strokeLinecap="round" />
          </g>
        </svg>
      </div>

      {/* Brand & Loading Label */}
      <div className="flex flex-col items-center gap-1.5">
        <div className="flex items-center gap-2 text-slate-800 font-extrabold text-base tracking-wide">
          <span>{message}</span>
          <span className="flex gap-1 items-center">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-[ping_1.4s_cubic-bezier(0,0,0.2,1)_infinite]" />
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-[ping_1.4s_cubic-bezier(0,0,0.2,1)_0.2s_infinite]" />
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-[ping_1.4s_cubic-bezier(0,0,0.2,1)_0.4s_infinite]" />
          </span>
        </div>

        {subMessage && (
          <span className="text-xs font-semibold text-slate-500 tracking-normal px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200/70 shadow-sm">
            {subMessage}
          </span>
        )}
      </div>
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-100 backdrop-blur-md">
        <div className="bg-white/80 backdrop-blur-xl p-8 sm:p-10 rounded-2xl shadow-xl border border-white/60 max-w-sm w-full mx-4">
          {content}
        </div>
      </div>
    );
  }

  return content;
};
