
import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'full' | 'icon';
  inverse?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = "h-12", variant = 'full', inverse = false }) => {
  if (variant === 'icon') {
    return (
      <img
        src="/logo-icon.png"
        alt="TecWerkstatt"
        className={`${className} w-auto object-contain`}
      />
    );
  }

  // Full logo: Icon + Text nebeneinander
  // Bei inverse (dunkler Hintergrund) wird der Text weiß, Icon bleibt original
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img
        src="/logo-icon.png"
        alt="TecWerkstatt Icon"
        className="h-full w-auto object-contain"
      />
      <div className="flex text-3xl md:text-4xl font-light tracking-wide whitespace-nowrap">
        <span className={inverse ? "text-white" : "text-[#4a4a4a]"} style={{ fontWeight: 600 }}>TEC</span>
        <span className={inverse ? "text-gray-300" : "text-[#7a7a7a]"} style={{ fontWeight: 300 }}>WERKSTATT</span>
      </div>
    </div>
  );
};

export default Logo;
