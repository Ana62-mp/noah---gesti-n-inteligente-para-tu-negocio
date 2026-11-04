import React, { useState } from 'react';
import { useApp } from '../../shared/context/AppContext';
import { Button } from '../../shared/ui/Button';
import { Badge } from '../../shared/ui/Badge';
import { NoahOrb } from '../../shared/ui/NoahOrb';
import { formatCurrency, formatPercent } from '../../shared/utils/formatters';
import {
  BarChart3,
  FileDown,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  PieChart,
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { showToast, setIsAssistantOpen } = useApp();
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('month');

  // Dish margin ranking sorted
  const dishMarginRanking = [
    { name: 'Jarra de jugo de naranjilla', margin: 0.71, price: 4.00, cost: 1.15, vol: 210 },
    { name: 'Colada morada con guagua', margin: 0.69, price: 3.50, cost: 1.10, vol: 230 },
    { name: 'Bolón de verde mixto', margin: 0.66, price: 3.50, cost: 1.20, vol: 165 },
    { name: 'Locro de papa con queso', margin: 0.65, price: 4.00, cost: 1.40, vol: 120 },
    { name: 'Seco de pollo', margin: 0.60, price: 5.50, cost: 2.20, vol: 184 },
    { name: 'Encebollado mixto de albacora', margin: 0.59, price: 4.50, cost: 1.85, vol: 310 },
    { name: 'Fritada pastusa tradicional', margin: 0.57, price: 6.50, cost: 2.80, vol: 88 },
    { name: 'Hornado con llapingachos', margin: 0.54, price: 7.00, cost: 3.20, vol: 115 },
    { name: 'Churrasco ecuatoriano', margin: 0.52, price: 6.50, cost: 3.10, vol: 95 },
    { name: 'Ceviche de camarón', margin: 0.18, price: 9.00, cost: 7.38, vol: 142 }, // WORST
  ];

  // Category distribution
  const expenseCategories = [
    { label: 'Insumos frescos y bodega', amount: 6300, pct: '50.6%', color: '#D59F3F' },
    { label: 'Nómina y sueldos de personal', amount: 2900, pct: '23.3%', color: '#A43108' },
    { label: 'Arriendo de local comercial', amount: 850, pct: '6.8%', color: '#5C5011' },
    { label: 'Servicios básicos (luz/agua/gas)', amount: 350, pct: '2.8%', color: '#8A7424' },
    { label: 'Mantenimiento y otros egresos', amount: 2050, pct: '16.5%', color: '#6B6B6B' },
  ];

  const handleExportPDF = () => {
    showToast('Generando reporte PDF consolidado con sello de NOAH (Simulado)', 'info');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E7E5E0] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#CF6811]" />
            <h2 className="text-lg font-bold text-[#111111]">Reportes y Rentabilidad Gerencial</h2>
          </div>
          <p className="text-xs text-[#6B6B6B]">
            Desempeño mensual de platos, estructura de egresos y comparativas estacionales.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 bg-[#F5F4F1] rounded-xl border border-[#E7E5E0]">
            <button
              onClick={() => setPeriod('month')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                period === 'month' ? 'bg-white text-[#111111] shadow-xs' : 'text-[#6B6B6B]'
              }`}
            >
              Octubre
            </button>
            <button
              onClick={() => setPeriod('quarter')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                period === 'quarter' ? 'bg-white text-[#111111] shadow-xs' : 'text-[#6B6B6B]'
              }`}
            >
              Trimestre
            </button>
          </div>

          <Button
            variant="secondary"
            size="sm"
            leftIcon={<FileDown className="w-4 h-4" />}
            onClick={handleExportPDF}
          >
            Exportar PDF
          </Button>

          <Button
            variant="cinnamon"
            size="sm"
            leftIcon={<NoahOrb state="idle" size="sm" showRipples={false} />}
            onClick={() => setIsAssistantOpen(true)}
          >
            Pedirle a Noah que me lo explique
          </Button>
        </div>
      </div>

      {/* Main Grid: Margin Ranking | Expense Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Dish Margin Ranking Bar Chart */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E7E5E0] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E7E5E0] pb-3">
            <div>
              <h3 className="text-base font-bold text-[#111111]">Ranking de Margen Bruto por Plato</h3>
              <p className="text-xs text-[#6B6B6B]">De mayor a menor margen referencial</p>
            </div>
            <span className="text-xs font-bold text-[#6B6B6B]">Meta: ≥ 50 %</span>
          </div>

          <div className="space-y-3 pt-2">
            {dishMarginRanking.map((dish, idx) => {
              const marginPct = (dish.margin * 100).toFixed(0);
              const isLow = dish.margin < 0.30;
              const isHigh = dish.margin >= 0.50;

              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between items-baseline text-xs">
                    <span className="font-bold text-[#111111]">
                      {idx + 1}. {dish.name}
                    </span>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-[#6B6B6B]">{dish.vol} vendidos</span>
                      <span
                        className={`font-bold tabular-nums ${
                          isLow ? 'text-[#A43108]' : isHigh ? 'text-[#5C5011]' : 'text-[#8A6310]'
                        }`}
                      >
                        {marginPct} %
                      </span>
                    </div>
                  </div>

                  {/* Horizontal Bar */}
                  <div className="h-2.5 w-full bg-[#F5F4F1] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isLow ? 'bg-[#A43108]' : isHigh ? 'bg-[#5C5011]' : 'bg-[#D59F3F]'
                      }`}
                      style={{ width: `${Math.min(100, dish.margin * 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Expenses Breakdown & Noah Analysis */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-[#E7E5E0] p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E7E5E0] pb-3">
              <h3 className="text-base font-bold text-[#111111]">Distribución de Egresos</h3>
              <span className="text-xs font-mono font-bold text-[#A43108]">$12.450,00</span>
            </div>

            <div className="space-y-3">
              {expenseCategories.map((cat, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#111111] font-medium">{cat.label}</span>
                    <span className="font-bold font-mono tabular-nums">
                      {formatCurrency(cat.amount)} ({cat.pct})
                    </span>
                  </div>
                  <div className="h-2 bg-[#F5F4F1] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        backgroundColor: cat.color,
                        width: cat.pct,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Executive Noah Brief */}
          <div className="bg-[#FBF6E6] border border-[#EBD48F] rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <NoahOrb state="idle" size="sm" showRipples={false} />
              <h4 className="text-xs font-bold text-[#421A05]">Lectura gerencial de Noah:</h4>
            </div>
            <p className="text-xs text-[#421A05] leading-relaxed">
              En octubre ganaste un <strong>19.1 % neto aproximado</strong>. El Encebollado y el Seco de Pollo
              fueron tus dos mayores motores de utilidad, sumando más de $1.200 de ganancia neta.
              Sin embargo, los $142 platos de Ceviche de camarón dejaron solo $230 de beneficio por el alza del marisco.
            </p>
            <div className="pt-2 border-t border-[#EBD48F]/60 flex items-center justify-between">
              <span className="text-[10px] text-[#8A7424]">* Cifras antes de impuestos y retenciones SRI</span>
              <button
                onClick={() => setIsAssistantOpen(true)}
                className="text-xs font-bold text-[#CF6811] hover:underline"
              >
                Hacer preguntas →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
