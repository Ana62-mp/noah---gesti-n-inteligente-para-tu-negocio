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
  const { guidedTourStep, nextTourStep, prevTourStep, closeTour } = useApp();

  if (guidedTourStep === null) return null;

  const tourSteps = [
    {
      step: 1,
      title: '1. Dashboard Gerencial del Dueño',
      description:
        'Resumen en una sola pantalla: Ventas de hoy ($780,50, +12%), resultado estimado del mes ($2.950), gráfico comparativo semanal y panel "Noah te avisa". Cada métrica cuenta con tooltip de origen de datos.',
    },
    {
      step: 2,
      title: '2. Consulta Inteligente con Noah',
      description:
        'Abre el asistente de voz. Pregúntale "¿Cuánto ganamos este mes?" o "¿Cuál es mi plato menos rentable?". Noah explica las fuentes consultadas y ofrece fichas interactivas.',
    },
    {
      step: 3,
      title: '3. Ficha de Recetas y Costeo de Platos',
      description:
        'El flujo estrella: Selecciona el Ceviche de camarón para ver cómo el alza del 15 % redujo el margen al 18 %. Usa los simuladores en vivo para ver el impacto de subir el precio a $10,50.',
    },
    {
      step: 4,
      title: '4. Inventario, Vencimientos y Merma',
      description:
        'Control de stock perecible: 5 pollos enteros excedentes vencen mañana. Desde aquí se puede generar una promoción 2x1 en Seco de Pollo para evitar la pérdida económica.',
    },
    {
      step: 5,
      title: '5. Pedido del Mesero por Voz (Mesa 4)',
      description:
        'Escucha la conversación entre el mesero y el comensal. Noah extrae cantidades y observaciones especiales ("sin cebolla") y envía la comanda estructurada a cocina.',
    },
    {
      step: 6,
      title: '6. Cocina y Delivery',
      description:
        'Tablero Kanban con temporizadores de demora y vista previa de comanda térmica rotulada con "Impresión simulada · equipo por definir".',
    },
    {
      step: 7,
      title: '7. Modo Tienda / Minimarket',
      description:
        'Compara la simplificación visual: para "Tienda Doña Rosa" se eliminan las recetas complejas y se reducen a 3 tarjetas grandes con botones gigantes "+ Ingreso" y "+ Egreso".',
    },
    {
      step: 8,
      title: '8. Barbería y Agenda de Citas',
      description:
        'Demuestra la prevención de choques de horarios: al pedir una cita el martes a las 14:00, Noah detecta la superposición y propone chips con los horarios libres más cercanos.',
    },
    {
      step: 9,
      title: '9. Catálogo y Propuesta Comercial',
      description:
        'Configura los módulos activos y revisa los conectores previstos para cotizar de manera modular e independiente la base gastronómica, la tienda o las extensiones.',
    },
  ];

  const current = tourSteps[guidedTourStep - 1] || tourSteps[0];

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 max-w-xl w-[92%] bg-[#421A05] text-white rounded-2xl p-5 shadow-2xl border border-[#D59F3F]/40 animate-in slide-in-from-bottom-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <NoahOrb state="speaking" size="sm" showRipples={false} className="shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#EBD48F] bg-white/10 px-2 py-0.5 rounded">
                Paso {guidedTourStep} de 9
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
                i + 1 === guidedTourStep ? 'bg-[#CF6811] w-4' : 'bg-white/20'
              }`}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          {guidedTourStep > 1 && (
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
            {guidedTourStep === 9 ? 'Finalizar recorrido' : 'Siguiente paso'}
          </Button>
        </div>
      </div>
    </div>
  );
};
