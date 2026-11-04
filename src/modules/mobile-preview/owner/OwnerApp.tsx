import React, { useEffect, useState } from 'react';
import { BellRing, Home, MoreHorizontal, Sparkles, Wallet } from 'lucide-react';
import { apiService } from '../../../shared/services/apiService';
import { BUSINESS_OPTIONS } from '../../../shared/services/mockData';
import { PhoneAssistant } from '../components/PhoneAssistant';
import { PhoneTab, PhoneTabBar } from '../components/PhoneChrome';
import { OwnerAlerts } from './OwnerAlerts';
import { OwnerFinance } from './OwnerFinance';
import { OwnerHome } from './OwnerHome';
import { OwnerMore } from './OwnerMore';

export type OwnerTab = 'home' | 'noah' | 'finance' | 'alerts' | 'more';

const [RESTAURANT] = BUSINESS_OPTIONS;
const ICON = 'w-5 h-5';

export const OwnerApp: React.FC<{ requestedTab: { tab: string; nonce: number } | null }> = ({ requestedTab }) => {
  const [tab, setTab] = useState<OwnerTab>('home');
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null);
  const [alertCount, setAlertCount] = useState(0);

  const refreshAlertCount = async () => {
    const alerts = await apiService.getNotifications();
    setAlertCount(alerts.filter((alert) => !alert.dismissed).length);
  };

  useEffect(() => {
    refreshAlertCount();
  }, []);

  useEffect(() => {
    if (requestedTab) setTab(requestedTab.tab as OwnerTab);
  }, [requestedTab]);

  const askNoah = (question: string) => {
    setPendingQuestion(question);
    setTab('noah');
  };

  const tabs: PhoneTab<OwnerTab>[] = [
    { id: 'home', label: 'Inicio', icon: <Home className={ICON} /> },
    { id: 'noah', label: 'Noah', icon: <Sparkles className={ICON} /> },
    { id: 'finance', label: 'Finanzas', icon: <Wallet className={ICON} /> },
    { id: 'alerts', label: 'Alertas', icon: <BellRing className={ICON} />, badge: alertCount },
    { id: 'more', label: 'Más', icon: <MoreHorizontal className={ICON} /> },
  ];

  return (
    <>
      <div className="flex-1 min-h-0 flex flex-col relative">
        {tab === 'home' && <OwnerHome onAsk={askNoah} onOpenAlerts={() => setTab('alerts')} alertCount={alertCount} />}
        <div className={tab === 'noah' ? 'flex-1 min-h-0 flex flex-col' : 'hidden'}>
          <PhoneAssistant
            role="owner"
            business={RESTAURANT}
            pendingQuestion={pendingQuestion}
            onQuestionHandled={() => setPendingQuestion(null)}
          />
        </div>
        {tab === 'finance' && <OwnerFinance />}
        {tab === 'alerts' && <OwnerAlerts onChanged={refreshAlertCount} onAsk={askNoah} />}
        {tab === 'more' && <OwnerMore />}
      </div>
      <PhoneTabBar tabs={tabs} active={tab} onChange={setTab} />
    </>
  );
};
