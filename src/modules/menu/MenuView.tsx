import React, { useState, useEffect } from 'react';
import { useApp } from '../../shared/context/AppContext';
import { apiService } from '../../shared/services/apiService';
import { Dish } from '../../shared/types';
import { Button } from '../../shared/ui/Button';
import { Badge } from '../../shared/ui/Badge';
import { FilterBar } from '../../shared/ui/FilterBar';
import { formatCurrency, formatPercent } from '../../shared/utils/formatters';
import { usePagedList } from '../../shared/hooks/usePagedList';
import { Pagination } from '../../shared/ui/Pagination';
import { ErrorState } from '../../shared/ui/ErrorState';
import { EmptyState } from '../../shared/ui/EmptyState';
import { SkeletonLoader } from '../../shared/ui/SkeletonLoader';
import {
  UtensilsCrossed,
  Calculator,
  Search,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

const DISHES_PER_PAGE = 12;
const PAGE_SIZES = [12, 24, 48];

export const MenuView: React.FC = () => {
  const { setActiveSection, showToast, currentRole, canAccess } = useApp();
  const canSeeCosts = canAccess('costing');
  const canEdit = currentRole === 'owner';
  const list = usePagedList((params) => apiService.getDishesPage(params), 'all', DISHES_PER_PAGE);

  const handleToggleAvailability = async (dishId: string) => {
    await apiService.toggleDishAvailability(dishId);
    showToast('Disponibilidad actualizada en cocina y carta', 'info');
    list.reload();
  };

  return (
    <div className="space-y-3">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-end gap-2">
{canSeeCosts && (
          <div className="flex items-center gap-2">
            <Badge variant="olive">Verde ≥ 50%</Badge>
            <Badge variant="banana">Banana 30–50%</Badge>
            <Badge variant="terracotta">Rojo &lt; 30%</Badge>
          </div>
        )}
      </div>

      <FilterBar
        search={{ value: list.search, onChange: list.setSearch, placeholder: 'Buscar plato…' }}
        fields={[
          { key: 'filter', label: 'Categoría', type: 'select', options: [{ value: 'all', label: 'Todas' }, { value: 'platos_fuertes', label: 'Platos fuertes' }, { value: 'sopas', label: 'Sopas y caldos' }, { value: 'mariscos', label: 'Mariscos' }, { value: 'desayunos', label: 'Desayunos' }, { value: 'bebidas', label: 'Bebidas' }, { value: 'postres', label: 'Postres' }] },
          { key: 'availability', label: 'Disponibilidad', type: 'select', options: [{ value: '', label: 'Todos' }, { value: 'yes', label: 'Disponibles' }, { value: 'no', label: 'Agotados' }] },
          ...(canSeeCosts ? [{ key: 'margin', label: 'Margen', type: 'select' as const, options: [{ value: '', label: 'Todos' }, { value: 'high', label: '50 % o más' }, { value: 'mid', label: '30 % a 50 %' }, { value: 'low', label: 'Menos de 30 %' }] }] : []),
        ]}
        values={list.fieldValues}
        onChange={list.setField}
        onReset={list.reset}
        activeCount={list.activeFilters}
        total={list.result.total}
        totalLabel="platos"
      />

      {/* Dishes Grid */}
      {list.error && <ErrorState message={list.error} onRetry={list.reload} />}
      {list.isLoading && <SkeletonLoader rows={4} cols={3} />}
      {!list.isLoading && !list.error && list.result.total === 0 && (
        <EmptyState title="Sin platos para mostrar" description="Prueba con otra categoría o búsqueda." />
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {!list.isLoading && list.result.items.map((dish) => {
          const margin = dish.grossMargin * 100;
          const badgeVariant =
            margin >= 50 ? 'olive' : margin >= 30 ? 'banana' : 'terracotta';

          return (
            <div
              key={dish.id}
              className={`bg-white rounded-2xl border p-4 shadow-[var(--shadow-soft)] flex flex-col justify-between space-y-2.5 transition-all ${
                dish.isAvailable ? 'border-[#E7E5E0] hover:border-[#D59F3F]' : 'border-[#E7E5E0] opacity-60'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display font-extrabold text-base text-[#111111]">
                    {dish.name}
                  </h3>
                  {canSeeCosts && (
                    <Badge variant={badgeVariant} size="sm">
                      {formatPercent(dish.grossMargin, 0)}
                    </Badge>
                  )}
                </div>

                <p className="text-xs text-[#6B6B6B] line-clamp-2 leading-relaxed">
                  {dish.description}
                </p>

                {canSeeCosts ? (
                <div className="bg-[#FAFAF8] p-3 rounded-xl border border-[#E7E5E0] grid grid-cols-3 gap-2 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-[#6B6B6B] uppercase font-bold block">Precio</span>
                    <span className="font-bold text-sm font-mono text-[#111111]">
                      {formatCurrency(dish.sellingPrice)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#A43108] uppercase font-bold block">Costo</span>
                    <span className="font-bold text-sm font-mono text-[#A43108]">
                      {formatCurrency(dish.theoreticalCost)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#5C5011] uppercase font-bold block">Ganancia</span>
                    <span className="font-bold text-sm font-mono text-[#5C5011]">
                      {formatCurrency(dish.sellingPrice - dish.theoreticalCost)}
                    </span>
                  </div>
                </div>
                ) : (
                  <div className="bg-[#FAFAF8] p-3 rounded-xl border border-[#E7E5E0] flex items-center justify-between text-xs">
                    <span className="text-[10px] text-[#6B6B6B] uppercase font-bold">Precio de venta</span>
                    <span className="font-bold text-sm font-mono text-[#111111]">{formatCurrency(dish.sellingPrice)}</span>
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="pt-2 border-t border-[#E7E5E0] flex items-center justify-between">
                {canEdit ? (
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-[#6B6B6B]">
                  <input
                    type="checkbox"
                    checked={dish.isAvailable}
                    onChange={() => handleToggleAvailability(dish.id)}
                    className="accent-[#5C5011] rounded"
                  />
                  <span>{dish.isAvailable ? 'Disponible' : 'Agotado'}</span>
                </label>
                ) : (
                  <Badge variant={dish.isAvailable ? 'olive' : 'terracotta'} size="sm">
                    {dish.isAvailable ? 'Disponible' : 'Agotado'}
                  </Badge>
                )}

                {canSeeCosts && (
                <button
                  onClick={() => setActiveSection('costing')}
                  className="text-xs font-semibold text-[#CF6811] hover:underline flex items-center gap-1"
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Costeo</span>
                </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {list.result.total > 0 && (
        <div className="rounded-xl overflow-hidden border border-[#E7E5E0]">
          <Pagination
            page={list.result.page}
            pageSize={list.result.pageSize}
            total={list.result.total}
            totalPages={list.result.totalPages}
            onPageChange={list.setPage}
            onPageSizeChange={list.setPageSize}
            sizes={PAGE_SIZES}
          />
        </div>
      )}
    </div>
  );
};
