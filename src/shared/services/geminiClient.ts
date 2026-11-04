import { BusinessConfig, ChatMessage, UserRole } from '../types';
import { buildBusinessContext } from './businessContext';

const HISTORY_LIMIT = 6;

const ACTION_TYPES: Record<string, NonNullable<ChatMessage['actionDraft']>['type']> = {
  CREAR_GASTO: 'expense',
  CREAR_PEDIDO: 'order',
  CREAR_PROMO: 'promo',
  AGENDAR_CITA: 'appointment',
};

interface GeminiAnswer {
  texto?: string;
  datosUsados?: string[];
  periodo?: string;
  certeza?: string;
  accion?: { tipo?: string; titulo?: string; payload?: Record<string, unknown> };
}

const nowLabel = () => new Date().toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' });

const toActionDraft = (accion: GeminiAnswer['accion']): ChatMessage['actionDraft'] => {
  const type = accion?.tipo ? ACTION_TYPES[accion.tipo] : undefined;
  if (!type) return undefined;
  return {
    id: `draft-live-${Date.now()}`,
    type,
    title: accion?.titulo || 'Borrador sugerido por Noah',
    details: accion?.payload ?? {},
    status: 'pending',
  };
};

export const fetchGeminiHealth = async (): Promise<boolean> => {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) return false;
    const data = await res.json();
    return Boolean(data.hasGeminiKey);
  } catch {
    return false;
  }
};

export const askGemini = async (
  query: string,
  business: BusinessConfig,
  role: UserRole,
  history: ChatMessage[]
): Promise<ChatMessage | null> => {
  const res = await fetch('/api/gemini/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: query,
      businessContext: buildBusinessContext(business, role),
      history: history.slice(-HISTORY_LIMIT).map(({ sender, text }) => ({ sender, text })),
    }),
  });
  if (!res.ok) return null;

  const data: GeminiAnswer = await res.json();
  return {
    id: `msg-noah-${Date.now()}`,
    sender: 'noah',
    text: data.texto || 'No pude generar una respuesta con los datos disponibles.',
    timestamp: nowLabel(),
    source: 'live',
    actionDraft: toActionDraft(data.accion),
    provenance: {
      period: data.periodo || 'Período no especificado',
      modules: data.datosUsados?.length ? data.datosUsados : ['Datos de ejemplo del negocio'],
      updatedAt: 'Respuesta generada en vivo por IA',
      certainty: data.certeza || 'Media',
    },
  };
};
