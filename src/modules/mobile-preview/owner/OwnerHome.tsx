import React from 'react';
import { ChevronRight, Volume2 } from 'lucide-react';
import { speechService } from '../../../shared/services/speechService';
import { Badge } from '../../../shared/ui/Badge';
import { NoahOrb } from '../../../shared/ui/NoahOrb';
import { PhoneHeader } from '../components/PhoneChrome';

const KPI_SLIDES = [
  { label: 'Ventas de hoy', value: '$780,50', note: '+12 % vs. martes anterior · 86 pedidos' },
  { label: 'Resultado de octubre', value: '$2.950,00', note: 'Estimado, antes de impuestos' },
  { label: 'En caja', value: '$445,00', note: 'Efectivo con fondo inicial de $50,00' },
  { label: 'Pedidos activos', value: '15', note: '4 cocina · 8 salón · 3 delivery' },
];

const QUICK_QUESTIONS = ['¿Cuánto ganamos este mes?', '¿Cuál es mi plato menos rentable?', '¿Qué tengo por vencer?'];

const DAILY_SUMMARY =
  'Hoy vendiste 780 dólares con 50 centavos, un 12 por ciento más que el martes pasado. Tu plato estrella fue el encebollado. Ojo: 5 pollos vencen mañana.';

interface OwnerHomeProps {
  onAsk: (question: string) => void;
  onOpenAlerts: () => void;
  alertCount: number;
}

export const OwnerHome: React.FC<OwnerHomeProps> = ({ onAsk, onOpenAlerts, alertCount }) => (
  <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-3 space-y-3">
    <PhoneHeader eyebrow="La Sazón de Carlos" title="Hola, Carlos" right={<Badge variant="olive" size="sm">Abierto</Badge>} />

    <div className="flex gap-2 overflow-x-auto snap-x snap-mandatory scrollbar-none -mx-3 px-3">
      {KPI_SLIDES.map((slide) => (
        <div key={slide.label} className="snap-center shrink-0 w-[86%] p-3.5 rounded-2xl gradient-espresso text-white">
          <div className="text-[10px] text-[#EBD48F] uppercase font-bold">{slide.label}</div>
          <div className="text-2xl font-black tabular-nums">{slide.value}</div>
          <div className="text-[11px] text-[#EBD48F]/90">{slide.note}</div>
        </div>
      ))}
    </div>

    <button
      onClick={() => onAsk('¿Cuánto vendimos hoy?')}
      className="w-full ph-card flex flex-col items-center gap-1 py-3.5"
      aria-label="Tocar para hablar con Noah"
    >
      <NoahOrb state="idle" size="lg" />
      <span className="font-bold text-xs mt-1">Toca para hablar</span>
      <span className="text-[11px] ph-muted">"¿Cuánto vendimos hoy?"</span>
    </button>

    <div className="flex gap-1.5 overflow-x-auto scrollbar-none -mx-3 px-3">
      {QUICK_QUESTIONS.map((question) => (
        <button key={question} onClick={() => onAsk(question)} className="ph-chip shrink-0 px-2.5 py-1.5 rounded-full text-[11px] font-semibold">
          {question}
        </button>
      ))}
    </div>

    <div className="ph-card p-3 space-y-1">
      <div className="flex items-center justify-between gap-2">
        <span className="font-bold text-xs">Tu día en 20 segundos</span>
        <button onClick={() => speechService.speak(DAILY_SUMMARY)} className="flex items-center gap-1 text-[11px] font-bold text-[#CF6811]">
          <Volume2 className="w-3.5 h-3.5" />
          Escuchar
        </button>
      </div>
      <p className="text-[11px] ph-muted leading-relaxed">
        Vendiste $780,50 (+12 %). Plato estrella: encebollado. Ojo: 5 pollos vencen mañana.
      </p>
    </div>

    {alertCount > 0 && (
      <button onClick={onOpenAlerts} className="w-full ph-card p-3 flex items-center justify-between gap-2 text-left">
        <span className="text-xs font-bold">{alertCount} alertas de Noah por revisar</span>
        <ChevronRight className="w-4 h-4 text-[#CF6811] shrink-0" />
      </button>
    )}
  </div>
);
