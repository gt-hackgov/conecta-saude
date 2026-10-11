/**
 * Regras de triagem orientativa do Conecta Saúde.
 *
 * Este arquivo é usado em DOIS lugares:
 *  - na tela "O que você tem?" (lista de sintomas para marcar);
 *  - na rota de servidor /api/triagem (camada de segurança que roda ANTES e DEPOIS da IA).
 *
 * Princípio de segurança: a IA nunca pode "rebaixar" um caso.
 * O resultado final é sempre o MAIS GRAVE entre (regras) e (IA).
 */

export type Nivel = "EMERGENCIA" | "UPA" | "UBS";

export type Sintoma = { id: string; texto: string; nivel: Nivel };

export const PRIORIDADE: Record<Nivel, number> = { EMERGENCIA: 3, UPA: 2, UBS: 1 };

export const GRUPOS_SINTOMAS: { titulo: string; sintomas: Sintoma[] }[] = [
  {
    titulo: "Sinais de alerta",
    sintomas: [
      { id: "peito", texto: "Dor forte ou aperto no peito", nivel: "EMERGENCIA" },
      { id: "ar", texto: "Falta de ar intensa, lábios roxos", nivel: "EMERGENCIA" },
      { id: "avc", texto: "Boca torta, fraqueza de um lado do corpo ou fala enrolada", nivel: "EMERGENCIA" },
      { id: "desmaio", texto: "Desmaio, convulsão ou confusão mental", nivel: "EMERGENCIA" },
      { id: "sangue", texto: "Sangramento intenso que não para", nivel: "EMERGENCIA" },
      { id: "acidente", texto: "Acidente grave, queimadura extensa ou trauma na cabeça", nivel: "EMERGENCIA" },
    ],
  },
  {
    titulo: "Precisa de atendimento hoje",
    sintomas: [
      { id: "febre", texto: "Febre alta (39 °C ou mais) que não baixa com remédio", nivel: "UPA" },
      { id: "vomito", texto: "Vômito ou diarreia muito forte, sinais de desidratação", nivel: "UPA" },
      { id: "corte", texto: "Corte que pode precisar de pontos", nivel: "UPA" },
      { id: "fratura", texto: "Suspeita de fratura, torção forte ou inchaço após queda", nivel: "UPA" },
      { id: "dor", texto: "Dor forte e repentina (barriga, cabeça, costas)", nivel: "UPA" },
      { id: "asma", texto: "Crise de asma ou chiado no peito", nivel: "UPA" },
      { id: "alergia", texto: "Alergia com inchaço ou manchas pelo corpo", nivel: "UPA" },
    ],
  },
  {
    titulo: "Pode ser resolvido na UBS",
    sintomas: [
      { id: "resfriado", texto: "Resfriado, tosse leve, dor de garganta", nivel: "UBS" },
      { id: "leve", texto: "Dor leve ou mal-estar há alguns dias", nivel: "UBS" },
      { id: "receita", texto: "Renovar receita ou acompanhar doença crônica (pressão, diabetes)", nivel: "UBS" },
      { id: "vacina", texto: "Vacinação", nivel: "UBS" },
      { id: "exame", texto: "Pedir ou mostrar exames de rotina", nivel: "UBS" },
      { id: "prenatal", texto: "Pré-natal, saúde da mulher ou da criança", nivel: "UBS" },
      { id: "mental", texto: "Ansiedade, tristeza, dificuldade para dormir", nivel: "UBS" },
    ],
  },
];

const TODOS_SINTOMAS = GRUPOS_SINTOMAS.flatMap((g) => g.sintomas);

