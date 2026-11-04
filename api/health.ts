import { hasGeminiKey } from '../server/gemini.js';

interface JsonResponse {
  status: (code: number) => JsonResponse;
  json: (body: unknown) => void;
}

export default function handler(_req: unknown, res: JsonResponse) {
  res.status(200).json({ status: 'ok', hasGeminiKey: hasGeminiKey(), timestamp: new Date().toISOString() });
}
