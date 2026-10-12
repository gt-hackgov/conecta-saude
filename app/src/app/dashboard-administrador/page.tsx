"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  ClipboardList,
  HeartPulse,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";
import { getSession, removeSession } from "@/lib/authSession";
import { ThemeToggle } from "@/components/ThemeToggle";
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

const navItems: { href: string; label: string; icon: LucideIcon; current?: boolean }[] = [
  { href: "#visao-geral", label: "Visão geral", icon: LayoutDashboard, current: true },
  { href: "/admin/usuarios", label: "Usuários", icon: Users },
  { href: "#indicadores", label: "Indicadores", icon: BarChart3 },
  { href: "/dashboard-administrador/auditoria", label: "Auditoria", icon: ClipboardList },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];

function navClass(current?: boolean) {
  return [
    "inline-flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium whitespace-nowrap transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600",
    current
      ? "bg-sky-50 text-sky-800 dark:bg-sky-950/60 dark:text-sky-100"
      : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-50",
  ].join(" ");
}

function AdminNavLinks() {
  return (
    <>
      {navItems.map((item) => {
        const Icon = item.icon;
        const content = (
          <>
            <Icon className="size-4 shrink-0" aria-hidden="true" />
            {item.label}
          </>
        );

        if (item.href.startsWith("#")) {
          return (
            <a
              key={item.href}
              href={item.href}
              className={navClass(item.current)}
              aria-current={item.current ? "page" : undefined}
            >
              {content}
            </a>
          );
        }

        return (
          <Link key={item.href} href={item.href} className={navClass()}>
            {content}
          </Link>
        );
      })}
    </>
  );
}

export default function DashboardAdministradorPage() {
  const router = useRouter();
  const [checkedAuth, setCheckedAuth] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminName, setAdminName] = useState<string | null>(null);

  useEffect(() => {
    const session = getSession();
    const allowed = Boolean(session?.token && session.role === "ADMIN");
    setIsAdmin(allowed);
    setAdminName(allowed ? session?.nome ?? null : null);
    setCheckedAuth(true);
  }, []);

  useEffect(() => {
    if (checkedAuth && !isAdmin) {
      router.replace("/");
    }
  }, [checkedAuth, isAdmin, router]);

  const handleLogout = () => {
    removeSession();
    router.push("/");
  };

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
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-b from-slate-50 via-white to-sky-50/80 font-sans dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-900">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-sky-100/90 bg-white/90 px-4 py-6 backdrop-blur-xl lg:flex dark:border-zinc-800 dark:bg-zinc-950/90">
        <div className="flex items-center gap-3 px-2">
          <span className="flex size-10 items-center justify-center rounded-2xl bg-sky-600 text-white shadow-sm">
            <HeartPulse className="size-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Conecta Saúde
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Administração</p>
          </div>
        </div>

        <nav aria-label="Navegação do dashboard administrativo" className="mt-8 flex flex-col gap-1">
          <AdminNavLinks />
        </nav>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-auto inline-flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50 hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
        >
          <LogOut className="size-4" aria-hidden="true" />
          Sair
        </button>
      </aside>

      <div className="lg:pl-64">
        <div className="mx-auto w-full max-w-6xl px-5 py-6 sm:px-8 lg:py-10">
          <div className="mb-6 flex items-center gap-3 lg:hidden">
            <span className="flex size-9 items-center justify-center rounded-xl bg-sky-600 text-white">
              <HeartPulse className="size-4" aria-hidden="true" />
            </span>
            <p className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Conecta Saúde
            </p>
          </div>

          <nav
            aria-label="Navegação do dashboard administrativo"
            className="mb-8 flex items-center gap-1 overflow-x-auto lg:hidden"
          >
            <AdminNavLinks />
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium whitespace-nowrap text-zinc-600 transition hover:bg-zinc-50 hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
            >
              <LogOut className="size-4" aria-hidden="true" />
              Sair
            </button>
          </nav>

          <header id="visao-geral" className="flex scroll-mt-6 flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                Dashboard Administrativo
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                Acompanhe os principais indicadores e gerencie a plataforma Conecta Saúde.
              </p>
            </div>
            <div className="flex items-center gap-4">
              {adminName ? (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  <span className="sr-only">Administrador logado: </span>
                  {adminName}
                </p>
              ) : null}
              <ThemeToggle />
            </div>
          </header>

          <section className="mt-8 overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-[0_12px_40px_-28px_rgba(14,116,144,0.45)] dark:border-zinc-800 dark:bg-zinc-950">
            <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                  Visão geral da plataforma
                </h2>
                <p className="mt-3 max-w-lg text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
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
              <div
                aria-hidden="true"
                className="relative min-h-36 overflow-hidden rounded-2xl bg-gradient-to-br from-sky-100 via-white to-cyan-50 dark:from-sky-950/50 dark:via-zinc-900 dark:to-cyan-950/30"
              >
                <div className="absolute -top-8 -right-6 size-36 rounded-full bg-sky-200/80 blur-2xl dark:bg-sky-700/30" />
                <div className="absolute -bottom-8 left-8 size-28 rounded-full bg-cyan-200/80 blur-2xl dark:bg-cyan-700/20" />
                <div className="absolute top-8 left-10 size-16 rounded-full bg-emerald-100/80 blur-xl dark:bg-emerald-700/20" />
              </div>
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

          <section className="mt-10 rounded-2xl border border-dashed border-sky-200/90 bg-white/70 p-6 sm:p-8 dark:border-zinc-700 dark:bg-zinc-950/60">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
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
          </section>
        </div>
      </div>
    </div>
  );
}
