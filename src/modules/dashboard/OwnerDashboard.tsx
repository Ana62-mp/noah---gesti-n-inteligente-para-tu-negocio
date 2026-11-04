import React, { useState } from 'react';
import { useApp } from '../../shared/context/AppContext';
import { MetricCard } from '../../shared/ui/MetricCard';
import { Button } from '../../shared/ui/Button';
import { Badge } from '../../shared/ui/Badge';
import { NoahOrb } from '../../shared/ui/NoahOrb';
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  ChefHat,
  ArrowRight,
  Receipt,
  Boxes,
  HelpCircle,
  Plus,
  Send,
} from 'lucide-react';

export const OwnerDashboard: React.FC = () => {
  const {
    currentBusiness,
    setActiveSection,
    setIsAssistantOpen,
    showToast,
  } = useApp();

  const [questionInput, setQuestionInput] = useState('');

  // Weekly comparison data (Semana 45 vs Semana 44)
  const weeklyData = [
    { day: 'Lun', actual: 1360, anterior: 1190 },
    { day: 'Mar', actual: 780, anterior: 700 }, // Today (partial)
    { day: 'Mié', actual: 0, anterior: 950 },
    { day: 'Jue', actual: 0, anterior: 1220 },
    { day: 'Vie', actual: 0, anterior: 2450 },
    { day: 'Sáb', actual: 0, anterior: 3100 },
    { day: 'Dom', actual: 0, anterior: 2850 },
  ];

  const handleAskNoah = (query: string) => {
    setIsAssistantOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Personalized Greeting & Noah Quick Question Bar */}
      <div className="bg-gradient-to-r from-[#421A05] via-[#5C2307] to-[#421A05] text-white rounded-3xl p-6 lg:p-7 shadow-md relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-[#CF6811]/20 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/10 text-[#EBD48F] text-xs font-semibold backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#CF6811]" />
              <span>Resumen ejecutivo diario</span>
            </div>
            <h2 className="text-xl lg:text-2xl font-display font-extrabold tracking-tight">
              Buenas tardes, {currentBusiness.ownerName.split(' ')[0]}
            </h2>
            <p className="text-xs lg:text-sm text-[#FBF6E6]/80 leading-relaxed">
              Hoy llevas vendiendo <strong className="text-white font-bold tabular-nums">$780,50</strong> en 86 pedidos, un{' '}
              <strong className="text-[#EBD48F] font-bold tabular-nums">12 % más</strong> que el martes pasado a esta misma hora.
            </p>
          </div>

          {/* Quick Voice / Assistant Launcher */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAssistantOpen(true)}
              className="flex items-center gap-3 bg-white text-[#111111] px-5 py-3 rounded-2xl hover:bg-[#FBF6E6] transition-all shadow-md group active:scale-95"
            >
              <NoahOrb state="idle" size="sm" showRipples={false} />
              <div className="text-left leading-tight">
                <div className="text-xs font-bold text-[#421A05] group-hover:text-[#CF6811] transition-colors">
                  Hablar con Noah
                </div>
                <div className="text-[11px] text-[#6B6B6B]">Voz y chat con tu negocio</div>
              </div>
            </button>
          </div>
        </div>

        {/* Suggestion Chips Bar */}
        <div className="mt-5 pt-4 border-t border-white/15 flex items-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-none">
          <span className="text-xs text-[#EBD48F] font-semibold shrink-0">Pregúntale a Noah:</span>
          {[
            '¿Cuánto ganamos este mes?',
            '¿Cuál es mi plato menos rentable?',
            '¿Qué insumos vencen mañana?',
            'Dame un consejo para vender más el miércoles',
          ].map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleAskNoah(prompt)}
              className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-xl transition-colors shrink-0 backdrop-blur-xs border border-white/10"
            >
              "{prompt}"
            </button>
          ))}
        </div>
      </div>

      {/* Row of 6 Key Financial & Operational MetricCards with Provenance */}
      <div className="stagger grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        <MetricCard
          title="Ventas de hoy"
          tone="cinnamon"
          icon={<TrendingUp className="w-4 h-4" />}
          value="$780,50"
          change={0.12}
          changePeriod="vs. martes anterior"
          provenance={{
            period: 'Hoy (00:00 a 14:30)',
            source: 'Comprobantes emitidos en salón y delivery',
            updatedAt: 'Hace 3 minutos',
            details: '86 transacciones conciliadas en caja física y pagos electrónicos.',
          }}
          highlight
        />

        <MetricCard
          title="Ventas semana"
          tone="banana"
          icon={<TrendingUp className="w-4 h-4" />}
          value="$2.140,00"
          change={0.092}
          changePeriod="vs. semana 44"
          provenance={{
            period: 'Semana 45 (Lunes y Martes)',
            source: 'Módulo de Ventas y Caja',
            updatedAt: 'Hoy, 14:30',
            details: '+$180,00 frente a los primeros 2 días de la semana anterior.',
          }}
        />

        <MetricCard
          title="Gastos del mes"
          tone="terracotta"
          icon={<Receipt className="w-4 h-4" />}
          value="$12.450,00"
          subtitle="Insumos + Op. de octubre"
          provenance={{
            period: '01/10/2026 al 31/10/2026',
            source: 'Facturas registradas en Compras y Egresos',
            updatedAt: 'Cierre de octubre',
            details: 'Insumos: $6.300 | Nómina: $2.900 | Arriendo: $850 | Servicios: $2.400',
          }}
        />

        <MetricCard
          title="Resultado est."
          tone="olive"
          icon={<TrendingUp className="w-4 h-4" />}
          value="$2.950,00"
          change={0.191}
          changePeriod="19.1% margen neto"
          provenance={{
            period: 'Octubre 2026',
            source: 'Ventas ($15.400) - Costos ($6.300) - Gastos ($6.150)',
            updatedAt: 'Preliminar mensual',
            details: 'Estimación referencial antes de provisiones tributarias de fin de año.',
          }}
          highlight
        />

        <MetricCard
          title="Margen carta"
          tone="harvest"
          icon={<ChefHat className="w-4 h-4" />}
          value="56.8 %"
          subtitle="Promedio recetas"
          provenance={{
            period: 'Carta actual (25 platos)',
            source: 'Fichas de costeo teórico de insumos',
            updatedAt: 'Ayer',
            details: 'Plato más alto: Bebidas (71%); más bajo: Ceviche camarón (18%).',
          }}
        />

        <MetricCard
          title="Pedidos activos"
          tone="banana"
          icon={<Boxes className="w-4 h-4" />}
          value="15"
          subtitle="4 cocina · 8 salón · 3 delivery"
          provenance={{
            period: 'En tiempo real',
            source: 'Mesas y Tablero de Cocina',
            updatedAt: 'En vivo',
          }}
        />
      </div>

      {/* Main Two-Column Layout (Desktop compact without scrolling) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Weekly Sales Comparison Chart */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E7E5E0] border-t-4 border-t-[#D59F3F] p-6 shadow-[var(--shadow-soft)] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#111111]">
                Ventas de esta semana vs. semana anterior
              </h3>
              <p className="text-xs text-[#6B6B6B]">
                Comparativa día a día para anticipar días de baja rotación
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 font-semibold text-[#111111]">
                <span className="w-3 h-3 rounded-sm bg-[#CF6811]" />
                Esta semana
              </span>
              <span className="flex items-center gap-1.5 text-[#6B6B6B]">
                <span className="w-3 h-3 rounded-sm bg-[#E7E5E0]" />
                Semana anterior
              </span>
            </div>
          </div>

          {/* Clean SVG/CSS Bar Comparison Chart */}
          <div className="pt-4">
            <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-48 border-b border-[#E7E5E0] pb-2">
              {weeklyData.map((d, idx) => {
                const maxVal = 3200;
                const actHeight = (d.actual / maxVal) * 100;
                const antHeight = (d.anterior / maxVal) * 100;

                return (
                  <div key={idx} className="flex flex-col items-center h-full justify-end gap-1.5 group">
                    <div className="flex items-end gap-1 w-full justify-center h-full">
                      {/* Anterior */}
                      <div
                        className="w-3 sm:w-5 bg-[#E7E5E0] rounded-t-sm transition-all group-hover:bg-[#D59F3F]/40"
                        style={{ height: `${antHeight}%` }}
                        title={`${d.day} anterior: $${d.anterior}`}
                      />
                      {/* Actual */}
                      <div
                        className={`w-3 sm:w-5 rounded-t-sm transition-all ${
                          d.actual > 0
                            ? 'bg-[#CF6811] shadow-[var(--shadow-soft)] group-hover:bg-[#B85B0E]'
                            : 'bg-transparent border border-dashed border-[#E7E5E0]'
                        }`}
                        style={{ height: d.actual > 0 ? `${actHeight}%` : '4%' }}
                        title={`${d.day} actual: $${d.actual}`}
                      />
                    </div>
                    <span className="text-xs font-bold text-[#6B6B6B]">{d.day}</span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-xs text-[#6B6B6B] pt-3">
              <span>* Los miércoles bajan las ventas un 20 % en promedio</span>
              <button
                onClick={() => setActiveSection('reports')}
                className="text-[#CF6811] hover:underline font-semibold flex items-center gap-1"
              >
                Ver reporte completo <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: "Noah te avisa" (Proactive Alerts & Action buttons) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-[#E7E5E0] border-t-4 border-t-[#A43108] p-6 shadow-[var(--shadow-soft)] space-y-4">
          <div className="flex items-center justify-between border-b border-[#E7E5E0] pb-3">
            <div className="flex items-center gap-2">
              <NoahOrb state="idle" size="sm" showRipples={false} />
              <h3 className="text-base font-bold text-[#111111]">Noah te avisa</h3>
            </div>
            <Badge variant="banana" size="sm">3 avisos activos</Badge>
          </div>

          <div className="space-y-3">
            {/* Alert 1: Overstock chicken expiring */}
            <div className="p-3.5 rounded-xl border border-[#A43108]/30 bg-red-50/50 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#A43108]">
                  <AlertTriangle className="w-4 h-4 text-[#A43108]" />
                  <span>5 pollos por vencer mañana (Merma)</span>
                </div>
                <span className="text-[10px] text-[#6B6B6B] shrink-0">Hoy 08:30</span>
              </div>
              <p className="text-xs text-[#421A05] leading-relaxed">
                Tienes 13 kg de pollo entero excedente. Haz una promo 2x1 en seco de pollo hoy para transformarlo en liquidez.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setActiveSection('alerts')}
                >
                  Crear promoción
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => showToast('Aviso pospuesto', 'info')}
                >
                  Descartar
                </Button>
              </div>
            </div>

            {/* Alert 2: Low margin on Shrimp Ceviche */}
            <div className="p-3.5 rounded-xl border border-[#D59F3F]/40 bg-[#FFFBEB] space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#8A6310]">
                  <AlertTriangle className="w-4 h-4 text-[#D59F3F]" />
                  <span>Margen crítico en Ceviche (18 %)</span>
                </div>
                <span className="text-[10px] text-[#6B6B6B] shrink-0">Ayer</span>
              </div>
              <p className="text-xs text-[#421A05] leading-relaxed">
                El camarón subió un 15 % este mes. Tu margen cayó al 18 %. Evalúa subir el precio de $9,00 a $10,50.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <Button
                  variant="cinnamon"
                  size="sm"
                  onClick={() => setActiveSection('costing')}
                >
                  Abrir simulador de costeo
                </Button>
              </div>
            </div>

            {/* Alert 3: Lemon expiring */}
            <div className="p-3.5 rounded-xl border border-[#E7E5E0] bg-[#FAFAF8] space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="text-xs font-bold text-[#111111]">
                  3 kg de limón sutil por vencer en 2 días
                </div>
                <span className="text-[10px] text-[#6B6B6B] shrink-0">Hoy</span>
              </div>
              <p className="text-xs text-[#6B6B6B]">
                Se sugiere preparar jarra de limonada imperial o ceviches del día.
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setActiveSection('inventory')}
              >
                Ver en bodega
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
