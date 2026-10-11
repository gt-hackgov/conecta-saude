"use client";

import { useCallback, useEffect, useState } from "react";
import { getSession } from "@/lib/authSession";

/**
 * Indicadores de gestão calculados no back-end com SQL (GET /api/admin/indicadores).
 * Cada bloco mostra a pergunta de gestão e o resultado.
 */

type Linha = Record<string, string | number | null>;
type Consulta = { id: string; titulo: string; pergunta: string; sql: string; colunas: string[]; linhas: Linha[] };
type Resumo = {
  totalAtendimentos: number;
  taxaFaltaUbsPct: number;
  esperaMediaUpaMin: number | null;
  baixoRiscoNaUpaPct: number;
  periodoInicio: string | null;
  periodoFim: string | null;
};
type Indicadores = { fonteDados: string; resumo: Resumo; consultas: Consulta[] };

const DIAS = ["", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
const MESES = ["", "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

const ROTULOS: Record<string, string> = {
  unidade: "Unidade",
  tipo_unidade: "Tipo",
  total: "Total",
  espera_media_min: "Espera média (min)",
  faltas: "Faltas",
  especialidade: "Especialidade",
  agendados: "Agendados",
  taxa_falta_pct: "Faltas (%)",
  dia_semana: "Dia",
  atendimentos: "Atendimentos",
  posicao: "Posição",
  classificacao_risco: "Risco",
  percentual: "% do total",
  ano: "Ano",
  mes: "Mês",
  upa: "UPA",
  ubs: "UBS",
};

/** Coluna que ganha a barrinha visual em cada consulta. */
const COLUNA_DESTAQUE: Record<string, string> = {
  volume_por_unidade: "total",
  absenteismo_especialidade: "taxa_falta_pct",
  espera_acima_media: "espera_media_min",
  ranking_dia_semana: "atendimentos",
  perfil_risco_upa: "percentual",
  tendencia_mensal: "atendimentos",
};

function formatar(coluna: string, valor: string | number | null): string {
  if (valor === null || valor === undefined) return "—";
  if (coluna === "dia_semana") return DIAS[Number(valor)] ?? String(valor);
  if (coluna === "mes") return MESES[Number(valor)] ?? String(valor);
  if (coluna === "ano" || coluna === "posicao") return String(valor);
  if (typeof valor === "number") return valor.toLocaleString("pt-BR");
  return valor;
}

function formatarData(iso: string | null): string {
  if (!iso) return "—";
  const [a, m, d] = iso.slice(0, 10).split("-");
  return `${d}/${m}/${a}`;
}

export function IndicadoresSql() {
  const [dados, setDados] = useState<Indicadores | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const token = getSession()?.token;
      const resposta = await fetch("/api/admin/indicadores", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        cache: "no-store",
      });
      if (resposta.status === 401 || resposta.status === 403) {
        setErro("Sua sessão expirou ou não tem permissão. Saia e entre novamente como administrador.");
        return;
      }
      if (!resposta.ok) {
        setErro("Não foi possível carregar os indicadores agora.");
        return;
      }
      setDados((await resposta.json()) as Indicadores);
    } catch {
      setErro("Sem conexão com o servidor. Verifique se o back-end está rodando.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  if (carregando) {
    return (
      <section aria-busy="true" className="mt-8 grid gap-4 sm:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-white shadow-sm dark:bg-zinc-950" />
        ))}
      </section>
    );
  }

  if (erro || !dados) {
    return (
      <section role="alert" className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
        <p>{erro ?? "Indicadores indisponíveis."}</p>
        <button type="button" onClick={() => void carregar()} className="mt-3 rounded-lg border border-current px-3 py-1.5 text-xs font-semibold">
          Tentar novamente
        </button>
      </section>
    );
  }

  const { resumo } = dados;
  const pct = (v: number | null | undefined) => (v == null ? "—" : `${v.toLocaleString("pt-BR")}%`);
  const cartoes = [
    { rotulo: "Atendimentos no período", valor: (resumo.totalAtendimentos ?? 0).toLocaleString("pt-BR") },
    { rotulo: "Faltas em consultas na UBS", valor: pct(resumo.taxaFaltaUbsPct) },
    { rotulo: "Espera média na UPA", valor: resumo.esperaMediaUpaMin != null ? `${Math.round(resumo.esperaMediaUpaMin)} min` : "—" },
    { rotulo: "Casos de baixo risco na UPA", valor: pct(resumo.baixoRiscoNaUpaPct), destaque: true },
  ];

  return (
    <>
      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cartoes.map((c) => (
          <div key={c.rotulo} className={`rounded-2xl p-5 shadow-sm ${c.destaque ? "bg-indigo-600 text-white" : "bg-white dark:bg-zinc-950"}`}>
            <p className={`text-xs uppercase tracking-wide ${c.destaque ? "text-indigo-100" : "text-zinc-500 dark:text-zinc-400"}`}>{c.rotulo}</p>
            <p className={`mt-1 text-2xl font-semibold ${c.destaque ? "" : "text-indigo-600"}`}>{c.valor}</p>
          </div>
        ))}
      </section>
      <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
        Período: {formatarData(resumo.periodoInicio)} a {formatarData(resumo.periodoFim)} · {dados.fonteDados}
      </p>

      <section className="mt-10 grid gap-6 lg:grid-cols-2">
        {dados.consultas.map((consulta) => {
          const destaque = COLUNA_DESTAQUE[consulta.id];
          const maximo = Math.max(1, ...consulta.linhas.map((l) => Number(l[destaque] ?? 0)));
          return (
            <article key={consulta.id} className="overflow-hidden rounded-3xl bg-white p-6 shadow-sm dark:bg-zinc-950">
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">{consulta.titulo}</h3>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{consulta.pergunta}</p>

              {consulta.linhas.length === 0 ? (
                <p className="mt-4 text-sm text-zinc-500">Nenhum resultado para esta consulta.</p>
              ) : (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-zinc-200 text-xs uppercase text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                        {consulta.colunas.map((c) => (
                          <th key={c} scope="col" className="py-2 pr-3 font-medium">{ROTULOS[c] ?? c}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                      {consulta.linhas.map((linha, i) => (
                        <tr key={i}>
                          {consulta.colunas.map((c) => (
                            <td key={c} className={`py-2 pr-3 align-middle text-zinc-800 dark:text-zinc-200 ${c === destaque ? "min-w-[150px]" : ""}`}>
                              {c === destaque ? (
                                <div className="flex items-center gap-2">
                                  <span className="w-14 shrink-0 tabular-nums">{formatar(c, linha[c])}</span>
                                  <span className="hidden h-1.5 w-20 shrink-0 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800 sm:block">
                                    <span className="block h-full rounded-full bg-indigo-500" style={{ width: `${(Number(linha[c] ?? 0) / maximo) * 100}%` }} />
                                  </span>
                                </div>
                              ) : (
                                formatar(c, linha[c])
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </article>
          );
        })}
      </section>
    </>
  );
}
