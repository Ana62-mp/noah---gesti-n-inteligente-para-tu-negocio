import React, { useState, useEffect } from 'react';
import { useApp } from '../../shared/context/AppContext';
import { apiService } from '../../shared/services/apiService';
import { KitchenTicket, TableItem } from '../../shared/types';
import { Button } from '../../shared/ui/Button';
import { Badge } from '../../shared/ui/Badge';
import { Modal } from '../../shared/ui/Modal';
import { FilterBar } from '../../shared/ui/FilterBar';
import { formatCurrency } from '../../shared/utils/formatters';
import {
  Grid3X3,
  Users,
  Clock,
  DollarSign,
  CheckCircle2,
  Receipt,
  Utensils,
  Plus,
} from 'lucide-react';
import confetti from 'canvas-confetti';

const TABLE_STATUS_LABELS: Record<TableItem['status'], string> = {
  free: 'Libre para comensales',
  ordering: 'Pidiendo',
  occupied: 'Ocupada',
  billing: 'Por cobrar',
};

export const TablesView: React.FC = () => {
  const { showToast, setActiveSection, canAccess } = useApp();
  const canCharge = canAccess('sales');
  const canUseVoice = canAccess('voice_scenarios');
  const [tables, setTables] = useState<TableItem[]>([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [capacity, setCapacity] = useState('');
  const [waiter, setWaiter] = useState('');
  const [selectedTable, setSelectedTable] = useState<TableItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [tableTickets, setTableTickets] = useState<KitchenTicket[]>([]);

  useEffect(() => {
    loadTables();
  }, []);

  const loadTables = async () => {
    const data = await apiService.getTables();
    setTables(data);
  };

  const handleOpenTable = async (table: TableItem) => {
    setSelectedTable(table);
    setIsDetailModalOpen(true);
    const tickets = await apiService.getKitchenTickets();
    setTableTickets(tickets.filter((ticket) => ticket.tableNumber === table.id));
  };

  const handleCloseAndBillTable = async () => {
    if (!selectedTable) return;

    try {
      confetti({ particleCount: 40, spread: 50 });
    } catch (e) {}

    await apiService.updateTableStatus(selectedTable.id, 'free');
    if (selectedTable.total) {
      await apiService.addSale({
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' }),
        channel: 'salon',
        tableNumber: selectedTable.id,
        waiterName: selectedTable.waiterName || 'Ana',
        items: [
          {
            dishId: 'dish-table-close',
            dishName: `Consumo Mesa ${selectedTable.id}`,
            quantity: 1,
            unitPrice: selectedTable.total,
            subtotal: selectedTable.total,
          },
        ],
        subtotal: selectedTable.total,
        tax: selectedTable.total * 0.15,
        total: selectedTable.total,
        paymentMethod: 'cash',
        status: 'completed',
      });
    }

    setIsDetailModalOpen(false);
    showToast(`Mesa ${selectedTable.id} cobrada y liberada con éxito`, 'success');
    loadTables();
  };

  const handleOccupyTable = async (status: TableItem['status']) => {
    if (!selectedTable) return;
    await apiService.updateTableStatus(selectedTable.id, status);
    setIsDetailModalOpen(false);
    showToast(`Estado de Mesa ${selectedTable.id} actualizado`, 'info');
    loadTables();
  };

  const visibleTables = tables.filter(t => (!status || t.status === status) && (!capacity || String(t.capacity) === capacity) && (!waiter || t.waiterName === waiter) && `${t.name} ${t.id} ${t.waiterName ?? ''}`.toLowerCase().includes(query.trim().toLowerCase()));
  const resetFilters = () => { setQuery(''); setStatus(''); setCapacity(''); setWaiter(''); };
  const summaries = [
    { status: 'free', title: 'Libres', hint: 'Listas para recibir clientes', color: 'bg-[#F3F5E8] text-[#5C5011]', Icon: CheckCircle2 },
    { status: 'ordering', title: 'Pidiendo', hint: 'Acompaña la elección del menú', color: 'bg-[#FFF6DC] text-[#8A7424]', Icon: Utensils },
    { status: 'occupied', title: 'Ocupadas', hint: 'Servicio y consumo en curso', color: 'bg-[#FDEBD6] text-[#CF6811]', Icon: Users },
    { status: 'billing', title: 'Por cobrar', hint: 'Cuentas pendientes de cierre', color: 'bg-[#FBE3DA] text-[#A43108]', Icon: Receipt },
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div><h2 className="text-lg font-bold">Tu salón de un vistazo</h2><p className="text-xs text-[#6B6B6B]">Selecciona una mesa para revisar su comanda o recibir nuevos comensales.</p></div>
        <Badge variant="olive">{tables.filter(t => t.status === 'free').reduce((sum, t) => sum + t.capacity, 0)} asientos disponibles</Badge>
      </div>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {summaries.map(item => <button key={item.status} type="button" aria-pressed={status === item.status} onClick={() => setStatus(status === item.status ? '' : item.status)} className={`rounded-2xl border p-4 text-left transition-shadow hover:shadow-md ${item.color} ${status === item.status ? 'border-current ring-1 ring-current' : 'border-transparent'}`}>
          <div className="flex items-center justify-between"><item.Icon size={24} /><strong className="text-3xl tabular-nums">{tables.filter(t => t.status === item.status).length}</strong></div>
          <h3 className="font-bold mt-3">{item.title}</h3><p className="text-xs mt-1">{item.hint}</p>
        </button>)}
      </div>
      <FilterBar search={{ value: query, onChange: setQuery, placeholder: 'Buscar mesa o mesero…' }} fields={[
        { key: 'status', label: 'Estado', type: 'select', options: [{ value: '', label: 'Todos' }, ...summaries.map(s => ({ value: s.status, label: s.title }))] },
        { key: 'capacity', label: 'Capacidad', type: 'select', options: [{ value: '', label: 'Todas' }, ...Array.from(new Set(tables.map(t => t.capacity))).sort((a, b) => a - b).map(n => ({ value: String(n), label: `${n} personas` }))] },
        { key: 'waiter', label: 'Mesero', type: 'select', options: [{ value: '', label: 'Todos' }, ...Array.from(new Set(tables.map(t => t.waiterName).filter((name): name is string => Boolean(name)))).map(name => ({ value: name, label: name }))] },
      ]} values={{ status, capacity, waiter }} onChange={(key, value) => key === 'status' ? setStatus(value) : key === 'capacity' ? setCapacity(value) : setWaiter(value)} onReset={resetFilters} activeCount={[query, status, capacity, waiter].filter(Boolean).length} total={visibleTables.length} totalLabel="mesas" />
      {visibleTables.length === 0 && <div className="rounded-2xl border border-[#E7E5E0] bg-white p-8 text-center text-sm text-[#6B6B6B]">No hay mesas que coincidan con los filtros. <button onClick={resetFilters} className="font-bold text-[#CF6811] underline">Ver todas</button></div>}

      {/* Tables 12-Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
        {visibleTables.map((t) => {
          const statusConfig = {
            free: {
              label: 'Libre',
              badgeVariant: 'neutral' as const,
              border: 'border-[#E7E5E0] border-t-4 border-t-[#8A7424] bg-white hover:border-[#CF6811]',
            },
            ordering: {
              label: 'Pidiendo',
              badgeVariant: 'banana' as const,
              border: 'border-[#D59F3F] border-t-4 border-t-[#D59F3F] bg-[#FFF6DC] hover:shadow-md',
            },
            occupied: {
              label: 'Ocupada',
              badgeVariant: 'cinnamon' as const,
              border: 'border-[#CF6811] border-t-4 border-t-[#CF6811] bg-[#FDEBD6] hover:shadow-md',
            },
            billing: {
              label: 'Por cobrar',
              badgeVariant: 'terracotta' as const,
              border: 'border-[#A43108] border-t-4 border-t-[#A43108] bg-[#FBE3DA] hover:shadow-md',
            },
          }[t.status];

          return (
            <button
              type="button"
              key={t.id}
              onClick={() => handleOpenTable(t)}
              className={`p-5 min-h-56 text-left rounded-2xl border card-lift cursor-pointer relative flex flex-col overflow-hidden ${statusConfig.border}`}
            >
              <div className="flex items-start justify-between mb-3">
                <span className="font-display font-extrabold text-xl text-[#111111]">
                  Mesa {t.id}
                </span>
                <Badge variant={statusConfig.badgeVariant} size="sm">
                  {statusConfig.label}
                </Badge>
              </div>

              <div className="space-y-2 text-sm text-[#6B6B6B] mb-4">
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 shrink-0" />
                  <span>Capacidad: {t.capacity} personas</span>
                </div>

                {t.status === 'free' && <p className="text-xs leading-relaxed">Disponible para un grupo de hasta {t.capacity} personas. Abre la mesa para comenzar el servicio.</p>}

                {t.status !== 'free' && (
                  <>
                    <div className="flex items-center gap-1.5 text-[#111111] font-medium">
                      <Clock className="w-3.5 h-3.5 text-[#CF6811] shrink-0" />
                      <span className="truncate">Sentados: {t.seatedAt || '13:45'} • {t.waiterName || 'Ana'}</span>
                    </div>

                    {t.total && (
                      <div className="flex items-center gap-1.5 font-bold text-[#111111] text-sm pt-1">
                        <DollarSign className="w-4 h-4 text-[#5C5011] shrink-0" />
                        <span className="font-mono tabular-nums">{formatCurrency(t.total)}</span>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="mt-auto pt-3 border-t border-black/10 flex items-center justify-between text-[11px] text-[#CF6811] font-semibold">
                <span>{t.status === 'free' ? 'Asignar mesa' : 'Ver comanda'}</span>
                <span>→</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Table Detail & Actions Modal */}
      {selectedTable && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={`Detalle de ${selectedTable.name}`}
          subtitle={`Capacidad para ${selectedTable.capacity} personas`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-[#FAFAF8] rounded-xl border border-[#E7E5E0] flex justify-between items-center">
              <div>
                <div className="text-[#6B6B6B]">Estado actual:</div>
                <div className="text-sm font-bold capitalize text-[#111111]">
                  {TABLE_STATUS_LABELS[selectedTable.status]}
                </div>
              </div>
              {selectedTable.total && (
                <div className="text-right">
                  <div className="text-[#6B6B6B]">Total acumulado:</div>
                  <div className="text-base font-extrabold font-mono text-[#111111]">
                    {formatCurrency(selectedTable.total)}
                  </div>
                </div>
              )}
            </div>

            {selectedTable.status === 'free' ? (
              <div className="space-y-2 pt-2">
                <p className="text-[#6B6B6B]">Esta mesa se encuentra desocupada y limpia.</p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="primary"
                    className="flex-1 min-w-[180px]"
                    onClick={() => handleOccupyTable('occupied')}
                  >
                    Sentar comensales y abrir comanda
                  </Button>
                  {canUseVoice && (
                    <Button
                      variant="secondary"
                      className="flex-1 min-w-[180px]"
                      onClick={() => setActiveSection('voice_scenarios')}
                    >
                      Tomar pedido por voz
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4 pt-1">
                <div className="space-y-2">
                  <div className="font-bold text-[#111111]">Comanda activa:</div>
                  <div className="p-3 bg-[#FBF6E6] rounded-xl border border-[#EBD48F] text-[#421A05] space-y-1">
                    {tableTickets.length === 0 && <div>Aún no hay platos enviados a cocina.</div>}
                    {tableTickets.flatMap((ticket) => ticket.items).map((item, index) => (
                      <div key={`${item.dishName}-${index}`}>
                        • {item.quantity}x {item.dishName}
                        {item.notes && <em> — {item.notes}</em>}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  {canCharge ? (
                    <Button
                      variant="primary"
                      size="md"
                      className="w-full"
                      leftIcon={<Receipt className="w-4 h-4" />}
                      onClick={handleCloseAndBillTable}
                    >
                      Cobrar cuenta ({formatCurrency(selectedTable.total ?? 0)}) y liberar mesa
                    </Button>
                  ) : selectedTable.status === 'billing' ? (
                    <p className="text-center font-semibold text-[#A43108]">Caja ya tiene esta cuenta para cobrar.</p>
                  ) : (
                    <Button
                      variant="primary"
                      size="md"
                      className="w-full"
                      leftIcon={<Receipt className="w-4 h-4" />}
                      onClick={() => handleOccupyTable('billing')}
                    >
                      Pedir la cuenta a Caja
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    onClick={() => setIsDetailModalOpen(false)}
                  >
                    Cerrar
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
