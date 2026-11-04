import React, { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { HelpCircle } from 'lucide-react';

const TOOLTIP_WIDTH = 260;
const VIEWPORT_MARGIN = 12;
const TRIGGER_GAP = 8;

interface InfoTooltipProps {
  period: string;
  source: string;
  updatedAt: string;
  details?: string;
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({ period, source, updatedAt, details }) => {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

  const show = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const maxLeft = window.innerWidth - TOOLTIP_WIDTH - VIEWPORT_MARGIN;
    setPosition({
      top: rect.bottom + TRIGGER_GAP,
      left: Math.max(VIEWPORT_MARGIN, Math.min(rect.left + rect.width / 2 - TOOLTIP_WIDTH / 2, maxLeft)),
    });
  };
  const hide = () => setPosition(null);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        className="text-[#8A7424] hover:text-[#CF6811] p-0.5 rounded transition-colors"
        aria-label={`Origen del dato: ${source}, ${period}`}
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>

      {position &&
        createPortal(
          <div
            role="tooltip"
            style={{ top: position.top, left: position.left, width: TOOLTIP_WIDTH }}
            className="fixed z-[60] rounded-xl bg-white border border-[#EBD48F] shadow-xl p-3 text-xs text-[#421A05] pointer-events-none page-enter"
          >
            <div className="font-bold mb-1.5">¿De dónde sale este dato?</div>
            <dl className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5 text-[11px]">
              <dt className="text-[#6B6B6B]">Período</dt>
              <dd className="font-semibold">{period}</dd>
              <dt className="text-[#6B6B6B]">Fuente</dt>
              <dd className="font-semibold">{source}</dd>
              <dt className="text-[#6B6B6B]">Actualizado</dt>
              <dd className="font-semibold">{updatedAt}</dd>
            </dl>
            {details && <p className="mt-1.5 pt-1.5 border-t border-[#EBD48F]/60 text-[11px] text-[#6B6B6B]">{details}</p>}
          </div>,
          document.body
        )}
    </>
  );
};
