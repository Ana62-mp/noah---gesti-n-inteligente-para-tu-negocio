import React from 'react';
import { CalendarCheck, ChefHat, Receipt, ShoppingBasket, TrendingUp, Wallet } from 'lucide-react';
import { getBusinessProfile } from '../../shared/business/businessProfiles';
import { KpiIcon } from '../../shared/business/profileTypes';
import { useApp } from '../../shared/context/AppContext';
import { CategoryBars, ComparisonChart } from '../../shared/ui/Charts';
import { MetricCard } from '../../shared/ui/MetricCard';
import { NoahOrb } from '../../shared/ui/NoahOrb';
import { NoahAlertsPanel } from './NoahAlertsPanel';
import { StoreQuickEntry } from './StoreQuickEntry';
import { TodayAgendaPanel } from './TodayAgendaPanel';

const ICON = 'w-4 h-4';
const KPI_ICONS: Record<KpiIcon, React.ReactNode> = {
  trend: <TrendingUp className={ICON} />,
  receipt: <Receipt className={ICON} />,
  dish: <ChefHat className={ICON} />,
  orders: <ShoppingBasket className={ICON} />,
  calendar: <CalendarCheck className={ICON} />,
  wallet: <Wallet className={ICON} />,
};

const KPI_GRID: Record<number, string> = {
  3: 'grid-cols-1 sm:grid-cols-3',
  5: 'grid-cols-2 md:grid-cols-3 xl:grid-cols-5',
  6: 'grid-cols-2 md:grid-cols-3 xl:grid-cols-6',
};

const CARD = 'bg-white rounded-2xl border border-[#E7E5E0] shadow-[var(--shadow-soft)] p-3.5 flex flex-col gap-2 flex-1 min-h-0';

export const DashboardView: React.FC = () => {
  const { currentBusiness, currentMember, askNoah, canAccess } = useApp();
  const { dashboard } = getBusinessProfile(currentBusiness.type);
  const firstName = currentMember.name.split(' ')[0];

  return (
    <div className="flex flex-col gap-3 min-h-full lg:h-full lg:min-h-[640px]">
      <div className="gradient-espresso text-white rounded-2xl px-4 py-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="flex-1 min-w-[240px]">
          <h2 className="font-display font-extrabold text-base">Buenas tardes, {firstName}</h2>
          <p className="text-xs text-[#FBF6E6]/90">{dashboard.greeting}</p>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {dashboard.chips.map((chip) => (
            <button key={chip} onClick={() => askNoah(chip)} className="shrink-0 text-xs bg-white/10 hover:bg-white/20 border border-white/15 px-2.5 py-1.5 rounded-lg transition-colors">
              {chip}
            </button>
          ))}
        </div>
        <button onClick={() => askNoah()} className="shrink-0 flex items-center gap-2 bg-white text-[#421A05] pl-2 pr-3 py-1.5 rounded-xl text-xs font-bold hover:bg-[#FBF6E6]">
          <NoahOrb state="idle" size="sm" showRipples={false} />
          Hablar con Noah
        </button>
      </div>

      <div className={`stagger grid gap-3 ${KPI_GRID[dashboard.kpis.length] ?? 'grid-cols-2 md:grid-cols-4'}`}>
        {dashboard.kpis.map((kpi) => (
          <MetricCard
            key={kpi.title}
            title={kpi.title}
            value={kpi.value}
            tone={kpi.tone}
            icon={KPI_ICONS[kpi.icon]}
            change={kpi.change}
            changePeriod={kpi.changePeriod ?? ''}
            subtitle={kpi.subtitle}
            provenance={kpi.provenance}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 lg:grid-rows-[minmax(0,1fr)] gap-3 flex-1 min-h-0">
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-3 min-h-0">
          <section className={CARD}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-3">
              <h3 className="text-sm font-bold text-[#111111]">{dashboard.weeklyTitle}</h3>
              <p className="text-[11px] text-[#6B6B6B]">{dashboard.weeklyNote}</p>
            </div>
            <ComparisonChart data={dashboard.weekly} currentLabel="Esta semana" previousLabel="Semana anterior" />
          </section>
          <section className={CARD}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-3">
              <h3 className="text-sm font-bold text-[#111111]">{dashboard.secondaryTitle}</h3>
              <p className="text-[11px] text-[#6B6B6B]">{dashboard.secondarySubtitle}</p>
            </div>
            <CategoryBars items={dashboard.secondary} />
          </section>
        </div>

        <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-3 min-h-0">
          {currentBusiness.type === 'store' && <StoreQuickEntry />}
          {canAccess('appointments') && <TodayAgendaPanel />}
          <NoahAlertsPanel />
        </div>
      </div>
    </div>
  );
};
