import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'md',
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
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  }[maxWidth];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#111111]/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Dialog card */}
      <div
        className={`relative z-10 w-full ${widthClasses} bg-white rounded-2xl shadow-2xl border border-[#E7E5E0] overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95`}
      >
        {(title || subtitle) && (
          <div className="flex items-start justify-between p-5 border-b border-[#E7E5E0] bg-[#FAFAF8]">
            <div>
              {title && <h3 className="text-base font-bold text-[#111111]">{title}</h3>}
              {subtitle && <p className="text-xs text-[#6B6B6B] mt-0.5">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              className="text-[#6B6B6B] hover:text-[#111111] p-1 rounded-lg hover:bg-[#E7E5E0]/50 transition-colors"
              aria-label="Cerrar modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="p-5 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};
