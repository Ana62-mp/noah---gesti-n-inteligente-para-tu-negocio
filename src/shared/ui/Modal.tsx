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
  maxWidth = 'lg',
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#2A1103]/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Dialog card */}
      <div
        className={`relative z-10 w-full ${widthClasses} bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-[#EBD48F]/60 overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[88vh] page-enter`}
      >
        <div className="h-1.5 w-full gradient-brand shrink-0" />
        {(title || subtitle) && (
          <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-[#EBD48F]/50 bg-[#FBF6E6]/70">
            <div>
              {title && <h3 className="text-lg font-display font-extrabold text-[#421A05] leading-tight">{title}</h3>}
              {subtitle && <p className="text-xs text-[#6B6B6B] mt-0.5">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              className="shrink-0 w-10 h-10 flex items-center justify-center text-[#6B6B6B] hover:text-[#111111] rounded-xl hover:bg-[#EBD48F]/40 transition-colors"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        <div className="px-6 py-5 overflow-y-auto overflow-x-hidden">{children}</div>
      </div>
    </div>
  );
};
