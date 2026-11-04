import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const port = parseInt(process.env.PORT || '3000', 10);
  const isProduction = process.env.NODE_ENV === 'production';

  app.use(express.json());

  // Check Gemini API status
  app.get('/api/health', (req, res) => {
    const hasKey = Boolean(process.env.GEMINI_API_KEY || process.env.API_KEY);
    res.json({
      status: 'ok',
      hasGeminiKey: hasKey,
      timestamp: new Date().toISOString(),
    });
  });

  // Server-side Gemini API endpoint for Noah
  app.post('/api/gemini/chat', async (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
    if (!apiKey) {
      return res.status(503).json({
        error: 'No se detectó GEMINI_API_KEY en el entorno.',
        fallbackToDemo: true,
      });
    }

    try {
      const { message, businessContext, history } = req.body;

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const systemInstruction = `
Eres NOAH, el asistente inteligente de gestión de negocios para micro, pequeñas y medianas empresas en Ecuador (trato de 'tú', tono cercano, profesional, claro, empático y ecuatoriano).
El usuario es el dueño o colaborador de un negocio:
Datos del negocio activo: ${JSON.stringify(businessContext || {})}

REGLAS DE COMPORTAMIENTO:
1. Responde de forma concisa y directa. Siempre especifica la cifra, el período de tiempo y la base de comparación si aplica.
2. NUNCA apliques cambios ni guardes pedidos, gastos o precios automáticamente. Si el usuario pide registrar algo o crear una promoción, prepara un borrador de acción estructurado en el campo "accion" para que el usuario confirme o edite.
3. No confundas ingresos con ganancias: aclara los costos incluidos cuando te pregunten sobre rentabilidad.
4. Si faltan datos, dilo honestamente en la respuesta ("certeza": "Media" o "Baja").
5. La moneda es dólares estadounidenses (USD / $).
6. Debes responder SIEMPRE en formato JSON que cumpla el esquema requerido:
{
  "texto": "Tu respuesta conversacional clara y directa.",
  "datosUsados": ["Ventas de hoy", "Gastos de octubre", "Receta Seco de Pollo"],
  "periodo": "Hoy (24h) | Octubre 2026 | Esta semana",
  "certeza": "Alta (datos completos)" o "Media (faltan gastos de ayer)",
  "accion": {
    "tipo": "CREAR_GASTO" | "CREAR_PEDIDO" | "CREAR_PROMO" | "AGENDAR_CITA" | "VER_COSTEO" | "NINGUNA",
    "titulo": "Confirmar registro de gasto de $45,00",
    "payload": {}
  }
}
      `.trim();

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          {
            role: 'user',
            parts: [{ text: `Mensaje del usuario: "${message}"\nHistorial reciente: ${JSON.stringify(history || [])}` }],
          },
        ],
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              texto: { type: Type.STRING },
              datosUsados: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
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
          },
        },
      });

      const responseText = response.text || '{}';
      try {
        const parsed = JSON.parse(responseText);
        return res.json(parsed);
      } catch (e) {
        return res.json({
          texto: responseText,
          datosUsados: ['Datos del negocio'],
          periodo: 'Actual',
          certeza: 'Media',
        });
      }
    } catch (err: any) {
      console.error('Gemini error:', err);
      return res.status(500).json({
        error: err.message || 'Error al comunicarse con Gemini.',
        fallbackToDemo: true,
      });
    }
  });

  // In development, hook up Vite middleware
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production serve dist
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`NOAH platform server running at http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
