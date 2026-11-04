import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { useApp } from '../../../shared/context/AppContext';
import { apiService } from '../../../shared/services/apiService';
import { NotificationAlert } from '../../../shared/types';
import { Badge } from '../../../shared/ui/Badge';
import { Button } from '../../../shared/ui/Button';
import { EmptyState } from '../../../shared/ui/EmptyState';
import { PhoneHeader, PhoneSheet } from '../components/PhoneChrome';

const SEVERITY: Record<NotificationAlert['severity'], { label: string; variant: 'terracotta' | 'banana' | 'harvest' }> = {
  critical: { label: 'Crítico', variant: 'terracotta' },
  warning: { label: 'Atención', variant: 'banana' },
  info: { label: 'Oportunidad', variant: 'harvest' },
};

const QUESTION_BY_TOPIC: Record<NotificationAlert['topic'], string> = {
  stock: '¿Qué tengo por vencer?',
  margin: '¿Cuál es mi plato menos rentable?',
  sales: 'Dame un consejo para vender más el miércoles',
};

interface OwnerAlertsProps {
  onChanged: () => void;
  onAsk: (question: string) => void;
}

export const OwnerAlerts: React.FC<OwnerAlertsProps> = ({ onChanged, onAsk }) => {
  const { showToast } = useApp();
  const [alerts, setAlerts] = useState<NotificationAlert[]>([]);
  const [promoAlert, setPromoAlert] = useState<NotificationAlert | null>(null);
  const [promoName, setPromoName] = useState('');
  const [promoDuration, setPromoDuration] = useState('Hoy hasta las 16:00');

  const load = async () => {
    setAlerts((await apiService.getNotifications()).filter((alert) => !alert.dismissed));
    onChanged();
  };

  useEffect(() => {
    load();
  }, []);

  const dismiss = async (id: string) => {
    await apiService.dismissNotification(id);
    showToast('Alerta descartada', 'info');
    load();
  };

  const openPromo = (alert: NotificationAlert) => {
    setPromoName(alert.suggestedAction?.payload?.title ?? 'Promoción sugerida');
    setPromoAlert(alert);
  };

  const savePromo = async () => {
    if (!promoAlert) return;
    await apiService.dismissNotification(promoAlert.id);
    setPromoAlert(null);
    confetti({ particleCount: 30, spread: 50 });
    showToast(`Borrador "${promoName}" guardado. No se publica sin tu aprobación.`, 'success');
    load();
  };

  return (
    <>
      <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-3 space-y-3">
        <PhoneHeader eyebrow="Noah te avisa" title="Alertas" />
        {alerts.length === 0 && <EmptyState title="Todo en orden" description="No tienes alertas por revisar." />}
        {alerts.map((alert) => (
          <div key={alert.id} className="ph-card p-3 space-y-1.5">
            <div className="flex items-start justify-between gap-2">
              <span className="font-bold text-xs leading-tight">{alert.title}</span>
              <Badge variant={SEVERITY[alert.severity].variant} size="sm">{SEVERITY[alert.severity].label}</Badge>
            </div>
            <p className="text-[11px] ph-muted leading-relaxed">{alert.message}</p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {alert.suggestedAction?.type === 'create_promo' ? (
                <Button variant="primary" size="sm" className="flex-1" onClick={() => openPromo(alert)}>
                  Crear promoción
                </Button>
              ) : (
                <Button variant="secondary" size="sm" className="flex-1" onClick={() => onAsk(QUESTION_BY_TOPIC[alert.topic])}>
                  Preguntar a Noah
                </Button>
              )}
              <Button variant="ghost" size="sm" className="ph-ghost" onClick={() => dismiss(alert.id)}>
                Descartar
              </Button>
            </div>
          </div>
        ))}
      </div>

      {promoAlert && (
        <PhoneSheet title="Borrador de promoción" onClose={() => setPromoAlert(null)}>
          <label className="block text-[11px] font-bold">
            Nombre
            <input value={promoName} onChange={(e) => setPromoName(e.target.value)} className="ph-input mt-1 w-full h-10 rounded-xl px-3 text-xs font-normal" />
          </label>
          <label className="block text-[11px] font-bold">
            Duración
            <input value={promoDuration} onChange={(e) => setPromoDuration(e.target.value)} className="ph-input mt-1 w-full h-10 rounded-xl px-3 text-xs font-normal" />
          </label>
          <p className="text-[11px] ph-muted">No se publica ni cambia precios sin tu aprobación.</p>
          <Button variant="primary" className="w-full" disabled={!promoName.trim()} onClick={savePromo}>
            Guardar borrador
          </Button>
        </PhoneSheet>
      )}
    </>
  );
};
