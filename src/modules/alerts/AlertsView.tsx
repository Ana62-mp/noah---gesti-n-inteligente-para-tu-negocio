import React, { useState, useEffect } from 'react';
import { useApp } from '../../shared/context/AppContext';
import { apiService } from '../../shared/services/apiService';
import { NotificationAlert } from '../../shared/types';
import { Button } from '../../shared/ui/Button';
import { Badge } from '../../shared/ui/Badge';
import { Modal } from '../../shared/ui/Modal';
import { getVisibleAlerts } from '../../shared/permissions/rolePermissions';
import {
  BellRing,
  AlertTriangle,
  AlertCircle,
  Info,
  Sparkles,
  Tag,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const AlertsView: React.FC = () => {
  const { showToast, setActiveSection, setUnreadNotificationsCount, currentRole, accessibleSections, canAccess } = useApp();
  const canCreatePromo = currentRole === 'owner';
  const [alerts, setAlerts] = useState<NotificationAlert[]>([]);
  const [selectedAlertForPromo, setSelectedAlertForPromo] = useState<NotificationAlert | null>(null);
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);

  // Promo draft form
  const [promoTitle, setPromoTitle] = useState('Miércoles de Seco 2x1');
  const [promoDish, setPromoDish] = useState('Seco de pollo');
  const [promoDiscount, setPromoDiscount] = useState('2x1 ($7,50 por 2 platos)');
  const [promoDuration, setPromoDuration] = useState('Hoy hasta las 16:00');

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    const data = getVisibleAlerts(accessibleSections, await apiService.getNotifications());
    setAlerts(data);
    setUnreadNotificationsCount(data.filter((n) => !n.dismissed).length);
  };

  const handleOpenPromoModal = (alert: NotificationAlert) => {
    setSelectedAlertForPromo(alert);
    if (alert.suggestedAction?.payload) {
      setPromoTitle(alert.suggestedAction.payload.title || 'Promo especial');
      setPromoDish(alert.suggestedAction.payload.dishName || 'Seco de pollo');
      setPromoDiscount(alert.suggestedAction.payload.discountType || '2x1');
    }
    setIsPromoModalOpen(true);
  };

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    await apiService.addPromotion({ title: promoTitle, item: promoDish, discount: promoDiscount, duration: promoDuration });
    if (selectedAlertForPromo) await apiService.dismissNotification(selectedAlertForPromo.id);
    loadAlerts();
    try {
      confetti({ particleCount: 50, spread: 60 });
    } catch (e) {}

    setIsPromoModalOpen(false);
    showToast(canAccess('promotions') ? 'Borrador guardado en Promociones. No se aplica sin tu aprobación.' : 'Borrador guardado. No se aplica sin tu aprobación.', 'success');
  };

  const handleDismiss = async (id: string) => {
    await apiService.dismissNotification(id);
    showToast('Alerta descartada', 'info');
    loadAlerts();
  };

  return (
    <div className="space-y-3">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-end gap-2">
<Badge variant="banana">
          {alerts.filter((a) => !a.dismissed).length} alertas activas
        </Badge>
      </div>

      {/* Alerts Feed */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
        {alerts.map((alert) => {
          if (alert.dismissed) return null;

          const severityStyles = {
            critical: {
              border: 'border-[#A43108]/30 bg-red-50/40',
              icon: <AlertCircle className="w-5 h-5 text-[#A43108]" />,
              badge: 'terracotta' as const,
              label: 'Crítico',
            },
            warning: {
              border: 'border-[#D59F3F]/40 bg-[#FFFBEB]',
              icon: <AlertTriangle className="w-5 h-5 text-[#D59F3F]" />,
              badge: 'banana' as const,
              label: 'Advertencia',
            },
            info: {
              border: 'border-[#E7E5E0] bg-white',
              icon: <Info className="w-5 h-5 text-[#8A7424]" />,
              badge: 'harvest' as const,
              label: 'Oportunidad',
            },
          }[alert.severity];

          return (
            <div
              key={alert.id}
              className={`rounded-2xl border p-4 shadow-[var(--shadow-soft)] transition-all space-y-3 ${severityStyles.border}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="shrink-0 mt-0.5">{severityStyles.icon}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-display font-bold text-sm text-[#111111]">
                        {alert.title}
                      </h3>
                      <Badge variant={severityStyles.badge} size="sm">
                        {severityStyles.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-[#421A05] leading-relaxed mt-1">
                      {alert.message}
                    </p>
                  </div>
                </div>

                <span className="text-[11px] text-[#6B6B6B] shrink-0 font-medium">{alert.date}</span>
              </div>

              {/* Rule that triggered the alert (Rule transparency RN-06 & RN-10) */}
              <div className="flex items-center gap-2 text-[11px] text-[#6B6B6B] bg-black/5 px-3 py-1.5 rounded-lg">
                <span className="font-bold text-[#111111]">Regla disparada:</span>
                <span className="font-mono">{alert.ruleTriggered}</span>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-black/5 flex items-center justify-between">
                <div>
                  {alert.suggestedAction?.type === 'adjust_price' && canAccess('costing') ? (
                    <Button variant="cinnamon" size="sm" onClick={() => setActiveSection('costing')}>
                      {alert.suggestedAction.label}
                    </Button>
                  ) : alert.suggestedAction?.type === 'create_promo' && canCreatePromo ? (
                    <Button
                      variant={alert.severity === 'critical' ? 'primary' : 'cinnamon'}
                      size="sm"
                      leftIcon={<Tag className="w-3.5 h-3.5" />}
                      onClick={() => handleOpenPromoModal(alert)}
                    >
                      {alert.suggestedAction.label}
                    </Button>
                  ) : alert.topic === 'stock' && canAccess('inventory') ? (
                    <Button variant="secondary" size="sm" onClick={() => setActiveSection('inventory')}>
                      Ver inventario
                    </Button>
                  ) : null}
                </div>

                <button
                  onClick={() => handleDismiss(alert.id)}
                  className="text-xs text-[#6B6B6B] hover:text-[#A43108] transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Descartar</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Promotion Draft Modal (RN-10: Never applies automatically) */}
      <Modal
        isOpen={isPromoModalOpen}
        onClose={() => setIsPromoModalOpen(false)}
        title="Crear Promoción a partir de Alerta"
        subtitle="Transforma el inventario por vencer en liquidez inmediata"
      >
        <form onSubmit={handleApplyPromo} className="space-y-4 text-xs">
          {/* Safety rule callout */}
          <div className="p-3 bg-[#FBF6E6] border border-[#EBD48F] rounded-xl text-xs text-[#421A05] leading-relaxed">
            ⚠️ <strong>Control humano (RN-10):</strong> Noah propone la promoción pero{' '}
            <em>no se publica en redes ni se aplica a precios sin tu aprobación expresa</em>.
          </div>

          <div>
            <label className="font-semibold text-[#111111] block mb-1">Nombre de la promo:</label>
            <input
              type="text"
              value={promoTitle}
              onChange={(e) => setPromoTitle(e.target.value)}
              className="w-full border border-[#E7E5E0] rounded-xl p-2.5 text-xs text-[#111111] bg-[#F5F4F1] focus:bg-white"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-[#111111] block mb-1">Plato objetivo:</label>
              <input
                type="text"
                value={promoDish}
                onChange={(e) => setPromoDish(e.target.value)}
                className="w-full border border-[#E7E5E0] rounded-xl p-2.5 text-xs text-[#111111] bg-[#F5F4F1] focus:bg-white"
                required
              />
            </div>
            <div>
              <label className="font-semibold text-[#111111] block mb-1">Tipo de oferta:</label>
              <input
                type="text"
                value={promoDiscount}
                onChange={(e) => setPromoDiscount(e.target.value)}
                className="w-full border border-[#E7E5E0] rounded-xl p-2.5 text-xs text-[#111111] bg-[#F5F4F1] focus:bg-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-[#111111] block mb-1">Vigencia:</label>
            <input
              type="text"
              value={promoDuration}
              onChange={(e) => setPromoDuration(e.target.value)}
              className="w-full border border-[#E7E5E0] rounded-xl p-2.5 text-xs text-[#111111] bg-[#F5F4F1] focus:bg-white"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" type="button" onClick={() => setIsPromoModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              Aprobar y activar en caja
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
