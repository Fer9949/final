// Vercel Edge Function: proxy seguro a la API de NVIDIA.
// La API key vive solo en el servidor (env var de Vercel),
// nunca se expone al navegador.

export const config = {
  runtime: 'edge',
};

// Endpoint compatible con OpenAI de NVIDIA. El modelo se puede sobreescribir
// con NVIDIA_MODEL sin tocar el codigo, porque el catalogo de NVIDIA cambia
// los identificadores con mas frecuencia que nuestro ciclo de despliegue.
const NVIDIA_ENDPOINT = 'https://integrate.api.nvidia.com/v1/chat/completions';
const DEFAULT_MODEL = 'nvidia/nemotron-3-super-120b-a12b';

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) {
    return jsonResponse(
      { error: 'NVIDIA_API_KEY no está configurada en Vercel. Settings → Environment Variables.' },
      500
    );
  }

  let body: { systemMessage?: string; userMessage?: string };
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: 'Body inválido: se esperaba JSON' }, 400);
  }

  const { systemMessage, userMessage } = body;
  if (!systemMessage || !userMessage) {
    return jsonResponse({ error: 'Campos requeridos: systemMessage, userMessage' }, 400);
  }

  try {
    const upstream = await fetch(NVIDIA_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.NVIDIA_MODEL || DEFAULT_MODEL,
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: userMessage },
        ],
        // Presupuesto amplio: Nemotron razona antes de responder y con un
        // maximo bajo agota los tokens sin alcanzar a escribir el plan.
        max_tokens: 8000,
        temperature: 0.6,
      }),
    });

    if (!upstream.ok) {
      const errText = await upstream.text();
      return jsonResponse(
        { error: `NVIDIA HTTP ${upstream.status}: ${errText.slice(0, 500)}` },
        upstream.status
      );
    }

    const data = await upstream.json();
    const text = data?.choices?.[0]?.message?.content ?? null;
    const finishReason = data?.choices?.[0]?.finish_reason ?? null;

    return jsonResponse({ text, finishReason });
  } catch (error) {
    return jsonResponse(
      { error: error instanceof Error ? error.message : String(error) },
      500
    );
  }
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
