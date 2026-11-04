import React from 'react';
import { useApp } from '../../shared/context/AppContext';
import { NoahOrb } from '../../shared/ui/NoahOrb';
import { Button } from '../../shared/ui/Button';
import {
  Compass,
  ArrowRight,
  ArrowLeft,
  X,
  CheckCircle2,
} from 'lucide-react';

export const GuidedTour: React.FC = () => {
  const { guidedTourStep, tourSteps, nextTourStep, prevTourStep, closeTour } = useApp();

  if (guidedTourStep === null) return null;

  const current = tourSteps[guidedTourStep] ?? tourSteps[0];

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 max-w-xl w-[92%] bg-[#421A05] text-white rounded-2xl p-5 shadow-2xl border border-[#D59F3F]/40 animate-in slide-in-from-bottom-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <NoahOrb state="speaking" size="sm" showRipples={false} className="shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#EBD48F] bg-white/10 px-2 py-0.5 rounded">
                Paso {guidedTourStep + 1} de {tourSteps.length}
              </span>
              <h4 className="font-bold text-sm text-white">{current.title}</h4>
            </div>
            <p className="text-xs text-[#FBF6E6]/90 leading-relaxed">{current.description}</p>
          </div>
        </div>

        <button
          onClick={closeTour}
          className="text-white/60 hover:text-white p-1 rounded-lg transition-colors"
          aria-label="Cerrar recorrido guiado"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/10">
        <div className="flex gap-1.5">
          {tourSteps.map((_, i) => (
            <span
              key={i}
              className={`w-2 h-2 rounded-full transition-all ${
                i === guidedTourStep ? 'bg-[#CF6811] w-4' : 'bg-white/20'
              }`}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          {guidedTourStep > 0 && (
            <button
              onClick={prevTourStep}
              className="text-xs text-white/80 hover:text-white px-2.5 py-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              Anterior
            </button>
          )}

          <Button
            variant="cinnamon"
            size="sm"
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            onClick={nextTourStep}
          >
            {guidedTourStep === tourSteps.length - 1 ? 'Finalizar recorrido' : 'Siguiente paso'}
          </Button>
        </div>
      </div>
    </div>
  );
};
