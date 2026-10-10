"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { BottomNav } from "@/components/BottomNav";
import { getHomeHref } from "@/lib/authSession";

/**
 * Triagem orientativa "O que você tem?"
 *
 * Regras simples e transparentes (sem IA e sem custo) baseadas nas orientações
 * gerais do SUS sobre a diferença entre UBS, UPA e SAMU 192:
 *  - Sinais de risco de vida  -> ligar 192 (SAMU) / pronto-socorro
 *  - Urgência (precisa hoje)  -> UPA 24h
 *  - Rotina / sintomas leves   -> UBS
 * A regra considera sempre o sintoma MAIS GRAVE marcado.
 */

type Nivel = "EMERGENCIA" | "UPA" | "UBS";

type Sintoma = { id: string; texto: string; nivel: Nivel };

const grupos: { titulo: string; sintomas: Sintoma[] }[] = [
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

const prioridade: Record<Nivel, number> = { EMERGENCIA: 3, UPA: 2, UBS: 1 };

const resultado: Record<Nivel, { titulo: string; texto: string; cor: string }> = {
  EMERGENCIA: {
    titulo: "Ligue 192 (SAMU) agora",
    texto:
      "Os sinais marcados podem indicar risco de vida. Ligue 192 ou vá imediatamente ao pronto-socorro mais próximo. Não espere e não vá dirigindo sozinho.",
    cor: "border-red-300 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950/40 dark:text-red-100",
  },
  UPA: {
    titulo: "Procure uma UPA 24h",
    texto:
      "Seu caso parece uma urgência que precisa de atendimento hoje. A UPA funciona 24 horas, sem agendamento, e atende casos como febre alta, cortes, fraturas e crises de asma.",
    cor: "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100",
  },
  UBS: {
    titulo: "Procure a sua UBS",
    texto:
      "Seu caso pode ser atendido na Unidade Básica de Saúde, com consulta agendada. A UBS é a porta de entrada do SUS: consultas, vacinas, exames, receitas e acompanhamento.",
    cor: "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-100",
  },
};

export default function OQueVoceTemPage() {
  const router = useRouter();
  const [marcados, setMarcados] = useState<string[]>([]);
  const [nivel, setNivel] = useState<Nivel | null>(null);

  const alternar = (id: string) => {
    setNivel(null);
    setMarcados((atual) => (atual.includes(id) ? atual.filter((x) => x !== id) : [...atual, id]));
  };

  const avaliar = () => {
    const todos = grupos.flatMap((g) => g.sintomas).filter((s) => marcados.includes(s.id));
    if (todos.length === 0) return;
    const maisGrave = todos.reduce((a, b) => (prioridade[b.nivel] > prioridade[a.nivel] ? b : a));
    setNivel(maisGrave.nivel);
    setTimeout(() => document.getElementById("resultado-triagem")?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-indigo-50 to-white px-6 py-10 pb-24 dark:bg-none dark:bg-zinc-900">
      <div className="mx-auto w-full max-w-3xl">
        <header className="flex flex-col gap-4 rounded-3xl bg-white p-8 shadow-lg dark:bg-zinc-950 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-indigo-600">Para onde eu vou?</p>
            <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50">O que você tem?</h1>
            <p className="mt-2 max-w-xl text-sm text-zinc-600 dark:text-zinc-400">
              Marque o que está sentindo e o Conecta Saúde indica se o melhor lugar é a UBS, a UPA ou o SAMU.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push(getHomeHref())}
              className="inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900"
            >
              Voltar
            </button>
            <ThemeToggle />
          </div>
        </header>

        <section className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-zinc-950">
            <p className="text-xs font-bold text-indigo-600">UBS — Unidade Básica de Saúde</p>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Consultas agendadas, vacinas, exames, receitas e acompanhamento. Horário comercial.
            </p>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-zinc-950">
            <p className="text-xs font-bold text-red-600">UPA — Unidade de Pronto Atendimento</p>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Urgências que não podem esperar: febre alta, cortes, fraturas, crises. Aberta 24h.
            </p>
          </div>
        </section>

        {grupos.map((g) => (
          <section key={g.titulo} className="mt-6 rounded-2xl bg-white p-6 shadow-sm dark:bg-zinc-950">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{g.titulo}</h2>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {g.sintomas.map((s) => {
                const ativo = marcados.includes(s.id);
                return (
                  <label
                    key={s.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2.5 text-sm transition ${
                      ativo
                        ? "border-indigo-400 bg-indigo-50 text-indigo-900 dark:border-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-100"
                        : "border-zinc-200 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900"
                    }`}
                  >
                    <input type="checkbox" checked={ativo} onChange={() => alternar(s.id)} className="mt-0.5 accent-indigo-600" />
                    {s.texto}
                  </label>
                );
              })}
            </div>
          </section>
        ))}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={avaliar}
            disabled={marcados.length === 0}
            className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Ver para onde ir
          </button>
          {marcados.length > 0 ? (
            <button
              type="button"
              onClick={() => {
                setMarcados([]);
                setNivel(null);
              }}
              className="rounded-xl border border-zinc-200 px-6 py-3 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
            >
              Limpar
            </button>
          ) : null}
        </div>

        {nivel ? (
          <section id="resultado-triagem" role="status" className={`mt-6 rounded-2xl border-2 p-6 ${resultado[nivel].cor}`}>
            <h2 className="text-xl font-bold">{resultado[nivel].titulo}</h2>
            <p className="mt-2 text-sm leading-relaxed">{resultado[nivel].texto}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {nivel === "EMERGENCIA" ? (
                <a href="tel:192" className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-700">
                  Ligar 192
                </a>
              ) : null}
              {nivel !== "UBS" ? (
                <button
                  type="button"
                  onClick={() => router.push("/buscar-ubs?tipo=UPA")}
                  className="rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900"
                >
                  Ver UPA mais próxima
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => router.push("/buscar-ubs?tipo=UBS")}
                    className="rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900"
                  >
                    Ver UBS mais próxima
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push("/agendar-consulta")}
                    className="rounded-xl border border-current px-5 py-2.5 text-sm font-semibold"
                  >
                    Agendar consulta
                  </button>
                </>
              )}
            </div>
          </section>
        ) : null}

        <p className="mt-6 text-xs text-zinc-500 dark:text-zinc-400">
          Esta é uma orientação geral e não substitui avaliação profissional. Em caso de dúvida sobre gravidade, procure a UPA ou ligue 192.
        </p>
      </div>

      <BottomNav />
    </div>
  );
}
