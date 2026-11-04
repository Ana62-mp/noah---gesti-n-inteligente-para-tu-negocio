import React, { useState, useEffect } from 'react';
import { useApp } from '../../shared/context/AppContext';
import { apiService } from '../../shared/services/apiService';
import { KitchenTicket } from '../../shared/types';
import { Button } from '../../shared/ui/Button';
import { Badge } from '../../shared/ui/Badge';
import { FilterBar } from '../../shared/ui/FilterBar';
import { Modal } from '../../shared/ui/Modal';
import {
  ChefHat,
  Printer,
  Clock,
  CheckCircle2,
  ArrowRight,
  AlertTriangle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const KitchenView: React.FC = () => {
  const { showToast } = useApp();
  const [allTickets, setTickets] = useState<KitchenTicket[]>([]);
  const [ticketQuery, setTicketQuery] = useState('');
  const [channelFilter, setChannelFilter] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('');
  const [selectedTicketForPrint, setSelectedTicketForPrint] = useState<KitchenTicket | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    const data = await apiService.getKitchenTickets();
    setTickets(data);
  };

  const handleUpdateStatus = async (ticketId: string, newStatus: KitchenTicket['status']) => {
    await apiService.updateTicketStatus(ticketId, newStatus);
    if (newStatus === 'ready') {
      try {
        confetti({ particleCount: 30, spread: 50 });
      } catch (e) {}
      showToast('¡Comanda lista para entrega a salón!', 'success');
    }
    loadTickets();
  };

  const handleOpenPrintPreview = (t: KitchenTicket) => {
    setSelectedTicketForPrint(t);
    setIsPrintModalOpen(true);
  };

  const tickets = allTickets.filter(
    (ticket) =>
      (!channelFilter || ticket.channel === channelFilter) &&
      (!urgencyFilter || ticket.urgency === urgencyFilter) &&
      (!ticketQuery || `${ticket.orderNumber} ${ticket.waiterName} ${ticket.tableNumber ?? ''} ${ticket.items.map((item) => item.dishName).join(' ')}`.toLowerCase().includes(ticketQuery.toLowerCase()))
  );
  const pendingTickets = tickets.filter((t) => t.status === 'pending');
  const preparingTickets = tickets.filter((t) => t.status === 'preparing');
  const readyTickets = tickets.filter((t) => t.status === 'ready');

  return (
    <div className="space-y-3">
      <FilterBar
        search={{ value: ticketQuery, onChange: setTicketQuery, placeholder: 'Buscar comanda, mesa, mesero o plato…' }}
        fields={[
          { key: 'channel', label: 'Canal', type: 'select', options: [{ value: '', label: 'Todos' }, { value: 'salon', label: 'Salón' }, { value: 'takeout', label: 'Para llevar' }, { value: 'delivery', label: 'Delivery' }] },
          { key: 'urgency', label: 'Demora', type: 'select', options: [{ value: '', label: 'Todas' }, { value: 'normal', label: 'En tiempo' }, { value: 'delayed', label: 'Demoradas' }] },
        ]}
        values={{ channel: channelFilter, urgency: urgencyFilter }}
        onChange={(key, value) => (key === 'channel' ? setChannelFilter(value) : setUrgencyFilter(value))}
        onReset={() => { setTicketQuery(''); setChannelFilter(''); setUrgencyFilter(''); }}
        activeCount={[ticketQuery, channelFilter, urgencyFilter].filter(Boolean).length}
        total={tickets.length}
        totalLabel="comandas"
      />

      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-end gap-2">
<div className="flex items-center gap-2">
          <Badge variant="banana" size="sm">
            {tickets.length} comandas en proceso
          </Badge>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            onClick={loadTickets}
          >
            Actualizar
          </Button>
        </div>
      </div>

      {/* 3-Column Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-stretch">
        {/* Column 1: Pendiente */}
        <div className="bg-[#FFF6DC] border-[#D59F3F]/50 rounded-2xl border p-4 space-y-4 min-h-[calc(100dvh-10rem)]">
          <div className="flex items-center justify-between pb-2 border-b border-[#E7E5E0]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D59F3F]" />
              <h3 className="text-sm font-bold text-[#111111]">Pendientes</h3>
            </div>
            <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-full bg-white border border-[#E7E5E0]">
              {pendingTickets.length}
            </span>
          </div>

          <div className="space-y-3">
            {pendingTickets.map((t) => (
              <TicketCard
                key={t.id}
                ticket={t}
                onPrint={() => handleOpenPrintPreview(t)}
                nextAction={{
                  label: 'Iniciar preparación',
                  onClick: () => handleUpdateStatus(t.id, 'preparing'),
                }}
              />
            ))}
            {pendingTickets.length === 0 && (
              <div className="text-center py-8 text-xs text-[#6B6B6B]">
                Sin comandas pendientes en cola
              </div>
            )}
          </div>
        </div>

        {/* Column 2: En Preparación */}
        <div className="bg-[#FDEBD6] border-[#CF6811]/50 rounded-2xl border p-4 space-y-4 min-h-[calc(100dvh-10rem)]">
          <div className="flex items-center justify-between pb-2 border-b border-[#E7E5E0]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#CF6811]" />
              <h3 className="text-sm font-bold text-[#111111]">En preparación</h3>
            </div>
            <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-full bg-white border border-[#E7E5E0]">
              {preparingTickets.length}
            </span>
          </div>

          <div className="space-y-3">
            {preparingTickets.map((t) => (
              <TicketCard
                key={t.id}
                ticket={t}
                onPrint={() => handleOpenPrintPreview(t)}
                nextAction={{
                  label: 'Marcar listo',
                  onClick: () => handleUpdateStatus(t.id, 'ready'),
                }}
              />
            ))}
            {preparingTickets.length === 0 && (
              <div className="text-center py-8 text-xs text-[#6B6B6B]">
                Cocina lista para recibir pedidos
              </div>
            )}
          </div>
        </div>

        {/* Column 3: Listo / Entregado */}
        <div className="bg-[#EEEBD0] border-[#5C5011]/40 rounded-2xl border p-4 space-y-4 min-h-[calc(100dvh-10rem)]">
          <div className="flex items-center justify-between pb-2 border-b border-[#E7E5E0]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#5C5011]" />
              <h3 className="text-sm font-bold text-[#111111]">Listos para despacho</h3>
            </div>
            <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-full bg-white border border-[#E7E5E0]">
              {readyTickets.length}
            </span>
          </div>

          <div className="space-y-3">
            {readyTickets.map((t) => (
              <TicketCard
                key={t.id}
                ticket={t}
                onPrint={() => handleOpenPrintPreview(t)}
                isDone
              />
            ))}
            {readyTickets.length === 0 && (
              <div className="text-center py-8 text-xs text-[#6B6B6B]">
                Ningún plato pendiente de servir
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Simulated Thermal Ticket Print Preview Modal */}
      {selectedTicketForPrint && (
        <Modal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          title="Vista Previa de Comanda Térmica"
          subtitle="Simulación de impresión para cocina"
        >
          <div className="space-y-4 text-xs">
            {/* Caution Banner required by RN-09 & CA-09 */}
            <div className="p-3 bg-[#FBF6E6] border border-[#EBD48F] rounded-xl text-[#421A05] text-[11px] font-semibold">
              ⚠️ <strong>Impresión simulada · equipo por definir:</strong> La integración real con comandera térmica Epson/Bixolon (vía ESC/POS o red local) se presupuestará en la fase comercial.
            </div>

            {/* Thermal Ticket Mockup */}
            <div className="bg-[#FFFFF0] border border-dashed border-[#111111]/30 p-5 rounded-md font-mono text-[11px] text-[#111111] max-w-xs mx-auto shadow-sm space-y-3">
              <div className="text-center border-b border-dashed border-[#111111]/30 pb-2">
                <div className="font-extrabold text-sm uppercase">LA SAZÓN DE CARLOS</div>
                <div>COMANDA COCINA {selectedTicketForPrint.orderNumber}</div>
                <div>Hora: {selectedTicketForPrint.createdAt}</div>
                <div className="font-bold mt-1">
                  {selectedTicketForPrint.tableNumber
                    ? `MESA ${selectedTicketForPrint.tableNumber} (SALÓN)`
                    : 'PARA LLEVAR / DELIVERY'}
                </div>
                <div>Mesero: {selectedTicketForPrint.waiterName}</div>
              </div>

              <div className="space-y-2 py-1">
                {selectedTicketForPrint.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between items-start">
                    <div>
                      <span className="font-bold text-xs">{it.quantity}x </span>
                      <span>{it.dishName}</span>
                      {it.notes && (
                        <div className="text-[10px] italic text-[#A43108]">
                          ** {it.notes} **
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-dashed border-[#111111]/30 pt-2 text-center text-[10px]">
                *** FIN DE COMANDA ***
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setIsPrintModalOpen(false)}>
                Cerrar
              </Button>
              <Button
                variant="primary"
                leftIcon={<Printer className="w-4 h-4" />}
                onClick={() => {
                  setIsPrintModalOpen(false);
                  showToast('Ticket térmico enviado a comandera (Simulado)', 'success');
                }}
              >
                Enviar a imprimir (Simulado)
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

// Reusable Ticket Card inside Kanban
const TicketCard: React.FC<{
  ticket: KitchenTicket;
  onPrint: () => void;
  nextAction?: { label: string; onClick: () => void };
  isDone?: boolean;
}> = ({ ticket, onPrint, nextAction, isDone = false }) => {
  const isDelayed = ticket.urgency === 'delayed';

  return (
    <div
      className={`p-4 rounded-xl border bg-white shadow-2xs space-y-3 transition-all ${
        isDelayed ? 'border-[#D59F3F] ring-1 ring-[#D59F3F]/30' : 'border-[#E7E5E0]'
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="font-display font-extrabold text-sm text-[#111111]">
            {ticket.orderNumber}
          </span>
          <div className="text-[11px] text-[#6B6B6B]">
            {ticket.tableNumber ? `Mesa ${ticket.tableNumber}` : 'Delivery'} · {ticket.waiterName}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <div
            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded ${
              isDelayed
                ? 'bg-[#D59F3F]/15 text-[#8A6310]'
                : 'bg-[#F5F4F1] text-[#6B6B6B]'
            }`}
          >
            <Clock className="w-3 h-3" />
            <span>{ticket.elapsedMinutes}m</span>
          </div>
        </div>
      </div>

      {/* Dishes List */}
      <div className="space-y-1.5 text-xs text-[#111111] divide-y divide-[#E7E5E0]/40">
        {ticket.items.map((it, idx) => (
          <div key={idx} className="pt-1.5 first:pt-0">
            <div className="flex items-center justify-between">
              <span className="font-bold">
                {it.quantity}x {it.dishName}
              </span>
              {it.done && <CheckCircle2 className="w-3.5 h-3.5 text-[#5C5011]" />}
            </div>
            {it.notes && (
              <div className="text-[11px] text-[#A43108] font-semibold italic mt-0.5">
                Obs: {it.notes}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Card Actions */}
      <div className="pt-2 border-t border-[#E7E5E0] flex items-center justify-between gap-2">
        <button
          onClick={onPrint}
          className="text-[11px] text-[#6B6B6B] hover:text-[#111111] flex items-center gap-1 font-medium transition-colors"
          title="Vista previa ticket térmico"
        >
          <Printer className="w-3.5 h-3.5 text-[#CF6811]" />
          <span>Ticket</span>
        </button>

        {nextAction && (
          <Button variant="secondary" size="sm" onClick={nextAction.onClick}>
            {nextAction.label}
          </Button>
        )}
      </div>
    </div>
  );
};
