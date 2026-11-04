import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../shared/context/AppContext';
import { applyActionDraft, SECTION_AFTER_DRAFT } from '../../shared/services/actionDraftService';
import { getRoleGreeting, getSuggestedChips } from '../../shared/services/assistantPolicy';
import { canAccessSection } from '../../shared/permissions/rolePermissions';
import { getErrorMessage } from '../../shared/utils/errors';
import { RichText } from '../../shared/ui/RichText';
import { DraftDetails, humanizeKey } from '../../shared/ui/DraftDetails';
import { aiService } from '../../shared/services/aiService';
import { speechService } from '../../shared/services/speechService';
import { ChatMessage } from '../../shared/types';
import { NoahOrb, OrbState } from '../../shared/ui/NoahOrb';
import { Button } from '../../shared/ui/Button';
import { Badge } from '../../shared/ui/Badge';
import {
  Mic,
  Send,
  Volume2,
  VolumeX,
  ChevronDown,
  Sparkles,
  Info,
  Check,
  X,
  Play,
  RotateCcw,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface NoahChatProps {
  isFullScreen?: boolean;
}

const VOICE_SIMULATORS = 3;

export const NoahChat: React.FC<NoahChatProps> = ({ isFullScreen = false }) => {
  const {
    currentBusiness,
    currentRole,
    isGeminiMode,
    isGeminiAvailable,
    setIsGeminiMode,
    showToast,
    setActiveSection,
  } = useApp();

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome-1',
      sender: 'noah',
      text: getRoleGreeting(currentRole, currentBusiness.ownerName.split(' ')[0]),
      timestamp: new Date().toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' }),
      provenance: {
        period: 'En vivo',
        modules: ['Núcleo NOAH'],
        updatedAt: 'Ahora',
        certainty: 'Alta',
      },
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [orbState, setOrbState] = useState<OrbState>('idle');
  const [isListening, setIsListening] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [expandedProvenanceId, setExpandedProvenanceId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, liveTranscript, isTyping]);

  const suggestedChips = getSuggestedChips(currentRole, currentBusiness.type);

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = queryText || inputText.trim() || liveTranscript.trim();
    if (!textToSend) return;

    speechService.stopListening();
    setIsListening(false);
    setLiveTranscript('');
    setInputText('');

    // Add user message
    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);
    setOrbState('thinking');

    try {
      const response = await aiService.askNoah(textToSend, currentBusiness, currentRole, messages);
      setIsTyping(false);
      setOrbState('idle');
      setMessages((prev) => [...prev, response.message]);
    } catch (e) {
      setIsTyping(false);
      setOrbState('idle');
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-err-${Date.now()}`,
          sender: 'noah',
          text: 'No pude procesar tu solicitud en este momento. Por favor reintenta.',
          timestamp: new Date().toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  };

  const handleStartListening = () => {
    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
      setOrbState('idle');
      if (liveTranscript) {
        handleSendMessage(liveTranscript);
      }
      return;
    }

    setIsListening(true);
    setOrbState('listening');
    setLiveTranscript('');

    speechService.startListening(
      (transcript, isFinal) => {
        setLiveTranscript(transcript);
        if (isFinal) {
          setIsListening(false);
          setOrbState('idle');
          handleSendMessage(transcript);
        }
      },
      (err) => {
        setIsListening(false);
        setOrbState('idle');
        showToast(err, 'warning');
      },
      () => {
        setIsListening(false);
        setOrbState('idle');
      }
    );
  };

  // Simulate audio transcription for demo
  const handleSimulateVoice = (sampleText: string) => {
    speechService.stopListening();
    setIsListening(true);
    setOrbState('listening');
    setLiveTranscript('');

    speechService.simulateAudioTranscription(sampleText, (partial, isFinished) => {
      setLiveTranscript(partial);
      if (isFinished) {
        setTimeout(() => {
          setIsListening(false);
          setOrbState('idle');
          handleSendMessage(partial);
        }, 300);
      }
    });
  };

  const handleSpeakAnswer = (msg: ChatMessage) => {
    if (speakingMessageId === msg.id) {
      speechService.stopSpeaking();
      setSpeakingMessageId(null);
      setOrbState('idle');
      return;
    }

    setSpeakingMessageId(msg.id);
    setOrbState('speaking');
    speechService.speak(
      msg.text,
      () => setOrbState('speaking'),
      () => {
        setSpeakingMessageId(null);
        setOrbState('idle');
      }
    );
  };

  const handleConfirmAction = async (msgId: string, draft: NonNullable<ChatMessage['actionDraft']>) => {
    try {
      const confirmation = await applyActionDraft(draft);
      setMessages((prev) =>
        prev.map((m) => (m.id === msgId && m.actionDraft ? { ...m, actionDraft: { ...m.actionDraft, status: 'confirmed' } } : m))
      );
      confetti({ particleCount: 45, spread: 60, origin: { y: 0.8 } });
      showToast(confirmation, 'success');
      const nextSection = SECTION_AFTER_DRAFT[draft.type];
      if (canAccessSection(currentRole, nextSection)) setActiveSection(nextSection);
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
    }
  };

  const handleCancelAction = (msgId: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId && m.actionDraft
          ? {
              ...m,
              actionDraft: { ...m.actionDraft, status: 'cancelled' },
            }
          : m
      )
    );
    showToast('Acción cancelada. No se modificó ningún dato.', 'info');
  };

  return (
    <div
      className={`flex flex-col bg-white ${
        isFullScreen ? 'h-full rounded-2xl border border-[#E7E5E0] shadow-sm' : 'h-full'
      }`}
    >
      {/* Assistant Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#E7E5E0] bg-[#FAFAF8]">
        <div className="flex items-center gap-3">
          <NoahOrb state={orbState} size="sm" onClick={handleStartListening} />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-extrabold text-[#111111] text-base">Noah</span>
              <Badge
                variant={
                  orbState === 'listening'
                    ? 'cinnamon'
                    : orbState === 'thinking'
                    ? 'banana'
                    : 'olive'
                }
                size="sm"
              >
                {orbState === 'listening'
                  ? 'Escuchando voz…'
                  : orbState === 'thinking'
                  ? 'Pensando…'
                  : 'Listo'}
              </Badge>
            </div>
            <p className="text-[11px] text-[#6B6B6B]">
              {currentBusiness.name} · {currentBusiness.city}
            </p>
          </div>
        </div>

        {/* Gemini / Demo Mode Toggle */}
        <div className="flex items-center gap-2">
          <label className="text-[11px] font-medium text-[#6B6B6B] flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isGeminiMode}
              disabled={!isGeminiAvailable}
              onChange={(e) => setIsGeminiMode(e.target.checked)}
              title={isGeminiAvailable ? undefined : 'Configura GEMINI_API_KEY en el servidor para activar la IA real'}
              className="accent-[#CF6811] rounded cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            />
            <Sparkles className="w-3.5 h-3.5 text-[#CF6811]" />
            <span className="hidden sm:inline">Modo IA real (Gemini)</span>
            <span className="sm:hidden">Gemini</span>
          </label>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-full`}
            >
              <div className="flex items-start gap-2.5 max-w-[92%] sm:max-w-[80%]">
                {!isUser && (
                  <NoahOrb state="idle" size="sm" className="mt-1 shrink-0" />
                )}

                <div className="flex flex-col space-y-2">
                  {/* Chat bubble */}
                  <div
                    className={`rounded-2xl p-4 text-sm leading-relaxed shadow-[var(--shadow-soft)] ${
                      isUser
                        ? 'bg-[#421A05] text-white rounded-tr-xs'
                        : 'bg-[#FBF6E6] text-[#111111] border border-[#EBD48F]/60 rounded-tl-xs'
                    }`}
                  >
                    <RichText text={msg.text} />

                    {/* Rich Cards embedded inside Noah's bubble */}
                    {msg.cards && msg.cards.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {msg.cards.map((card, idx) => (
                          <div
                            key={idx}
                            className="bg-white rounded-xl p-3 border border-[#EBD48F] shadow-[var(--shadow-soft)] text-xs text-[#111111]"
                          >
                            <div className="font-bold text-[#421A05] mb-2 flex items-center justify-between">
                              <span>{card.title}</span>
                            </div>

                            {(card.type === 'kpi' || card.type === 'chart' || card.type === 'advice') && (
                              <div className="grid grid-cols-2 gap-2">
                                {Object.entries(card.data).map(([key, val]) => (
                                  <div key={key} className="bg-[#FAFAF8] p-2 rounded-lg">
                                    <div className="text-[10px] text-[#6B6B6B] uppercase">{humanizeKey(key)}</div>
                                    <div className="text-sm font-bold tabular-nums text-[#111111]">
                                      {String(val)}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {card.type === 'dish_cost' && (
                              <div className="space-y-2">
                                <div className="flex justify-between items-center bg-[#FAFAF8] p-2 rounded-lg">
                                  <span>Precio actual:</span>
                                  <span className="font-bold tabular-nums">${card.data.sellingPrice.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center bg-[#FAFAF8] p-2 rounded-lg">
                                  <span>Costo teórico insumos:</span>
                                  <span className="font-bold text-[#A43108] tabular-nums">
                                    ${card.data.cost.toFixed(2)}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center bg-[#FAFAF8] p-2 rounded-lg">
                                  <span>Margen bruto:</span>
                                  <span className="font-bold text-[#A43108] tabular-nums">{card.data.margin}</span>
                                </div>
                                {card.data.suggestedPrice && (
                                  <Button
                                    variant="cinnamon"
                                    size="sm"
                                    className="w-full mt-2"
                                    onClick={() => setActiveSection('costing')}
                                  >
                                    Abrir simulador en Ficha de Costeo
                                  </Button>
                                )}
                              </div>
                            )}

                            {card.type === 'appointment' && (
                              <div className="space-y-2">
                                <div className="text-red-700 font-semibold">{card.data.conflicto}</div>
                                <div className="text-[11px] text-[#6B6B6B]">Horarios sugeridos:</div>
                                <div className="flex flex-wrap gap-1.5">
                                  {card.data.alternativas.map((alt: string, aIdx: number) => (
                                    <button
                                      key={aIdx}
                                      onClick={() => handleSendMessage(`Agéndame para ${alt}`)}
                                      className="px-2.5 py-1 bg-[#FBF6E6] border border-[#EBD48F] rounded-lg text-xs font-semibold hover:bg-[#EBD48F] transition-colors"
                                    >
                                      {alt}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Action Draft confirmation box (RN-07: Never changes data without user confirmation) */}
                    {msg.actionDraft && (
                      <div className="mt-3 p-3.5 bg-white rounded-xl border border-[#D59F3F] shadow-sm">
                        <div className="flex items-center justify-between font-bold text-xs text-[#421A05] mb-2">
                          <span>{msg.actionDraft.title}</span>
                          <span className="text-[10px] text-[#A43108] bg-red-50 px-2 py-0.5 rounded font-semibold">
                            Borrador
                          </span>
                        </div>

                        <div className="mb-3">
                          <DraftDetails details={msg.actionDraft.details} />
                        </div>

                        {msg.actionDraft.status === 'pending' ? (
                          <div className="flex items-center gap-2 pt-2 border-t border-[#E7E5E0]">
                            <Button
                              variant="primary"
                              size="sm"
                              leftIcon={<Check className="w-3.5 h-3.5" />}
                              onClick={() => handleConfirmAction(msg.id, msg.actionDraft!)}
                            >
                              Confirmar y guardar
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              leftIcon={<X className="w-3.5 h-3.5" />}
                              onClick={() => handleCancelAction(msg.id)}
                            >
                              Cancelar
                            </Button>
                          </div>
                        ) : msg.actionDraft.status === 'confirmed' ? (
                          <div className="text-xs font-bold text-[#5C5011] flex items-center gap-1.5 pt-2 border-t border-[#E7E5E0]">
                            <Check className="w-4 h-4" />
                            <span>Confirmado y registrado exitosamente</span>
                          </div>
                        ) : (
                          <div className="text-xs font-semibold text-[#6B6B6B] pt-2 border-t border-[#E7E5E0]">
                            Operación descartada.
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Message Footer: Provenance & Audio speaker */}
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 px-1 text-[11px] text-[#6B6B6B]">
                    <span className="whitespace-nowrap">{msg.timestamp}</span>
                    {!isUser && msg.source && (
                      <span className="px-1.5 py-0.5 rounded bg-[#F5F4F1] border border-[#E7E5E0] font-semibold whitespace-nowrap">
                        {msg.source === 'live' ? 'IA en vivo' : 'Respuesta simulada'}
                      </span>
                    )}

                    {!isUser && (
                      <>
                        <button
                          onClick={() => handleSpeakAnswer(msg)}
                          className="hover:text-[#CF6811] flex items-center gap-1 transition-colors"
                          aria-label="Escuchar respuesta"
                        >
                          {speakingMessageId === msg.id ? (
                            <VolumeX className="w-3.5 h-3.5 text-[#CF6811]" />
                          ) : (
                            <Volume2 className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {msg.provenance && (
                          <button
                            onClick={() =>
                              setExpandedProvenanceId(
                                expandedProvenanceId === msg.id ? null : msg.id
                              )
                            }
                            className="flex items-center gap-1 text-[#8A7424] hover:text-[#CF6811] transition-colors"
                          >
                            <Info className="w-3.5 h-3.5" />
                            <span>¿De dónde sale este dato?</span>
                            <ChevronDown
                              className={`w-3 h-3 transition-transform ${
                                expandedProvenanceId === msg.id ? 'rotate-180' : ''
                              }`}
                            />
                          </button>
                        )}
                      </>
                    )}
                  </div>

                  {/* Collapsible Provenance Details */}
                  {expandedProvenanceId === msg.id && msg.provenance && (
                    <div className="p-3 bg-[#F5F4F1] rounded-xl border border-[#E7E5E0] text-xs space-y-1 animate-in fade-in">
                      <div>
                        <strong className="text-[#111111]">Período consultado:</strong>{' '}
                        {msg.provenance.period}
                      </div>
                      <div>
                        <strong className="text-[#111111]">Módulos:</strong>{' '}
                        {msg.provenance.modules.join(', ')}
                      </div>
                      <div>
                        <strong className="text-[#111111]">Última actualización:</strong>{' '}
                        {msg.provenance.updatedAt}
                      </div>
                      <div>
                        <strong className="text-[#111111]">Certeza de cálculo:</strong>{' '}
                        {msg.provenance.certainty}
                      </div>
                      {msg.provenance.notes && (
                        <div className="text-[11px] text-[#A43108] pt-1">
                          Nota: {msg.provenance.notes}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Live audio transcription placeholder */}
        {isListening && liveTranscript && (
          <div className="flex items-start gap-2.5">
            <NoahOrb state="listening" size="sm" className="mt-1" />
            <div className="p-3.5 bg-white border border-[#CF6811] rounded-2xl text-xs text-[#111111] shadow-md animate-pulse">
              <span className="text-[10px] uppercase font-bold text-[#CF6811] block mb-1">
                Transcribiendo voz en tiempo real:
              </span>
              <span className="font-medium text-sm">"{liveTranscript}"</span>
            </div>
          </div>
        )}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-center gap-2 p-2 text-xs text-[#6B6B6B]">
            <NoahOrb state="thinking" size="sm" />
            <span>Noah está analizando los datos del negocio…</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Query Chips */}
      <div className="p-3 bg-[#FAFAF8] border-t border-[#E7E5E0] overflow-x-auto whitespace-nowrap scrollbar-none flex items-center gap-2">
        <span className="text-[11px] font-bold text-[#6B6B6B] shrink-0 mr-1">Sugerencias:</span>
        {suggestedChips.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(chip)}
            className="text-xs px-3 py-1.5 bg-white border border-[#E7E5E0] rounded-xl hover:bg-[#FBF6E6] hover:border-[#D59F3F] text-[#111111] transition-colors shrink-0 shadow-2xs font-medium"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Input Bar & Voice Controls */}
      <div className="p-3 bg-white border-t border-[#E7E5E0]">
        <div className="flex items-center gap-2">
          {/* Big Cinnamon Microphone Button */}
          <button
            onClick={handleStartListening}
            className={`p-3 rounded-2xl transition-all shadow-md active:scale-95 shrink-0 ${
              isListening
                ? 'bg-[#A43108] text-white animate-pulse ring-4 ring-[#A43108]/30'
                : 'bg-[#CF6811] text-white hover:bg-[#B85B0E]'
            }`}
            aria-label={isListening ? 'Detener micrófono' : 'Hablar con Noah'}
            title="Toca para hablar o mantén presionado"
          >
            <Mic className="w-5 h-5" />
          </button>

          {/* Text input */}
          <div className="relative flex-1">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Pregúntale a Noah o pídeme registrar algo…"
              className="w-full bg-[#F5F4F1] border border-[#E7E5E0] focus:border-[#CF6811] focus:bg-white rounded-xl px-4 py-2.5 text-sm text-[#111111] placeholder:text-[#6B6B6B] focus:outline-none transition-all"
            />
          </div>

          {/* Send text button */}
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim()}
            className="p-2.5 rounded-xl bg-[#421A05] text-white hover:bg-[#2A1103] disabled:opacity-30 disabled:pointer-events-none transition-colors shrink-0"
            aria-label="Enviar mensaje"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        {/* Demo Simulated Audio Trigger Buttons */}
        <div className="flex flex-col gap-1.5 mt-2 pt-2 border-t border-[#E7E5E0]/60 text-[11px] text-[#6B6B6B]">
          <span className="flex items-center gap-1 font-medium">
            <Play className="w-3 h-3 text-[#CF6811]" />
            Simuladores de voz para presentación:
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {suggestedChips.slice(0, VOICE_SIMULATORS).map((chip) => (
              <button
                key={chip}
                onClick={() => handleSimulateVoice(chip)}
                className="text-[10px] text-left text-[#A43108] hover:underline bg-[#FBF6E6] px-2 py-0.5 rounded font-semibold"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
