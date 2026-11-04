import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message = 'Ocurrió un error al cargar la información.',
  onRetry,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center bg-white rounded-2xl border border-red-200 shadow-xs ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-red-50 text-[#A43108] flex items-center justify-center mb-3">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h4 className="text-sm font-bold text-[#111111] mb-1">Error de sincronización</h4>
      <p className="text-xs text-[#6B6B6B] max-w-sm mb-4">{message}</p>
      {onRetry && (
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          onClick={onRetry}
        >
          Reintentar
        </Button>
      )}
    </div>
  );
};
