import { errorResponse, jsonResponse } from '../../utils';

export async function handleAiRoute(context: PagesFunctionContext<Env>): Promise<Response | null> {
  const url = new URL(context.request.url);
  const method = context.request.method;

  if (url.pathname !== '/api/ai/enhance') {
    return null;
  }

  if (method !== 'POST') {
    return errorResponse("Method not allowed", 405);
  }

  try {
    const body = await context.request.json() as any;
    const { messages, response_format, temperature, max_tokens } = body;
    
    if (!messages) return errorResponse("Messages required", 400);

    // In Cloudflare Workers, access environment variables via context.env
    // We expect these to be configured in .dev.vars or dashboard
    const hfApiKey = (context.env as any).VITE_HF_API_KEY;
    const groqApiKey = (context.env as any).VITE_GROQ_API_KEY;
    const HF_MODEL = "Qwen/Qwen3.5-122B-A10B";

    if (hfApiKey) {
      try {
        const hfRes = await fetch("https://router.huggingface.co/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${hfApiKey}` },
          body: JSON.stringify({ model: HF_MODEL, messages, temperature: temperature || 0.5, max_tokens: max_tokens || 2048 }),
        });
        if (hfRes.ok) {
          const data = await hfRes.json() as any;
          const content = data.choices?.[0]?.message?.content;
          if (content) return jsonResponse({ success: true, provider: "1st ai model", content: content.trim() });
        }
      } catch (err: any) { console.error("HF Error:", err.message); }
    }

    // Groq fallback
    if (groqApiKey) {
      try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${groqApiKey}` },
          body: JSON.stringify({ model: "llama-3.1-8b-instant", messages, temperature: temperature || 0.5, max_tokens: max_tokens || 2048, response_format }),
        });
        
        if (!response.ok) return errorResponse(`AI Error: ${response.status}`, 500);
        
        const data = await response.json() as any;
        const content = data.choices?.[0]?.message?.content;
        
        if (!content) return errorResponse("Empty AI response", 500);
        return jsonResponse({ success: true, provider: "2nd model", content: content.trim() });
      } catch (e: any) { 
        return errorResponse(e.message, 500);
      }
    }

    return errorResponse("No AI providers configured", 500);
  } catch (error: any) {
    return errorResponse(`AI handler error: ${error.message}`, 500);
  }
}
