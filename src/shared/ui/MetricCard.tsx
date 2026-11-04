import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, HelpCircle, Info } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  change?: number; // e.g. 0.12 = +12%
  changePeriod?: string;
  provenance?: {
    period: string;
    source: string;
    updatedAt: string;
    details?: string;
  };
  highlight?: boolean;
  icon?: React.ReactNode;
  subtitle?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changePeriod = 'vs. semana anterior',
  provenance,
  highlight = false,
  icon,
  subtitle,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const isPositive = change !== undefined && change >= 0;
  const isNegative = change !== undefined && change < 0;

  return (
    <div
      className={`relative rounded-2xl p-4 sm:p-5 transition-all duration-200 border overflow-hidden ${
        highlight
          ? 'bg-[#FBF6E6] border-[#EBD48F] shadow-sm'
          : 'bg-white border-[#E7E5E0] hover:border-[#D59F3F]/40 shadow-xs'
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#6B6B6B] truncate" title={title}>
          {title}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          {icon && <span className="text-[#CF6811]">{icon}</span>}
          {provenance && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowTooltip(!showTooltip)}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                className="text-[#8A7424] hover:text-[#CF6811] p-0.5 rounded transition-colors focus:outline-none"
                aria-label="Origen del dato"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>

              {/* Provenance Popover Tooltip */}
              {showTooltip && (
                <div className="absolute right-0 top-6 z-40 w-64 p-3 bg-[#421A05] text-[#FBF6E6] text-xs rounded-xl shadow-xl border border-[#D59F3F]/30 animate-in fade-in zoom-in-95">
                  <div className="flex items-center gap-1.5 font-bold text-[#EBD48F] mb-1.5">
                    <Info className="w-3.5 h-3.5" />
                    <span>¿De dónde sale este dato?</span>
                  </div>
                  <div className="space-y-1 text-[11px] leading-tight">
                    <p>
                      <strong className="text-white">Período:</strong> {provenance.period}
                    </p>
                    <p>
                      <strong className="text-white">Fuente:</strong> {provenance.source}
                    </p>
                    <p>
                      <strong className="text-white">Actualizado:</strong> {provenance.updatedAt}
                    </p>
                    {provenance.details && (
                      <p className="mt-1 pt-1 border-t border-white/10 text-white/80">
                        {provenance.details}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-baseline justify-between gap-1.5 flex-wrap">
        <div
          className="text-lg sm:text-xl lg:text-2xl font-black tracking-tight text-[#111111] tabular-nums font-sans min-w-0 truncate"
          title={value}
        >
          {value}
        </div>

        {change !== undefined && (
          <div
            className={`inline-flex items-center text-[11px] sm:text-xs font-bold px-1.5 py-0.5 rounded-md tabular-nums shrink-0 ${
              isPositive
                ? 'bg-[#5C5011]/10 text-[#5C5011]'
                : isNegative
                ? 'bg-[#A43108]/10 text-[#A43108]'
                : 'bg-[#F5F4F1] text-[#6B6B6B]'
            }`}
          >
            {isPositive ? (
              <ArrowUpRight className="w-3 h-3 mr-0.5" />
            ) : isNegative ? (
              <ArrowDownRight className="w-3 h-3 mr-0.5" />
            ) : null}
            <span>
              {isPositive ? '+' : ''}
              {(change * 100).toFixed(1)}%
            </span>
          </div>
        )}
      </div>

      {(subtitle || changePeriod) && (
        <div className="text-[11px] text-[#6B6B6B] mt-1.5 truncate" title={subtitle || changePeriod}>
          {subtitle || changePeriod}
        </div>
      )}
    </div>
  );
};
