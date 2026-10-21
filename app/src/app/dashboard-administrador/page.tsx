"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/authSession";
import { AdminShell } from "@/components/admin/AdminShell";
import { IndicadoresSql } from "@/components/admin/IndicadoresSql";

const especialidades = [
  { nome: "Clínica Médica (Geral)", absoluta: 2250, relativa: 45, acumulada: 45, cor: "#0284c7" },
  { nome: "Pediatria", absoluta: 1000, relativa: 20, acumulada: 65, cor: "#0f766e" },
  { nome: "Ginecologia e Obstetrícia", absoluta: 750, relativa: 15, acumulada: 80, cor: "#38bdf8" },
  { nome: "Odontologia", absoluta: 600, relativa: 12, acumulada: 92, cor: "#5eead4" },
  { nome: "Saúde Mental (Psi.)", absoluta: 400, relativa: 8, acumulada: 100, cor: "#94a3b8" },
];

const insights = [
  "Clínica Médica concentra 45% da demanda: é a porta de entrada da UBS; atrasos aqui travam todo o fluxo de encaminhamentos.",
  "Pediatria representa 20%; em regiões populosas, mutirões sazonais (ex.: doenças respiratórias) podem aliviar picos.",
  "Saúde Mental é a menor fatia (8%), mas pode refletir dificuldade de acesso ou estigma; um canal digital discreto tende a aumentar a procura real.",
];

export default function DashboardAdministradorPage() {
  const router = useRouter();
  const [checkedAuth, setCheckedAuth] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const session = getSession();
    setIsAdmin(Boolean(session?.token && session.role === "ADMIN"));
    setCheckedAuth(true);
  }, []);

  useEffect(() => {
    if (checkedAuth && !isAdmin) {
      router.replace("/");
    }
  }, [checkedAuth, isAdmin, router]);

  if (!checkedAuth || !isAdmin) {
    return null;
  }

  const gradientePizza = (() => {
    let acumulado = 0;
    const partes: string[] = [];
    especialidades.forEach((item) => {
      partes.push(`${item.cor} ${acumulado}%`);
      acumulado += item.relativa;
      partes.push(`${item.cor} ${acumulado}%`);
    });
    return `conic-gradient(${partes.join(", ")})`;
  })();

  return (
    <AdminShell
      title="Dashboard Administrativo"
      description="Acompanhe os principais indicadores e gerencie a plataforma Conecta Saúde."
    >
          <section
            id="visao-geral"
            className="relative mt-8 scroll-mt-6 overflow-hidden rounded-2xl border border-sky-100 bg-white bg-cover bg-right bg-no-repeat shadow-[0_12px_40px_-28px_rgba(14,116,144,0.45)] md:bg-[url('/dashboard-admin-hero.png')] dark:border-zinc-800"
          >
            <div className="relative max-w-xl p-6 sm:p-8">
              <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">
                Visão geral da plataforma
              </h2>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-zinc-600">
                Acompanhe o desempenho, gerencie usuários e mantenha a plataforma funcionando com
                qualidade e segurança.
              </p>
              <button
                type="button"
                onClick={() => router.push("/admin/usuarios")}
                className="mt-6 inline-flex h-11 items-center rounded-full bg-sky-600 px-5 text-sm font-medium text-white shadow-sm transition hover:bg-sky-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
              >
                Cadastrar usuário
              </button>
            </div>
          </section>

          <section id="indicadores" className="mt-10 scroll-mt-6">
            <p className="text-[11px] font-semibold tracking-[0.16em] text-sky-700 uppercase dark:text-sky-300">
              Indicadores
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Indicadores da plataforma
            </h2>
            <IndicadoresSql />
          </section>

          <details className="group mt-10 rounded-2xl border border-dashed border-sky-200/90 bg-white/70 p-6 sm:p-8 dark:border-zinc-700 dark:bg-zinc-950/60">
            <summary className="cursor-pointer list-none text-sm font-medium text-sky-700 dark:text-sky-300">
              <span className="group-open:hidden">Ver amostra demonstrativa ▸</span>
              <span className="hidden group-open:inline">Ocultar amostra demonstrativa ▾</span>
            </summary>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[11px] font-semibold tracking-[0.16em] text-zinc-500 uppercase dark:text-zinc-400">
                  Amostra demonstrativa
                </p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                  Demanda por especialidade
                </h2>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Amostra de 5.000 solicitações mensais. Não faz parte dos indicadores operacionais.
              </p>
            </div>

            <div className="mt-8 grid gap-10 lg:grid-cols-2">
              <div>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  Participação relativa
                </h3>
                <div className="mt-5 space-y-4">
                  {especialidades.map((item) => (
                    <div key={item.nome}>
                      <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400">
                        <span>{item.nome}</span>
                        <span className="font-medium text-zinc-800 dark:text-zinc-200">{item.relativa}%</span>
                      </div>
                      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-sky-50 dark:bg-zinc-800">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${item.relativa}%`, backgroundColor: item.cor }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  Distribuição
                </h3>
                <div className="mt-5 flex flex-col items-center gap-6 sm:flex-row sm:items-center">
                  <div
                    className="size-44 shrink-0 rounded-full"
                    style={{ backgroundImage: gradientePizza }}
                    role="img"
                    aria-label="Gráfico de participação percentual por especialidade"
                  />
                  <ul className="space-y-2">
                    {especialidades.map((item) => (
                      <li key={item.nome} className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-300">
                        <span className="size-2.5 rounded-full" style={{ backgroundColor: item.cor }} />
                        {item.nome} — {item.relativa}%
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-10 overflow-x-auto">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                Tabela de frequência
              </h3>
              <table className="mt-4 w-full min-w-[36rem] text-left text-sm">
                <thead>
                  <tr className="border-b border-sky-100 text-[11px] tracking-wide text-zinc-500 uppercase dark:border-zinc-800 dark:text-zinc-400">
                    <th className="py-3 pr-4 font-medium">Especialidade</th>
                    <th className="py-3 pr-4 text-right font-medium">Freq. absoluta</th>
                    <th className="py-3 pr-4 text-right font-medium">Freq. relativa</th>
                    <th className="py-3 text-right font-medium">Freq. acumulada</th>
                  </tr>
                </thead>
                <tbody>
                  {especialidades.map((item) => (
                    <tr key={item.nome} className="border-b border-sky-50 last:border-0 dark:border-zinc-800/80">
                      <td className="py-3 pr-4 text-zinc-800 dark:text-zinc-100">{item.nome}</td>
                      <td className="py-3 pr-4 text-right text-zinc-600 dark:text-zinc-300">{item.absoluta}</td>
                      <td className="py-3 pr-4 text-right text-zinc-600 dark:text-zinc-300">{item.relativa}%</td>
                      <td className="py-3 text-right text-zinc-600 dark:text-zinc-300">{item.acumulada}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-10">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                Insights para gestão
              </h3>
              <ul className="mt-4 grid gap-3">
                {insights.map((texto) => (
                  <li
                    key={texto}
                    className="rounded-xl bg-sky-50/70 px-4 py-3 text-sm leading-relaxed text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
                  >
                    {texto}
                  </li>
                ))}
              </ul>
            </div>
          </details>
    </AdminShell>
  );
}
