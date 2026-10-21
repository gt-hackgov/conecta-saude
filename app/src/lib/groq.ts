/**
 * Cliente mínimo para a API do Groq (camada gratuita, modelos abertos como Llama).
 * A API do Groq segue o formato da OpenAI (chat/completions).
 *
 * Usado como alternativa gratuita ao Gemini: se GEMINI_API_KEY não existir,
 * as rotas de servidor tentam o Groq com GROQ_API_KEY.
 * A chave fica APENAS no servidor (app/.env.local) — nunca vai para o navegador.
 */

const URL_GROQ = "https://api.groq.com/openai/v1/chat/completions";

export function groqConfigurado(): boolean {
  return Boolean(process.env.GROQ_API_KEY);
}

type Opcoes = {
  system: string;
  user: string;
  json?: boolean;
  maxTokens?: number;
  temperature?: number;
};

/** Retorna o texto gerado pelo modelo, ou null se não houver chave ou se falhar. */
export async function perguntarGroq({ system, user, json = false, maxTokens = 400, temperature = 0.3 }: Opcoes): Promise<string | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  // O modelo pode ser trocado pelo .env.local (GROQ_MODEL). Se ele não existir mais, tenta o próximo.
  const modelos = [process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile", "llama-3.1-8b-instant"];

  for (const modelo of modelos) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12_000);
      const response = await fetch(URL_GROQ, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: modelo,
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
          temperature,
          max_tokens: maxTokens,
          ...(json ? { response_format: { type: "json_object" } } : {}),
        }),
        cache: "no-store",
        signal: controller.signal,
      }).finally(() => clearTimeout(timeout));

      // 404 ou 400 de modelo inexistente/descontinuado -> tenta o próximo modelo
      if (response.status === 404 || response.status === 400) {
        console.error(`Groq: modelo ${modelo} indisponível (status ${response.status})`);
        continue;
      }
      if (!response.ok) {
        console.error("Groq respondeu com status", response.status);
        return null;
      }

      const data = (await response.json()) as { choices?: { message?: { content?: string } }[] };
      const texto = data.choices?.[0]?.message?.content?.trim();
      return texto || null;
    } catch {
      console.error("Falha ao consultar o Groq");
      return null;
    }
  }
  return null;
}
