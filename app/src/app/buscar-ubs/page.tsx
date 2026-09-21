"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { BottomNav } from "@/components/BottomNav";

type UBS = {
  nome: string;
  endereco: string;
  distanciaKm: number;
  horario: string;
  telefone: string;
  abertaAgora: boolean;
};

const unidades: UBS[] = [
  {
    nome: "UBS Jardim Esperança",
    endereco: "Rua das Acácias, 245 — Jardim Esperança, São Paulo/SP",
    distanciaKm: 1.2,
    horario: "Seg a Sex, 7h–19h",
    telefone: "(11) 3123-4567",
    abertaAgora: true,
  },
  {
    nome: "UBS Vila Nova",
    endereco: "Av. Vila Nova, 980 — Vila Nova, São Paulo/SP",
    distanciaKm: 2.8,
    horario: "Seg a Sex, 7h–17h",
    telefone: "(11) 3123-8899",
    abertaAgora: true,
  },
  {
    nome: "UBS Parque das Flores",
    endereco: "Rua das Orquídeas, 112 — Parque das Flores, São Paulo/SP",
    distanciaKm: 3.5,
    horario: "Seg a Sáb, 7h–13h",
    telefone: "(11) 3123-2200",
    abertaAgora: false,
  },
  {
    nome: "UBS Cidade Líder",
    endereco: "Av. Águia de Haia, 3300 — Cidade Líder, São Paulo/SP",
    distanciaKm: 4.9,
    horario: "Seg a Sex, 7h–19h",
    telefone: "(11) 3123-7744",
    abertaAgora: true,
  },
];

export default function BuscarUbsPage() {
  const router = useRouter();
  const [busca, setBusca] = useState("");

  const unidadesFiltradas = useMemo(() => {
    return [...unidades]
      .filter((u) => u.nome.toLowerCase().includes(busca.toLowerCase()))
      .sort((a, b) => a.distanciaKm - b.distanciaKm);
  }, [busca]);

  const abertasAgora = unidades.filter((u) => u.abertaAgora).length;
  const maisProxima = unidades.reduce((min, u) => (u.distanciaKm < min.distanciaKm ? u : min));

  const abrirRota = (endereco: string) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(endereco)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-indigo-50 to-white px-6 py-10 pb-24 dark:bg-none dark:bg-zinc-900">
      <div className="mx-auto w-full max-w-5xl">
        <header className="flex flex-col gap-4 rounded-3xl bg-white p-8 shadow-lg dark:bg-zinc-950 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-indigo-600">UBS mais próxima</p>
            <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
              Encontre uma unidade
            </h1>
            <p className="mt-2 max-w-xl text-sm text-zinc-600 dark:text-zinc-400">
              Encontre a unidade básica de saúde mais próxima e trace a rota até ela.
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
              UBS na região
            </p>
            <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{unidades.length}</p>
          </div>
          <div className="flex-1 px-6 py-4">
            <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Abertas agora
            </p>
            <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{abertasAgora}</p>
          </div>
          <div className="flex-1 px-6 py-4">
            <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Mais próxima
            </p>
            <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              {maisProxima.distanciaKm} km
            </p>
          </div>
        </section>

        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm dark:bg-zinc-950">
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome da UBS..."
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm outline-none focus:border-indigo-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 sm:w-72"
          />

          <ul className="mt-4 divide-y divide-zinc-100 dark:divide-zinc-800">
            {unidadesFiltradas.map((u) => (
              <li key={u.nome} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">{u.nome}</p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        u.abertaAgora
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                          : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                      }`}
                    >
                      {u.abertaAgora ? "Aberta agora" : "Fechada"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{u.endereco}</p>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
                    {u.horario} · {u.telefone} · {u.distanciaKm} km
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => abrirRota(u.endereco)}
                  className="whitespace-nowrap rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                >
                  Ver rota
                </button>
              </li>
            ))}
          </ul>
        </section>

      </div>

      <BottomNav />
    </div>
  );
}
