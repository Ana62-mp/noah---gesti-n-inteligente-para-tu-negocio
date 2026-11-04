import React, { useEffect, useState } from 'react';
import { apiService } from '../../../shared/services/apiService';
import { getBusinessProfile } from '../../../shared/business/businessProfiles';
import { useApp } from '../../../shared/context/AppContext';
import { Expense } from '../../../shared/types';
import { ErrorState } from '../../../shared/ui/ErrorState';
import { getErrorMessage } from '../../../shared/utils/errors';
import { formatCurrency } from '../../../shared/utils/formatters';
import { PhoneHeader } from '../components/PhoneChrome';

const RECENT_EXPENSES = 3;
const LOW_MARGIN_ITEMS = 3;

export const OwnerFinance: React.FC = () => {
  const { currentBusiness } = useApp();
  const { phone, reports } = getBusinessProfile(currentBusiness.type);
  const [periodId, setPeriodId] = useState(phone.periods[0].id);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [error, setError] = useState<string | null>(null);
  const period = phone.periods.find(({ id }) => id === periodId) ?? phone.periods[0];
  const barScaleMax = Math.max(...phone.weekBars.flatMap(({ current, previous }) => [current, previous]), 1);
  const lowMarginItems = [...reports.ranking].sort((a, b) => a.margin - b.margin).slice(0, LOW_MARGIN_ITEMS);

  const loadExpenses = async () => {
    setError(null);
    try {
      const result = await apiService.getExpenses({ page: 1, pageSize: RECENT_EXPENSES });
      setExpenses(result.items);
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-3 space-y-3">
      <PhoneHeader eyebrow="Solo dueño" title="Finanzas" />

      <div className="ph-chip flex p-0.5 rounded-xl" role="tablist" aria-label="Período">
        {phone.periods.map(({ id, label }) => (
          <button
            key={id}
            role="tab"
            aria-selected={periodId === id}
            onClick={() => setPeriodId(id)}
            className={`flex-1 min-h-8 rounded-lg text-[11px] font-bold ${periodId === id ? 'gradient-brand text-white' : ''}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="ph-card p-3 space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className="ph-muted">Ingresos</span>
          <strong className="tabular-nums">{formatCurrency(period.income)}</strong>
        </div>
        <div className="flex justify-between text-xs">
          <span className="ph-muted">Egresos</span>
          <strong className="tabular-nums text-[#CF6811]">-{formatCurrency(period.outcome)}</strong>
        </div>
        <div className="flex justify-between text-sm pt-1.5 border-t ph-divider">
          <span className="font-bold">Resultado estimado</span>
          <strong className="tabular-nums">{formatCurrency(period.income - period.outcome)}</strong>
        </div>
        <p className="text-[10px] ph-muted">{period.note}. Referencial: no descuenta IVA ni impuesto a la renta.</p>
      </div>

      <div className="ph-card p-3 space-y-2">
        <div className="font-bold text-xs">Esta semana vs. la anterior</div>
        {phone.weekBars.map(({ day, current, previous }) => (
          <div key={day} className="flex items-center gap-2 text-[10px]">
            <span className="w-3 font-bold">{day}</span>
            <div className="flex-1 space-y-0.5">
              <div className="h-2 rounded-full bg-[#CF6811]" style={{ width: `${(current / barScaleMax) * 100}%` }} />
              <div className="h-2 rounded-full bg-[#8C8479]" style={{ width: `${(previous / barScaleMax) * 100}%` }} />
            </div>
            <span className="tabular-nums font-bold">{formatCurrency(current)}</span>
          </div>
        ))}
      </div>

      <div className="ph-card p-3 space-y-1.5">
        <div className="font-bold text-xs">{phone.rankingTitle}</div>
        {lowMarginItems.map(({ name, margin }) => (
          <div key={name} className="flex justify-between gap-2 text-[11px]">
            <span className="truncate">{name}</span>
            <strong className="tabular-nums shrink-0">{Math.round(margin * 100)} %</strong>
          </div>
        ))}
      </div>

      <div className="ph-card p-3 space-y-1.5">
        <div className="font-bold text-xs">Últimos gastos</div>
        {error ? (
          <ErrorState message={error} onRetry={loadExpenses} />
        ) : (
          expenses.map((expense) => (
            <div key={expense.id} className="flex justify-between gap-2 text-[11px]">
              <span className="truncate">{expense.concept}</span>
              <strong className="tabular-nums shrink-0">-{formatCurrency(expense.amount)}</strong>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
