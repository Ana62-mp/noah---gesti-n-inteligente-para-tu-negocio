import React from 'react';

interface VoiceWaveProps {
  isListening?: boolean;
  barCount?: number;
  className?: string;
  color?: string;
}

export const VoiceWave: React.FC<VoiceWaveProps> = ({
  isListening = true,
  barCount = 12,
  className = '',
  color = '#CF6811',
}) => {
  return (
    <div className={`flex items-center justify-center gap-1 h-8 ${className}`}>
      {Array.from({ length: barCount }).map((_, i) => {
        // Vary height & duration
        const delay = (i * 0.1).toFixed(2);
        const minHeight = 4;
        const maxHeight = 16 + ((i * 7) % 14);

        return (
          <span
            key={i}
            className={`w-1 rounded-full transition-all duration-150 ${
              isListening ? 'animate-voice-wave' : 'h-1'
            }`}
            style={{
              backgroundColor: color,
              animationDelay: `${delay}s`,
              height: isListening ? `${maxHeight}px` : `${minHeight}px`,
            }}
          />
        );
      })}
    </div>
  );
};