/** Palavras-chave procuradas no texto livre. Ficam sem acento porque o texto é normalizado. */
const PALAVRAS_CHAVE: { nivel: Nivel; sinal: string; termos: string[] }[] = [
  { nivel: "EMERGENCIA", sinal: "Dor no peito", termos: ["dor no peito", "aperto no peito", "peito apertado", "dor no coracao", "infarto"] },
  { nivel: "EMERGENCIA", sinal: "Falta de ar intensa", termos: ["falta de ar", "nao consigo respirar", "sem ar", "sufocando", "labios roxos"] },
  { nivel: "EMERGENCIA", sinal: "Possível AVC", termos: ["boca torta", "fala enrolada", "lado do corpo", "formigamento de um lado", "avc", "derrame"] },
  { nivel: "EMERGENCIA", sinal: "Desmaio ou convulsão", termos: ["desmaio", "desmaiei", "desmaiou", "convulsao", "convulsionando", "desacordado", "inconsciente", "confusao mental"] },
  { nivel: "EMERGENCIA", sinal: "Sangramento intenso", termos: ["sangramento intenso", "muito sangue", "sangue nao para", "hemorragia", "vomitando sangue"] },
  { nivel: "EMERGENCIA", sinal: "Trauma grave", termos: ["acidente grave", "atropel", "bateu a cabeca", "queimadura grave", "queimadura extensa"] },
  { nivel: "EMERGENCIA", sinal: "Risco à própria vida", termos: ["me matar", "suicid", "tirar minha vida", "acabar com a minha vida"] },
  { nivel: "UPA", sinal: "Febre alta", termos: ["febre alta", "febre de 39", "febre de 40", "39 graus", "40 graus", "febre que nao baixa"] },
  { nivel: "UPA", sinal: "Desidratação", termos: ["desidrat", "vomitando muito", "diarreia forte", "nao para de vomitar"] },
  { nivel: "UPA", sinal: "Corte ou fratura", termos: ["corte fundo", "precisa de ponto", "levar ponto", "fratura", "quebrei", "torci", "torcao"] },
  { nivel: "UPA", sinal: "Dor forte e repentina", termos: ["dor muito forte", "dor forte", "dor insuportavel", "dor de repente"] },
  { nivel: "UPA", sinal: "Crise respiratória", termos: ["crise de asma", "chiado no peito", "bronquite atacada"] },
  { nivel: "UPA", sinal: "Alergia com inchaço", termos: ["inchaco na boca", "inchaco no rosto", "alergia forte", "placas vermelhas"] },
];

export function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export type AvaliacaoRegras = { nivel: Nivel | null; sinais: string[] };

/**
 * Avalia por regras (determinístico, sem internet).
 * Retorna o nível mais grave encontrado nos sintomas marcados e no texto livre.
 */
export function avaliarPorRegras(sintomasIds: string[], relato: string): AvaliacaoRegras {
  let nivel: Nivel | null = null;
  const sinais: string[] = [];
  const subir = (n: Nivel) => {
    if (!nivel || PRIORIDADE[n] > PRIORIDADE[nivel]) nivel = n;
  };

  for (const s of TODOS_SINTOMAS) {
    if (sintomasIds.includes(s.id)) {
      subir(s.nivel);
      sinais.push(s.texto);
    }
  }

  const texto = normalizar(relato);
  if (texto) {
    for (const regra of PALAVRAS_CHAVE) {
      if (regra.termos.some((t) => texto.includes(t))) {
        subir(regra.nivel);
        sinais.push(regra.sinal);
      }
    }
  }

  return { nivel, sinais };
}

export function maisGrave(a: Nivel | null, b: Nivel | null): Nivel | null {
  if (!a) return b;
  if (!b) return a;
  return PRIORIDADE[a] >= PRIORIDADE[b] ? a : b;
}

export function textoDosSintomas(ids: string[]): string[] {
  return TODOS_SINTOMAS.filter((s) => ids.includes(s.id)).map((s) => s.texto);
}

/** Formato da resposta da rota /api/triagem. */
export type ResultadoTriagem = {
  nivel: Nivel;
  justificativa: string;
  sinais: string[];
  especialidadeSugerida: string | null;
  fonte: "ia+regras" | "regras";
  regraDeSegurancaAplicada: boolean;
};
