import React, { useEffect, useState } from 'react';
import { useApp } from '../../../shared/context/AppContext';
import { apiService } from '../../../shared/services/apiService';
import { KitchenTicket } from '../../../shared/types';
import { Badge, BadgeVariant } from '../../../shared/ui/Badge';
import { Button } from '../../../shared/ui/Button';
import { EmptyState } from '../../../shared/ui/EmptyState';
import { PhoneHeader } from '../components/PhoneChrome';
import { WAITER_NAME } from './WaiterTables';

const STATUS: Record<KitchenTicket['status'], { label: string; variant: BadgeVariant }> = {
  pending: { label: 'En cola', variant: 'banana' },
  preparing: { label: 'Preparando', variant: 'cinnamon' },
  ready: { label: 'Listo para servir', variant: 'olive' },
};

const NEXT_STATUS: Partial<Record<KitchenTicket['status'], KitchenTicket['status']>> = {
  pending: 'preparing',
  preparing: 'ready',
};

export const WaiterOrders: React.FC = () => {
  const { showToast } = useApp();
  const [tickets, setTickets] = useState<KitchenTicket[]>([]);

  const load = async () => {
    const all = await apiService.getKitchenTickets();
    setTickets(all.filter((ticket) => ticket.waiterName === WAITER_NAME));
  };

  useEffect(() => {
    load();
  }, []);

  const simulateKitchenProgress = async () => {
    const next = tickets.find((ticket) => NEXT_STATUS[ticket.status]);
    const status = next && NEXT_STATUS[next.status];
    if (!next || !status) {
      showToast('Todos tus pedidos ya están listos', 'info');
      return;
    }
    await apiService.updateTicketStatus(next.id, status);
    showToast(`Cocina: comanda ${next.orderNumber} pasó a "${STATUS[status].label}"`, 'info');
    load();
  };

  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-3 space-y-3">
      <PhoneHeader eyebrow={`${WAITER_NAME} · Mesera`} title="Mis pedidos" />
      {tickets.length === 0 && <EmptyState title="Sin pedidos" description="Toma un pedido por voz para verlo aquí." />}
      {tickets.map((ticket) => (
        <div key={ticket.id} className="ph-card p-3 space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="font-extrabold text-xs">
              {ticket.orderNumber} · {ticket.tableNumber ? `Mesa ${ticket.tableNumber}` : 'Para llevar'}
            </span>
            <Badge variant={STATUS[ticket.status].variant} size="sm">{STATUS[ticket.status].label}</Badge>
          </div>
          {ticket.items.map((item) => (
            <div key={item.dishName} className="text-[11px]">
              <strong>{item.quantity}×</strong> {item.dishName}
              {item.notes && <span className="block ph-muted">{item.notes}</span>}
            </div>
          ))}
        </div>
      ))}
      {tickets.length > 0 && (
        <Button variant="secondary" className="w-full" onClick={simulateKitchenProgress}>
          Simular avance de cocina
        </Button>
      )}
    </div>
  );
};
