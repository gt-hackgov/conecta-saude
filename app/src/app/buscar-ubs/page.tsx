"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { BottomNav } from "@/components/BottomNav";
import { unidades, type TipoUnidade, type UnidadeSaude } from "@/lib/unidadesSaude";

type FiltroTipo = "Todas" | TipoUnidade;

const todasEspecialidades = Array.from(new Set(unidades.flatMap((u) => u.especialidades))).sort((a, b) =>
  a.localeCompare(b, "pt-BR")
);

/** Mapa gratuito do OpenStreetMap (sem chave de API e sem custo). */
function urlMapa(u: UnidadeSaude) {
  const d = 0.008;
  const bbox = [u.lon - d, u.lat - d, u.lon + d, u.lat + d].join(",");
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${u.lat},${u.lon}`;
}

const tipoStyles: Record<TipoUnidade, string> = {
  UBS: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
  UPA: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

export default function BuscarUbsPage() {
  const router = useRouter();
  const [busca, setBusca] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<FiltroTipo>("Todas");
  const [filtroEspecialidade, setFiltroEspecialidade] = useState<string>("");
  const [selecionada, setSelecionada] = useState<UnidadeSaude>(unidades[0]);
  const [especialidadesAbertas, setEspecialidadesAbertas] = useState<string | null>(null);

  // Permite abrir a tela já filtrada, ex.: /buscar-ubs?tipo=UPA (vindo da triagem "O que você tem?")
  useEffect(() => {
    const tipo = new URLSearchParams(window.location.search).get("tipo");
    if (tipo === "UPA" || tipo === "UBS") {
      setFiltroTipo(tipo);
      const primeira = [...unidades].filter((u) => u.tipo === tipo).sort((a, b) => a.distanciaKm - b.distanciaKm)[0];
      if (primeira) setSelecionada(primeira);
    }
  }, []);

  const unidadesFiltradas = useMemo(() => {
    const termo = busca.toLowerCase();
    return [...unidades]
      .filter((u) => filtroTipo === "Todas" || u.tipo === filtroTipo)
      .filter((u) => !filtroEspecialidade || u.especialidades.includes(filtroEspecialidade))
      .filter(
        (u) =>
          u.nome.toLowerCase().includes(termo) ||
          u.especialidades.some((e) => e.toLowerCase().includes(termo))
      )
      .sort((a, b) => a.distanciaKm - b.distanciaKm);
  }, [busca, filtroTipo, filtroEspecialidade]);

  const abertasAgora = unidadesFiltradas.filter((u) => u.abertaAgora).length;
  const maisProxima = unidadesFiltradas[0];

  const abrirRota = (endereco: string) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(endereco)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-indigo-50 to-white px-6 py-10 pb-24 dark:bg-none dark:bg-zinc-900">
      <div className="mx-auto w-full max-w-5xl">
        <header className="flex flex-col gap-4 rounded-3xl bg-white p-8 shadow-lg dark:bg-zinc-950 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-indigo-600">UBS e UPA mais próximas</p>
            <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50">Encontre uma unidade</h1>
            <p className="mt-2 max-w-xl text-sm text-zinc-600 dark:text-zinc-400">
              Veja o que cada unidade oferece, filtre pela especialidade que você precisa e trace a rota.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/o-que-voce-tem")}
              className="inline-flex items-center justify-center rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700"
            >
              UBS ou UPA?
            </button>
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900"
            >
              Voltar
            </button>
            <ThemeToggle />
          </div>
        </header>

        <section className="mt-6 flex divide-x divide-zinc-100 overflow-hidden rounded-2xl bg-white shadow-sm dark:divide-zinc-800 dark:bg-zinc-950">
          <div className="flex-1 px-6 py-4">
            <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Unidades encontradas</p>
            <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{unidadesFiltradas.length}</p>
          </div>
          <div className="flex-1 px-6 py-4">
            <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Abertas agora</p>
            <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{abertasAgora}</p>
          </div>
          <div className="flex-1 px-6 py-4">
            <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Mais próxima</p>
            <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              {maisProxima ? `${maisProxima.distanciaKm} km` : "—"}
            </p>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-5">
          <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-zinc-950 lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{selecionada.nome}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{selecionada.endereco}</p>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${tipoStyles[selecionada.tipo]}`}>
                {selecionada.tipo}
              </span>
            </div>
            <iframe
              key={selecionada.nome}
              title={`Mapa — ${selecionada.nome}`}
              src={urlMapa(selecionada)}
              className="mt-3 h-64 w-full rounded-xl border border-zinc-200 dark:border-zinc-800"
              loading="lazy"
            />
            <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Especialidades nesta unidade
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {selecionada.especialidades.map((e) => (
                <span
                  key={e}
                  className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300"
                >
                  {e}
                </span>
              ))}
            </div>
            <p className="mt-3 text-[11px] text-zinc-400">Mapa: © OpenStreetMap (gratuito). Localizações ilustrativas.</p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-zinc-950 lg:col-span-3">
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar por nome ou especialidade..."
                aria-label="Buscar unidade"
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm outline-none focus:border-indigo-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
              <select
                value={filtroEspecialidade}
                onChange={(e) => setFiltroEspecialidade(e.target.value)}
                aria-label="Filtrar por especialidade"
                className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              >
                <option value="">Todas as especialidades</option>
                {todasEspecialidades.map((e) => (
                  <option key={e} value={e}>{e}</option>
                ))}
              </select>
            </div>

            <div className="mt-3 flex gap-2" role="group" aria-label="Tipo de unidade">
              {(["Todas", "UBS", "UPA"] as FiltroTipo[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  aria-pressed={filtroTipo === t}
                  onClick={() => setFiltroTipo(t)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                    filtroTipo === t
                      ? "bg-indigo-600 text-white"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
                  }`}
                >
                  {t === "Todas" ? "Todas" : t === "UBS" ? "UBS (consultas e rotina)" : "UPA (urgência 24h)"}
                </button>
              ))}
            </div>

            <ul className="mt-4 divide-y divide-zinc-100 dark:divide-zinc-800">
              {unidadesFiltradas.map((u) => (
                <li key={u.nome} className="py-4">
                  <div className="flex flex-col gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${tipoStyles[u.tipo]}`}>{u.tipo}</span>
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
                      <p className="mt-1 text-xs text-zinc-500">
                        {u.horario} · {u.telefone} · {u.distanciaKm} km
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {u.especialidades.slice(0, 3).map((e) => (
                          <span key={e} className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                            {e}
                          </span>
                        ))}
                        {u.especialidades.length > 3 ? (
                          <span className="rounded-full px-2 py-0.5 text-[11px] text-zinc-500">+{u.especialidades.length - 3}</span>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        aria-expanded={especialidadesAbertas === u.nome}
                        onClick={() => {
                          setSelecionada(u);
                          setEspecialidadesAbertas(especialidadesAbertas === u.nome ? null : u.nome);
                        }}
                        className="whitespace-nowrap rounded-xl border border-indigo-200 px-3 py-1.5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-300 dark:hover:bg-indigo-950/40"
                      >
                        Especialidades
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelecionada(u)}
                        className="whitespace-nowrap rounded-xl border border-zinc-200 px-3 py-1.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
                      >
                        Ver no mapa
                      </button>
                      <button
                        type="button"
                        onClick={() => abrirRota(u.endereco)}
                        className="whitespace-nowrap rounded-xl bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                      >
                        Ver rota
                      </button>
                    </div>
                  </div>
                  {especialidadesAbertas === u.nome ? (
                    <div className="mt-3 rounded-xl bg-indigo-50 p-3 dark:bg-indigo-950/30">
                      <p className="text-xs font-semibold text-indigo-800 dark:text-indigo-200">Disponível nesta unidade:</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {u.especialidades.map((e) => (
                          <span key={e} className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-indigo-700 shadow-sm dark:bg-zinc-900 dark:text-indigo-300">
                            {e}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </li>
              ))}
              {unidadesFiltradas.length === 0 ? (
                <li className="py-6 text-center text-sm text-zinc-500">
                  Nenhuma unidade encontrada com esses filtros.
                </li>
              ) : null}
            </ul>
          </div>
        </section>
      </div>

      <BottomNav />
    </div>
  );
}
