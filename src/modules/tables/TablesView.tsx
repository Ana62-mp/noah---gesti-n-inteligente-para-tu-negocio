import React, { useState, useEffect } from 'react';
import { useApp } from '../../shared/context/AppContext';
import { apiService } from '../../shared/services/apiService';
import { TableItem } from '../../shared/types';
import { Button } from '../../shared/ui/Button';
import { Badge } from '../../shared/ui/Badge';
import { Modal } from '../../shared/ui/Modal';
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

export const TablesView: React.FC = () => {
  const { showToast, setActiveSection } = useApp();
  const [tables, setTables] = useState<TableItem[]>([]);
  const [selectedTable, setSelectedTable] = useState<TableItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    loadTables();
  }, []);

  const loadTables = async () => {
    const data = await apiService.getTables();
    setTables(data);
  };

  const handleOpenTable = (table: TableItem) => {
    setSelectedTable(table);
    setIsDetailModalOpen(true);
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
    await apiService.updateTableStatus(selectedTable.id, status, status === 'occupied' ? 38.50 : undefined);
    setIsDetailModalOpen(false);
    showToast(`Estado de Mesa ${selectedTable.id} actualizado`, 'info');
    loadTables();
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Status Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E7E5E0] shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-[#111111]">Mesas y Salón</h2>
          <p className="text-xs text-[#6B6B6B]">
            Distribución en vivo de comensales, tiempos transcurridos y cobro de cuentas.
          </p>
        </div>

        {/* Legend with color + icon + text (constitucional) */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <Badge variant="neutral">Libre</Badge>
          <Badge variant="banana">Pidiendo</Badge>
          <Badge variant="cinnamon">Ocupada</Badge>
          <Badge variant="terracotta">Por cobrar</Badge>
        </div>
      </div>

      {/* Tables 12-Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {tables.map((t) => {
          const statusConfig = {
            free: {
              label: 'Libre',
              badgeVariant: 'neutral' as const,
              border: 'border-[#E7E5E0] bg-white hover:border-[#CF6811]',
            },
            ordering: {
              label: 'Pidiendo',
              badgeVariant: 'banana' as const,
              border: 'border-[#D59F3F] bg-[#FFFBEB] hover:shadow-md',
            },
            occupied: {
              label: 'Ocupada',
              badgeVariant: 'cinnamon' as const,
              border: 'border-[#CF6811] bg-[#FBF6E6] hover:shadow-md',
            },
            billing: {
              label: 'Por cobrar',
              badgeVariant: 'terracotta' as const,
              border: 'border-[#A43108] bg-red-50/50 hover:shadow-md',
            },
          }[t.status];

          return (
            <div
              key={t.id}
              onClick={() => handleOpenTable(t)}
              className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer relative shadow-2xs overflow-hidden ${statusConfig.border}`}
            >
              <div className="flex items-start justify-between mb-3">
                <span className="font-display font-extrabold text-base text-[#111111]">
                  Mesa {t.id}
                </span>
                <Badge variant={statusConfig.badgeVariant} size="sm">
                  {statusConfig.label}
                </Badge>
              </div>

              <div className="space-y-1.5 text-xs text-[#6B6B6B]">
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 shrink-0" />
                  <span>Capacidad: {t.capacity} personas</span>
                </div>

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

              <div className="mt-4 pt-3 border-t border-black/5 flex items-center justify-between text-[11px] text-[#CF6811] font-semibold">
                <span>{t.status === 'free' ? 'Asignar mesa' : 'Ver comanda'}</span>
                <span>→</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Table Detail & Actions Modal */}
      {selectedTable && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={`Detalle de Mesa ${selectedTable.id} (${selectedTable.name})`}
          subtitle={`Capacidad para ${selectedTable.capacity} personas`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-[#FAFAF8] rounded-xl border border-[#E7E5E0] flex justify-between items-center">
              <div>
                <div className="text-[#6B6B6B]">Estado actual:</div>
                <div className="text-sm font-bold capitalize text-[#111111]">
                  {selectedTable.status === 'free' ? 'Libre para comensales' : selectedTable.status}
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
                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    className="flex-1"
                    onClick={() => handleOccupyTable('occupied')}
                  >
                    Sentar comensales y abrir comanda
                  </Button>
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={() => setActiveSection('voice_scenarios')}
                  >
                    Tomar pedido por voz
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 pt-1">
                <div className="space-y-2">
                  <div className="font-bold text-[#111111]">Comanda activa:</div>
                  <div className="p-3 bg-[#FBF6E6] rounded-xl border border-[#EBD48F] text-[#421A05] space-y-1">
                    <div>• 2x Secos de pollo ($11,00)</div>
                    <div>• 3x Ceviches de camarón ($27,00) — <em>1 sin cebolla</em></div>
                    <div>• 1x Jarra de naranjilla ($4,00)</div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <Button
                    variant="primary"
                    size="md"
                    className="w-full"
                    leftIcon={<Receipt className="w-4 h-4" />}
                    onClick={handleCloseAndBillTable}
                  >
                    Cobrar cuenta (${selectedTable.total?.toFixed(2) || '42.00'}) y liberar mesa
                  </Button>
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
