import type { Request, Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';

const DEFAULT_MODEL = 'gemini-3.8-flash';
const MAX_MESSAGE_LENGTH = 1000;

const SYSTEM_INSTRUCTION = `
Eres NOAH, el asistente de gestión de negocios para micro, pequeñas y medianas empresas en Ecuador. Tratas de 'tú', con tono cercano, profesional y claro.

REGLAS:
1. Usa SOLO los datos del contexto del negocio. Si un dato no está en el contexto, dilo y baja la certeza; no inventes cifras.
2. Responde conciso. Indica siempre la cifra, el período y la base de comparación.
3. No confundas ingresos con ganancia: explica qué costos y gastos incluye el resultado.
4. Moneda: dólares estadounidenses ($).
5. Respeta el rol del usuario: si es mesero, cocina o inventario, no reveles ventas totales, gastos ni rentabilidad.
6. NUNCA guardes ni apliques cambios. Para registrar un gasto, pedido, promoción o cita, devuelve un borrador en "accion" para que el usuario lo confirme.
7. Las cifras del contexto son datos de ejemplo de una demostración.
8. Responde siempre en JSON con el esquema indicado. "accion.tipo" es uno de: CREAR_GASTO, CREAR_PEDIDO, CREAR_PROMO, AGENDAR_CITA, VER_COSTEO, NINGUNA.
`.trim();

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    texto: { type: Type.STRING },
    datosUsados: { type: Type.ARRAY, items: { type: Type.STRING } },
    periodo: { type: Type.STRING },
    certeza: { type: Type.STRING },
    accion: {
      type: Type.OBJECT,
      properties: {
        tipo: { type: Type.STRING },
        titulo: { type: Type.STRING },
        payload: { type: Type.OBJECT },
      },
    },
  },
  required: ['texto', 'datosUsados', 'periodo', 'certeza'],
};

export const hasGeminiKey = () => Boolean(process.env.GEMINI_API_KEY || process.env.API_KEY);

export async function handleGeminiChat(req: Request, res: Response) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'Falta GEMINI_API_KEY en el servidor.', fallbackToDemo: true });
  }

  const { message, businessContext, history } = req.body ?? {};
  if (typeof message !== 'string' || !message.trim() || message.length > MAX_MESSAGE_LENGTH) {
    return res.status(400).json({ error: 'Mensaje vacío o demasiado largo.' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = [
      `Contexto del negocio (datos de ejemplo): ${JSON.stringify(businessContext ?? {})}`,
      `Conversación reciente: ${JSON.stringify(history ?? [])}`,
      `Mensaje del usuario: "${message.trim()}"`,
    ].join('\n');

    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || DEFAULT_MODEL,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: RESPONSE_SCHEMA,
      },
    });

    try {
      return res.json(JSON.parse(response.text || '{}'));
    } catch {
      return res.json({ texto: response.text, datosUsados: [], periodo: 'Actual', certeza: 'Media' });
    }
  } catch (err) {
    console.error('Gemini request failed:', err instanceof Error ? err.message : err);
    return res.status(502).json({ error: 'No se pudo consultar la IA.', fallbackToDemo: true });
  }
}
