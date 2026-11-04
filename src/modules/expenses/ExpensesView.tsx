import { getErrorMessage } from '../../shared/utils/errors';
import React, { useState, useEffect } from 'react';
import { useApp } from '../../shared/context/AppContext';
import { RowActions } from '../../shared/ui/RowActions';
import { useEntityCrud } from '../../shared/hooks/useEntityCrud';
import { EXPENSE_FIELDS, emptyExpense, expenseFromValues, expenseToValues } from '../../shared/forms/operationForms';
import { FilterBar } from '../../shared/ui/FilterBar';
import { DonutChart } from '../../shared/ui/Charts';
import { useListParams } from '../../shared/hooks/useListParams';
import { getBusinessProfile } from '../../shared/business/businessProfiles';
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
  const { showToast, setIsAssistantOpen, currentRole, currentBusiness, canAccess, activeSection } = useApp();
  const canSeeAllExpenses = currentRole === 'owner';
  const { expenseKpis, cashflow: cashflowDays, vocabulary } = getBusinessProfile(currentBusiness.type);
  const hasCashflow = canAccess('cashflow');
  const crud = useEntityCrud<Expense>({
    collection: 'expenses', noun: 'gasto', fields: EXPENSE_FIELDS, emptyValues: () => emptyExpense(vocabulary.defaultSupplier), toValues: expenseToValues,
    fromValues: expenseFromValues, nameOf: (item) => item.concept ?? 'El gasto', onChanged: () => loadExpenses(),
  });
  const [activeTab, setActiveTab] = useState<'expenses' | 'cashflow'>(activeSection === 'cashflow' ? 'cashflow' : 'expenses');

  const [expensesResult, setExpensesResult] = useState<PaginatedResult<Expense>>({
    items: [],
    total: 0,
    page: 1,
    pageSize: 10,
    totalPages: 0,
  });

  const list = useListParams(canSeeAllExpenses ? 'all' : 'insumos');
  const { page, pageSize, filter, search, setPage, setPageSize } = list;
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);


  useEffect(() => {
    loadExpenses();
  }, [page, pageSize, filter, search, JSON.stringify(list.extras)]);

  const loadExpenses = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await apiService.getExpenses({ page, pageSize, filter, search, extras: list.extras });
      setExpensesResult(res);
    } catch (e) {
      setLoadError(getErrorMessage(e));
    } finally {
      setIsLoading(false);
    }
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
    { header: '', align: 'right', accessor: (item) => <RowActions name={item.concept} onEdit={() => crud.openEdit(item)} onDelete={() => crud.askDelete(item)} /> },
  ];

  const cashflowIn = cashflowDays.reduce((sum, day) => sum + day.in, 0);
  const cashflowOut = cashflowDays.reduce((sum, day) => sum + day.out, 0);
  const heaviestDay = cashflowDays.reduce((top, day) => (day.out > top.out ? day : top), cashflowDays[0]);

  return (
    <div className="space-y-3">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-end gap-2">
<div className="flex items-center gap-3">
          {canSeeAllExpenses && hasCashflow && (
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
            onClick={crud.openNew}
          >
            {canSeeAllExpenses ? 'Nuevo gasto' : 'Nueva compra'}
          </Button>
        </div>
      </div>

      {activeTab === 'expenses' ? (
        <>
          {canSeeAllExpenses && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {expenseKpis.map(({ label, value }, index) => (
                <div key={label} className="bg-white p-3 rounded-xl border border-[#E7E5E0] shadow-[var(--shadow-soft)]">
                  <div className={`text-[11px] uppercase font-bold ${index === expenseKpis.length - 1 ? 'text-[#A43108]' : 'text-[#6B6B6B]'}`}>{label}</div>
                  <div className={`text-lg font-black tabular-nums ${index === expenseKpis.length - 1 ? 'text-[#A43108]' : 'text-[#111111]'}`}>{value}</div>
                </div>
              ))}
            </div>
          )}

          <FilterBar
            search={{ value: list.search, onChange: list.setSearch, placeholder: 'Buscar gasto o proveedor…' }}
            fields={[
              ...(canSeeAllExpenses
                ? [{ key: 'filter', label: 'Categoría', type: 'select' as const, options: [{ value: 'all', label: 'Todas' }, { value: 'insumos', label: 'Insumos' }, { value: 'sueldos', label: 'Nómina y sueldos' }, { value: 'servicios', label: 'Servicios básicos' }, { value: 'arriendo', label: 'Arriendo' }, { value: 'otros', label: 'Otros' }] }]
                : []),
              { key: 'payment', label: 'Pago', type: 'select', options: [{ value: '', label: 'Todos' }, { value: 'cash', label: 'Efectivo' }, { value: 'transfer', label: 'Transferencia' }, { value: 'card', label: 'Tarjeta' }] },
              { key: 'receipt', label: 'Comprobante', type: 'select', options: [{ value: '', label: 'Todos' }, { value: 'yes', label: 'Con comprobante' }, { value: 'no', label: 'Sin comprobante' }] },
              { key: 'from', label: 'Desde', type: 'date' },
              { key: 'to', label: 'Hasta', type: 'date' },
            ]}
            values={list.fieldValues}
            onChange={list.setField}
            onReset={list.reset}
            activeCount={list.activeFilters}
            total={expensesResult.total}
            totalLabel="gastos"
          />

          {/* Table */}
          <PaginatedTable
            columns={columns}
            data={expensesResult.items}
            total={expensesResult.total}
            page={expensesResult.page}
            pageSize={expensesResult.pageSize}
            totalPages={expensesResult.totalPages}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            isLoading={isLoading}
            error={loadError}
            onRetry={loadExpenses}
            rowKey={(e) => e.id}
          />
        </>
      ) : (
        /* Cash Flow Chart View */
        <div className="bg-white rounded-2xl border border-[#E7E5E0] p-4 shadow-[var(--shadow-soft)] space-y-3">
          <div className="flex items-center justify-between border-b border-[#E7E5E0] pb-4">
            <div>
              <h3 className="text-base font-bold text-[#111111]">
                Flujo de Caja: Entradas vs. Salidas Diarias
              </h3>
              <p className="text-xs text-[#6B6B6B]">Últimos 8 días de operación</p>
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-center">
            <DonutChart
              data={[{ label: 'Entradas', value: cashflowIn }, { label: 'Salidas', value: cashflowOut }]}
              centerCaption="Movimiento total"
            />
            <ul className="space-y-1">
              {cashflowDays.map((day) => (
                <li key={day.day} className="grid grid-cols-[4rem_1fr_1fr_5rem] items-center gap-2 text-xs rounded-lg px-2 py-1 hover:bg-[#FBF6E6]">
                  <span className="font-bold text-[#6B6B6B]">{day.day}</span>
                  <span className="tabular-nums text-[#2F7D5B] font-semibold">+{formatCurrency(day.in)}</span>
                  <span className="tabular-nums text-[#B83232] font-semibold">-{formatCurrency(day.out)}</span>
                  <span className={`text-right tabular-nums font-bold ${day.in - day.out >= 0 ? 'text-[#111111]' : 'text-[#B83232]'}`}>{formatCurrency(day.in - day.out)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 bg-[#FBF6E6] rounded-xl border border-[#EBD48F]">
              <span className="text-xs text-[#6B6B6B] font-semibold">Saldo neto del período</span>
              <div className="text-lg font-black tabular-nums text-[#5C5011]">{formatCurrency(cashflowIn - cashflowOut)}</div>
            </div>
            <div className="p-3 bg-[#FAFAF8] rounded-xl border border-[#E7E5E0]">
              <span className="text-xs text-[#6B6B6B] font-semibold">Total de entradas y salidas</span>
              <div className="text-sm font-bold text-[#111111]">{formatCurrency(cashflowIn)} / {formatCurrency(cashflowOut)}</div>
            </div>
            <div className="p-3 bg-[#FAFAF8] rounded-xl border border-[#E7E5E0]">
              <span className="text-xs text-[#6B6B6B] font-semibold">Día de mayor egreso</span>
              <div className="text-sm font-bold text-[#111111]">{heaviestDay.day}: {formatCurrency(heaviestDay.out)}</div>
            </div>
          </div>
        </div>
      )}

      {crud.modals}
    </div>
  );
};
