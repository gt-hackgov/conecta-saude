"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { BottomNav } from "@/components/BottomNav";
import { getHomeHref } from "@/lib/authSession";
import { GRUPOS_SINTOMAS as grupos, type Nivel, type ResultadoTriagem } from "@/lib/triagem";

/**
 * Triagem orientativa "O que você tem?" — assistida por IA.
 *
 * O cidadão descreve com as próprias palavras e/ou marca sintomas.
 * A rota /api/triagem combina REGRAS de segurança (sempre) com a IA (Gemini ou Groq, quando configurada).
 * Layout: emergência no topo, texto + botão como caminho principal, sintomas num dropdown dentro do mesmo cartão, entre o texto e o botão.
 * A IA só pode aumentar a gravidade, nunca diminuir. Detalhes em src/app/api/triagem/route.ts.
 */

const resultado: Record<Nivel, { titulo: string; texto: string; cor: string }> = {
  EMERGENCIA: {
    titulo: "Ligue 192 (SAMU) agora",
    texto:
      "Os sinais informados podem indicar risco de vida. Ligue 192 ou vá imediatamente ao pronto-socorro mais próximo. Não espere e não vá dirigindo sozinho.",
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
  const [relato, setRelato] = useState("");
  const [resultadoIa, setResultadoIa] = useState<ResultadoTriagem | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const nivel: Nivel | null = resultadoIa?.nivel ?? null;
  const podeAvaliar = (marcados.length > 0 || relato.trim().length >= 3) && !carregando;

  const limparResultado = () => {
    setResultadoIa(null);
    setErro(null);
  };

  const alternar = (id: string) => {
    limparResultado();
    setMarcados((atual) => (atual.includes(id) ? atual.filter((x) => x !== id) : [...atual, id]));
  };

  const avaliar = async () => {
    if (!podeAvaliar) return;
    setCarregando(true);
    limparResultado();
    try {
      const resposta = await fetch("/api/triagem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ relato, sintomas: marcados }),
      });
      const dados = await resposta.json();
      if (!resposta.ok) {
        setErro(dados?.message ?? "Não foi possível avaliar agora. Tente novamente.");
        return;
      }
      setResultadoIa(dados as ResultadoTriagem);
      setTimeout(() => document.getElementById("resultado-triagem")?.scrollIntoView({ behavior: "smooth" }), 50);
    } catch {
      setErro("Sem conexão com o servidor. Em caso de dúvida sobre gravidade, procure a UPA ou ligue 192.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-indigo-50 to-white px-6 py-10 pb-40 dark:bg-none dark:bg-zinc-900">
      <div className="mx-auto w-full max-w-3xl">
        <header className="flex flex-col gap-4 rounded-3xl bg-white p-8 shadow-lg dark:bg-zinc-950 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-indigo-600">Para onde eu vou?</p>
            <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50">O que você tem?</h1>
            <p className="mt-2 max-w-xl text-sm text-zinc-600 dark:text-zinc-400">
              Conte o que está sentindo e o Conecta Saúde indica se o melhor lugar é a UBS, a UPA ou o SAMU.
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

        <section
          aria-label="Emergência"
          className="mt-6 flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 dark:border-red-900 dark:bg-red-950/40 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="text-sm text-red-900 dark:text-red-100">
            <strong>Dor no peito, falta de ar intensa, desmaio ou sinais de AVC?</strong> Não espere: ligue para o SAMU.
          </p>
          <a href="tel:192" className="shrink-0 rounded-xl bg-red-600 px-5 py-2.5 text-center text-sm font-bold text-white hover:bg-red-700">
            Ligar 192
          </a>
        </section>

        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm dark:bg-zinc-950">
          <label htmlFor="relato" className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            Conte com suas palavras o que está sentindo
          </label>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Ex.: &quot;Meu filho de 3 anos está com febre de 39,5 desde ontem e não quer comer&quot;. Não escreva nome, CPF ou endereço.
          </p>
          <textarea
            id="relato"
            value={relato}
            maxLength={600}
            rows={3}
            onChange={(e) => {
              setRelato(e.target.value);
              limparResultado();
            }}
            className="mt-3 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
            placeholder="Descreva os sintomas, há quanto tempo, idade e se tem alguma doença…"
          />
          <details className="group mt-3 rounded-xl border border-zinc-200 dark:border-zinc-800">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-zinc-900 hover:bg-zinc-50 dark:text-zinc-100 dark:hover:bg-zinc-900">
              <span>
                Prefere marcar os sintomas? <span className="font-normal text-zinc-500">(opcional)</span>
                {marcados.length > 0 ? (
                  <span className="ml-2 rounded-full bg-indigo-100 px-2 py-0.5 text-xs text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-200">
                    {marcados.length} marcado{marcados.length > 1 ? "s" : ""}
                  </span>
                ) : null}
              </span>
              <span aria-hidden className="text-zinc-400 transition group-open:rotate-180">▾</span>
            </summary>
            <div className="border-t border-zinc-200 px-4 pb-4 dark:border-zinc-800">
              {grupos.map((g) => (
                <div key={g.titulo} className="mt-4">
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{g.titulo}</h3>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
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
                </div>
              ))}
            </div>
          </details>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={avaliar}
              disabled={!podeAvaliar}
              aria-busy={carregando}
              className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {carregando ? "Analisando…" : "Ver para onde ir"}
            </button>
            {marcados.length > 0 || relato ? (
              <button
                type="button"
                onClick={() => {
                  setMarcados([]);
                  setRelato("");
                  limparResultado();
                }}
                className="rounded-xl border border-zinc-200 px-6 py-3 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
              >
                Limpar
              </button>
            ) : null}
            <span className="ml-auto text-xs text-zinc-400">{relato.length}/600</span>
          </div>
        </section>

        {erro ? (
          <p role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
            {erro}
          </p>
        ) : null}

        {nivel && resultadoIa ? (
          <section id="resultado-triagem" role="status" aria-live="polite" className={`mt-6 rounded-2xl border-2 p-6 ${resultado[nivel].cor}`}>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold">{resultado[nivel].titulo}</h2>
              <span className="rounded-full border border-current px-2.5 py-0.5 text-[11px] font-semibold opacity-80">
                {resultadoIa.fonte === "ia+regras" ? "Analisado por IA + regras de segurança" : "Analisado por regras de segurança"}
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed">{resultado[nivel].texto}</p>
            <div className="mt-4 rounded-xl bg-white/60 p-4 text-sm dark:bg-black/20">
              <p className="font-semibold">Por que essa orientação?</p>
              <p className="mt-1 leading-relaxed">{resultadoIa.justificativa}</p>
              {resultadoIa.sinais.length > 0 ? (
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {resultadoIa.sinais.map((s) => (
                    <li key={s} className="rounded-full bg-black/5 px-2.5 py-1 text-xs dark:bg-white/10">{s}</li>
                  ))}
                </ul>
              ) : null}
              {resultadoIa.regraDeSegurancaAplicada ? (
                <p className="mt-2 text-xs font-semibold">A regra de segurança elevou a gravidade em relação à sugestão da IA.</p>
              ) : null}
              {resultadoIa.especialidadeSugerida ? (
                <p className="mt-2 text-xs">Especialidade sugerida: <strong>{resultadoIa.especialidadeSugerida}</strong></p>
              ) : null}
            </div>
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

        <p className="mt-6 text-xs text-zinc-500 dark:text-zinc-400">
          Esta é uma orientação geral e não substitui avaliação profissional. Em caso de dúvida sobre gravidade, procure a UPA ou ligue 192.
        </p>
      </div>

      {marcados.length > 0 && !resultadoIa ? (
        <div className="fixed inset-x-0 bottom-16 z-40 border-t border-zinc-200 bg-white/95 p-3 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95 sm:hidden">
          <button
            type="button"
            onClick={avaliar}
            disabled={!podeAvaliar}
            aria-busy={carregando}
            className="w-full rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm disabled:opacity-50"
          >
            {carregando ? "Analisando…" : `Ver para onde ir (${marcados.length} sintoma${marcados.length > 1 ? "s" : ""})`}
          </button>
        </div>
      ) : null}

      <BottomNav />
    </div>
  );
}
