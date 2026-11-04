import React, { useState } from 'react';
import { useApp } from '../../shared/context/AppContext';
import { speechService } from '../../shared/services/speechService';
import { apiService } from '../../shared/services/apiService';
import { NoahOrb } from '../../shared/ui/NoahOrb';
import { Button } from '../../shared/ui/Button';
import { Badge } from '../../shared/ui/Badge';
import {
  Mic,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Volume2,
  Send,
  Plus,
  Minus,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const NoahVoiceScenarios: React.FC = () => {
  const { showToast, setActiveSection } = useApp();
  const [activeScenario, setActiveScenario] = useState<'A' | 'B' | 'C'>('A');

  // Scenario A State (Waiter order Table 4)
  const [scenarioAState, setScenarioAState] = useState<'idle' | 'transcribing' | 'review' | 'confirmed'>('idle');
  const [scenarioATranscriptStep, setScenarioATranscriptStep] = useState<number>(0);
  const [orderAItems, setOrderAItems] = useState([
    { name: 'Seco de pollo', qty: 2, price: 5.50, notes: 'Con arroz amarillo y maduro frito' },
    { name: 'Ceviche de camarón', qty: 3, price: 9.00, notes: '1 sin cebolla, con chifles' },
    { name: 'Jarra de jugo de naranjilla', qty: 1, price: 4.00, notes: 'Bien fría' },
  ]);

  // Scenario B State (Barbershop collision)
  const [scenarioBState, setScenarioBState] = useState<'idle' | 'transcribing' | 'conflict' | 'confirmed'>('idle');
  const [selectedBTime, setSelectedBTime] = useState<string>('Martes 14:50');

  // Scenario C State (Expense registration)
  const [scenarioCState, setScenarioCState] = useState<'idle' | 'transcribing' | 'review' | 'confirmed'>('idle');

  // Multi-speaker dialogue lines for Scenario A
  const scenarioADialogue = [
    { speaker: 'Cliente', text: 'Hola, buenas tardes. Para empezar queremos dos secos de pollo, por favor.' },
    { speaker: 'Mesero', text: 'Perfecto, ¿con arroz amarillo y maduro frito?' },
    { speaker: 'Cliente', text: 'Sí, exacto. Y también tres ceviches de camarón, pero por favor uno sin cebolla, con chifles extra.' },
    { speaker: 'Cliente', text: 'Ah, y una jarra de jugo de naranjilla para la mesa.' },
    { speaker: 'Mesero', text: 'Listo: dos secos de pollo, tres ceviches de camarón (uno sin cebolla) y una jarra de naranjilla.' },
  ];

  const handleRunScenarioA = () => {
    setScenarioAState('transcribing');
    setScenarioATranscriptStep(0);

    let step = 0;
    const interval = setInterval(() => {
      step++;
      setScenarioATranscriptStep(step);
      if (step >= scenarioADialogue.length) {
        clearInterval(interval);
        setTimeout(() => {
          setScenarioAState('review');
        }, 500);
      }
    }, 1400);
  };

  const handleUpdateQty = (index: number, delta: number) => {
    setOrderAItems((prev) =>
      prev.map((item, idx) => {
        if (idx === index) {
          const newQty = Math.max(1, item.qty + delta);
          return { ...item, qty: newQty };
        }
        return item;
      })
    );
  };

  const handleConfirmOrderA = async () => {
    try {
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
    } catch (e) {}

    // Add to kitchen tickets and occupy table 4
    await apiService.addKitchenTicket({
      orderNumber: '#886',
      tableNumber: 4,
      channel: 'salon',
      waiterName: 'Tú (Mesero voz)',
      createdAt: new Date().toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' }),
      elapsedMinutes: 0,
      status: 'pending',
      urgency: 'normal',
      items: orderAItems.map((it) => ({
        dishName: it.name,
        quantity: it.qty,
        notes: it.notes,
      })),
    });

    await apiService.updateTableStatus(4, 'occupied', 42.00);

    setScenarioAState('confirmed');
    showToast('¡Comanda enviada a Cocina y Mesa 4 ocupada!', 'success');
  };

  const handleSpeakScenarioAOrder = () => {
    const summary = 'Confirmando pedido para mesa cuatro: dos secos de pollo, tres ceviches de camarón, uno sin cebolla, y una jarra de jugo de naranjilla.';
    speechService.speak(summary);
  };

  const handleRunScenarioB = () => {
    setScenarioBState('transcribing');
    speechService.simulateAudioTranscription(
      'Noah, agéndame un corte con barba para Luis el martes a las 2 de la tarde con David',
      (partial, isFinished) => {
        if (isFinished) {
          setTimeout(() => {
            setScenarioBState('conflict');
          }, 400);
        }
      },
      120
    );
  };

  const handleConfirmScenarioB = async () => {
    await apiService.addAppointment({
      customerName: 'Luis Paredes',
      customerPhone: '098 765 1122',
      serviceId: 'bs-4',
      serviceName: 'Combo Corte + Barba spa',
      barberName: 'David',
      date: '2026-11-03',
      time: selectedBTime.split(' ')[1] || '14:50',
      durationMinutes: 60,
      price: 10.00,
      status: 'confirmed',
    });

    setScenarioBState('confirmed');
    try {
      confetti({ particleCount: 50, spread: 60 });
    } catch (e) {}
    showToast('Cita agendada exitosamente en Barber Kings', 'success');
  };

  const handleRunScenarioC = () => {
    setScenarioCState('transcribing');
    speechService.simulateAudioTranscription(
      'Noah, pagué 85 dólares de luz en la Empresa Eléctrica por transferencia',
      (partial, isFinished) => {
        if (isFinished) {
          setTimeout(() => {
            setScenarioCState('review');
          }, 400);
        }
      },
      120
    );
  };

  const handleConfirmScenarioC = async () => {
    await apiService.addExpense({
      date: '2026-11-03',
      concept: 'Pago de planilla de energía eléctrica EEQ',
      category: 'servicios',
      supplier: 'Empresa Eléctrica Quito',
      amount: 85.00,
      paymentMethod: 'transfer',
      receiptAttached: true,
      receiptNumber: 'EEQ-TRANSF-8812',
    });

    setScenarioCState('confirmed');
    showToast('Gasto de $85,00 guardado en Flujo de Caja', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Notice (Acceptance Criteria CA-14 & RN-09) */}
      <div className="bg-[#FBF6E6] border border-[#EBD48F] rounded-2xl p-4 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-[#CF6811] shrink-0 mt-0.5" />
        <div className="text-xs text-[#421A05] leading-relaxed">
          <strong className="font-bold">Demostración destacada de voz · NOAH Escucha:</strong>{' '}
          En producción se evaluará el reconocimiento con audio real del local mediante Web Speech API o modelos dedicados.
          Toda acción iniciada por voz siempre se presenta como borrador y requiere confirmación del usuario antes de alterar
          los datos del negocio.
        </div>
      </div>

      {/* Scenario Selector Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1 bg-[#F5F4F1] rounded-2xl border border-[#E7E5E0]">
        <button
          onClick={() => setActiveScenario('A')}
          className={`flex-1 min-w-[200px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-2 ${
            activeScenario === 'A'
              ? 'bg-white text-[#111111] shadow-xs'
              : 'text-[#6B6B6B] hover:text-[#111111]'
          }`}
        >
          <span>Escenario A: Mesero en Mesa 4</span>
          <Badge variant="olive" size="sm">Restaurante</Badge>
        </button>

        <button
          onClick={() => setActiveScenario('B')}
          className={`flex-1 min-w-[200px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-2 ${
            activeScenario === 'B'
              ? 'bg-white text-[#111111] shadow-xs'
              : 'text-[#6B6B6B] hover:text-[#111111]'
          }`}
        >
          <span>Escenario B: Reserva con Choque</span>
          <Badge variant="banana" size="sm">Barbería</Badge>
        </button>

        <button
          onClick={() => setActiveScenario('C')}
          className={`flex-1 min-w-[200px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-2 ${
            activeScenario === 'C'
              ? 'bg-white text-[#111111] shadow-xs'
              : 'text-[#6B6B6B] hover:text-[#111111]'
          }`}
        >
          <span>Escenario C: Registro de Gasto</span>
          <Badge variant="harvest" size="sm">Finanzas</Badge>
        </button>
      </div>

      {/* ================= ESCENARIO A ================= */}
      {activeScenario === 'A' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Live Audio Transcription */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E7E5E0] p-6 shadow-xs flex flex-col space-y-4">
            <div className="flex items-center justify-between border-b border-[#E7E5E0] pb-4">
              <div>
                <h3 className="text-base font-bold text-[#111111]">
                  Toma de pedido conversacional (Mesa 4)
                </h3>
                <p className="text-xs text-[#6B6B6B]">
                  El mesero activa el micrófono mientras habla con los comensales.
                </p>
              </div>

              {scenarioAState === 'idle' ? (
                <Button
                  variant="cinnamon"
                  size="sm"
                  leftIcon={<Play className="w-3.5 h-3.5" />}
                  onClick={handleRunScenarioA}
                >
                  Iniciar simulación
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                  onClick={() => {
                    setScenarioAState('idle');
                    setScenarioATranscriptStep(0);
                  }}
                >
                  Reiniciar
                </Button>
              )}
            </div>

            {/* Conversation Flow Stream */}
            <div className="space-y-3 min-h-[260px] bg-[#FAFAF8] p-4 rounded-xl border border-[#E7E5E0]/60">
              {scenarioAState === 'idle' && (
                <div className="flex flex-col items-center justify-center py-12 text-center text-[#6B6B6B]">
                  <NoahOrb state="idle" size="md" className="mb-3" />
                  <p className="text-xs max-w-sm">
                    Toca <strong>"Iniciar simulación"</strong> para ver cómo Noah transcribe la charla
                    entre el mesero y el cliente, detectando platos y observaciones en vivo.
                  </p>
                </div>
              )}

              {scenarioADialogue.slice(0, scenarioATranscriptStep).map((d, idx) => {
                const isWaiter = d.speaker === 'Mesero';
                return (
                  <div
                    key={idx}
                    className={`flex items-start gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-300 ${
                      isWaiter ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {!isWaiter && (
                      <div className="w-7 h-7 rounded-full bg-[#EBD48F] text-[#421A05] text-[10px] font-bold flex items-center justify-center shrink-0">
                        Cli
                      </div>
                    )}
                    <div
                      className={`p-3 rounded-xl text-xs max-w-[85%] ${
                        isWaiter
                          ? 'bg-[#421A05] text-white rounded-tr-xs'
                          : 'bg-white text-[#111111] border border-[#E7E5E0] shadow-2xs rounded-tl-xs'
                      }`}
                    >
                      <div className="text-[10px] font-bold opacity-70 mb-1">{d.speaker}</div>
                      <div>
                        {/* Highlight detected keywords */}
                        {d.text.split(/(dos secos de pollo|tres ceviches de camarón|sin cebolla|chifles|jarra de jugo de naranjilla)/gi).map((part, pIdx) => {
                          const lower = part.toLowerCase();
                          if (
                            lower.includes('secos de pollo') ||
                            lower.includes('ceviches') ||
                            lower.includes('naranjilla') ||
                            lower.includes('sin cebolla') ||
                            lower.includes('chifles')
                          ) {
                            return (
                              <mark
                                key={pIdx}
                                className="bg-[#EBD48F] text-[#421A05] font-bold px-1 rounded mx-0.5"
                              >
                                {part}
                              </mark>
                            );
                          }
                          return <span key={pIdx}>{part}</span>;
                        })}
                      </div>
                    </div>
                    {isWaiter && (
                      <div className="w-7 h-7 rounded-full bg-[#CF6811] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                        Mes
                      </div>
                    )}
                  </div>
                );
              })}

              {scenarioAState === 'transcribing' && (
                <div className="flex items-center gap-2 text-xs text-[#CF6811] font-semibold pt-2">
                  <span className="w-2 h-2 rounded-full bg-[#CF6811] animate-ping" />
                  <span>Escuchando conversación en mesa 4…</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Detected Order Draft */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-[#E7E5E0] p-6 shadow-xs flex flex-col space-y-4">
            <div className="flex items-center justify-between border-b border-[#E7E5E0] pb-3">
              <div>
                <span className="text-xs font-bold text-[#A43108] uppercase tracking-wider">
                  Borrador estructurado
                </span>
                <h4 className="text-base font-extrabold text-[#111111]">Comanda Mesa 4 (Terraza)</h4>
              </div>
              <Badge variant={scenarioAState === 'confirmed' ? 'olive' : 'banana'}>
                {scenarioAState === 'confirmed' ? 'Enviado a Cocina' : 'Por confirmar'}
              </Badge>
            </div>

            {/* Items list with editable controls */}
            <div className="space-y-2.5 divide-y divide-[#E7E5E0]/60">
              {orderAItems.map((item, idx) => (
                <div key={idx} className="pt-2.5 first:pt-0 flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="text-xs font-bold text-[#111111]">{item.name}</div>
                    <div className="text-[11px] text-[#A43108] italic">{item.notes}</div>
                    <div className="text-xs text-[#6B6B6B] mt-0.5 tabular-nums">
                      ${item.price.toFixed(2)} c/u
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleUpdateQty(idx, -1)}
                      disabled={scenarioAState === 'confirmed'}
                      className="w-7 h-7 rounded-lg border border-[#E7E5E0] bg-[#F5F4F1] flex items-center justify-center hover:bg-[#E7E5E0] transition-colors disabled:opacity-40"
                    >
                      <Minus className="w-3 h-3 text-[#111111]" />
                    </button>
                    <span className="text-sm font-bold tabular-nums w-4 text-center">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => handleUpdateQty(idx, 1)}
                      disabled={scenarioAState === 'confirmed'}
                      className="w-7 h-7 rounded-lg border border-[#E7E5E0] bg-[#F5F4F1] flex items-center justify-center hover:bg-[#E7E5E0] transition-colors disabled:opacity-40"
                    >
                      <Plus className="w-3 h-3 text-[#111111]" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Total calculation */}
            <div className="pt-3 border-t border-[#E7E5E0] flex justify-between items-baseline">
              <span className="text-xs text-[#6B6B6B] font-semibold">Total comanda:</span>
              <span className="text-xl font-extrabold text-[#111111] tabular-nums font-mono">
                $
                {orderAItems
                  .reduce((sum, it) => sum + it.qty * it.price, 0)
                  .toFixed(2)}
              </span>
            </div>

            {/* Audio verify button & Confirm send */}
            <div className="space-y-2 pt-2">
              <Button
                variant="secondary"
                size="sm"
                className="w-full"
                leftIcon={<Volume2 className="w-4 h-4 text-[#CF6811]" />}
                onClick={handleSpeakScenarioAOrder}
              >
                Repetir pedido en voz alta
              </Button>

              {scenarioAState !== 'confirmed' ? (
                <Button
                  variant="primary"
                  size="md"
                  className="w-full"
                  leftIcon={<Send className="w-4 h-4" />}
                  onClick={handleConfirmOrderA}
                  disabled={scenarioAState === 'idle'}
                >
                  Confirmar y enviar a cocina
                </Button>
              ) : (
                <div className="p-3 bg-[#5C5011]/10 border border-[#5C5011]/30 rounded-xl text-center">
                  <div className="text-xs font-bold text-[#5C5011] flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>¡Comanda recibida en Cocina y Mesa 4 ocupada!</span>
                  </div>
                  <button
                    onClick={() => setActiveSection('kitchen')}
                    className="text-[11px] text-[#CF6811] underline font-semibold mt-1 inline-block"
                  >
                    Ver comanda en Tablero de Cocina →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= ESCENARIO B ================= */}
      {activeScenario === 'B' && (
        <div className="bg-white rounded-2xl border border-[#E7E5E0] p-6 shadow-xs max-w-3xl mx-auto space-y-6">
          <div className="flex items-center justify-between border-b border-[#E7E5E0] pb-4">
            <div>
              <h3 className="text-base font-bold text-[#111111]">
                Reserva de Barbería con Control de Choque de Horarios
              </h3>
              <p className="text-xs text-[#6B6B6B]">
                "Noah, agéndame un corte con barba para Luis el martes a las 2 de la tarde"
              </p>
            </div>
            {scenarioBState === 'idle' ? (
              <Button
                variant="cinnamon"
                size="sm"
                leftIcon={<Play className="w-3.5 h-3.5" />}
                onClick={handleRunScenarioB}
              >
                Simular voz
              </Button>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                onClick={() => setScenarioBState('idle')}
              >
                Reiniciar
              </Button>
            )}
          </div>

          {scenarioBState === 'transcribing' && (
            <div className="p-4 bg-[#F5F4F1] rounded-xl flex items-center gap-3">
              <NoahOrb state="listening" size="sm" />
              <div className="text-xs text-[#111111] animate-pulse">
                Transcribiendo: "Noah, agéndame un corte con barba para Luis el martes a las 2 de la tarde con David"
              </div>
            </div>
          )}

          {scenarioBState === 'conflict' && (
            <div className="space-y-4 animate-in fade-in">
              {/* Conflict Alert Box */}
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div className="text-xs text-red-900 leading-relaxed">
                  <strong className="font-bold">¡Conflicto detectado (RN-07)!</strong> David ya tiene agendada
                  una cita con <em>Santiago Proaño (Fade 45 min)</em> de 14:00 a 14:45 el martes 3 de noviembre.
                  Noah no permite sobreescritura accidental y te propone los siguientes horarios libres:
                </div>
              </div>

              {/* Alternative Chips */}
              <div>
                <label className="text-xs font-bold text-[#111111] block mb-2">
                  Selecciona uno de los horarios libres recomendados por Noah:
                </label>
                <div className="flex flex-wrap gap-2">
                  {['Martes 14:50', 'Martes 15:30', 'Miércoles 10:00'].map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedBTime(time)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                        selectedBTime === time
                          ? 'bg-[#CF6811] text-white border-[#CF6811] shadow-xs'
                          : 'bg-[#F5F4F1] text-[#111111] border-[#E7E5E0] hover:bg-[#FBF6E6]'
                      }`}
                    >
                      {time} (Disponible)
                    </button>
                  ))}
                </div>
              </div>

              {/* Draft appointment card */}
              <div className="p-4 bg-[#FAFAF8] rounded-xl border border-[#E7E5E0] space-y-2 text-xs">
                <div className="font-bold text-[#111111]">Borrador de reserva para confirmar:</div>
                <div className="grid grid-cols-2 gap-2 text-[#6B6B6B]">
                  <div>Cliente: <strong className="text-[#111111]">Luis Paredes</strong></div>
                  <div>Servicio: <strong className="text-[#111111]">Combo Corte + Barba</strong></div>
                  <div>Barbero: <strong className="text-[#111111]">David</strong></div>
                  <div>Nuevo Horario: <strong className="text-[#CF6811]">{selectedBTime}</strong></div>
                  <div>Tarifa: <strong className="text-[#111111]">$10,00 USD</strong></div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="primary" onClick={handleConfirmScenarioB}>
                  Confirmar cita en {selectedBTime}
                </Button>
                <Button variant="ghost" onClick={() => setScenarioBState('idle')}>
                  Descartar
                </Button>
              </div>
            </div>
          )}

          {scenarioBState === 'confirmed' && (
            <div className="p-6 bg-[#5C5011]/10 border border-[#5C5011]/30 rounded-xl text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-[#5C5011] mx-auto" />
              <h4 className="text-sm font-bold text-[#5C5011]">¡Cita registrada en Barber Kings!</h4>
              <p className="text-xs text-[#6B6B6B]">
                Luis agendado con David para el {selectedBTime}. El solapamiento fue evitado con éxito.
              </p>
              <Button
                variant="secondary"
                size="sm"
                className="mt-2"
                onClick={() => setActiveSection('appointments')}
              >
                Ver en Agenda de Citas →
              </Button>
            </div>
          )}
        </div>
      )}

      {/* ================= ESCENARIO C ================= */}
      {activeScenario === 'C' && (
        <div className="bg-white rounded-2xl border border-[#E7E5E0] p-6 shadow-xs max-w-2xl mx-auto space-y-6">
          <div className="flex items-center justify-between border-b border-[#E7E5E0] pb-4">
            <div>
              <h3 className="text-base font-bold text-[#111111]">Registro asistido de gasto por voz</h3>
              <p className="text-xs text-[#6B6B6B]">
                "Noah, pagué 85 dólares de luz en la Empresa Eléctrica por transferencia"
              </p>
            </div>
            {scenarioCState === 'idle' ? (
              <Button
                variant="cinnamon"
                size="sm"
                leftIcon={<Play className="w-3.5 h-3.5" />}
                onClick={handleRunScenarioC}
              >
                Simular voz
              </Button>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                onClick={() => setScenarioCState('idle')}
              >
                Reiniciar
              </Button>
            )}
          </div>

          {scenarioCState === 'transcribing' && (
            <div className="p-4 bg-[#F5F4F1] rounded-xl flex items-center gap-3">
              <NoahOrb state="listening" size="sm" />
              <div className="text-xs text-[#111111] animate-pulse">
                Transcribiendo: "Noah, pagué 85 dólares de luz en la Empresa Eléctrica por transferencia"
              </div>
            </div>
          )}

          {scenarioCState === 'review' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 bg-[#FBF6E6] border border-[#EBD48F] rounded-xl text-xs space-y-2">
                <span className="font-bold text-[#421A05] block">
                  Noah interpretó y prellenó este comprobante de egreso:
                </span>
                <div className="grid grid-cols-2 gap-3 text-[#111111]">
                  <div>Concepto: <strong>Planilla de luz eléctrica EEQ</strong></div>
                  <div>Monto: <strong className="text-lg text-[#A43108] font-mono">$85,00 USD</strong></div>
                  <div>Categoría: <strong>Servicios básicos</strong></div>
                  <div>Proveedor: <strong>Empresa Eléctrica Quito</strong></div>
                  <div>Método: <strong>Transferencia bancaria</strong></div>
                  <div>Fecha: <strong>Hoy (03/11/2026)</strong></div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="primary" onClick={handleConfirmScenarioC}>
                  Confirmar y registrar en Flujo de Caja
                </Button>
                <Button variant="ghost" onClick={() => setScenarioCState('idle')}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          {scenarioCState === 'confirmed' && (
            <div className="p-6 bg-[#5C5011]/10 border border-[#5C5011]/30 rounded-xl text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-[#5C5011] mx-auto" />
              <h4 className="text-sm font-bold text-[#5C5011]">¡Gasto registrado en contabilidad!</h4>
              <p className="text-xs text-[#6B6B6B]">
                El egreso de $85,00 ahora aparece en la tabla de Gastos y resta del saldo de caja.
              </p>
              <Button
                variant="secondary"
                size="sm"
                className="mt-2"
                onClick={() => setActiveSection('expenses')}
              >
                Ver en Gastos y Compras →
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
