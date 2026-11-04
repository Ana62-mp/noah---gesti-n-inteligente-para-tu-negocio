import React from 'react';

export type OrbState = 'idle' | 'listening' | 'thinking' | 'speaking';

interface NoahOrbProps {
  state?: OrbState;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
  showRipples?: boolean;
  className?: string;
}

export const NoahOrb: React.FC<NoahOrbProps> = ({
  state = 'idle',
  size = 'md',
  onClick,
  showRipples = true,
  className = '',
}) => {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  const stateAnimation = {
    idle: 'animate-breathe',
    listening: 'animate-pulse scale-105',
    thinking: 'animate-slow-spin',
    speaking: 'animate-bounce',
  }[state];

  return (
    <div
      onClick={onClick}
      className={`relative inline-flex items-center justify-center shrink-0 ${
        onClick ? 'cursor-pointer hover:scale-105 active:scale-95 transition-transform' : ''
      } ${className}`}
      role={onClick ? 'button' : undefined}
      aria-label="Asistente Noah"
    >
      {/* Outer subtle glow/pulse when listening */}
      {showRipples && state === 'listening' && (
        <>
          <span className="absolute inset-0 rounded-full bg-[#CF6811]/30 animate-ping" />
          <span className="absolute -inset-2 rounded-full bg-[#D59F3F]/20 animate-pulse" />
        </>
      )}

      {/* Main Orb Body */}
      <div
        className={`${sizeMap[size]} ${stateAnimation} rounded-full relative overflow-hidden shadow-md flex items-center justify-center transition-all duration-300`}
        style={{
          background: 'linear-gradient(135deg, #CF6811 0%, #D59F3F 45%, #A43108 100%)',
          boxShadow: '0 4px 16px rgba(207, 104, 17, 0.35)',
        }}
      >
        {/* Inner specular highlight */}
        <div className="absolute top-1 left-2 w-1/3 h-1/4 bg-white/40 rounded-full blur-[1px] transform -rotate-12" />

        {/* Center waveform or neural icon */}
        <div className="relative z-10 flex items-center gap-0.5">
          <span
            className={`w-1 rounded-full bg-white/95 transition-all duration-200 ${
              state === 'listening'
                ? 'h-4 animate-voice-wave'
                : state === 'thinking'
                ? 'h-2 animate-pulse'
                : 'h-2.5'
            }`}
          />
          <span
            className={`w-1 rounded-full bg-white transition-all duration-200 ${
              state === 'listening'
                ? 'h-6 animate-voice-wave [animation-delay:150ms]'
                : state === 'thinking'
                ? 'h-3 animate-pulse'
                : 'h-4'
            }`}
          />
          <span
            className={`w-1 rounded-full bg-white/95 transition-all duration-200 ${
              state === 'listening'
                ? 'h-3.5 animate-voice-wave [animation-delay:300ms]'
                : state === 'thinking'
                ? 'h-2 animate-pulse'
                : 'h-2.5'
            }`}
          />
        </div>
      </div>
    </div>
  );
};
