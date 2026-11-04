import { answerWithGemini } from '../../server/gemini.js';

interface ChatRequest {
  method?: string;
  body?: unknown;
}

interface JsonResponse {
  status: (code: number) => JsonResponse;
  json: (body: unknown) => void;
}

export default async function handler(req: ChatRequest, res: JsonResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido.' });
  }
  const { status, body } = await answerWithGemini(req.body);
  res.status(status).json(body);
}
