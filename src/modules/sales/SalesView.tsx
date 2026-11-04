import { getErrorMessage } from '../../shared/utils/errors';
import React, { useState, useEffect } from 'react';
import { useApp } from '../../shared/context/AppContext';
import { apiService, PaginatedResult } from '../../shared/services/apiService';
import { Sale } from '../../shared/types';
import { PaginatedTable, Column } from '../../shared/ui/PaginatedTable';
import { Button } from '../../shared/ui/Button';
import { Badge } from '../../shared/ui/Badge';
import { Modal } from '../../shared/ui/Modal';
import { formatCurrency, formatDate } from '../../shared/utils/formatters';
import {
  Receipt,
  Plus,
  Coins,
  CreditCard,
  Building,
  CheckCircle2,
  Calendar,
  Lock,
} from 'lucide-react';

export const SalesView: React.FC = () => {
  const { currentBusiness, showToast } = useApp();
  const [activeTab, setActiveTab] = useState<'sales' | 'closing'>('sales');

  const [salesResult, setSalesResult] = useState<PaginatedResult<Sale>>({
    items: [],
    total: 0,
    page: 1,
    pageSize: 10,
    totalPages: 0,
  });

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New sale form
  const [newSaleDish, setNewSaleDish] = useState('Encebollado mixto de albacora');
  const [newSalePrice, setNewSalePrice] = useState(4.50);
  const [newSaleQty, setNewSaleQty] = useState(1);
  const [newSaleMethod, setNewSaleMethod] = useState<Sale['paymentMethod']>('cash');
  const [newSaleChannel, setNewSaleChannel] = useState<Sale['channel']>('salon');
  const [newSaleTable, setNewSaleTable] = useState(1);

  useEffect(() => {
    loadSales();
  }, [page, pageSize, filter, search]);

  const loadSales = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await apiService.getSales({ page, pageSize, filter, search });
      setSalesResult(res);
    } catch (e) {
      setLoadError(getErrorMessage(e));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSale = async (e: React.FormEvent) => {
    e.preventDefault();
    const subtotal = newSalePrice * newSaleQty;
    const tax = subtotal * 0.15;
    const total = subtotal;

    await apiService.addSale({
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' }),
      channel: newSaleChannel,
      tableNumber: newSaleChannel === 'salon' ? newSaleTable : undefined,
      waiterName: 'Caja',
      items: [
        {
          dishId: 'dish-custom',
          dishName: newSaleDish,
          quantity: newSaleQty,
          unitPrice: newSalePrice,
          subtotal,
        },
      ],
      subtotal,
      tax,
      total,
      paymentMethod: newSaleMethod,
      status: 'completed',
    });

    setIsModalOpen(false);
    showToast(`Venta por ${formatCurrency(total)} registrada con éxito`, 'success');
    loadSales();
  };

  const columns: Column<Sale>[] = [
    {
      header: 'ID / Fecha',
      accessor: (s) => (
        <div>
          <span className="font-mono font-bold text-[#111111]">{s.id}</span>
          <div className="text-[11px] text-[#6B6B6B]">
            {formatDate(s.date)} · {s.time}
          </div>
        </div>
      ),
    },
    {
      header: 'Canal',
      accessor: (s) => {
        const variants: Record<Sale['channel'], { label: string; v: 'olive' | 'banana' | 'harvest' }> = {
          salon: { label: s.tableNumber ? `Mesa ${s.tableNumber}` : 'Salón', v: 'olive' },
          takeout: { label: 'Para llevar', v: 'banana' },
          delivery: { label: 'Delivery', v: 'harvest' },
        };
        const conf = variants[s.channel] || { label: s.channel, v: 'harvest' };
        return <Badge variant={conf.v} size="sm">{conf.label}</Badge>;
      },
    },
    {
      header: 'Detalle de platos',
      accessor: (s) => (
        <div className="text-xs">
          {s.items.map((it, i) => (
            <span key={i}>
              {it.quantity}x {it.dishName}
              {i < s.items.length - 1 ? ', ' : ''}
            </span>
          ))}
        </div>
      ),
    },
    {
      header: 'Método de pago',
      accessor: (s) => {
        const labels: Record<Sale['paymentMethod'], string> = {
          cash: 'Efectivo',
          card: 'Tarjeta',
          transfer: 'Transferencia',
          deuna: 'DeUna / Banco',
        };
        return <span className="text-xs text-[#6B6B6B]">{labels[s.paymentMethod]}</span>;
      },
    },
    {
      header: 'Total',
      align: 'right',
      accessor: (s) => (
        <span className="font-extrabold font-mono text-[#111111] tabular-nums">
          {formatCurrency(s.total)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E7E5E0] shadow-[var(--shadow-soft)]">
        <div>
          <h2 className="text-lg font-bold text-[#111111]">Ventas y Caja</h2>
          <p className="text-xs text-[#6B6B6B]">
            Control de cobros en salón, delivery, métodos de pago y arqueo diario.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center p-1 bg-[#F5F4F1] rounded-xl border border-[#E7E5E0]">
            <button
              onClick={() => setActiveTab('sales')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'sales'
                  ? 'bg-white text-[#111111] shadow-[var(--shadow-soft)]'
                  : 'text-[#6B6B6B] hover:text-[#111111]'
              }`}
            >
              Registro de ventas
            </button>
            <button
              onClick={() => setActiveTab('closing')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'closing'
                  ? 'bg-white text-[#111111] shadow-[var(--shadow-soft)]'
                  : 'text-[#6B6B6B] hover:text-[#111111]'
              }`}
            >
              Cierre de caja
            </button>
          </div>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsModalOpen(true)}
          >
            Registrar venta
          </Button>
        </div>
      </div>

      {activeTab === 'sales' ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-[#E7E5E0] shadow-[var(--shadow-soft)]">
              <div className="flex items-center justify-between text-xs text-[#6B6B6B] mb-1">
                <span>Total hoy (86 ventas)</span>
                <Coins className="w-4 h-4 text-[#CF6811]" />
              </div>
              <div className="text-xl font-bold font-mono text-[#111111] tabular-nums">
                $780,50
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#E7E5E0] shadow-[var(--shadow-soft)]">
              <div className="flex items-center justify-between text-xs text-[#6B6B6B] mb-1">
                <span>Efectivo caja</span>
                <Coins className="w-4 h-4 text-[#5C5011]" />
              </div>
              <div className="text-xl font-bold font-mono text-[#5C5011] tabular-nums">
                $395,00
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#E7E5E0] shadow-[var(--shadow-soft)]">
              <div className="flex items-center justify-between text-xs text-[#6B6B6B] mb-1">
                <span>Tarjetas Datafast</span>
                <CreditCard className="w-4 h-4 text-[#CF6811]" />
              </div>
              <div className="text-xl font-bold font-mono text-[#111111] tabular-nums">
                $225,50
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#E7E5E0] shadow-[var(--shadow-soft)]">
              <div className="flex items-center justify-between text-xs text-[#6B6B6B] mb-1">
                <span>Transferencias / DeUna</span>
                <Building className="w-4 h-4 text-[#8A7424]" />
              </div>
              <div className="text-xl font-bold font-mono text-[#111111] tabular-nums">
                $160,00
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-[#E7E5E0]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#6B6B6B]">Canal:</span>
              <select
                value={filter}
                onChange={(e) => {
                  setFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-[#F5F4F1] border border-[#E7E5E0] rounded-lg px-2.5 py-1 text-xs text-[#111111] focus:outline-none"
              >
                <option value="all">Todos los canales</option>
                <option value="salon">Salón</option>
                <option value="takeout">Para llevar</option>
                <option value="delivery">Delivery</option>
              </select>
            </div>

            <input
              type="text"
              placeholder="Buscar por plato o código…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="bg-[#F5F4F1] border border-[#E7E5E0] rounded-lg px-3 py-1 text-xs text-[#111111] focus:outline-none focus:ring-1 focus:ring-[#CF6811] w-48"
            />
          </div>

          {/* Paginated Table */}
          <PaginatedTable
            columns={columns}
            data={salesResult.items}
            total={salesResult.total}
            page={salesResult.page}
            pageSize={salesResult.pageSize}
            totalPages={salesResult.totalPages}
            onPageChange={setPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setPage(1);
            }}
            isLoading={isLoading}
            error={loadError}
            onRetry={loadSales}
            rowKey={(s) => s.id}
          />
        </>
      ) : (
        /* Cierre de caja Tab */
        <div className="bg-white rounded-2xl border border-[#E7E5E0] p-6 shadow-[var(--shadow-soft)] max-w-2xl mx-auto space-y-6">
          <div className="flex items-center justify-between border-b border-[#E7E5E0] pb-4">
            <div>
              <h3 className="text-base font-bold text-[#111111]">Arqueo y Cierre del Día</h3>
              <p className="text-xs text-[#6B6B6B]">Turno 03 de noviembre de 2026 · Quito</p>
            </div>
            <Badge variant="olive">Caja Abierta</Badge>
          </div>

          <div className="space-y-3 divide-y divide-[#E7E5E0] text-sm">
            <div className="flex justify-between items-center py-2">
              <span className="text-[#6B6B6B]">Fondo inicial de apertura:</span>
              <span className="font-mono font-bold text-[#111111]">$50,00</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-[#6B6B6B]">Ventas en efectivo hoy:</span>
              <span className="font-mono font-bold text-[#5C5011]">+$395,00</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-[#6B6B6B]">Ventas con tarjeta (Datafast):</span>
              <span className="font-mono font-bold text-[#111111]">+$225,50</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-[#6B6B6B]">Transferencias / DeUna:</span>
              <span className="font-mono font-bold text-[#111111]">+$160,00</span>
            </div>
            <div className="flex justify-between items-center py-2 text-[#A43108]">
              <span>Salidas de caja chica (Gastos del día):</span>
              <span className="font-mono font-bold">-$45,00</span>
            </div>
            <div className="flex justify-between items-center py-3 bg-[#FAFAF8] px-3 rounded-xl border border-[#E7E5E0] text-base font-bold">
              <span>Efectivo físico a entregar en caja:</span>
              <span className="font-mono text-[#5C5011] text-xl">$400,00</span>
            </div>
          </div>

          <div className="p-3 bg-[#FBF6E6] border border-[#EBD48F] rounded-xl text-xs text-[#421A05]">
            Al cerrar la caja se emitirá el resumen de ventas del turno y se enviará la notificación
            de arqueo al dueño vía app.
          </div>

          <Button
            variant="primary"
            className="w-full"
            leftIcon={<Lock className="w-4 h-4" />}
            onClick={() => showToast('Caja del día cerrada y arqueada exitosamente', 'success')}
          >
            Realizar Cierre de Caja Definitivo
          </Button>
        </div>
      )}

      {/* Register Sale Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Registrar Venta"
        subtitle="Agrega un cobro manual en salón o delivery"
      >
        <form onSubmit={handleRegisterSale} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-[#111111] block mb-1">Plato o Producto:</label>
            <input
              type="text"
              value={newSaleDish}
              onChange={(e) => setNewSaleDish(e.target.value)}
              className="w-full border border-[#E7E5E0] rounded-xl p-2.5 text-xs text-[#111111] bg-[#F5F4F1] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#CF6811]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-[#111111] block mb-1">Precio Unitario ($):</label>
              <input
                type="number"
                step="0.25"
                value={newSalePrice}
                onChange={(e) => setNewSalePrice(parseFloat(e.target.value) || 0)}
                className="w-full border border-[#E7E5E0] rounded-xl p-2.5 text-xs text-[#111111] bg-[#F5F4F1] focus:bg-white font-mono"
                required
              />
            </div>
            <div>
              <label className="font-semibold text-[#111111] block mb-1">Cantidad:</label>
              <input
                type="number"
                min="1"
                value={newSaleQty}
                onChange={(e) => setNewSaleQty(parseInt(e.target.value) || 1)}
                className="w-full border border-[#E7E5E0] rounded-xl p-2.5 text-xs text-[#111111] bg-[#F5F4F1] focus:bg-white font-mono"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-[#111111] block mb-1">Canal:</label>
              <select
                value={newSaleChannel}
                onChange={(e) => setNewSaleChannel(e.target.value as Sale['channel'])}
                className="w-full border border-[#E7E5E0] rounded-xl p-2.5 text-xs text-[#111111] bg-[#F5F4F1]"
              >
                <option value="salon">Salón</option>
                <option value="takeout">Para llevar</option>
                <option value="delivery">Delivery</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-[#111111] block mb-1">Método de pago:</label>
              <select
                value={newSaleMethod}
                onChange={(e) => setNewSaleMethod(e.target.value as Sale['paymentMethod'])}
                className="w-full border border-[#E7E5E0] rounded-xl p-2.5 text-xs text-[#111111] bg-[#F5F4F1]"
              >
                <option value="cash">Efectivo</option>
                <option value="card">Tarjeta</option>
                <option value="transfer">Transferencia</option>
                <option value="deuna">DeUna</option>
              </select>
            </div>
          </div>

          <div className="pt-3 border-t border-[#E7E5E0] flex justify-between items-center font-bold">
            <span className="text-[#6B6B6B]">Total a cobrar:</span>
            <span className="text-base text-[#111111] font-mono">
              ${(newSalePrice * newSaleQty).toFixed(2)} USD
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              Guardar cobro
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
