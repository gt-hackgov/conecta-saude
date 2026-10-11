"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { getSession } from "@/lib/authSession";

/**
 * Fila de atendimento por classificação de risco (GET/POST /api/medico/fila).
 * A ordem vem do back-end, que usa um heap binário (árvore de prioridade):
 * primeiro a cor de risco, depois a ordem de chegada.
 */

type Risco = "VERMELHO" | "LARANJA" | "AMARELO" | "VERDE" | "AZUL";

type Entrada = {
  id: string;
  senha: number;
  posicao: number;
  iniciais: string;
  classificacao: Risco;
  descricaoRisco: string;
  queixa: string;
  minutosEsperando: number;
  tempoAlvoMinutos: number;
  acimaDoTempoAlvo: boolean;
};

const CORES: Record<Risco, string> = {
  VERMELHO: "bg-red-600 text-white",
  LARANJA: "bg-orange-400 text-orange-950",
  AMARELO: "bg-yellow-300 text-yellow-950",
  VERDE: "bg-emerald-500 text-white",
  AZUL: "bg-sky-500 text-white",
};

const OPCOES: { valor: Risco; rotulo: string }[] = [
  { valor: "VERMELHO", rotulo: "Vermelho · Emergência" },
  { valor: "LARANJA", rotulo: "Laranja · Muito urgente" },
  { valor: "AMARELO", rotulo: "Amarelo · Urgente" },
  { valor: "VERDE", rotulo: "Verde · Pouco urgente" },
  { valor: "AZUL", rotulo: "Azul · Não urgente" },
];

function cabecalhos(): HeadersInit {
  const token = getSession()?.token;
  return token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" };
}

export function FilaAtendimento() {
  const [fila, setFila] = useState<Entrada[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [iniciais, setIniciais] = useState("");
  const [risco, setRisco] = useState<Risco>("VERDE");
  const [queixa, setQueixa] = useState("");
  const [enviando, setEnviando] = useState(false);

  const carregar = useCallback(async () => {
    setErro(null);
    try {
      const resposta = await fetch("/api/medico/fila", { headers: cabecalhos(), cache: "no-store" });
      if (resposta.status === 401 || resposta.status === 403) {
        setErro("Sessão expirada ou sem permissão. Saia e entre novamente.");
        return;
      }
      if (!resposta.ok) {
        setErro("Não foi possível carregar a fila.");
        return;
      }
      const dados = (await resposta.json()) as { fila: Entrada[] };
      setFila(dados.fila);
    } catch {
      setErro("Sem conexão com o servidor.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void carregar();
    const intervalo = setInterval(() => void carregar(), 30_000);
    return () => clearInterval(intervalo);
  }, [carregar]);

  const adicionar = async (e: FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    setAviso(null);
    try {
      const resposta = await fetch("/api/medico/fila", {
        method: "POST",
        headers: cabecalhos(),
        body: JSON.stringify({ iniciais, classificacao: risco, queixa }),
      });
      const dados = await resposta.json().catch(() => ({}));
      if (!resposta.ok) {
        setAviso(dados?.message ?? dados?.error ?? "Verifique os dados informados.");
        return;
      }
      setAviso(`Senha ${dados.entrada.senha} adicionada na posição ${dados.entrada.posicao}.`);
      setIniciais("");
      setQueixa("");
      await carregar();
    } catch {
      setAviso("Sem conexão com o servidor.");
    } finally {
      setEnviando(false);
    }
  };

  const chamar = async () => {
    setAviso(null);
    try {
      const resposta = await fetch("/api/medico/fila/chamar", { method: "POST", headers: cabecalhos() });
      const dados = await resposta.json().catch(() => ({}));
      if (!resposta.ok) {
        setAviso(dados?.error ?? "Não foi possível chamar o próximo.");
        return;
      }
      setAviso(`Chamando senha ${dados.chamado.senha} (${dados.chamado.iniciais}) — ${dados.chamado.descricaoRisco}.`);
      await carregar();
    } catch {
      setAviso("Sem conexão com o servidor.");
    }
  };

  return (
    <section className="mt-8 rounded-3xl bg-white p-6 shadow-lg dark:bg-zinc-950 sm:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Fila de atendimento por risco</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Ordenada por gravidade e depois por chegada. Pacientes fictícios, identificados só por iniciais.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void chamar()}
          disabled={fila.length === 0}
          className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
        >
          Chamar próximo
        </button>
      </div>

      {aviso ? (
        <p role="status" className="mt-4 rounded-xl bg-indigo-50 px-4 py-2.5 text-sm text-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-100">{aviso}</p>
      ) : null}

      {carregando ? (
        <div className="mt-6 space-y-2" aria-busy="true">
          {[0, 1, 2].map((i) => <div key={i} className="h-12 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-900" />)}
        </div>
      ) : erro ? (
        <p role="alert" className="mt-6 text-sm text-red-700 dark:text-red-300">{erro}</p>
      ) : fila.length === 0 ? (
        <p className="mt-6 text-sm text-zinc-500">Nenhum paciente aguardando.</p>
      ) : (
        <ol className="mt-6 space-y-2">
          {fila.map((e) => (
            <li key={e.id} className="flex items-center gap-3 rounded-xl border border-zinc-100 px-3 py-2.5 dark:border-zinc-800">
              <span className="w-6 text-center text-sm font-bold text-zinc-400">{e.posicao}</span>
              <span className={`rounded-lg px-2 py-1 text-[11px] font-bold ${CORES[e.classificacao]}`}>{e.classificacao}</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {e.iniciais} <span className="font-normal text-zinc-500">· senha {e.senha}</span>
                </p>
                <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{e.queixa || "Sem queixa registrada"}</p>
              </div>
              <span className={`text-right text-xs tabular-nums ${e.acimaDoTempoAlvo ? "font-bold text-red-600" : "text-zinc-500"}`}>
                {e.minutosEsperando} min
                <span className="block text-[10px] font-normal text-zinc-400">alvo {e.tempoAlvoMinutos} min</span>
              </span>
            </li>
          ))}
        </ol>
      )}

      <form onSubmit={adicionar} className="mt-6 grid gap-3 border-t border-zinc-100 pt-6 dark:border-zinc-800 sm:grid-cols-[120px_1fr_1.5fr_auto]">
        <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">
          Iniciais
          <input
            value={iniciais}
            onChange={(e) => setIniciais(e.target.value)}
            required
            maxLength={8}
            placeholder="M.S."
            className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>
        <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">
          Classificação
          <select
            value={risco}
            onChange={(e) => setRisco(e.target.value as Risco)}
            className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          >
            {OPCOES.map((o) => <option key={o.valor} value={o.valor}>{o.rotulo}</option>)}
          </select>
        </label>
        <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">
          Queixa principal
          <input
            value={queixa}
            onChange={(e) => setQueixa(e.target.value)}
            maxLength={120}
            placeholder="Ex.: febre e dor no corpo"
            className="mt-1 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>
        <button
          type="submit"
          disabled={enviando}
          className="self-end rounded-lg border border-indigo-600 px-4 py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 disabled:opacity-50 dark:hover:bg-indigo-950/40"
        >
          {enviando ? "Adicionando…" : "Adicionar"}
        </button>
      </form>
    </section>
  );
}
