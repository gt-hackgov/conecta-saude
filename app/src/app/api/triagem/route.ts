import { NextRequest, NextResponse } from "next/server";
import {
  avaliarPorRegras,
  maisGrave,
  PRIORIDADE,
  textoDosSintomas,
  type Nivel,
  type ResultadoTriagem,
} from "@/lib/triagem";
import { perguntarGroq } from "@/lib/groq";

/**
 * Triagem orientativa assistida por IA: "Para onde eu vou? UBS, UPA ou SAMU".
 *
 * Como funciona (em 3 camadas):
 *  1. REGRAS (sempre rodam): procuram sinais de alarme nos sintomas marcados e no texto.
 *  2. IA (Gemini, camada gratuita): lê o relato em linguagem natural e devolve um JSON
 *     estruturado com nível, justificativa em linguagem simples e especialidade sugerida.
 *  3. TRAVA DE SEGURANÇA: o resultado final é o MAIS GRAVE entre regras e IA.
 *     A IA pode aumentar a gravidade, mas nunca diminuir.
 *
 * Provedor de IA: Gemini (GEMINI_API_KEY) ou, como alternativa gratuita, Groq (GROQ_API_KEY).
 * Sem nenhuma chave, ou se a IA falhar, a triagem continua funcionando só com as regras.
 * Privacidade: o relato NÃO é gravado em lugar nenhum e não é enviado para o log.
 */

const LIMITE_TEXTO = 600;
const NIVEIS: Nivel[] = ["EMERGENCIA", "UPA", "UBS"];

const SYSTEM_PROMPT = `Você é o módulo de ORIENTAÇÃO DE ENCAMINHAMENTO do Conecta Saúde (SUS).
Sua única tarefa é indicar o local adequado de atendimento, NÃO é diagnosticar.
Níveis possíveis:
- "EMERGENCIA": risco de vida, ligar 192 (SAMU) ou ir ao pronto-socorro (dor no peito, falta de ar intensa, sinais de AVC, desmaio, convulsão, sangramento intenso, trauma grave, ideação suicida).
- "UPA": urgência que precisa de atendimento hoje, UPA 24h (febre alta persistente, desidratação, cortes, suspeita de fratura, dor forte e repentina, crise de asma, alergia com inchaço).
- "UBS": casos de rotina ou sintomas leves, Unidade Básica de Saúde com agendamento (resfriado, dor leve, renovação de receita, doença crônica, vacina, exames de rotina, pré-natal, saúde mental sem risco imediato).
Regras obrigatórias:
- Na dúvida entre dois níveis, escolha o MAIS GRAVE.
- Considere idade, gestação e doenças crônicas se forem mencionadas (aumentam o risco).
- "justificativa": até 3 frases curtas, linguagem simples, sem termos técnicos, sem citar doenças específicas como diagnóstico, sem indicar remédios ou doses.
- "sinais": lista curta (máx. 4) dos sinais do relato que pesaram na decisão.
- "especialidadeSugerida": para UBS, uma de "Clínica Geral", "Pediatria", "Ginecologia", "Saúde Mental", "Enfermagem/Vacinação"; para os outros níveis, null.
- Se o texto não tiver relação com sintomas de saúde, responda nivel "UBS" e explique que não foi possível entender o relato.`;

const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    nivel: { type: "STRING", enum: NIVEIS },
    justificativa: { type: "STRING" },
    sinais: { type: "ARRAY", items: { type: "STRING" } },
    especialidadeSugerida: { type: "STRING", nullable: true },
  },
  required: ["nivel", "justificativa", "sinais"],
};

type RespostaIa = {
  nivel: Nivel;
  justificativa: string;
  sinais: string[];
  especialidadeSugerida: string | null;
};

/* ---------- Limite simples de requisições por IP (protege a cota gratuita da IA) ---------- */
const JANELA_MS = 60_000;
const MAX_POR_JANELA = 8;
const acessos = new Map<string, number[]>();

function excedeuLimite(ip: string): boolean {
  const agora = Date.now();
  const recentes = (acessos.get(ip) ?? []).filter((t) => agora - t < JANELA_MS);
  recentes.push(agora);
  acessos.set(ip, recentes);
  return recentes.length > MAX_POR_JANELA;
}

/* ---------- Chamada à IA ---------- */
/** Instrução extra para modelos sem "responseSchema" (Groq): descreve o JSON esperado. */
const FORMATO_JSON = `
Responda SOMENTE com um objeto JSON válido, sem texto fora dele, neste formato:
{"nivel": "EMERGENCIA" | "UPA" | "UBS", "justificativa": "texto", "sinais": ["texto"], "especialidadeSugerida": "texto" ou null}`;

