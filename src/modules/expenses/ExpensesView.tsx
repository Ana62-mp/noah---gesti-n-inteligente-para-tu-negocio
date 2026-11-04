import { getErrorMessage } from '../../shared/utils/errors';
import React, { useState, useEffect } from 'react';
import { useApp } from '../../shared/context/AppContext';
import { canViewFinancials } from '../../shared/permissions/rolePermissions';
import { apiService, PaginatedResult } from '../../shared/services/apiService';
import { Expense } from '../../shared/types';
import { PaginatedTable, Column } from '../../shared/ui/PaginatedTable';
import { Button } from '../../shared/ui/Button';
import { Badge } from '../../shared/ui/Badge';
import { Modal } from '../../shared/ui/Modal';
import { formatCurrency, formatDate } from '../../shared/utils/formatters';
import {
  TrendingDown,
  Plus,
  Paperclip,
  ArrowLeftRight,
  Upload,
  Mic,
  FileText,
  DollarSign,
} from 'lucide-react';

export const ExpensesView: React.FC = () => {
  const { showToast, setIsAssistantOpen, currentRole } = useApp();
  const canSeeAllExpenses = canViewFinancials(currentRole);
  const [activeTab, setActiveTab] = useState<'expenses' | 'cashflow'>('expenses');

  const [expensesResult, setExpensesResult] = useState<PaginatedResult<Expense>>({
    items: [],
    total: 0,
    page: 1,
    pageSize: 10,
    totalPages: 0,
  });

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filter, setFilter] = useState(canSeeAllExpenses ? 'all' : 'insumos');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New expense form
  const [concept, setConcept] = useState('');
  const [amount, setAmount] = useState<number>(45.00);
  const [category, setCategory] = useState<Expense['category']>('insumos');
  const [supplier, setSupplier] = useState('Mercado Mayorista Quito');
  const [paymentMethod, setPaymentMethod] = useState<Expense['paymentMethod']>('cash');
  const [hasReceipt, setHasReceipt] = useState(true);

  useEffect(() => {
    loadExpenses();
  }, [page, pageSize, filter, search]);

  const loadExpenses = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await apiService.getExpenses({ page, pageSize, filter, search });
      setExpensesResult(res);
    } catch (e) {
      setLoadError(getErrorMessage(e));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!concept.trim()) return;

    await apiService.addExpense({
      date: new Date().toISOString().split('T')[0],
      concept,
      category,
      supplier,
      amount,
      paymentMethod,
      receiptAttached: hasReceipt,
      receiptNumber: hasReceipt ? `FAC-00${Math.floor(Math.random() * 9000 + 1000)}` : undefined,
    });

    setIsModalOpen(false);
    setConcept('');
    showToast(`Gasto por ${formatCurrency(amount)} guardado con éxito`, 'success');
    loadExpenses();
  };

  const columns: Column<Expense>[] = [
    {
      header: 'Fecha / ID',
      accessor: (e) => (
        <div>
          <span className="font-mono text-xs font-bold text-[#111111]">{formatDate(e.date)}</span>
          <div className="text-[11px] text-[#6B6B6B]">{e.id}</div>
        </div>
      ),
    },
    {
      header: 'Concepto',
      accessor: (e) => (
        <div className="max-w-xs">
          <div className="font-medium text-[#111111] text-xs">{e.concept}</div>
          {e.supplier && <div className="text-[11px] text-[#6B6B6B]">{e.supplier}</div>}
        </div>
      ),
    },
    {
      header: 'Categoría',
      accessor: (e) => {
        const variants: Record<Expense['category'], { label: string; v: 'banana' | 'harvest' | 'terracotta' | 'neutral' | 'olive' }> = {
          insumos: { label: 'Insumos', v: 'banana' },
          servicios: { label: 'Servicios básicos', v: 'harvest' },
          sueldos: { label: 'Nómina / Sueldos', v: 'terracotta' },
          arriendo: { label: 'Arriendo', v: 'olive' },
          otros: { label: 'Otros', v: 'neutral' },
        };
        const conf = variants[e.category] || { label: e.category, v: 'neutral' };
        return <Badge variant={conf.v} size="sm">{conf.label}</Badge>;
      },
    },
    {
      header: 'Comprobante',
      accessor: (e) =>
        e.receiptAttached ? (
          <span className="inline-flex items-center gap-1 text-[11px] text-[#5C5011] font-semibold bg-[#5C5011]/10 px-2 py-0.5 rounded-md">
            <Paperclip className="w-3 h-3" />
            {e.receiptNumber || 'Adjunto'}
          </span>
        ) : (
          <span className="text-[11px] text-[#6B6B6B]">Sin adjunto</span>
        ),
    },
    {
      header: 'Importe',
      align: 'right',
      accessor: (e) => (
        <span className="font-extrabold font-mono text-[#A43108] tabular-nums">
          -{formatCurrency(e.amount)}
        </span>
      ),
    },
  ];

  // Cashflow simulation data (entradas vs salidas)
  const cashflowDays = [
    { day: 'Lun 27', in: 1250, out: 420 },
    { day: 'Mar 28', in: 980, out: 185 },
    { day: 'Mié 29', in: 740, out: 820 },
    { day: 'Jue 30', in: 1100, out: 350 },
    { day: 'Vie 31', in: 2600, out: 1650 },
    { day: 'Sáb 01', in: 3400, out: 950 },
    { day: 'Dom 02', in: 2900, out: 240 },
    { day: 'Lun 03', in: 1360, out: 145 },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E7E5E0] shadow-[var(--shadow-soft)]">
        <div>
          <h2 className="text-lg font-bold text-[#111111]">{canSeeAllExpenses ? 'Gastos y Compras' : 'Compras de insumos'}</h2>
          <p className="text-xs text-[#6B6B6B]">
            {canSeeAllExpenses
              ? 'Control de egresos, comprobantes, clasificación y flujo de caja neto.'
              : 'Compras de mercadería con su proveedor y comprobante.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {canSeeAllExpenses && (
          <div className="flex items-center p-1 bg-[#F5F4F1] rounded-xl border border-[#E7E5E0]">
            <button
              onClick={() => setActiveTab('expenses')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'expenses'
                  ? 'bg-white text-[#111111] shadow-[var(--shadow-soft)]'
                  : 'text-[#6B6B6B] hover:text-[#111111]'
              }`}
            >
              Lista de gastos
            </button>
            <button
              onClick={() => setActiveTab('cashflow')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'cashflow'
                  ? 'bg-white text-[#111111] shadow-[var(--shadow-soft)]'
                  : 'text-[#6B6B6B] hover:text-[#111111]'
              }`}
            >
              Flujo de caja
            </button>
          </div>
          )}

          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Mic className="w-4 h-4 text-[#CF6811]" />}
            onClick={() => setIsAssistantOpen(true)}
          >
            Registrar por voz
          </Button>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsModalOpen(true)}
          >
            {canSeeAllExpenses ? 'Nuevo gasto' : 'Nueva compra'}
          </Button>
        </div>
      </div>

      {activeTab === 'expenses' ? (
        <>
          {canSeeAllExpenses && (
            <>
          {/* Category Summary KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="bg-white p-3.5 rounded-xl border border-[#E7E5E0] shadow-[var(--shadow-soft)]">
              <span className="text-[10px] uppercase font-bold text-[#6B6B6B]">Insumos (Mes)</span>
              <div className="text-lg font-bold font-mono text-[#111111] tabular-nums mt-1">
                $6.300,00
              </div>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-[#E7E5E0] shadow-[var(--shadow-soft)]">
              <span className="text-[10px] uppercase font-bold text-[#6B6B6B]">Nómina / Sueldos</span>
              <div className="text-lg font-bold font-mono text-[#111111] tabular-nums mt-1">
                $2.900,00
              </div>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-[#E7E5E0] shadow-[var(--shadow-soft)]">
              <span className="text-[10px] uppercase font-bold text-[#6B6B6B]">Arriendo local</span>
              <div className="text-lg font-bold font-mono text-[#111111] tabular-nums mt-1">
                $850,00
              </div>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-[#E7E5E0] shadow-[var(--shadow-soft)]">
              <span className="text-[10px] uppercase font-bold text-[#6B6B6B]">Servicios básicos</span>
              <div className="text-lg font-bold font-mono text-[#111111] tabular-nums mt-1">
                $349,60
              </div>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-[#E7E5E0] shadow-[var(--shadow-soft)]">
              <span className="text-[10px] uppercase font-bold text-[#A43108]">Total egresos</span>
              <div className="text-lg font-bold font-mono text-[#A43108] tabular-nums mt-1">
                $12.450,00
              </div>
            </div>
          </div>
            </>
          )}

          {/* Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-[#E7E5E0]">
            {canSeeAllExpenses && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#6B6B6B]">Categoría:</span>
              <select
                value={filter}
                onChange={(e) => {
                  setFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-[#F5F4F1] border border-[#E7E5E0] rounded-lg px-2.5 py-1 text-xs text-[#111111] focus:outline-none"
              >
                <option value="all">Todas las categorías</option>
                <option value="insumos">Insumos y mercado</option>
                <option value="sueldos">Nómina y sueldos</option>
                <option value="servicios">Servicios básicos</option>
                <option value="arriendo">Arriendo</option>
                <option value="otros">Otros</option>
              </select>
            </div>
            )}

            <input
              type="text"
              placeholder="Buscar gasto o proveedor…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="bg-[#F5F4F1] border border-[#E7E5E0] rounded-lg px-3 py-1 text-xs text-[#111111] focus:outline-none focus:ring-1 focus:ring-[#CF6811] w-48"
            />
          </div>

          {/* Table */}
          <PaginatedTable
            columns={columns}
            data={expensesResult.items}
            total={expensesResult.total}
            page={expensesResult.page}
            pageSize={expensesResult.pageSize}
            totalPages={expensesResult.totalPages}
            onPageChange={setPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setPage(1);
            }}
            isLoading={isLoading}
            error={loadError}
            onRetry={loadExpenses}
            rowKey={(e) => e.id}
          />
        </>
      ) : (
        /* Cash Flow Chart View */
        <div className="bg-white rounded-2xl border border-[#E7E5E0] p-6 shadow-[var(--shadow-soft)] space-y-6">
          <div className="flex items-center justify-between border-b border-[#E7E5E0] pb-4">
            <div>
              <h3 className="text-base font-bold text-[#111111]">
                Flujo de Caja: Entradas vs. Salidas Diarias
              </h3>
              <p className="text-xs text-[#6B6B6B]">Últimos 8 días de operación en Quito</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 font-semibold text-[#5C5011]">
                <span className="w-3 h-3 rounded-sm bg-[#5C5011]" />
                Entradas (Ventas)
              </span>
              <span className="flex items-center gap-1.5 font-semibold text-[#A43108]">
                <span className="w-3 h-3 rounded-sm bg-[#A43108]" />
                Salidas (Gastos)
              </span>
            </div>
          </div>

          {/* Cashflow visual comparison */}
          <div className="grid grid-cols-8 gap-2 sm:gap-4 items-end h-56 border-b border-[#E7E5E0] pb-2">
            {cashflowDays.map((d, i) => {
              const max = 3600;
              const inH = (d.in / max) * 100;
              const outH = (d.out / max) * 100;

              return (
                <div key={i} className="flex flex-col items-center h-full justify-end gap-1.5 group">
                  <div className="flex items-end gap-1.5 w-full justify-center h-full">
                    {/* Entradas */}
                    <div
                      className="w-3 sm:w-6 bg-[#5C5011] rounded-t-sm transition-all group-hover:brightness-110"
                      style={{ height: `${inH}%` }}
                      title={`Entradas ${d.day}: $${d.in}`}
                    />
                    {/* Salidas */}
                    <div
                      className="w-3 sm:w-6 bg-[#A43108] rounded-t-sm transition-all group-hover:brightness-110"
                      style={{ height: `${outH}%` }}
                      title={`Salidas ${d.day}: $${d.out}`}
                    />
                  </div>
                  <span className="text-[11px] font-bold text-[#6B6B6B]">{d.day}</span>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 bg-[#FBF6E6] rounded-xl border border-[#EBD48F]">
              <span className="text-xs text-[#6B6B6B] font-semibold">Saldo neto del período:</span>
              <div className="text-xl font-bold font-mono text-[#5C5011] tabular-nums mt-1">
                +$9.675,00 USD
              </div>
            </div>
            <div className="p-4 bg-[#FAFAF8] rounded-xl border border-[#E7E5E0]">
              <span className="text-xs text-[#6B6B6B] font-semibold">Día de mayor egreso:</span>
              <div className="text-sm font-bold text-[#111111] mt-1">
                Viernes 31 ($1.650, pago de quincena)
              </div>
            </div>
            <div className="p-4 bg-[#FAFAF8] rounded-xl border border-[#E7E5E0]">
              <span className="text-xs text-[#6B6B6B] font-semibold">Día de mayor superávit:</span>
              <div className="text-sm font-bold text-[#5C5011] mt-1">
                Sábado 01 (+$2.450 netos)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Register Expense Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Registrar Gasto o Compra"
        subtitle="Registra el importe de facturas, notas de venta o egresos operativos"
      >
        <form onSubmit={handleRegisterExpense} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-[#111111] block mb-1">Concepto del gasto:</label>
            <input
              type="text"
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              placeholder="Ej. Compra de 5 kg de limón y cebolla"
              className="w-full border border-[#E7E5E0] rounded-xl p-2.5 text-xs text-[#111111] bg-[#F5F4F1] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#CF6811]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-[#111111] block mb-1">Importe ($ USD):</label>
              <input
                type="number"
                step="0.5"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="w-full border border-[#E7E5E0] rounded-xl p-2.5 text-xs text-[#111111] bg-[#F5F4F1] focus:bg-white font-mono"
                required
              />
            </div>
            {canSeeAllExpenses && (
            <div>
              <label className="font-semibold text-[#111111] block mb-1">Categoría:</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Expense['category'])}
                className="w-full border border-[#E7E5E0] rounded-xl p-2.5 text-xs text-[#111111] bg-[#F5F4F1]"
              >
                <option value="insumos">Insumos y alimentos</option>
                <option value="servicios">Servicios básicos (luz/agua/gas)</option>
                <option value="sueldos">Nómina / Sueldos</option>
                <option value="arriendo">Arriendo de local</option>
                <option value="otros">Otros gastos operativos</option>
              </select>
            </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-[#111111] block mb-1">Proveedor / Entidad:</label>
              <input
                type="text"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                className="w-full border border-[#E7E5E0] rounded-xl p-2.5 text-xs text-[#111111] bg-[#F5F4F1]"
              />
            </div>
            <div>
              <label className="font-semibold text-[#111111] block mb-1">Método de pago:</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as Expense['paymentMethod'])}
                className="w-full border border-[#E7E5E0] rounded-xl p-2.5 text-xs text-[#111111] bg-[#F5F4F1]"
              >
                <option value="cash">Efectivo caja chica</option>
                <option value="transfer">Transferencia bancaria</option>
                <option value="card">Tarjeta de débito/crédito</option>
              </select>
            </div>
          </div>

          {/* Simulated receipt upload */}
          <div className="p-3 bg-[#FAFAF8] rounded-xl border border-dashed border-[#E7E5E0] text-center">
            <Upload className="w-5 h-5 text-[#CF6811] mx-auto mb-1" />
            <div className="text-xs font-semibold text-[#111111]">
              Foto del comprobante (Factura o Nota de venta)
            </div>
            <div className="text-[10px] text-[#6B6B6B] mt-0.5">
              Simulado · "Lectura automática con OCR: próximamente"
            </div>
            <label className="mt-2 inline-flex items-center gap-1.5 cursor-pointer text-[11px] font-bold text-[#CF6811] hover:underline">
              <input
                type="checkbox"
                checked={hasReceipt}
                onChange={(e) => setHasReceipt(e.target.checked)}
                className="accent-[#CF6811]"
              />
              Simular comprobante adjunto válido
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              Guardar gasto
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
