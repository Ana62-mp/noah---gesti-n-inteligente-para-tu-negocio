import React from 'react';

interface LogoProps {
  variant?: 'light' | 'dark' | 'icon-only';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ variant = 'dark', size = 'md', className = '' }) => {
  const isLight = variant === 'light'; // Light background -> dark logo
  const isIconOnly = variant === 'icon-only';

  const sizeClasses = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-11',
  }[size];

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Isotipo: N con onda de voz y burbuja de diálogo */}
      <svg
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${sizeClasses} aspect-square shrink-0`}
      >
        <defs>
          <linearGradient id="noahLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#CF6811" />
            <stop offset="55%" stopColor="#D59F3F" />
            <stop offset="100%" stopColor="#A43108" />
          </linearGradient>
        </defs>

        {/* Círculo contenedor suave */}
        <rect width="40" height="40" rx="12" fill="url(#noahLogoGrad)" />

        {/* Letra N combinada con barras de onda de voz */}
        {/* Barra izquierda N */}
        <rect x="9" y="11" width="4.5" height="18" rx="2.25" fill="#FFFFFF" />
        {/* Barra central onda baja */}
        <rect x="15.5" y="16" width="3.5" height="8" rx="1.75" fill="#FFFFFF" opacity="0.85" />
        {/* Barra central onda alta (pulso de voz) */}
        <rect x="21" y="13" width="3.5" height="14" rx="1.75" fill="#FFFFFF" opacity="0.95" />
        {/* Barra derecha N */}
        <rect x="26.5" y="11" width="4.5" height="18" rx="2.25" fill="#FFFFFF" />

        {/* Pequeña colita de burbuja de diálogo */}
        <path
          d="M10 29.5 L6 33.5 C5.5 34 5 33.5 5.5 32.8 L7.5 28.5 Z"
          fill="#CF6811"
        />
      </svg>

      {!isIconOnly && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-display text-lg tracking-[0.16em] font-extrabold uppercase ${
                isLight ? 'text-[#111111]' : 'text-white'
              }`}
            >
              NOAH
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold tracking-wider bg-[#EBD48F] text-[#421A05]">
              AI
            </span>
          </div>
          <span
            className={`text-[9px] tracking-wider uppercase font-medium mt-0.5 ${
              isLight ? 'text-[#6B6B6B]' : 'text-[#E7E5E0]/70'
            }`}
          >
            Habla con tu negocio
          </span>
        </div>
      )}
    </div>
  );
};
