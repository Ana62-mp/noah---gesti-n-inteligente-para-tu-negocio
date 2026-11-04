import React, { useState, useEffect } from 'react';
import { useApp } from '../../shared/context/AppContext';
import { apiService } from '../../shared/services/apiService';
import { Dish } from '../../shared/types';
import { Button } from '../../shared/ui/Button';
import { Badge } from '../../shared/ui/Badge';
import { formatCurrency, formatPercent } from '../../shared/utils/formatters';
import { canEditMenu, canViewDishCosts } from '../../shared/permissions/rolePermissions';
import {
  UtensilsCrossed,
  Calculator,
  Search,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export const MenuView: React.FC = () => {
  const { setActiveSection, showToast, currentRole } = useApp();
  const canSeeCosts = canViewDishCosts(currentRole);
  const canEdit = canEditMenu(currentRole);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadDishes();
  }, []);

  const loadDishes = async () => {
    const data = await apiService.getDishes();
    setDishes(data);
  };

  const handleToggleAvailability = async (dishId: string) => {
    await apiService.toggleDishAvailability(dishId);
    showToast('Disponibilidad actualizada en cocina y carta', 'info');
    loadDishes();
  };

  const filteredDishes = dishes.filter((d) => {
    const matchesCat = filterCategory === 'all' || d.category === filterCategory;
    const matchesSearch =
      !searchTerm ||
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E7E5E0] shadow-[var(--shadow-soft)]">
        <div>
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5 text-[#CF6811]" />
            <h2 className="text-lg font-bold text-[#111111]">Carta y Menú</h2>
          </div>
          <p className="text-xs text-[#6B6B6B]">
            {canSeeCosts
              ? '25 platos ecuatorianos con recetas costeadas, márgenes brutos y disponibilidad.'
              : 'Platos, precios de venta y disponibilidad de hoy.'}
          </p>
        </div>

        {canSeeCosts && (
          <div className="flex items-center gap-2">
            <Badge variant="olive">Verde ≥ 50%</Badge>
            <Badge variant="banana">Banana 30–50%</Badge>
            <Badge variant="terracotta">Rojo &lt; 30%</Badge>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-[#E7E5E0]">
        <div className="flex items-center gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none py-1">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'platos_fuertes', label: 'Platos fuertes' },
            { id: 'sopas', label: 'Sopas y caldos' },
            { id: 'mariscos', label: 'Mariscos' },
            { id: 'desayunos', label: 'Desayunos' },
            { id: 'bebidas', label: 'Bebidas' },
            { id: 'postres', label: 'Postres' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterCategory === cat.id
                  ? 'bg-[#421A05] text-white shadow-[var(--shadow-soft)]'
                  : 'bg-[#F5F4F1] text-[#6B6B6B] hover:text-[#111111]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Buscar plato…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-[#F5F4F1] border border-[#E7E5E0] rounded-lg px-3 py-1.5 text-xs text-[#111111] focus:outline-none focus:ring-1 focus:ring-[#CF6811] w-48"
          />
        </div>
      </div>

      {/* Dishes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDishes.map((dish) => {
          const margin = dish.grossMargin * 100;
          const badgeVariant =
            margin >= 50 ? 'olive' : margin >= 30 ? 'banana' : 'terracotta';

          return (
            <div
              key={dish.id}
              className={`bg-white rounded-2xl border p-5 shadow-[var(--shadow-soft)] flex flex-col justify-between space-y-4 transition-all ${
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
    </div>
  );
};
