import { NextRequest, NextResponse } from "next/server";

/**
 * Chatbot híbrido (sem custo):
 *  1. Primeiro pergunta ao back-end (FAQ cadastrado no banco — resposta oficial e controlada).
 *  2. Se o FAQ não souber responder E existir GEMINI_API_KEY configurada,
 *     pede a resposta para a IA do Google Gemini (camada gratuita do Google AI Studio).
 *  3. Sem chave configurada, o comportamento é exatamente o de antes (só FAQ).
 *
 * A chave fica APENAS no servidor (arquivo app/.env.local) — nunca vai para o navegador.
 */

const SYSTEM_PROMPT = `Você é a assistente virtual do Conecta Saúde, um aplicativo do SUS para agendamento em UBS.
Responda sempre em português do Brasil, de forma curta (no máximo 5 frases), gentil e em linguagem simples.
Você pode explicar: como usar o app (agendar consulta/exame, ver resultados, vacinas, buscar UBS/UPA),
a diferença entre UBS (rotina, consultas agendadas) e UPA (urgência 24h), e orientações gerais de saúde pública.
Regras: não faça diagnóstico, não prescreva remédios nem doses. Se houver sinais de emergência
(dor no peito, falta de ar intensa, desmaio, sinais de AVC, sangramento intenso), oriente ligar 192 (SAMU) imediatamente.
Se a pergunta não tiver relação com saúde ou com o app, diga educadamente que só pode ajudar com esses temas.`;

type BackendChat = { answer?: string; matched?: boolean };

async function perguntarGemini(pergunta: string): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const modelos = [process.env.GEMINI_MODEL ?? "gemini-3.5-flash", "gemini-2.5-flash"];

  for (const modelo of modelos) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
            contents: [{ role: "user", parts: [{ text: pergunta.slice(0, 1000) }] }],
            generationConfig: { temperature: 0.4, maxOutputTokens: 400 },
          }),
          cache: "no-store",
        }
      );

      if (response.status === 404) continue; // modelo não existe mais -> tenta o próximo
      if (!response.ok) {
        console.error("Gemini respondeu com erro", response.status, await response.text());
        return null;
      }

      const data = (await response.json()) as {
        candidates?: { content?: { parts?: { text?: string }[] } }[];
      };
      const texto = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("").trim();
      return texto || null;
    } catch (error) {
      console.error("Falha ao chamar o Gemini", error);
      return null;
    }
  }
  return null;
}

export async function POST(request: NextRequest) {
  const backendUrl = process.env.BACKEND_URL ?? "http://localhost:8080";
  const authorization = request.headers.get("authorization");

  if (!authorization) {
    return NextResponse.json({ message: "Autenticação necessária ou token inválido" }, { status: 401 });
  }

  const rawBody = await request.text();
  let pergunta = "";
  try {
    pergunta = String((JSON.parse(rawBody) as { message?: unknown }).message ?? "");
  } catch {
    pergunta = "";
  }

  let backendStatus = 502;
  let backendBody = "";
  let backendContentType = "application/json";

  try {
    const response = await fetch(`${backendUrl}/api/chatbot/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: authorization },
      body: rawBody,
      cache: "no-store",
    });
    backendStatus = response.status;
    backendBody = await response.text();
    backendContentType = response.headers.get("content-type") ?? "application/json";
  } catch {
    backendStatus = 502;
  }

  // Segurança: se o token for inválido, não usamos a IA para "furar" a autenticação.
  if (backendStatus === 401 || backendStatus === 403) {
    return new NextResponse(backendBody, { status: backendStatus, headers: { "Content-Type": backendContentType } });
  }

  let faq: BackendChat | null = null;
  if (backendStatus >= 200 && backendStatus < 300) {
    try {
      faq = JSON.parse(backendBody) as BackendChat;
    } catch {
      faq = null;
    }
  }

  // FAQ encontrou resposta -> devolve a resposta oficial
  if (faq?.matched) {
    return NextResponse.json({ ...faq, source: "faq" });
  }

  // FAQ não encontrou (ou back-end fora do ar) -> tenta Gemini
  if (pergunta.trim()) {
    const respostaIa = await perguntarGemini(pergunta);
    if (respostaIa) {
      return NextResponse.json({ answer: respostaIa, matched: true, category: "IA", source: "gemini" });
    }
  }

  if (faq) {
    return NextResponse.json({ ...faq, source: "faq" });
  }

  return NextResponse.json({ message: "Não foi possível conectar ao servidor do chatbot." }, { status: 502 });
}
