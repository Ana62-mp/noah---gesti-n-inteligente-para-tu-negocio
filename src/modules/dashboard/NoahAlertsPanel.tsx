import React, { useEffect, useState } from 'react';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { useApp } from '../../shared/context/AppContext';
import { getVisibleAlerts } from '../../shared/permissions/rolePermissions';
import { apiService } from '../../shared/services/apiService';
import { NotificationAlert } from '../../shared/types';
import { Badge } from '../../shared/ui/Badge';
import { Button } from '../../shared/ui/Button';
import { NoahOrb } from '../../shared/ui/NoahOrb';

const SEVERITY_STYLE: Record<NotificationAlert['severity'], { box: string; icon: React.ReactNode }> = {
  critical: { box: 'border-[#A43108]/40 bg-[#F8E4DD]/60', icon: <AlertCircle className="w-4 h-4 text-[#A43108] shrink-0" /> },
  warning: { box: 'border-[#D59F3F]/50 bg-[#FFFBEB]', icon: <AlertTriangle className="w-4 h-4 text-[#8A6310] shrink-0" /> },
  info: { box: 'border-[#E7E5E0] bg-white', icon: <Info className="w-4 h-4 text-[#8A7424] shrink-0" /> },
};

const TOPIC_ACTION: Record<NotificationAlert['topic'], { section: string; label: string }> = {
  stock: { section: 'inventory', label: 'Ver inventario' },
  margin: { section: 'reports', label: 'Ver márgenes' },
  sales: { section: 'reports', label: 'Ver reporte' },
};

export const NoahAlertsPanel: React.FC = () => {
  const { accessibleSections, canAccess, setActiveSection, showToast, setUnreadNotificationsCount } = useApp();
  const [alerts, setAlerts] = useState<NotificationAlert[]>([]);

  const load = async () => {
    const visible = getVisibleAlerts(accessibleSections, await apiService.getNotifications()).filter(({ dismissed }) => !dismissed);
    setAlerts(visible);
    setUnreadNotificationsCount(visible.length);
  };

  useEffect(() => {
    load();
  }, []);

  const dismiss = async (id: string) => {
    await apiService.dismissNotification(id);
    showToast('Alerta descartada', 'info');
    load();
  };

  const getAction = (alert: NotificationAlert) => {
    if (alert.suggestedAction?.type === 'create_promo') return { section: 'alerts', label: 'Crear promoción' };
    if (alert.suggestedAction?.type === 'adjust_price') return { section: 'costing', label: 'Abrir costeo' };
    return TOPIC_ACTION[alert.topic];
  };

  return (
    <section className="bg-white rounded-2xl border border-[#E7E5E0] shadow-[var(--shadow-soft)] p-3.5 flex flex-col gap-2 flex-1 min-h-[220px] lg:min-h-0">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <NoahOrb state="idle" size="sm" showRipples={false} />
          <h3 className="text-sm font-bold text-[#111111]">Noah te avisa</h3>
        </div>
        <Badge variant="banana" size="sm">{alerts.length} avisos</Badge>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pr-0.5">
        {alerts.length === 0 && <p className="text-xs text-[#6B6B6B] py-6 text-center">Todo en orden. No hay avisos por revisar.</p>}
        {alerts.map((alert) => {
          const action = getAction(alert);
          return (
            <article key={alert.id} className={`rounded-xl border p-2.5 space-y-1 ${SEVERITY_STYLE[alert.severity].box}`}>
              <div className="flex items-start gap-1.5">
                {SEVERITY_STYLE[alert.severity].icon}
                <h4 className="flex-1 text-xs font-bold text-[#111111] leading-tight">{alert.title}</h4>
                <span className="text-[10px] text-[#6B6B6B] shrink-0">{alert.date}</span>
              </div>
              <p className="text-[11px] text-[#421A05] leading-snug">{alert.message}</p>
              <div className="flex items-center gap-1.5 pt-0.5">
                {canAccess(action.section) && (
                  <Button variant="secondary" size="sm" onClick={() => setActiveSection(action.section)}>{action.label}</Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => dismiss(alert.id)}>Descartar</Button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};
