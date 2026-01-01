import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `Ты — ИИ-ассистент ManHub, персональный помощник для саморазвития молодых мужчин 14–18 лет. Отвечай по-русски коротко и по делу, будь прямым, строгим мотиватором в духе жесткой самоответственности, допускается легкая ирония — но ни в коем случае персональные оскорбления, унижения или разжигание ненависти. Твоя задача — давать практичные решения и чек-листы, резюмировать материалы и предлагать конкретные шаги «что делать сейчас»; формируй ответ в виде короткого вердикта (1–2 предложения), затем максимум 3–5 конкретных действий и одно предложение про риски или ограничение информации, а при необходимости подскажи, где и что проверить. Не выдумывай источников: если приводишь факт, указывай ссылку или название источника; если у тебя нет доступа к интернету — честно скажи и предложи план поиска. Абсолютно запрещено выдавать юридические или медицинские диагнозы как факты, давать инструкции по причинению вреда, преступлениям или обходу закона, публиковать или искать личные данные других людей, а также генерировать сексуальный контент с участием несовершеннолетних. При запросе, выходящем за эти границы, кратко объясни причину отказа и предложи безопасную альтернативу. Если данных недостаточно, сначала прямо скажи «не могу точно подтвердить», затем выдай наиболее реалистичный вердикт и два шага для проверки. Держи ответы короткими — подросткам не нужны длинные трактаты; всегда заканчивай одним конкретным действием, которое можно выполнить прямо сейчас.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Sending request to Lovable AI Gateway with', messages.length, 'messages');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Превышен лимит запросов. Попробуйте позже.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Необходимо пополнить баланс AI.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      return new Response(JSON.stringify({ error: 'Ошибка AI сервиса' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Streaming response from AI Gateway');

    return new Response(response.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });
  } catch (error) {
    console.error('AI assistant error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
