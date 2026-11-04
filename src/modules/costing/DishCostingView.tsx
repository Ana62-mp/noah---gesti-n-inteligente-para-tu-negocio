import React, { useState, useEffect } from 'react';
import { useApp } from '../../shared/context/AppContext';
import { apiService } from '../../shared/services/apiService';
import { Dish, RecipeItem } from '../../shared/types';
import { Button } from '../../shared/ui/Button';
import { Badge } from '../../shared/ui/Badge';
import { NoahOrb } from '../../shared/ui/NoahOrb';
import {
  Calculator,
  Save,
  RotateCcw,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Info,
} from 'lucide-react';

export const DishCostingView: React.FC = () => {
  const { showToast } = useApp();
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [selectedDishId, setSelectedDishId] = useState<string>('dish-ceviche-camaron');
  const [currentDish, setCurrentDish] = useState<Dish | null>(null);

  // Editable ingredients copy for current dish
  const [ingredients, setIngredients] = useState<RecipeItem[]>([]);
  const [simulatedPrice, setSimulatedPrice] = useState<number>(9.00);
  const [simulatedIngredientCostMultiplier, setSimulatedIngredientCostMultiplier] = useState<number>(1.0);

  useEffect(() => {
    loadDishes();
  }, []);

  const loadDishes = async () => {
    const data = await apiService.getDishes();
    setDishes(data);
    const initial = data.find((d) => d.id === 'dish-ceviche-camaron') || data[0];
    if (initial) {
      selectDish(initial);
    }
  };

  const selectDish = (dish: Dish) => {
    setSelectedDishId(dish.id);
    setCurrentDish(dish);
    setIngredients(JSON.parse(JSON.stringify(dish.ingredients)));
    setSimulatedPrice(dish.sellingPrice);
    setSimulatedIngredientCostMultiplier(1.0);
  };

  const handleDishChange = (id: string) => {
    const dish = dishes.find((d) => d.id === id);
    if (dish) selectDish(dish);
  };

  const handleUpdateIngredient = (idx: number, field: 'quantity' | 'unitCost', value: number) => {
    setIngredients((prev) =>
      prev.map((item, i) => {
        if (i === idx) {
          const updated = { ...item, [field]: value };
          updated.subtotal = Number((updated.quantity * updated.unitCost).toFixed(2));
          return updated;
        }
        return item;
      })
    );
  };

  // Calculations
  const calculatedCost = Number(
    ingredients
      .reduce((sum, item) => sum + item.quantity * item.unitCost * simulatedIngredientCostMultiplier, 0)
      .toFixed(2)
  );

  const calculatedGain = Number((simulatedPrice - calculatedCost).toFixed(2));
  const calculatedMargin = simulatedPrice > 0 ? (simulatedPrice - calculatedCost) / simulatedPrice : 0;
  const marginPercent = Number((calculatedMargin * 100).toFixed(1));

  const marginVariant =
    marginPercent >= 50 ? 'olive' : marginPercent >= 30 ? 'banana' : 'terracotta';

  const handleSaveRecipe = async () => {
    if (!currentDish) return;
    await apiService.updateDishRecipe(currentDish.id, ingredients);
    await apiService.updateDishPrice(currentDish.id, simulatedPrice);
    showToast(`Receta y precio de "${currentDish.name}" actualizados con éxito`, 'success');
  };

  if (!currentDish) return null;

  return (
    <div className="space-y-6">
      {/* Top Header & Dish Picker */}
      <div className="bg-white rounded-2xl border border-[#E7E5E0] p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-[#CF6811]" />
            <h2 className="text-lg font-bold text-[#111111]">Ficha de Receta y Costeo Gastronómico</h2>
          </div>
          <p className="text-xs text-[#6B6B6B]">
            Calcula el costo real de preparación plato por plato y simula variaciones de insumos y precios.
          </p>
        </div>

        {/* Dish Selector Dropdown */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-[#6B6B6B] whitespace-nowrap">Plato:</label>
          <select
            value={selectedDishId}
            onChange={(e) => handleDishChange(e.target.value)}
            className="bg-[#F5F4F1] border border-[#E7E5E0] rounded-xl px-3 py-2 text-sm font-bold text-[#111111] focus:outline-none focus:ring-2 focus:ring-[#CF6811]"
          >
            {dishes.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} (${d.sellingPrice.toFixed(2)}) — Margen {(d.grossMargin * 100).toFixed(0)}%
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Split Layout: Left Table | Right Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Ingredients Table & Formula */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E7E5E0] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E7E5E0] pb-3">
            <div>
              <h3 className="text-base font-bold text-[#111111]">{currentDish.name}</h3>
              <p className="text-xs text-[#6B6B6B]">{currentDish.description}</p>
            </div>
            <Badge variant={marginVariant}>
              Margen {(currentDish.grossMargin * 100).toFixed(0)}%
            </Badge>
          </div>

          {/* Formula Display */}
          <div className="bg-[#FBF6E6] border border-[#EBD48F] rounded-xl p-3 text-xs text-[#421A05] flex items-center justify-between">
            <span className="font-semibold">Fórmula de costeo:</span>
            <code className="font-mono text-[11px] bg-white px-2 py-0.5 rounded border border-[#EBD48F]">
              Costo = Σ (Cantidad × Costo unitario) · Margen = (Precio − Costo) / Precio
            </code>
          </div>

          {/* Ingredients Editable Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#F5F4F1] text-[#6B6B6B] uppercase font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Insumo</th>
                  <th className="py-2.5 px-3 text-center">Cantidad</th>
                  <th className="py-2.5 px-3 text-center">Unidad</th>
                  <th className="py-2.5 px-3 text-right">Costo Unit.</th>
                  <th className="py-2.5 px-3 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E5E0]">
                {ingredients.map((ing, idx) => (
                  <tr key={idx} className="hover:bg-[#FBF6E6]/30 transition-colors">
                    <td className="py-2.5 px-3 font-medium text-[#111111]">{ing.ingredientName}</td>
                    <td className="py-2.5 px-3 text-center">
                      <input
                        type="number"
                        step="0.01"
                        value={ing.quantity}
                        onChange={(e) =>
                          handleUpdateIngredient(idx, 'quantity', parseFloat(e.target.value) || 0)
                        }
                        className="w-16 text-center border border-[#E7E5E0] rounded-lg py-1 px-1 bg-white font-mono"
                      />
                    </td>
                    <td className="py-2.5 px-3 text-center text-[#6B6B6B]">{ing.unit}</td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <span>$</span>
                        <input
                          type="number"
                          step="0.05"
                          value={ing.unitCost}
                          onChange={(e) =>
                            handleUpdateIngredient(idx, 'unitCost', parseFloat(e.target.value) || 0)
                          }
                          className="w-16 text-right border border-[#E7E5E0] rounded-lg py-1 px-1 bg-white font-mono"
                        />
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-[#111111] tabular-nums font-mono">
                      ${ing.subtotal.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-[#FAFAF8] border-t-2 border-[#E7E5E0] font-bold text-[#111111]">
                <tr>
                  <td colSpan={4} className="py-3 px-3 text-right">
                    Costo teórico total:
                  </td>
                  <td className="py-3 px-3 text-right text-base text-[#A43108] tabular-nums font-mono">
                    ${calculatedCost.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              onClick={() => selectDish(currentDish)}
            >
              Restablecer receta original
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Save className="w-3.5 h-3.5" />}
              onClick={handleSaveRecipe}
            >
              Guardar receta y precio
            </Button>
          </div>
        </div>

        {/* Right Column: Live Simulator & Circular Gauge */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-[#E7E5E0] p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-[#E7E5E0] pb-3">
            <h3 className="text-base font-bold text-[#111111]">Simulador en vivo</h3>
            <span className="text-[11px] text-[#6B6B6B]">Recálculo automático</span>
          </div>

          {/* KPI Triad: Price, Cost, Gain */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-[#FAFAF8] p-2.5 sm:p-3 rounded-xl border border-[#E7E5E0] min-w-0 overflow-hidden">
              <div className="text-[10px] uppercase font-bold text-[#6B6B6B] truncate">Precio venta</div>
              <div className="text-base sm:text-lg font-extrabold text-[#111111] tabular-nums font-mono mt-1 truncate" title={`$${simulatedPrice.toFixed(2)}`}>
                ${simulatedPrice.toFixed(2)}
              </div>
            </div>
            <div className="bg-[#FAFAF8] p-2.5 sm:p-3 rounded-xl border border-[#E7E5E0] min-w-0 overflow-hidden">
              <div className="text-[10px] uppercase font-bold text-[#A43108] truncate">Costo insumos</div>
              <div className="text-base sm:text-lg font-extrabold text-[#A43108] tabular-nums font-mono mt-1 truncate" title={`$${calculatedCost.toFixed(2)}`}>
                ${calculatedCost.toFixed(2)}
              </div>
            </div>
            <div className="bg-[#FAFAF8] p-2.5 sm:p-3 rounded-xl border border-[#E7E5E0] min-w-0 overflow-hidden">
              <div className="text-[10px] uppercase font-bold text-[#5C5011] truncate">Ganancia/plato</div>
              <div className="text-base sm:text-lg font-extrabold text-[#5C5011] tabular-nums font-mono mt-1 truncate" title={`$${calculatedGain.toFixed(2)}`}>
                ${calculatedGain.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Circular Margin Gauge */}
          <div className="flex flex-col items-center justify-center p-4 bg-[#FAFAF8] rounded-2xl border border-[#E7E5E0]">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#E7E5E0"
                  strokeWidth="10"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke={
                    marginVariant === 'olive'
                      ? '#5C5011'
                      : marginVariant === 'banana'
                      ? '#D59F3F'
                      : '#A43108'
                  }
                  strokeWidth="10"
                  strokeDasharray={`${Math.max(0, Math.min(100, marginPercent)) * 2.51} 251`}
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-extrabold text-[#111111] font-mono tabular-nums">
                  {marginPercent}%
                </span>
                <span className="text-[10px] uppercase tracking-wider text-[#6B6B6B] font-bold">
                  Margen Bruto
                </span>
              </div>
            </div>
            <div className="mt-3">
              <Badge variant={marginVariant}>
                {marginVariant === 'olive'
                  ? 'Margen saludable (≥ 50 %)'
                  : marginVariant === 'banana'
                  ? 'Margen moderado (30 - 50 %)'
                  : 'Margen crítico (< 30 %)'}
              </Badge>
            </div>
          </div>

          {/* Interactive Sliders */}
          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>¿Si cambio el precio de venta?</span>
                <span className="font-mono text-[#CF6811] font-bold">
                  ${simulatedPrice.toFixed(2)} USD
                </span>
              </div>
              <input
                type="range"
                min="4"
                max="16"
                step="0.5"
                value={simulatedPrice}
                onChange={(e) => setSimulatedPrice(parseFloat(e.target.value))}
                className="w-full accent-[#CF6811]"
              />
              <div className="flex justify-between text-[10px] text-[#6B6B6B]">
                <span>$4,00</span>
                <span>$10,50 (Recomendado)</span>
                <span>$16,00</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>¿Si los insumos suben o bajan?</span>
                <span className="font-mono font-bold text-[#111111]">
                  {simulatedIngredientCostMultiplier > 1 ? '+' : ''}
                  {((simulatedIngredientCostMultiplier - 1) * 100).toFixed(0)} %
                </span>
              </div>
              <input
                type="range"
                min="0.8"
                max="1.5"
                step="0.05"
                value={simulatedIngredientCostMultiplier}
                onChange={(e) => setSimulatedIngredientCostMultiplier(parseFloat(e.target.value))}
                className="w-full accent-[#421A05]"
              />
              <div className="flex justify-between text-[10px] text-[#6B6B6B]">
                <span>-20% (Oferta)</span>
                <span>Normal</span>
                <span>+50% (Escasez)</span>
              </div>
            </div>
          </div>

          {/* Noah's AI Diagnostic Box */}
          <div className="p-4 bg-[#FBF6E6] border border-[#EBD48F] rounded-2xl space-y-2">
            <div className="flex items-center gap-2">
              <NoahOrb state="idle" size="sm" showRipples={false} />
              <span className="text-xs font-bold text-[#421A05]">Diagnóstico de Noah:</span>
            </div>
            <p className="text-xs text-[#421A05] leading-relaxed">
              {currentDish.id === 'dish-ceviche-camaron' && marginPercent < 30 ? (
                <>
                  Tu ceviche de camarón deja solo <strong>18 % de margen</strong> porque el camarón subió un 15 % este mes en Mariscos del Pacífico.
                  Si subes el precio a <strong>$10,50</strong> o reemplazas la porción doble de canguil por chifles, tu margen volverá a subir al <strong>30 %</strong>.
                </>
              ) : marginPercent >= 50 ? (
                <>
                  Excelente plato ancla: <strong>{currentDish.name}</strong> deja un saludable <strong>{marginPercent}% de margen</strong>.
                  Genera liquidez continua y puedes usarlo como plato estrella en promociones de almuerzo.
                </>
              ) : (
                <>
                  Margen en rango intermedio ({marginPercent}%). Monitorea el precio de compra en el Mercado Mayorista para evitar caídas imprevistas.
                </>
              )}
            </p>
            <div className="text-[10px] text-[#8A7424] pt-1 border-t border-[#EBD48F]/60">
              * Cifras referenciales calculadas según los gramajes registrados en la receta y precios de proveedores.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
