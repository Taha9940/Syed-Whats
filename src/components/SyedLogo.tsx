import React from 'react';

interface SyedLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  showText?: boolean;
  withContainer?: boolean;
}

export const SyedLogo: React.FC<SyedLogoProps> = ({
  size = 'md',
  className = '',
  showText = false,
  withContainer = false,
}) => {
  const sizeMap = {
    sm: { box: 28, text: 'text-base font-bold' },
    md: { box: 40, text: 'text-xl font-bold' },
    lg: { box: 56, text: 'text-2xl font-extrabold' },
    xl: { box: 80, text: 'text-3xl font-extrabold' },
    '2xl': { box: 110, text: 'text-4xl font-black' },
  };

  const currentSize = sizeMap[size];

  const svgContent = (
    <svg
      width={currentSize.box}
      height={currentSize.box}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="drop-shadow-md select-none shrink-0"
    >
      <defs>
        {/* Soft Radial Ambient Glow */}
        <radialGradient id="syedGlow" cx="70%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#16324F" stopOpacity="0" />
        </radialGradient>

        {/* Paper Plane Top Main Wing Gradient */}
        <linearGradient id="mainWingGrad" x1="20" y1="50" x2="100" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#E2E8F0" />
          <stop offset="50%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F8FAFC" />
        </linearGradient>

        {/* Inner Cyan Origami Fold Gradient */}
        <linearGradient id="innerCyanFold" x1="35" y1="55" x2="85" y2="50" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0EA5E9" />
          <stop offset="60%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#7DD3FC" />
        </linearGradient>

        {/* Bottom Wing Under-Fold Shadow */}
        <linearGradient id="underWingGrad" x1="45" y1="65" x2="55" y2="85" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#94A3B8" />
          <stop offset="100%" stopColor="#CBD5E1" />
        </linearGradient>

        {/* Shadow under plane */}
        <filter id="softShadow" x="15" y="30" width="95" height="70" filterUnits="userSpaceOnUse">
          <feDropShadow dx="-1" dy="4" stdDeviation="5" floodColor="#0F172A" floodOpacity="0.45" />
        </filter>
      </defs>

      {/* Background glow if standalone */}
      <circle cx="60" cy="60" r="54" fill="url(#syedGlow)" opacity="0.6" />

      {/* SYED Origami Plane Group */}
      <g filter="url(#softShadow)" transform="translate(4, 2)">
        {/* Underbody / keel keel fold */}
        <path
          d="M48 68 L50 82 C50.4 84.5 53 85.5 54.8 84 L64 74 Z"
          fill="url(#underWingGrad)"
        />

        {/* Inner Teal/Cyan Crease */}
        <path
          d="M34 60 C32.5 59.2 33 57 34.8 56.5 L95 44 C97.5 43.5 98.8 46.2 97 47.8 L48 68 Z"
          fill="url(#innerCyanFold)"
        />

        {/* Main Sleek White Origami Wing */}
        <path
          d="M95 44 L48 68 L64 74 C66 75.5 68.8 74.8 70 72.8 L97.2 46.8 C98.2 45.6 96.8 44.2 95 44 Z"
          fill="url(#mainWingGrad)"
        />

        {/* Left Side Curved Flange */}
        <path
          d="M34 60 L48 68 L48 76 C48 78 45.8 79.2 44.2 78 L34 60 Z"
          fill="#64748B"
          opacity="0.8"
        />

        {/* Subtle highlight edge */}
        <path
          d="M34.8 56.5 L95 44"
          stroke="#FFFFFF"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.9"
        />
      </g>
    </svg>
  );

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {withContainer ? (
        <div
          className="flex items-center justify-center rounded-2xl bg-gradient-to-br from-[#16324F] to-[#101820] shadow-lg border border-slate-700/40 p-1.5 transition-transform hover:scale-105"
          style={{ width: currentSize.box + 12, height: currentSize.box + 12 }}
        >
          {svgContent}
        </div>
      ) : (
        svgContent
      )}

      {showText && (
        <div className="flex flex-col select-none">
          <span className={`tracking-wider text-[#16324F] dark:text-white ${currentSize.text} leading-tight`}>
            SYED
          </span>
          <span className="text-[10px] tracking-widest uppercase font-semibold text-[#16B8A6]">
            Secure Messenger
          </span>
        </div>
      )}
    </div>
  );
};
