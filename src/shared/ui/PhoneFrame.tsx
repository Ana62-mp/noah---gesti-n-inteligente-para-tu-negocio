import React, { useEffect, useState } from 'react';
import { BatteryFull, Signal, Wifi } from 'lucide-react';

export type PhoneModel = 'iphone' | 'android';
export type PhoneTheme = 'light' | 'dark';

const CLOCK_REFRESH_MS = 30000;

const MODEL_STYLES: Record<PhoneModel, { frame: string; screen: string }> = {
  iphone: { frame: 'w-[350px] h-[700px] rounded-[52px] p-3', screen: 'rounded-[42px]' },
  android: { frame: 'w-[310px] h-[620px] rounded-[32px] p-2', screen: 'rounded-[26px]' },
};

const getClock = () => new Date().toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' });

interface PhoneFrameProps {
  model: PhoneModel;
  theme: PhoneTheme;
  children: React.ReactNode;
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({ model, theme, children }) => {
  const [clock, setClock] = useState(getClock);
  const styles = MODEL_STYLES[model];

  useEffect(() => {
    const timer = setInterval(() => setClock(getClock()), CLOCK_REFRESH_MS);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={`bg-[#111111] border-4 border-[#2B2B2B] shadow-2xl transition-all duration-300 ${styles.frame}`}>
      <div data-theme={theme} className={`phone-app relative w-full h-full overflow-hidden flex flex-col ${styles.screen}`}>
        <div className="relative z-20 shrink-0 h-9 px-6 flex items-center justify-between text-[11px] font-bold">
          <span className="tabular-nums">{clock}</span>
          {model === 'iphone' ? (
            <div className="absolute left-1/2 -translate-x-1/2 top-1.5 w-24 h-6 bg-black rounded-full" />
          ) : (
            <div className="absolute left-1/2 -translate-x-1/2 top-2 w-3.5 h-3.5 bg-black rounded-full" />
          )}
          <div className="flex items-center gap-1">
            <Signal className="w-3 h-3" />
            <Wifi className="w-3 h-3" />
            <BatteryFull className="w-4 h-4" />
          </div>
        </div>
        {children}
      </div>
    </div>
  );
};
