"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";

type StatusVacina = "Aplicada" | "Atrasada" | "Prevista";

const vacinas: { nome: string; dose: string; data: string; local: string; status: StatusVacina }[] = [
  { nome: "Hepatite B", dose: "3ª dose", data: "12/03/2024", local: "UBS Jardim Esperança", status: "Aplicada" },
  { nome: "Tríplice Viral (SCR)", dose: "Reforço", data: "05/07/2023", local: "UBS Jardim Esperança", status: "Aplicada" },
  { nome: "Febre Amarela", dose: "Dose única", data: "20/01/2022", local: "UBS Vila Nova", status: "Aplicada" },
  { nome: "Influenza (gripe)", dose: "Campanha 2025", data: "15/04/2025", local: "UBS Jardim Esperança", status: "Aplicada" },
  { nome: "dT (dupla adulto)", dose: "Reforço decenal", data: "Prevista para 2026", local: "—", status: "Prevista" },
  { nome: "COVID-19", dose: "Reforço", data: "Prevista para 10/2025", local: "—", status: "Atrasada" },
];

const statusStyles: Record<StatusVacina, string> = {
  Aplicada: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  Atrasada: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  Prevista: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
};

export default function HistoricoVacinasPage() {
  const router = useRouter();
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<"Todos" | StatusVacina>("Todos");

  const vacinasFiltradas = useMemo(() => {
    return vacinas.filter((v) => {
      const combinaBusca = v.nome.toLowerCase().includes(busca.toLowerCase());
      const combinaStatus = filtroStatus === "Todos" || v.status === filtroStatus;
      return combinaBusca && combinaStatus;
    });
  }, [busca, filtroStatus]);

  const totalAplicadas = vacinas.filter((v) => v.status === "Aplicada").length;
  const totalPendentes = vacinas.filter((v) => v.status !== "Aplicada").length;
  const ultimaAplicacao = vacinas.find((v) => v.status === "Aplicada")?.data ?? "—";

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-indigo-50 to-white px-6 py-10 dark:bg-none dark:bg-zinc-900">
      <div className="mx-auto w-full max-w-5xl">
        <header className="flex flex-col gap-4 rounded-3xl bg-white p-8 shadow-lg dark:bg-zinc-950 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-indigo-600">Histórico de vacinas</p>
            <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
              Suas doses aplicadas
            </h1>
            <p className="mt-2 max-w-xl text-sm text-zinc-600 dark:text-zinc-400">
              Consulte suas doses aplicadas e as próximas previstas pelo calendário do SUS.
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
              Doses aplicadas
            </p>
            <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{totalAplicadas}</p>
          </div>
          <div className="flex-1 px-6 py-4">
            <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Pendentes/atrasadas
            </p>
            <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{totalPendentes}</p>
          </div>
          <div className="flex-1 px-6 py-4">
            <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Última aplicação
            </p>
            <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{ultimaAplicacao}</p>
          </div>
        </section>

        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm dark:bg-zinc-950">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar vacina..."
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm outline-none focus:border-indigo-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 sm:w-64"
            />
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value as typeof filtroStatus)}
              className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm outline-none focus:border-indigo-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              <option value="Todos">Todos os status</option>
              <option value="Aplicada">Aplicada</option>
              <option value="Prevista">Prevista</option>
              <option value="Atrasada">Atrasada</option>
            </select>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-xs uppercase text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                  <th className="py-2 pr-4">Vacina</th>
                  <th className="py-2 pr-4">Dose</th>
                  <th className="py-2 pr-4">Data</th>
                  <th className="py-2 pr-4">Local</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {vacinasFiltradas.map((v) => (
                  <tr key={v.nome}>
                    <td className="py-3 pr-4 text-zinc-900 dark:text-zinc-100">{v.nome}</td>
                    <td className="py-3 pr-4 text-zinc-700 dark:text-zinc-300">{v.dose}</td>
                    <td className="py-3 pr-4 text-zinc-700 dark:text-zinc-300">{v.data}</td>
                    <td className="py-3 pr-4 text-zinc-700 dark:text-zinc-300">{v.local}</td>
                    <td className="py-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[v.status]}`}>
                        {v.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {vacinasFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
                      Nenhuma vacina encontrada.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>

        <p className="mt-4 text-xs text-zinc-400">
          Dados de exemplo — em produção, viriam do prontuário eletrônico integrado ao e-SUS/RNDS.
        </p>
      </div>
    </div>
  );
}
