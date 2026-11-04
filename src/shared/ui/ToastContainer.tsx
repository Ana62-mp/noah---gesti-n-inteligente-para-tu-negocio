import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => {
        const icons = {
          success: <CheckCircle2 className="w-4 h-4 text-[#5C5011]" />,
          warning: <AlertTriangle className="w-4 h-4 text-[#D59F3F]" />,
          error: <AlertCircle className="w-4 h-4 text-[#A43108]" />,
          info: <Info className="w-4 h-4 text-[#CF6811]" />,
        }[t.type];

        const bg = {
          success: 'bg-[#FBF6E6] border-[#5C5011]/30 text-[#421A05]',
          warning: 'bg-[#FFFBEB] border-[#D59F3F]/40 text-[#421A05]',
          error: 'bg-[#FEF2F2] border-[#A43108]/30 text-[#421A05]',
          info: 'bg-white border-[#CF6811]/30 text-[#111111]',
        }[t.type];

        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-lg transition-all animate-in slide-in-from-bottom-2 ${bg}`}
          >
            <span className="shrink-0 mt-0.5">{icons}</span>
            <div className="flex-1 text-xs">
              {t.title && <div className="font-bold mb-0.5">{t.title}</div>}
              <div>{t.message}</div>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-[#6B6B6B] hover:text-[#111111] p-0.5 rounded transition-colors"
              aria-label="Cerrar notificación"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
