import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface SidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  width?: 'sm' | 'md' | 'lg' | 'xl';
  headerExtra?: React.ReactNode;
}

export const SidePanel: React.FC<SidePanelProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  width = 'md',
  headerExtra,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widthClasses = {
    sm: 'max-w-xs',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  }[width];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#111111]/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div
        className={`relative z-10 w-full ${widthClasses} bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200 border-l border-[#E7E5E0]`}
      >
        <div className="flex items-center justify-between p-4 border-b border-[#E7E5E0] bg-[#FAFAF8]">
          <div className="flex items-center gap-3">
            <div>
              {title && <h3 className="text-sm font-bold text-[#111111]">{title}</h3>}
              {subtitle && <p className="text-[11px] text-[#6B6B6B]">{subtitle}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {headerExtra}
            <button
              onClick={onClose}
              className="text-[#6B6B6B] hover:text-[#111111] p-1.5 rounded-lg hover:bg-[#E7E5E0]/60 transition-colors"
              aria-label="Cerrar panel lateral"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col">{children}</div>
      </div>
    </div>
  );
};
