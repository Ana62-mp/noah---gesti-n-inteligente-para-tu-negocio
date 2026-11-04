import { getErrorMessage } from '../../shared/utils/errors';
import React, { useState, useEffect } from 'react';
import { useApp } from '../../shared/context/AppContext';
import { FilterBar, FilterField } from '../../shared/ui/FilterBar';
import { getBusinessProfile } from '../../shared/business/businessProfiles';
import { useListParams } from '../../shared/hooks/useListParams';
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
  const { salesSummary, closing, vocabulary } = getBusinessProfile(currentBusiness.type);
  const hasChannelChoice = vocabulary.saleChannels.length > 1;
  const [activeTab, setActiveTab] = useState<'sales' | 'closing'>('sales');

  const [salesResult, setSalesResult] = useState<PaginatedResult<Sale>>({
    items: [],
    total: 0,
    page: 1,
    pageSize: 10,
    totalPages: 0,
  });

  const list = useListParams('all');
  const { page, pageSize, filter, search, setPage, setPageSize } = list;
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New sale form
  const [newSaleDish, setNewSaleDish] = useState(vocabulary.defaultSaleItem.name);
  const [newSalePrice, setNewSalePrice] = useState(vocabulary.defaultSaleItem.price);
  const [newSaleQty, setNewSaleQty] = useState(1);
  const [newSaleMethod, setNewSaleMethod] = useState<Sale['paymentMethod']>('cash');
  const [newSaleChannel, setNewSaleChannel] = useState<Sale['channel']>(vocabulary.saleChannels[0].value);
  const [newSaleTable, setNewSaleTable] = useState(1);

  useEffect(() => {
    loadSales();
  }, [page, pageSize, filter, search, JSON.stringify(list.extras)]);

  const loadSales = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await apiService.getSales({ page, pageSize, filter, search, extras: list.extras });
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
          counter: { label: 'Mostrador', v: 'olive' },
          chair: { label: 'En sillón', v: 'olive' },
        };
        const conf = variants[s.channel] || { label: s.channel, v: 'harvest' };
        return <Badge variant={conf.v} size="sm">{conf.label}</Badge>;
      },
    },
    {
      header: vocabulary.itemsColumn,
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
    <div className="space-y-3">
      {/* Top Header & Tabs */}
      <div className="flex flex-wrap items-center justify-end gap-2">
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {salesSummary.map(({ label, value }) => (
              <div key={label} className="bg-white p-3 rounded-xl border border-[#E7E5E0] shadow-[var(--shadow-soft)]">
                <div className="text-xs text-[#6B6B6B]">{label}</div>
                <div className="text-lg font-black tabular-nums text-[#111111]">{value}</div>
              </div>
            ))}
          </div>

          <FilterBar
            search={{ value: list.search, onChange: list.setSearch, placeholder: `Buscar ${vocabulary.itemNoun} o código…` }}
            fields={[
              ...(hasChannelChoice ? [{ key: 'filter', label: 'Canal', type: 'select', options: [{ value: 'all', label: 'Todos' }, ...vocabulary.saleChannels.map(({ value, label }) => ({ value, label }))] } as FilterField] : []),
              { key: 'payment', label: 'Método de pago', type: 'select', options: [{ value: '', label: 'Todos' }, { value: 'cash', label: 'Efectivo' }, { value: 'card', label: 'Tarjeta' }, { value: 'transfer', label: 'Transferencia' }, { value: 'deuna', label: 'DeUna' }] },
              { key: 'from', label: 'Desde', type: 'date' },
              { key: 'to', label: 'Hasta', type: 'date' },
            ]}
            values={list.fieldValues}
            onChange={list.setField}
            onReset={list.reset}
            activeCount={list.activeFilters}
            total={salesResult.total}
            totalLabel="ventas"
          />

          {/* Paginated Table */}
          <PaginatedTable
            columns={columns}
            data={salesResult.items}
            total={salesResult.total}
            page={salesResult.page}
            pageSize={salesResult.pageSize}
            totalPages={salesResult.totalPages}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            isLoading={isLoading}
            error={loadError}
            onRetry={loadSales}
            rowKey={(s) => s.id}
          />
        </>
      ) : (
        /* Cierre de caja Tab */
        <div className="bg-white rounded-2xl border border-[#E7E5E0] p-4 shadow-[var(--shadow-soft)] max-w-3xl mx-auto space-y-3">
          <div className="flex items-center justify-between border-b border-[#E7E5E0] pb-4">
            <div>
              <h3 className="text-base font-bold text-[#111111]">Arqueo y Cierre del Día</h3>
              <p className="text-xs text-[#6B6B6B]">{closing.turn}</p>
            </div>
            <Badge variant="olive">Caja Abierta</Badge>
          </div>

          <div className="divide-y divide-[#E7E5E0] text-sm">
            {closing.rows.map(({ label, value, isExpense }) => (
              <div key={label} className={`flex justify-between items-center py-2 ${isExpense ? 'text-[#A43108]' : ''}`}>
                <span className={isExpense ? '' : 'text-[#6B6B6B]'}>{label}</span>
                <span className="font-bold tabular-nums">{value}</span>
              </div>
            ))}
            <div className="flex justify-between items-center py-2.5 mt-1 bg-[#FAFAF8] px-3 rounded-xl border border-[#E7E5E0] font-bold">
              <span>Efectivo a entregar</span>
              <span className="text-[#5C5011] text-lg tabular-nums">{closing.total}</span>
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
        subtitle="Agrega un cobro manual"
      >
        <form onSubmit={handleRegisterSale} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-[#111111] block mb-1">{vocabulary.itemNoun[0].toUpperCase() + vocabulary.itemNoun.slice(1)}:</label>
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
            {hasChannelChoice && (
            <div>
              <label className="font-semibold text-[#111111] block mb-1">Canal:</label>
              <select
                value={newSaleChannel}
                onChange={(e) => setNewSaleChannel(e.target.value as Sale['channel'])}
                className="w-full border border-[#E7E5E0] rounded-xl p-2.5 text-xs text-[#111111] bg-[#F5F4F1]"
              >
                {vocabulary.saleChannels.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            )}
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
