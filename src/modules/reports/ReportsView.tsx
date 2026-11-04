import React from 'react';
import { FileDown } from 'lucide-react';
import { getBusinessProfile } from '../../shared/business/businessProfiles';
import { useApp } from '../../shared/context/AppContext';
import { Button } from '../../shared/ui/Button';
import { DonutChart } from '../../shared/ui/Charts';
import { NoahOrb } from '../../shared/ui/NoahOrb';
import { LOW_MARGIN_THRESHOLD } from '../../shared/utils/formatters';

const CARD = 'bg-white rounded-2xl border border-[#E7E5E0] shadow-[var(--shadow-soft)] p-4';
const TARGET_MARGIN = 0.5;
const TOP_SOLD = 5;

const getMarginStyle = (margin: number) => {
  if (margin < LOW_MARGIN_THRESHOLD) return 'bg-[#F4C3B0] text-[#7A2105]';
  return margin >= TARGET_MARGIN ? 'bg-[#DCD8A8] text-[#3B3308]' : 'bg-[#F6D98F] text-[#5E3F04]';
};

const formatUnits = (value: number) => `${value}`;

export const ReportsView: React.FC = () => {
  const { currentBusiness, askNoah, showToast } = useApp();
  const { reports } = getBusinessProfile(currentBusiness.type);
  const bySales = [...reports.ranking].sort((a, b) => b.volume - a.volume);
  const soldSlices = [
    ...bySales.slice(0, TOP_SOLD).map(({ name, volume }) => ({ label: name, value: volume })),
    { label: 'Otros', value: bySales.slice(TOP_SOLD).reduce((sum, { volume }) => sum + volume, 0) },
  ].filter(({ value }) => value > 0);

  return (
    <div className="flex flex-col gap-4 min-h-full">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button variant="secondary" size="sm" leftIcon={<FileDown className="w-4 h-4" />} onClick={() => showToast('Exportación a PDF simulada en este prototipo', 'info')}>
          Exportar PDF
        </Button>
        <Button variant="cinnamon" size="sm" onClick={() => askNoah('¿Cuánto ganamos este mes?')}>
          Pedirle a Noah que me lo explique
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <section className={CARD}>
          <h2 className="text-sm font-bold text-[#111111]">Egresos por categoría</h2>
          <p className="text-[11px] text-[#6B6B6B] mb-2">Pasa el cursor por una porción para ver el detalle</p>
          <DonutChart data={reports.expenses.map(({ label, amount }) => ({ label, value: amount }))} centerCaption="Egresos del mes" />
        </section>

        <section className={CARD}>
          <h2 className="text-sm font-bold text-[#111111]">Lo que más se vendió</h2>
          <p className="text-[11px] text-[#6B6B6B] mb-2">Peso de cada uno según las unidades vendidas</p>
          <DonutChart data={soldSlices} centerCaption={`${reports.unit} en el mes`} formatValue={formatUnits} />
        </section>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        <section className={`${CARD} xl:col-span-3`}>
          <h2 className="text-sm font-bold text-[#111111]">{reports.rankingTitle}</h2>
          <p className="text-[11px] text-[#6B6B6B] mb-2">{reports.rankingSubtitle}</p>
          <ol className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1.5">
            {reports.ranking.map(({ name, margin, volume }, index) => (
              <li key={name} className="flex items-center gap-2 rounded-lg border border-[#F1EFEA] px-2.5 py-1.5 text-xs">
                <span className="w-5 text-[#6B6B6B] font-bold tabular-nums">{index + 1}</span>
                <span className="flex-1 min-w-0">
                  <span className="block truncate font-semibold text-[#111111]">{name}</span>
                  <span className="block text-[11px] text-[#6B6B6B]">{volume} {reports.unit}</span>
                </span>
                <span className={`px-2 py-0.5 rounded-md text-[11px] font-extrabold tabular-nums ${getMarginStyle(margin)}`}>{Math.round(margin * 100)} %</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="xl:col-span-2 bg-[#FBF6E6] border border-[#EBD48F] rounded-2xl p-4 space-y-2 self-start">
          <div className="flex items-center gap-2">
            <NoahOrb state="idle" size="sm" showRipples={false} />
            <h2 className="text-xs font-bold text-[#421A05]">Lectura de Noah</h2>
          </div>
          <p className="text-xs text-[#421A05] leading-relaxed">{reports.brief}</p>
          <p className="text-[11px] text-[#8A7424]">Cifras de ejemplo antes de impuestos y retenciones.</p>
        </section>
      </div>
    </div>
  );
};
