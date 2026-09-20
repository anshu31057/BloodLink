import React from 'react';

interface BloodLinkLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  showTagline?: boolean;
  className?: string;
  light?: boolean;
}

export const BloodLinkLogo: React.FC<BloodLinkLogoProps> = ({
  size = 'md',
  showText = true,
  showTagline = false,
  className = '',
  light = false
}) => {
  // Dimensions for the icon
  const iconDimensions = {
    sm: { box: 'w-7 h-7', svg: 'w-4 h-4', font: 'text-sm', badge: 'text-[9px] px-1 py-0.5' },
    md: { box: 'w-9 h-9', svg: 'w-5 h-5', font: 'text-base', badge: 'text-[10px] px-1.5 py-0.5' },
    lg: { box: 'w-11 h-11', svg: 'w-6 h-6', font: 'text-lg', badge: 'text-xs px-2 py-0.5' },
    xl: { box: 'w-14 h-14', svg: 'w-8 h-8', font: 'text-2xl', badge: 'text-sm px-2.5 py-1' }
  }[size];

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Blood Drop + Medical Cross Vector Icon */}
      <div 
        className={`${iconDimensions.box} rounded-[14px] bg-[#D92D20] text-white flex items-center justify-center shrink-0 shadow-[0_2px_8px_rgba(217,45,32,0.25)] relative overflow-hidden`}
        aria-label="BloodLink 8 Logo"
      >
        <svg 
          viewBox="0 0 32 32" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className={`${iconDimensions.svg}`}
        >
          {/* Blood Drop Base Silhouette */}
          <path 
            d="M16 2.8C16 2.8 6.5 14.2 6.5 20.6C6.5 25.8 10.7 30 16 30C21.3 30 25.5 25.8 25.5 20.6C25.5 14.2 16 2.8 16 2.8Z" 
            fill="white"
            fillOpacity="0.2"
          />
          {/* Clean Medical Cross embedded in drop */}
          <path 
            d="M13.8 14.5C13.8 14.1 14.1 13.8 14.5 13.8H17.5C17.9 13.8 18.2 14.1 18.2 14.5V17.8H21.5C21.9 17.8 22.2 18.1 22.2 18.5V21.5C22.2 21.9 21.9 22.2 21.5 22.2H18.2V25.5C18.2 25.9 17.9 26.2 17.5 26.2H14.5C14.1 26.2 13.8 25.9 13.8 25.5V22.2H10.5C10.1 22.2 9.8 21.9 9.8 21.5V18.5C9.8 18.1 10.1 17.8 10.5 17.8H13.8V14.5Z" 
            fill="white"
          />
        </svg>
      </div>

      {/* Typography */}
      {showText && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1.5">
            <span className={`font-bold tracking-tight ${light ? 'text-white' : 'text-[#101828]'} ${iconDimensions.font}`}>
              BloodLink
            </span>
            <span className={`font-black rounded-md bg-[#D92D20] text-white tracking-wider ${iconDimensions.badge}`}>
              8
            </span>
          </div>

          {showTagline && (
            <span className={`text-[10px] tracking-tight font-medium mt-0.5 ${light ? 'text-white/80' : 'text-[#667085]'}`}>
              8 Blood Groups. One Lifeline.
            </span>
          )}
        </div>
      )}
    </div>
  );
};
