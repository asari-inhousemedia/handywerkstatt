
import React from 'react';

interface LogoProps {
  className?: string;
  inverse?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = "h-12", inverse = false }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Hexagon Icon */}
      <svg viewBox="0 0 100 100" className="h-full w-auto drop-shadow-sm">
        <path 
          d="M25 5 L75 5 L100 50 L75 95 L25 95 L0 50 Z" 
          fill="#99bc1c" 
        />
        {/* Plus Shape */}
        <rect x="20" y="42" width="60" height="16" fill="white" rx="2" />
        {/* Phone Shape */}
        <rect x="38" y="20" width="24" height="60" fill="white" rx="4" />
        {/* Screen/Details */}
        <rect x="41" y="25" width="18" height="45" fill="#99bc1c" rx="1" />
        <circle cx="50" cy="74" r="2" fill="#99bc1c" />
      </svg>
      
      {/* Text Component */}
      <div className="flex font-bold tracking-tighter text-3xl md:text-4xl">
        <span className={inverse ? "text-white" : "text-[#575756]"}>HANDY</span>
        <span className="text-[#99bc1c]">WERKSTATT</span>
      </div>
    </div>
  );
};

export default Logo;
