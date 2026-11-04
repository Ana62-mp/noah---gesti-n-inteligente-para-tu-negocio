import React, { useState, useEffect } from 'react';
import { useApp } from '../../shared/context/AppContext';
import { apiService, PaginatedResult } from '../../shared/services/apiService';
import { Ingredient } from '../../shared/types';
import { PaginatedTable, Column } from '../../shared/ui/PaginatedTable';
import { Button } from '../../shared/ui/Button';
import { Badge } from '../../shared/ui/Badge';
import { Modal } from '../../shared/ui/Modal';
import { formatDate } from '../../shared/utils/formatters';
import {
  Boxes,
  Plus,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  Sparkles,
} from 'lucide-react';

export const InventoryView: React.FC = () => {
  const { showToast, setActiveSection } = useApp();
  const [activeTab, setActiveTab] = useState<'stock' | 'movements' | 'expirations'>('stock');

  const [ingredientsResult, setIngredientsResult] = useState<PaginatedResult<Ingredient>>({
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
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Movement Form
  const [selectedIngId, setSelectedIngId] = useState('');
  const [movementType, setMovementType] = useState<'entry' | 'consumption' | 'adjustment' | 'waste'>('entry');
  const [movementAmount, setMovementAmount] = useState(5);
  const [movementNotes, setMovementNotes] = useState('');

  useEffect(() => {
    loadIngredients();
  }, [page, pageSize, filter, search, activeTab]);

  const loadIngredients = async () => {
    setIsLoading(true);
    try {
      let activeFilter = filter;
      if (activeTab === 'expirations') {
        activeFilter = 'expiring';
      }
      const res = await apiService.getIngredients({
        page,
        pageSize,
        filter: activeFilter,
        search,
      });
      setIngredientsResult(res);
      if (res.items.length > 0 && !selectedIngId) {
        setSelectedIngId(res.items[0].id);
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecordMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIngId) return;

    await apiService.recordStockMovement(selectedIngId, movementType, movementAmount, movementNotes);
    setIsModalOpen(false);
    showToast('Movimiento de stock registrado y recalculado', 'success');
    loadIngredients();
  };

  const columns: Column<Ingredient>[] = [
    {
      header: 'Insumo / Ubicación',
      accessor: (ing) => (
        <div>
          <div className="font-bold text-[#111111] text-xs">{ing.name}</div>
          <div className="text-[11px] text-[#6B6B6B]">
            {ing.category} · {ing.location}
          </div>
        </div>
      ),
    },
    {
      header: 'Stock Actual',
      accessor: (ing) => (
        <span className="font-mono font-bold text-sm text-[#111111] tabular-nums">
          {ing.currentStock} {ing.unit}
        </span>
      ),
    },
    {
      header: 'Umbral Mínimo',
      accessor: (ing) => (
        <span className="text-xs text-[#6B6B6B] tabular-nums font-mono">
          {ing.minThreshold} {ing.unit}
        </span>
      ),
    },
    {
      header: 'Vencimiento',
      accessor: (ing) => (
        <div>
          <div className="text-xs font-medium tabular-nums">{formatDate(ing.expiryDate)}</div>
          <div
            className={`text-[10px] font-bold ${
              ing.daysToExpiry <= 1
                ? 'text-[#A43108]'
                : ing.daysToExpiry <= 3
                ? 'text-[#D59F3F]'
                : 'text-[#6B6B6B]'
            }`}
          >
            {ing.daysToExpiry <= 1
              ? 'Vence mañana'
              : `En ${ing.daysToExpiry} días`}
          </div>
        </div>
      ),
    },
    {
      header: 'Estado',
      accessor: (ing) => {
        const conf: Record<Ingredient['status'], { label: string; v: 'olive' | 'banana' | 'terracotta' | 'harvest' }> = {
          normal: { label: 'Normal', v: 'olive' },
          low: { label: 'Stock bajo', v: 'banana' },
          overstock: { label: 'Sobrestock', v: 'harvest' },
          expiring: { label: 'Por vencer', v: 'terracotta' },
        };
        const st = conf[ing.status] || { label: ing.status, v: 'olive' };
        return <Badge variant={st.v} size="sm">{st.label}</Badge>;
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E7E5E0] shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-[#111111]">Insumos y Bodega</h2>
          <p className="text-xs text-[#6B6B6B]">
            Control de materias primas, alertas de merma, caducidades y consumos teóricos.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center p-1 bg-[#F5F4F1] rounded-xl border border-[#E7E5E0]">
            <button
              onClick={() => {
                setActiveTab('stock');
                setFilter('all');
                setPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'stock'
                  ? 'bg-white text-[#111111] shadow-xs'
                  : 'text-[#6B6B6B] hover:text-[#111111]'
              }`}
            >
              Existencias
            </button>
            <button
              onClick={() => {
                setActiveTab('expirations');
                setFilter('expiring');
                setPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'expirations'
                  ? 'bg-white text-[#111111] shadow-xs'
                  : 'text-[#6B6B6B] hover:text-[#111111]'
              }`}
            >
              Vencimientos y Merma
            </button>
          </div>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsModalOpen(true)}
          >
            Registrar movimiento
          </Button>
        </div>
      </div>

      {/* Overstock / Critical Expiry Banner */}
      <div className="bg-[#FFFBEB] border border-[#D59F3F]/40 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-[#CF6811] shrink-0 mt-0.5" />
          <div className="text-xs text-[#421A05] leading-relaxed">
            <strong className="font-bold">Alerta de Sobrestock Crítico:</strong> 5 pollos enteros (≈ 13 kg)
            vencen mañana y 3 kg de limón sutil en 2 días. Noah sugiere activar la promo 2x1 en seco de pollo.
          </div>
        </div>

        <Button
          variant="primary"
          size="sm"
          className="shrink-0"
          onClick={() => setActiveSection('alerts')}
        >
          Ver sugerencia de promo
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-[#E7E5E0]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#6B6B6B]">Filtro de estado:</span>
          <select
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setPage(1);
            }}
            className="bg-[#F5F4F1] border border-[#E7E5E0] rounded-lg px-2.5 py-1 text-xs text-[#111111] focus:outline-none"
          >
            <option value="all">Todos los estados</option>
            <option value="normal">Normal</option>
            <option value="low">Stock bajo</option>
            <option value="overstock">Sobrestock</option>
            <option value="expiring">Por vencer</option>
          </select>
        </div>

        <input
          type="text"
          placeholder="Buscar insumo o categoría…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="bg-[#F5F4F1] border border-[#E7E5E0] rounded-lg px-3 py-1 text-xs text-[#111111] focus:outline-none focus:ring-1 focus:ring-[#CF6811] w-52"
        />
      </div>

      {/* Paginated Table */}
      <PaginatedTable
        columns={columns}
        data={ingredientsResult.items}
        total={ingredientsResult.total}
        page={ingredientsResult.page}
        pageSize={ingredientsResult.pageSize}
        totalPages={ingredientsResult.totalPages}
        onPageChange={setPage}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize);
          setPage(1);
        }}
        isLoading={isLoading}
        rowKey={(i) => i.id}
      />

      {/* Movement Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Registrar Movimiento de Inventario"
        subtitle="Entrada de compra, merma, consumo o ajuste físico"
      >
        <form onSubmit={handleRecordMovement} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-[#111111] block mb-1">Insumo:</label>
            <select
              value={selectedIngId}
              onChange={(e) => setSelectedIngId(e.target.value)}
              className="w-full border border-[#E7E5E0] rounded-xl p-2.5 text-xs text-[#111111] bg-[#F5F4F1]"
              required
            >
              {ingredientsResult.items.map((it) => (
                <option key={it.id} value={it.id}>
                  {it.name} (Stock: {it.currentStock} {it.unit})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-[#111111] block mb-1">Tipo de movimiento:</label>
              <select
                value={movementType}
                onChange={(e) => setMovementType(e.target.value as any)}
                className="w-full border border-[#E7E5E0] rounded-xl p-2.5 text-xs text-[#111111] bg-[#F5F4F1]"
              >
                <option value="entry">Entrada / Compra (+)</option>
                <option value="consumption">Consumo manual (-)</option>
                <option value="waste">Merma / Pérdida (-)</option>
                <option value="adjustment">Ajuste de inventario</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-[#111111] block mb-1">Cantidad:</label>
              <input
                type="number"
                step="0.5"
                min="0.1"
                value={movementAmount}
                onChange={(e) => setMovementAmount(parseFloat(e.target.value) || 0)}
                className="w-full border border-[#E7E5E0] rounded-xl p-2.5 text-xs text-[#111111] bg-[#F5F4F1] font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-[#111111] block mb-1">Observación o motivo:</label>
            <input
              type="text"
              value={movementNotes}
              onChange={(e) => setMovementNotes(e.target.value)}
              placeholder="Ej. Ingreso factura Los Andes / Merma por rotura"
              className="w-full border border-[#E7E5E0] rounded-xl p-2.5 text-xs text-[#111111] bg-[#F5F4F1]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              Aplicar movimiento
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
