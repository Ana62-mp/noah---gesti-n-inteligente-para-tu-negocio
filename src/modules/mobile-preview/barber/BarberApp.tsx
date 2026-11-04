import React, { useEffect, useState } from 'react';
import { CalendarDays, Mic, Scissors } from 'lucide-react';
import { BarberService } from '../../../shared/types';
import { PhoneTab, PhoneTabBar } from '../components/PhoneChrome';
import { BarberAgenda } from './BarberAgenda';
import { BarberBooking } from './BarberBooking';
import { BarberServices } from './BarberServices';

export type BarberTab = 'agenda' | 'booking' | 'services';

const ICON = 'w-5 h-5';

const TABS: PhoneTab<BarberTab>[] = [
  { id: 'agenda', label: 'Agenda', icon: <CalendarDays className={ICON} /> },
  { id: 'booking', label: 'Agendar', icon: <Mic className={ICON} /> },
  { id: 'services', label: 'Servicios', icon: <Scissors className={ICON} /> },
];

export const BarberApp: React.FC<{ requestedTab: { tab: string; nonce: number } | null }> = ({ requestedTab }) => {
  const [tab, setTab] = useState<BarberTab>('agenda');
  const [presetService, setPresetService] = useState<BarberService | null>(null);

  useEffect(() => {
    if (requestedTab) setTab(requestedTab.tab as BarberTab);
  }, [requestedTab]);

  return (
    <>
      <div className="flex-1 min-h-0 flex flex-col relative">
        {tab === 'agenda' && <BarberAgenda onBook={() => setTab('booking')} />}
        {tab === 'booking' && <BarberBooking presetService={presetService} onSeeAgenda={() => setTab('agenda')} />}
        {tab === 'services' && (
          <BarberServices
            onPick={(service) => {
              setPresetService(service);
              setTab('booking');
            }}
          />
        )}
      </div>
      <PhoneTabBar tabs={TABS} active={tab} onChange={setTab} />
    </>
  );
};
