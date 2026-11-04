import React, { useEffect, useState } from 'react';
import { CheckCircle2, Mic } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../shared/context/AppContext';
import { apiService } from '../../shared/services/apiService';
import { speechService } from '../../shared/services/speechService';
import { Button } from '../../shared/ui/Button';
import { NoahOrb } from '../../shared/ui/NoahOrb';
import { formatCurrency } from '../../shared/utils/formatters';

type Step = 'idle' | 'listening' | 'review' | 'done';

const SCRIPT = 'Noah, vendí 12 dólares con 50 de pan, leche y huevos, me pagaron en efectivo';
const SALE_AMOUNT = 12.5;
const SALE_DETAIL = 'Pan, leche y huevos';
const WORD_DELAY_MS = 120;

export const StoreSaleScenario: React.FC = () => {
  const { showToast, setActiveSection, canAccess } = useApp();
  const [step, setStep] = useState<Step>('idle');
  const [transcript, setTranscript] = useState('');

  useEffect(() => () => speechService.stopListening(), []);

  const listen = () => {
    setStep('listening');
    speechService.simulateAudioTranscription(
      SCRIPT,
      (partial, isFinished) => {
        setTranscript(partial);
        if (isFinished) setStep('review');
      },
      WORD_DELAY_MS
    );
  };

  const confirm = async () => {
    await apiService.addSale({
      date: '2026-11-03',
      time: new Date().toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' }),
      channel: 'counter',
      items: [{ dishId: 'venta-voz', dishName: SALE_DETAIL, quantity: 1, unitPrice: SALE_AMOUNT, subtotal: SALE_AMOUNT }],
      subtotal: SALE_AMOUNT,
      tax: SALE_AMOUNT * 0.15,
      total: SALE_AMOUNT,
      paymentMethod: 'cash',
      status: 'completed',
    });
    confetti({ particleCount: 40, spread: 60 });
    showToast(`Venta de ${formatCurrency(SALE_AMOUNT)} guardada`, 'success');
    setStep('done');
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E7E5E0] p-4 shadow-[var(--shadow-soft)] grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-[#111111]">Registrar una venta hablando</h2>
        <div className="min-h-24 p-3 rounded-xl bg-[#FAFAF8] border border-[#E7E5E0] text-sm text-[#111111]">
          {transcript || <span className="text-[#6B6B6B]">"{SCRIPT}"</span>}
        </div>
        <Button variant="cinnamon" className="w-full" leftIcon={<Mic className="w-4 h-4" />} disabled={step === 'listening'} onClick={listen}>
          {step === 'listening' ? 'Escuchando…' : 'Simular audio'}
        </Button>
      </div>

      <div className="rounded-xl border border-[#EBD48F] bg-[#FBF6E6] p-4 space-y-2">
        <div className="flex items-center gap-2">
          <NoahOrb state={step === 'listening' ? 'listening' : 'idle'} size="sm" showRipples={false} />
          <h3 className="text-sm font-bold text-[#421A05]">Borrador de venta</h3>
        </div>
        {step === 'idle' || step === 'listening' ? (
          <p className="text-xs text-[#6B6B6B]">Noah preparará la venta aquí para que la confirmes.</p>
        ) : step === 'review' ? (
          <>
            <dl className="grid grid-cols-2 gap-1 text-xs text-[#421A05]">
              <dt>Detalle</dt><dd className="font-bold text-right">{SALE_DETAIL}</dd>
              <dt>Monto</dt><dd className="font-bold text-right">{formatCurrency(SALE_AMOUNT)}</dd>
              <dt>Pago</dt><dd className="font-bold text-right">Efectivo</dd>
            </dl>
            <Button variant="primary" className="w-full" onClick={confirm}>Confirmar y guardar</Button>
          </>
        ) : (
          <div className="space-y-2 text-center">
            <CheckCircle2 className="w-8 h-8 mx-auto text-[#5C5011]" />
            <p className="text-xs font-bold text-[#421A05]">Venta guardada en caja</p>
            {canAccess('sales') && <Button variant="secondary" size="sm" onClick={() => setActiveSection('sales')}>Ver en Ventas y caja</Button>}
          </div>
        )}
      </div>
    </div>
  );
};
