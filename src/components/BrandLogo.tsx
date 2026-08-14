import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 'md',
  showSubtitle = true,
}) => {
  const sizeMap = {
    sm: { box: 'w-10 h-10', svg: 'w-10 h-10' },
    md: { box: 'w-14 h-14', svg: 'w-14 h-14' },
    lg: { box: 'w-20 h-20', svg: 'w-20 h-20' },
    xl: { box: 'w-28 h-28', svg: 'w-28 h-28' },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* High-fidelity Vector representation of the EM - إيمان المطيري logo */}
      <div className={`relative ${currentSize.box} flex items-center justify-center shrink-0 rounded-2xl bg-gradient-to-b from-stone-900 via-stone-900 to-stone-950 p-1 border border-cyan-500/30 shadow-lg shadow-cyan-950/40 group transition-all duration-300 hover:border-cyan-400/60`}>
        <svg
          viewBox="0 0 300 300"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`${currentSize.svg} drop-shadow-[0_2px_8px_rgba(41,182,246,0.3)] transition-transform duration-300 group-hover:scale-105`}
        >
          <defs>
            <linearGradient id="emCyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="50%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#0369a1" />
            </linearGradient>
            <linearGradient id="emLeafGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#7dd3fc" />
            </linearGradient>
            <filter id="subtleGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Letter E Main Vertical & Horizontal Bars */}
          <path
            d="M 90 75 L 175 75 L 175 92 L 138 92 L 138 135 L 170 135 L 170 148 L 138 148 L 138 190 L 175 190 L 175 207 L 90 207 Z"
            fill="url(#emCyanGrad)"
          />

          {/* Left Serif of Top Bar */}
          <path
            d="M 80 75 L 95 75 L 95 82 L 80 82 Z"
            fill="#38bdf8"
          />

          {/* Letter M Structure */}
          <path
            d="M 180 115 L 195 115 L 210 162 L 225 115 L 240 115 L 240 168 L 228 168 L 228 130 L 215 170 L 205 170 L 192 130 L 192 168 L 180 168 Z"
            fill="url(#emCyanGrad)"
          />

          {/* Serif on M */}
          <path
            d="M 175 115 L 195 115 L 195 120 L 175 120 Z"
            fill="#38bdf8"
          />
          <path
            d="M 225 115 L 245 115 L 245 120 L 225 120 Z"
            fill="#38bdf8"
          />
          <path
            d="M 225 165 L 245 165 L 245 170 L 225 170 Z"
            fill="#38bdf8"
          />

          {/* Arabic Calligraphy "إيمان المطيري" in Center */}
          <g fill="#38bdf8" className="font-serif">
            {/* Calligraphic styled text element */}
            <text
              x="138"
              y="142"
              textAnchor="middle"
              fill="#38bdf8"
              fontSize="20"
              fontWeight="900"
              fontFamily="'Amiri', 'Traditional Arabic', 'Scheherazade New', serif"
              letterSpacing="1"
            >
              إيمان المطيري
            </text>

            {/* Diacritics & Calligraphic swirls above & below */}
            <path
              d="M 95 122 Q 105 115 115 122 Q 125 115 135 122"
              stroke="#38bdf8"
              strokeWidth="1.8"
              fill="none"
            />
            <path
              d="M 140 122 Q 150 115 160 122 Q 170 115 180 122"
              stroke="#38bdf8"
              strokeWidth="1.8"
              fill="none"
            />
            <path
              d="M 98 152 Q 108 158 118 152 Q 128 158 138 152 Q 148 158 158 152 Q 168 158 178 152"
              stroke="#38bdf8"
              strokeWidth="1.8"
              fill="none"
            />
            
            {/* Small Calligraphic Harakat Accents */}
            <circle cx="102" cy="116" r="1.5" fill="#7dd3fc" />
            <circle cx="112" cy="116" r="1.5" fill="#7dd3fc" />
            <circle cx="155" cy="116" r="1.5" fill="#7dd3fc" />
            <circle cx="168" cy="116" r="1.5" fill="#7dd3fc" />
            <circle cx="125" cy="158" r="1.5" fill="#7dd3fc" />
            <circle cx="145" cy="158" r="1.5" fill="#7dd3fc" />
          </g>

          {/* Sweeping Flourish / Swirl below E & around M */}
          <path
            d="M 125 220 C 85 228, 68 190, 80 165 C 92 140, 140 160, 180 185 C 210 205, 235 185, 220 160 C 205 135, 175 145, 175 145"
            stroke="url(#emCyanGrad)"
            strokeWidth="4.5"
            strokeLinecap="round"
            fill="none"
          />

          {/* Teardrop flourish terminal at bottom left */}
          <path
            d="M 125 220 C 132 225, 134 235, 126 242 C 118 248, 106 244, 104 234 C 102 225, 114 218, 125 220 Z"
            fill="#0284c7"
          />

          {/* Delicate Botanical Vine / Leaves ascending on M */}
          <g stroke="url(#emLeafGrad)" strokeWidth="2" fill="url(#emLeafGrad)">
            {/* Stem */}
            <path
              d="M 195 170 Q 205 145 212 125"
              stroke="#38bdf8"
              strokeWidth="2"
              fill="none"
            />
            {/* Leaves */}
            <path d="M 198 160 Q 190 155 194 150 Q 200 152 198 160 Z" />
            <path d="M 204 148 Q 212 145 210 138 Q 204 140 204 148 Z" />
            <path d="M 206 138 Q 198 132 203 126 Q 208 130 206 138 Z" />
            <path d="M 212 125 Q 218 118 214 112 Q 210 116 212 125 Z" />
          </g>
        </svg>

        {/* Subtle Ambient Pulse Light */}
        <div className="absolute inset-0 rounded-2xl bg-cyan-500/5 blur-sm pointer-events-none group-hover:bg-cyan-500/15 transition-all" />
      </div>

      {showSubtitle && (
        <div className="text-right">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-stone-100 text-sm sm:text-base tracking-wide">
              إيمان المطيري
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 font-semibold">
              Eman Al-Mutairi
            </span>
          </div>
          <span className="text-[11px] text-stone-400 block font-normal">
            منصة الصوت والذكاء الاصطناعي السعودي
          </span>
        </div>
      )}
    </div>
  );
};
