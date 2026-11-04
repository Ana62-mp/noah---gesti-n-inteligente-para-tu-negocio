import React, { useEffect, useRef, useState } from 'react';
import { AudioLines, Check, Mic, Send, Volume2, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../../shared/context/AppContext';
import { applyActionDraft } from '../../../shared/services/actionDraftService';
import { aiService } from '../../../shared/services/aiService';
import { getRoleGreeting, getSuggestedChips } from '../../../shared/services/assistantPolicy';
import { speechService } from '../../../shared/services/speechService';
import { BusinessConfig, ChatMessage, UserRole } from '../../../shared/types';
import { humanizeKey, DraftDetails } from '../../../shared/ui/DraftDetails';
import { Button } from '../../../shared/ui/Button';
import { NoahOrb } from '../../../shared/ui/NoahOrb';
import { RichText } from '../../../shared/ui/RichText';
import { getErrorMessage } from '../../../shared/utils/errors';

const SIMULATED_WORD_MS = 130;

interface PhoneAssistantProps {
  role: UserRole;
  business: BusinessConfig;
  pendingQuestion?: string | null;
  onQuestionHandled?: () => void;
}

export const PhoneAssistant: React.FC<PhoneAssistantProps> = ({ role, business, pendingQuestion, onQuestionHandled }) => {
  const { showToast } = useApp();
  const chips = getSuggestedChips(role, business.type);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    { id: 'phone-welcome', sender: 'noah', text: getRoleGreeting(role, business.ownerName.split(' ')[0]), timestamp: '' },
  ]);
  const [input, setInput] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, isBusy]);

  useEffect(() => {
    if (!pendingQuestion) return;
    simulateVoice(pendingQuestion);
    onQuestionHandled?.();
  }, [pendingQuestion]);

  useEffect(() => () => speechService.stopListening(), []);

  const send = async (text: string) => {
    const question = text.trim();
    if (!question || isBusy) return;
    setInput('');
    const timestamp = new Date().toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' });
    const history = [...messages, { id: `phone-user-${Date.now()}`, sender: 'user' as const, text: question, timestamp }];
    setMessages(history);
    setIsBusy(true);
    const { message } = await aiService.askNoah(question, business, role, messages);
    setMessages([...history, message]);
    setIsBusy(false);
  };

  const simulateVoice = (script: string) => {
    setIsListening(true);
    speechService.simulateAudioTranscription(
      script,
      (partial, isFinished) => {
        setInput(partial);
        if (!isFinished) return;
        setIsListening(false);
        send(partial);
      },
      SIMULATED_WORD_MS
    );
  };

  const startMicrophone = () => {
    if (!speechService.isSupported()) {
      simulateVoice(chips[0]);
      return;
    }
    setIsListening(true);
    speechService.startListening(
      (transcript, isFinal) => {
        setInput(transcript);
        if (isFinal) send(transcript);
      },
      (error) => {
        showToast(`${error} Usamos audio simulado.`, 'warning');
        simulateVoice(chips[0]);
      },
      () => setIsListening(false)
    );
  };

  const setDraftStatus = (id: string, status: 'confirmed' | 'cancelled') =>
    setMessages((prev) => prev.map((m) => (m.id === id && m.actionDraft ? { ...m, actionDraft: { ...m.actionDraft, status } } : m)));

  const confirmDraft = async (message: ChatMessage) => {
    if (!message.actionDraft) return;
    try {
      showToast(await applyActionDraft(message.actionDraft), 'success');
      setDraftStatus(message.id, 'confirmed');
      confetti({ particleCount: 30, spread: 50 });
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
    }
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2.5">
        {messages.map((message) => (
          <div key={message.id} className={message.sender === 'user' ? 'flex justify-end' : 'flex items-start gap-1.5'}>
            {message.sender === 'noah' && <NoahOrb state="idle" size="sm" showRipples={false} className="scale-75 -ml-1 -mt-0.5" />}
            <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${message.sender === 'user' ? 'gradient-primary text-white' : 'ph-card'}`}>
              <RichText text={message.text} />

              {message.cards?.filter((card) => card.type === 'kpi' || card.type === 'chart' || card.type === 'advice').map((card) => (
                <div key={card.title} className="mt-2 pt-2 border-t border-current/15 space-y-0.5">
                  <div className="font-bold text-[11px]">{card.title}</div>
                  {Object.entries(card.data).map(([key, value]) => (
                    <div key={key} className="flex justify-between gap-2 text-[11px]">
                      <span className="ph-muted">{humanizeKey(key)}</span>
                      <span className="font-bold text-right">{String(value)}</span>
                    </div>
                  ))}
                </div>
              ))}

              {message.actionDraft && (
                <div className="mt-2 p-2.5 rounded-xl bg-white text-[#111111] border border-[#D59F3F] space-y-2">
                  <div className="font-bold text-[11px] text-[#421A05]">{message.actionDraft.title}</div>
                  <DraftDetails details={message.actionDraft.details} />
                  {message.actionDraft.status === 'pending' ? (
                    <div className="flex gap-1.5">
                      <Button variant="primary" size="sm" className="flex-1" leftIcon={<Check className="w-3.5 h-3.5" />} onClick={() => confirmDraft(message)}>
                        Confirmar
                      </Button>
                      <Button variant="ghost" size="sm" leftIcon={<X className="w-3.5 h-3.5" />} onClick={() => setDraftStatus(message.id, 'cancelled')}>
                        Cancelar
                      </Button>
                    </div>
                  ) : (
                    <div className="text-[11px] font-bold text-[#5C5011]">
                      {message.actionDraft.status === 'confirmed' ? 'Confirmado y guardado' : 'Descartado: no se guardó nada'}
                    </div>
                  )}
                </div>
              )}

              {message.sender === 'noah' && message.timestamp && (
                <div className="mt-1.5 flex items-center justify-between gap-2 text-[10px] ph-muted">
                  <span className="truncate">{message.provenance?.period}</span>
                  <button onClick={() => speechService.speak(message.text)} className="shrink-0 p-0.5 text-[#CF6811]" aria-label="Escuchar respuesta">
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {isBusy && <div className="text-[11px] ph-muted pl-8">Noah está pensando…</div>}
      </div>

      <div className="shrink-0 flex gap-1.5 overflow-x-auto scrollbar-none px-3 pb-2">
        {chips.map((chip) => (
          <button key={chip} onClick={() => send(chip)} className="ph-chip shrink-0 px-2.5 py-1.5 rounded-full text-[11px] font-semibold">
            {chip}
          </button>
        ))}
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          send(input);
        }}
        className="shrink-0 flex items-center gap-1.5 px-3 pb-2"
      >
        <button
          type="button"
          onClick={startMicrophone}
          className={`shrink-0 w-10 h-10 rounded-full gradient-brand text-white flex items-center justify-center ${isListening ? 'animate-pulse' : ''}`}
          aria-label="Hablar con Noah"
        >
          <Mic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => simulateVoice(chips[0])}
          className="shrink-0 w-10 h-10 rounded-full ph-chip flex items-center justify-center"
          aria-label="Simular audio"
          title="Simular audio"
        >
          <AudioLines className="w-4 h-4 text-[#CF6811]" />
        </button>
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={isListening ? 'Escuchando…' : 'Escribe a Noah…'}
          aria-label="Mensaje para Noah"
          className="ph-input flex-1 min-w-0 h-10 rounded-full px-3 text-xs"
        />
        <button type="submit" disabled={!input.trim() || isBusy} className="shrink-0 w-10 h-10 rounded-full gradient-primary text-white flex items-center justify-center disabled:opacity-40" aria-label="Enviar">
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
