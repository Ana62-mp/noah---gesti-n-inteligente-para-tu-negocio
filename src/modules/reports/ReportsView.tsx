import React from 'react';
import { FileDown } from 'lucide-react';
import { getBusinessProfile } from '../../shared/business/businessProfiles';
import { useApp } from '../../shared/context/AppContext';
import { Button } from '../../shared/ui/Button';
import { CategoryBars } from '../../shared/ui/Charts';
import { NoahOrb } from '../../shared/ui/NoahOrb';
import { LOW_MARGIN_THRESHOLD } from '../../shared/utils/formatters';

const CARD = 'bg-white rounded-2xl border border-[#E7E5E0] shadow-[var(--shadow-soft)] p-3.5';
const TARGET_MARGIN = 0.5;

const getMarginColor = (margin: number) => {
  if (margin < LOW_MARGIN_THRESHOLD) return 'bg-[#A43108]';
  return margin >= TARGET_MARGIN ? 'bg-[#5C5011]' : 'bg-[#D59F3F]';
};

export const ReportsView: React.FC = () => {
  const { currentBusiness, askNoah, showToast } = useApp();
  const { reports } = getBusinessProfile(currentBusiness.type);

  return (
    <div className="flex flex-col gap-3 min-h-full">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button variant="secondary" size="sm" leftIcon={<FileDown className="w-4 h-4" />} onClick={() => showToast('Exportación a PDF simulada en este prototipo', 'info')}>
          Exportar PDF
        </Button>
        <Button variant="cinnamon" size="sm" onClick={() => askNoah('¿Cuánto ganamos este mes?')}>
          Pedirle a Noah que me lo explique
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 flex-1">
        <section className={`${CARD} lg:col-span-7 flex flex-col gap-2`}>
          <div>
            <h2 className="text-sm font-bold text-[#111111]">{reports.rankingTitle}</h2>
            <p className="text-[11px] text-[#6B6B6B]">{reports.rankingSubtitle}</p>
          </div>
          <ul className="flex-1 flex flex-col justify-around gap-1.5">
            {reports.ranking.map(({ name, margin, volume }, index) => (
              <li key={name} title={`${name}: ${Math.round(margin * 100)} % de margen`}>
                <div className="flex items-baseline justify-between gap-2 text-xs">
                  <span className="font-semibold text-[#111111] truncate">{index + 1}. {name}</span>
                  <span className="shrink-0 tabular-nums text-[#6B6B6B]">
                    {volume} {reports.unit} · <strong className="text-[#111111]">{Math.round(margin * 100)} %</strong>
                  </span>
                </div>
                <div className="h-2 mt-0.5 rounded-full bg-[#F5F4F1] overflow-hidden">
                  <div className={`h-full rounded-full ${getMarginColor(margin)}`} style={{ width: `${margin * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </section>

        <div className="lg:col-span-5 flex flex-col gap-3">
          <section className={`${CARD} flex-1 flex flex-col gap-2`}>
            <h2 className="text-sm font-bold text-[#111111]">Distribución de egresos</h2>
            <CategoryBars items={reports.expenses.map(({ label, amount }) => ({ label, value: amount }))} />
          </section>
          <section className="bg-[#FBF6E6] border border-[#EBD48F] rounded-2xl p-3.5 space-y-1.5">
            <div className="flex items-center gap-2">
              <NoahOrb state="idle" size="sm" showRipples={false} />
              <h2 className="text-xs font-bold text-[#421A05]">Lectura de Noah</h2>
            </div>
            <p className="text-xs text-[#421A05] leading-relaxed">{reports.brief}</p>
            <p className="text-[11px] text-[#8A7424]">Cifras de ejemplo antes de impuestos y retenciones.</p>
          </section>
        </div>
      </div>
    </div>
  );
};
