// Vercel Edge Function: proxy seguro a OpenRouter
// La API key vive solo en el servidor (env var de Vercel),
// nunca se expone al navegador.

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return jsonResponse(
      { error: 'OPENROUTER_API_KEY no está configurada en Vercel. Settings → Environment Variables.' },
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
    const upstream = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': req.headers.get('origin') || 'https://grc-master.vercel.app',
        'X-Title': 'GRC Master Enterprise',
      },
      body: JSON.stringify({
        model: 'nvidia/nemotron-3-super-120b-a12b:free',
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: userMessage },
        ],
        max_tokens: 8000,
        reasoning: { effort: 'low' },
      }),
    });

    if (!upstream.ok) {
      const errText = await upstream.text();
      return jsonResponse(
        { error: `OpenRouter HTTP ${upstream.status}: ${errText.slice(0, 500)}` },
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
