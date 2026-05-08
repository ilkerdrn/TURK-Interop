import OpenAI from 'openai';

// Tek bir OpenAI instance — tüm servis bunu kullanır
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * LLM'e istek at, yapılandırılmış JSON döndür.
 * @param {string} systemPrompt  — modelin rolü ve kuralları
 * @param {string} userPrompt    — asıl görev + veri
 * @param {object} options       — temperature, max_tokens override
 */
export async function chat(systemPrompt, userPrompt, options = {}) {
  const response = await openai.chat.completions.create({
    model:       process.env.OPENAI_MODEL || 'gpt-4o-mini',
    temperature: options.temperature ?? 0.3,   // düşük = tutarlı, deterministik
    max_tokens:  options.max_tokens  ?? 1500,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user',   content: userPrompt   }
    ]
  });

  return response.choices[0].message.content.trim();
}