async function perguntarIa(relato: string, sintomas: string[]): Promise<RespostaIa | null> {
  const apiKey = process.env.GEMINI_API_KEY;

  const entrada =
    `Sintomas marcados: ${sintomas.length ? sintomas.join("; ") : "nenhum"}.\n` +
    `Relato do cidadão: """${relato || "(sem relato)"}"""`;

  // Sem chave do Gemini -> tenta o Groq (alternativa gratuita)
  if (!apiKey) {
    const texto = await perguntarGroq({ system: SYSTEM_PROMPT + FORMATO_JSON, user: entrada, json: true, temperature: 0.1 });
    if (!texto) return null;
    try {
      return validarRespostaIa(JSON.parse(texto));
    } catch {
      return null;
    }
  }

  const modelos = [process.env.GEMINI_MODEL ?? "gemini-3.5-flash", "gemini-2.5-flash"];

  for (const modelo of modelos) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12_000);
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
            contents: [{ role: "user", parts: [{ text: entrada }] }],
            generationConfig: {
              temperature: 0.1,
              maxOutputTokens: 400,
              responseMimeType: "application/json",
              responseSchema: RESPONSE_SCHEMA,
            },
          }),
          cache: "no-store",
          signal: controller.signal,
        }
      ).finally(() => clearTimeout(timeout));

      if (response.status === 404) continue; // modelo indisponível -> tenta o próximo
      if (!response.ok) {
        console.error("Triagem: Gemini respondeu com status", response.status);
        return null;
      }

      const data = (await response.json()) as {
        candidates?: { content?: { parts?: { text?: string }[] } }[];
      };
      const texto = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
      return validarRespostaIa(JSON.parse(texto));
    } catch {
      console.error("Triagem: falha ao consultar a IA (seguindo só com as regras)");
      return null;
    }
  }
  return null;
}

/** Nunca confiamos cegamente na saída da IA: validamos tipo, enum e tamanho. */
function validarRespostaIa(bruto: unknown): RespostaIa | null {
  if (!bruto || typeof bruto !== "object") return null;
  const r = bruto as Record<string, unknown>;
  if (typeof r.nivel !== "string" || !NIVEIS.includes(r.nivel as Nivel)) return null;
  if (typeof r.justificativa !== "string" || !r.justificativa.trim()) return null;
  const sinais = Array.isArray(r.sinais)
    ? r.sinais.filter((s): s is string => typeof s === "string").map((s) => s.slice(0, 80)).slice(0, 4)
    : [];
  const esp = typeof r.especialidadeSugerida === "string" ? r.especialidadeSugerida.slice(0, 40) : null;
  return {
    nivel: r.nivel as Nivel,
    justificativa: r.justificativa.slice(0, 400),
    sinais,
    especialidadeSugerida: esp,
  };
}

const JUSTIFICATIVA_REGRAS: Record<Nivel, string> = {
  EMERGENCIA: "Você informou um ou mais sinais de alerta que podem indicar risco de vida.",
  UPA: "Os sintomas informados parecem uma urgência que precisa de atendimento ainda hoje.",
  UBS: "Os sintomas informados podem ser cuidados na Unidade Básica de Saúde, com consulta agendada.",
};

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (excedeuLimite(ip)) {
    return NextResponse.json(
      { message: "Muitas tentativas em pouco tempo. Aguarde um minuto e tente de novo." },
      { status: 429 }
    );
  }

  let corpo: { relato?: unknown; sintomas?: unknown };
  try {
    corpo = await request.json();
  } catch {
    return NextResponse.json({ message: "Requisição inválida." }, { status: 400 });
  }

  const relato = typeof corpo.relato === "string" ? corpo.relato.trim().slice(0, LIMITE_TEXTO) : "";
  const sintomasIds = Array.isArray(corpo.sintomas)
    ? corpo.sintomas.filter((s): s is string => typeof s === "string").slice(0, 30)
    : [];

  if (!relato && sintomasIds.length === 0) {
    return NextResponse.json(
      { message: "Descreva o que está sentindo ou marque pelo menos um sintoma." },
      { status: 400 }
    );
  }

  // 1. Regras (sempre)
  const regras = avaliarPorRegras(sintomasIds, relato);

  // 2. IA (se configurada)
  const ia = await perguntarIa(relato, textoDosSintomas(sintomasIds));

  // 3. Trava de segurança: fica o mais grave
  const nivelFinal = maisGrave(regras.nivel, ia?.nivel ?? null) ?? "UBS";
  const regraVenceu =
    !!ia && !!regras.nivel && PRIORIDADE[regras.nivel] > PRIORIDADE[ia.nivel];

  const resultado: ResultadoTriagem = ia
    ? {
        nivel: nivelFinal,
        justificativa: regraVenceu
          ? `${JUSTIFICATIVA_REGRAS[nivelFinal]} Por segurança, o Conecta Saúde considera sempre o cenário mais grave.`
          : ia.justificativa,
        sinais: Array.from(new Set([...regras.sinais, ...ia.sinais])).slice(0, 6),
        especialidadeSugerida: nivelFinal === "UBS" ? ia.especialidadeSugerida : null,
        fonte: "ia+regras",
        regraDeSegurancaAplicada: regraVenceu,
      }
    : {
        nivel: nivelFinal,
        justificativa: regras.nivel
          ? JUSTIFICATIVA_REGRAS[nivelFinal]
          : "Não identificamos sinais de urgência no relato. Se os sintomas piorarem, procure a UPA ou ligue 192.",
        sinais: regras.sinais.slice(0, 6),
        especialidadeSugerida: nivelFinal === "UBS" ? "Clínica Geral" : null,
        fonte: "regras",
        regraDeSegurancaAplicada: false,
      };

  return NextResponse.json(resultado, { headers: { "Cache-Control": "no-store" } });
}
