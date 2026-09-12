"use client";

import { Fragment, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";

type StatusExame = "Disponível" | "Aguardando";

type Exame = {
  nome: string;
  tipo: string;
  dataColeta: string;
  status: StatusExame;
  resultado?: string[];
};

const exames: Exame[] = [
  {
    nome: "Hemograma completo",
    tipo: "Sangue",
    dataColeta: "10/08/2026",
    status: "Disponível",
    resultado: ["Hemoglobina: 13,8 g/dL (normal)", "Leucócitos: 6.200/mm³ (normal)"],
  },
  {
    nome: "Glicemia de jejum",
    tipo: "Sangue",
    dataColeta: "10/08/2026",
    status: "Disponível",
    resultado: ["Glicose: 92 mg/dL (normal)"],
  },
  {
    nome: "Colesterol total",
    tipo: "Sangue",
    dataColeta: "10/08/2026",
    status: "Disponível",
    resultado: ["Colesterol total: 210 mg/dL (levemente elevado)"],
  },
  { nome: "Raio-X de tórax", tipo: "Imagem", dataColeta: "28/08/2026", status: "Aguardando" },
  { nome: "Ultrassom abdominal", tipo: "Imagem", dataColeta: "02/09/2026", status: "Aguardando" },
];

const statusStyles: Record<StatusExame, string> = {
  Disponível: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  Aguardando: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
};

export default function ResultadoExamesPage() {
  const router = useRouter();
  const [busca, setBusca] = useState("");
  const [expandido, setExpandido] = useState<string | null>(null);
  const [menuAberto, setMenuAberto] = useState(false);
  const [baixando, setBaixando] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState<string | null>(null);

  const handleBaixar = (opcao: string) => {
    setMenuAberto(false);
    setBaixando(opcao);
    setTimeout(() => {
      setBaixando(null);
      setMensagem(`${opcao} — download concluído (demo)`);
      setTimeout(() => setMensagem(null), 3000);
    }, 1200);
  };

  const examesFiltrados = useMemo(
    () => exames.filter((e) => e.nome.toLowerCase().includes(busca.toLowerCase())),
    [busca]
  );

  const totalDisponiveis = exames.filter((e) => e.status === "Disponível").length;
  const totalAguardando = exames.filter((e) => e.status === "Aguardando").length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-indigo-50 to-white px-6 py-10 dark:bg-none dark:bg-zinc-900">
      <div className="mx-auto w-full max-w-5xl">
        <header className="flex flex-col gap-4 rounded-3xl bg-white p-8 shadow-lg dark:bg-zinc-950 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-indigo-600">Resultado de exames</p>
            <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
              Seus exames
            </h1>
            <p className="mt-2 max-w-xl text-sm text-zinc-600 dark:text-zinc-400">
              Acompanhe os exames realizados e seus resultados.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900"
            >
              Voltar ao painel
            </button>
            <ThemeToggle />
          </div>
        </header>

        <section className="mt-6 flex divide-x divide-zinc-100 overflow-hidden rounded-2xl bg-white shadow-sm dark:divide-zinc-800 dark:bg-zinc-950">
          <div className="flex-1 px-6 py-4">
            <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Total de exames
            </p>
            <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{exames.length}</p>
          </div>
          <div className="flex-1 px-6 py-4">
            <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Disponíveis
            </p>
            <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{totalDisponiveis}</p>
          </div>
          <div className="flex-1 px-6 py-4">
            <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Aguardando
            </p>
            <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{totalAguardando}</p>
          </div>
        </section>

        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm dark:bg-zinc-950">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar exame..."
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm outline-none focus:border-indigo-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 sm:w-64"
            />

            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuAberto((v) => !v)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 sm:w-auto"
              >
                Baixar resultados
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {menuAberto ? (
                <div className="absolute right-0 z-10 mt-2 w-56 rounded-xl border border-zinc-200 bg-white py-2 shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
                  <button
                    type="button"
                    onClick={() => handleBaixar("Todos os exames")}
                    className="flex w-full items-center justify-between px-4 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-zinc-900"
                  >
                    Todos os exames
                    {baixando === "Todos os exames" ? <span className="text-xs text-indigo-500">…</span> : null}
                  </button>
                  <div className="my-1 border-t border-zinc-100 dark:border-zinc-800" />
                  {exames.map((e) => (
                    <button
                      key={e.nome}
                      type="button"
                      onClick={() => handleBaixar(e.nome)}
                      disabled={e.status === "Aguardando"}
                      className="flex w-full items-center justify-between px-4 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:text-zinc-300 dark:text-zinc-200 dark:hover:bg-zinc-900 dark:disabled:text-zinc-700"
                    >
                      {e.nome}
                      {baixando === e.nome ? <span className="text-xs text-indigo-500">…</span> : null}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          {mensagem ? (
            <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
              {mensagem}
            </p>
          ) : null}

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-xs uppercase text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                  <th className="py-2 pr-4">Exame</th>
                  <th className="py-2 pr-4">Tipo</th>
                  <th className="py-2 pr-4">Coleta</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {examesFiltrados.map((e) => (
                  <Fragment key={e.nome}>
                    <tr>
                      <td className="py-3 pr-4 text-zinc-900 dark:text-zinc-100">{e.nome}</td>
                      <td className="py-3 pr-4 text-zinc-700 dark:text-zinc-300">{e.tipo}</td>
                      <td className="py-3 pr-4 text-zinc-700 dark:text-zinc-300">{e.dataColeta}</td>
                      <td className="py-3 pr-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[e.status]}`}>
                          {e.status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        {e.status === "Disponível" ? (
                          <button
                            type="button"
                            onClick={() => setExpandido(expandido === e.nome ? null : e.nome)}
                            className="text-xs font-semibold text-indigo-600 hover:underline"
                          >
                            {expandido === e.nome ? "Ocultar" : "Ver resultado"}
                          </button>
                        ) : null}
                      </td>
                    </tr>
                    {expandido === e.nome && e.resultado ? (
                      <tr>
                        <td colSpan={5} className="bg-zinc-50 px-4 py-3 dark:bg-zinc-900">
                          <ul className="space-y-1 text-xs text-zinc-700 dark:text-zinc-300">
                            {e.resultado.map((linha) => (
                              <li key={linha}>{linha}</li>
                            ))}
                          </ul>
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </div>
  );
}
