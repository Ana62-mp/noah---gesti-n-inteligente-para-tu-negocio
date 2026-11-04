import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Logo } from '../../../shared/ui/Logo';
import { NoahOrb } from '../../../shared/ui/NoahOrb';

const SPLASH_DURATION_MS = 1100;

export interface PhoneTab<T extends string> {
  id: T;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

interface PhoneTabBarProps<T extends string> {
  tabs: PhoneTab<T>[];
  active: T;
  onChange: (tab: T) => void;
}

export function PhoneTabBar<T extends string>({ tabs, active, onChange }: PhoneTabBarProps<T>) {
  return (
    <nav className="ph-tabbar shrink-0 flex items-stretch justify-around px-1 pt-1 pb-3" aria-label="Navegación de la app">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          aria-current={active === tab.id ? 'page' : undefined}
          className={`relative flex-1 min-h-11 flex flex-col items-center justify-center gap-0.5 rounded-xl text-[10px] font-bold transition-colors ${
            active === tab.id ? 'text-[#CF6811]' : 'ph-muted'
          }`}
        >
          {tab.icon}
          <span>{tab.label}</span>
          {Boolean(tab.badge) && (
            <span className="absolute top-0.5 right-3 min-w-4 h-4 px-1 rounded-full bg-[#A43108] text-white text-[9px] flex items-center justify-center">
              {tab.badge}
            </span>
          )}
        </button>
      ))}
    </nav>
  );
}

export const PhoneHeader: React.FC<{ eyebrow: string; title: string; right?: React.ReactNode }> = ({ eyebrow, title, right }) => (
  <div className="flex items-center justify-between gap-2">
    <div className="min-w-0">
      <div className="text-[10px] uppercase font-bold ph-muted truncate">{eyebrow}</div>
      <div className="font-display font-extrabold text-lg leading-tight truncate">{title}</div>
    </div>
    {right}
  </div>
);

export const PhoneSplash: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(false), SPLASH_DURATION_MS);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;
  return (
    <div className="absolute inset-0 z-40 gradient-espresso flex flex-col items-center justify-center gap-3 page-enter">
      <Logo variant="dark" size="lg" />
      <span className="text-xs text-[#EBD48F]">Habla con tu negocio</span>
    </div>
  );
};

interface PhonePushProps {
  message: string;
  onOpen: () => void;
  onClose: () => void;
}

export const PhonePush: React.FC<PhonePushProps> = ({ message, onOpen, onClose }) => (
  <div className="absolute inset-x-2 top-10 z-30 phone-push flex items-start gap-1 p-2.5 rounded-2xl bg-white text-[#111111] shadow-2xl border border-[#CF6811]/50">
    <button onClick={onOpen} className="flex-1 min-w-0 flex items-start gap-2 text-left">
      <NoahOrb state="idle" size="sm" showRipples={false} />
      <span className="min-w-0">
        <span className="block text-[11px] font-extrabold text-[#421A05]">NOAH · ahora</span>
        <span className="block text-xs font-semibold leading-tight">{message}</span>
      </span>
    </button>
    <button onClick={onClose} className="shrink-0 p-1.5 text-[#6B6B6B] hover:text-[#111111]" aria-label="Cerrar notificación">
      <X className="w-3.5 h-3.5" />
    </button>
  </div>
);

interface PhoneSheetProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export const PhoneSheet: React.FC<PhoneSheetProps> = ({ title, onClose, children }) => (
  <div className="absolute inset-0 z-30 flex items-end bg-black/50">
    <div className="ph-sheet w-full max-h-[85%] overflow-y-auto rounded-t-3xl p-4 space-y-3 page-enter">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-display font-extrabold text-sm">{title}</h3>
        <button onClick={onClose} className="p-1.5 ph-muted" aria-label="Cerrar">
          <X className="w-4 h-4" />
        </button>
      </div>
      {children}
    </div>
  </div>
);
