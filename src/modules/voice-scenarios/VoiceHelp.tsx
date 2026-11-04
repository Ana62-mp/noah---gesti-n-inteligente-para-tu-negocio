import React from 'react';
import { Mic, ShieldCheck, Sparkles } from 'lucide-react';
import { useApp } from '../../shared/context/AppContext';
import { apiService } from '../../shared/services/apiService';
import { BusinessType, Expense } from '../../shared/types';
import { formatCurrency, formatDate } from '../../shared/utils/formatters';

const PHRASES: Record<BusinessType, string[]> = {
  restaurant: ['Dos secos de pollo y tres ceviches para la mesa cuatro', 'Registra una compra de limón por 30 dólares', '¿Qué tengo por vencer?', '¿Cuál es mi plato menos rentable?', 'Pagué 85 dólares de luz'],
  store: ['Vendí 12 dólares con 50 de pan, leche y huevos', 'Registra una compra de 45 dólares en abarrotes', '¿Cuánto gasté este mes?', '¿Cuánto tengo en caja?', 'Pagué 62 dólares de luz'],
  barbershop: ['Agéndame un corte para Luis el martes a las 15:00', 'Agéndame un corte el martes a las 2 de la tarde', '¿Cuánto vendimos hoy?', 'Registra un gasto de 15 dólares en toallas', '¿Cuánto ganamos este mes?'],
  services: ['Agéndame una cita el martes a las 15:00', '¿Cuánto vendimos hoy?', 'Registra un gasto de 15 dólares'],
};

const RECENT_COUNT = 5;

const STEPS = [
  { title: 'Habla o escribe', text: 'Dile a Noah lo que necesitas con tus palabras, como se lo dirías a una persona.' },
  { title: 'Revisa el borrador', text: 'Noah entiende cantidades, nombres y horarios, y te muestra lo que anotó para que lo corrijas.' },
  { title: 'Confirma', text: 'Solo cuando tú confirmas se guarda. Nada cambia en tu negocio sin tu visto bueno.' },
];

export const VoiceHelp: React.FC = () => {
  const { currentBusiness, askNoah } = useApp();
  const recent = (apiService.getCollection('expenses') as Expense[]).slice(0, RECENT_COUNT);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <section className="bg-white rounded-2xl border border-[#E7E5E0] shadow-[var(--shadow-soft)] p-4 space-y-2">
        <h3 className="flex items-center gap-2 text-sm font-bold text-[#111111]"><Sparkles className="w-4 h-4 text-[#CF6811]" />Prueba decir…</h3>
        <p className="text-[11px] text-[#6B6B6B]">Toca una frase y Noah la responde en el asistente.</p>
        <div className="flex flex-wrap gap-2 pt-1">
          {PHRASES[currentBusiness.type].map((phrase) => (
            <button key={phrase} onClick={() => askNoah(phrase)} className="flex items-center gap-1.5 min-h-9 px-3 rounded-xl border border-[#EBD48F] bg-[#FBF6E6] text-xs font-semibold text-[#421A05] text-left hover:bg-[#F6D98F] transition-colors">
              <Mic className="w-3.5 h-3.5 text-[#CF6811] shrink-0" />“{phrase}”
            </button>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-[#E7E5E0] shadow-[var(--shadow-soft)] p-4 space-y-2">
        <h3 className="flex items-center gap-2 text-sm font-bold text-[#111111]"><ShieldCheck className="w-4 h-4 text-[#5C5011]" />Cómo funciona</h3>
        <ol className="space-y-2 pt-1">
          {STEPS.map(({ title, text }, index) => (
            <li key={title} className="flex items-start gap-3">
              <span className="w-6 h-6 shrink-0 rounded-full gradient-brand text-white text-xs font-black flex items-center justify-center">{index + 1}</span>
              <span className="text-xs text-[#6B6B6B]"><strong className="block text-[#111111]">{title}</strong>{text}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="bg-white rounded-2xl border border-[#E7E5E0] shadow-[var(--shadow-soft)] p-4 space-y-2">
        <h3 className="text-sm font-bold text-[#111111]">Últimos gastos registrados</h3>
        <ul className="divide-y divide-[#E7E5E0]">
          {recent.map((expense) => (
            <li key={expense.id} className="flex items-center justify-between gap-2 py-1.5 text-xs">
              <span className="min-w-0"><span className="block truncate font-semibold text-[#111111]">{expense.concept}</span><span className="text-[11px] text-[#6B6B6B]">{formatDate(expense.date)}</span></span>
              <span className="shrink-0 font-bold tabular-nums text-[#A43108]">-{formatCurrency(expense.amount)}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};
