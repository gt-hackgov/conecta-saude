"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  CalendarDays,
  LayoutDashboard,
  ListOrdered,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  type LucideIcon,
} from "lucide-react";
import { getSession, removeSession } from "@/lib/authSession";
import { ThemeToggle } from "@/components/ThemeToggle";

const navItems: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/dashboard-medico", label: "Visão geral", icon: LayoutDashboard },
  { href: "/dashboard-medico/fila", label: "Fila de atendimento", icon: ListOrdered },
  { href: "/dashboard-medico/consultas", label: "Consultas de hoje", icon: CalendarDays },
  { href: "/dashboard-medico/indicadores", label: "Indicadores", icon: BarChart3 },
];

function isCurrent(pathname: string, href: string) {
  if (href === "/dashboard-medico") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function navClass(current: boolean, collapsed: boolean) {
  return [
    "inline-flex items-center gap-2.5 rounded-xl py-2.5 text-sm font-medium whitespace-nowrap transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600",
    collapsed ? "justify-center px-2" : "px-3",
    current
      ? "bg-sky-50 text-sky-800 dark:bg-sky-950/60 dark:text-sky-100"
      : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-50",
  ].join(" ");
}

function MedicoNavLinks({ pathname, collapsed = false }: { pathname: string; collapsed?: boolean }) {
  return (
    <>
      {navItems.map((item) => {
        const Icon = item.icon;
        const current = isCurrent(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={navClass(current, collapsed)}
            aria-current={current ? "page" : undefined}
            title={collapsed ? item.label : undefined}
          >
            <Icon className="size-4 shrink-0" aria-hidden="true" />
            <span className={collapsed ? "sr-only" : undefined}>{item.label}</span>
          </Link>
        );
      })}
    </>
  );
}

type Props = {
  title: string;
  description: string;
  children: React.ReactNode;
};

export function MedicoShell({ title, description, children }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [checkedAuth, setCheckedAuth] = useState(false);
  const [isMedico, setIsMedico] = useState(false);
  const [medicoName, setMedicoName] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const session = getSession();
    const allowed = Boolean(session?.token && session.role === "MEDICO");
    setIsMedico(allowed);
    setMedicoName(allowed ? session?.nome ?? null : null);
    setCollapsed(localStorage.getItem("conectaMedicoSidebar") === "collapsed");
    setCheckedAuth(true);
  }, []);

  useEffect(() => {
    if (checkedAuth && !isMedico) {
      router.replace("/");
    }
  }, [checkedAuth, isMedico, router]);

  const handleLogout = () => {
    removeSession();
    router.push("/");
  };

  const toggleSidebar = () => {
    setCollapsed((current) => {
      const next = !current;
      localStorage.setItem("conectaMedicoSidebar", next ? "collapsed" : "expanded");
      return next;
    });
  };

  if (!checkedAuth || !isMedico) {
    return null;
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-b from-slate-50 via-white to-sky-50/80 font-sans dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-900">
      <aside
        className={`fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-sky-100/90 bg-white/90 py-6 backdrop-blur-xl transition-[width,padding] duration-200 lg:flex dark:border-zinc-800 dark:bg-zinc-950/90 ${
          collapsed ? "w-20 px-2" : "w-64 px-4"
        }`}
      >
        <Link
          href="/dashboard-medico"
          className={collapsed ? "mx-auto flex size-10 items-center justify-center" : "px-2"}
        >
          <img
            src={collapsed ? "/logo-conecta.png" : "/conecta_saude_logo_transparente_8k.png"}
            alt="Conecta Saúde"
            className={
              collapsed
                ? "size-10 object-contain"
                : "h-auto w-full dark:rounded-lg dark:bg-white dark:p-1.5"
            }
          />
        </Link>

        <nav aria-label="Navegação do painel do médico" className="mt-8 flex flex-col gap-1">
          <MedicoNavLinks pathname={pathname} collapsed={collapsed} />
        </nav>

        <div className="mt-auto flex flex-col gap-1">
          <button
            type="button"
            onClick={toggleSidebar}
            aria-expanded={!collapsed}
            aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
            title={collapsed ? "Expandir menu" : "Recolher menu"}
            className={`inline-flex items-center gap-2.5 rounded-xl py-2.5 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50 hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-50 ${
              collapsed ? "justify-center px-2" : "px-3"
            }`}
          >
            {collapsed ? (
              <PanelLeftOpen className="size-4" aria-hidden="true" />
            ) : (
              <PanelLeftClose className="size-4" aria-hidden="true" />
            )}
            <span className={collapsed ? "sr-only" : undefined}>
              {collapsed ? "Expandir" : "Recolher"}
            </span>
          </button>
          <button
            type="button"
            onClick={handleLogout}
            title={collapsed ? "Sair" : undefined}
            className={`inline-flex items-center gap-2.5 rounded-xl py-2.5 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50 hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-50 ${
              collapsed ? "justify-center px-2" : "px-3"
            }`}
          >
            <LogOut className="size-4" aria-hidden="true" />
            <span className={collapsed ? "sr-only" : undefined}>Sair</span>
          </button>
        </div>
      </aside>

      <div className={`transition-[padding] duration-200 ${collapsed ? "lg:pl-20" : "lg:pl-64"}`}>
        <div className="mx-auto w-full max-w-6xl px-5 py-6 sm:px-8 lg:py-10">
          <div className="mb-6 max-w-56 lg:hidden">
            <Link href="/dashboard-medico">
              <img
                src="/conecta_saude_logo_transparente_8k.png"
                alt="Conecta Saúde"
                className="h-auto w-full dark:rounded-lg dark:bg-white dark:p-1.5"
              />
            </Link>
          </div>

          <nav
            aria-label="Navegação do painel do médico"
            className="mb-8 flex items-center gap-1 overflow-x-auto lg:hidden"
          >
            <MedicoNavLinks pathname={pathname} />
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium whitespace-nowrap text-zinc-600 transition hover:bg-zinc-50 hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
            >
              <LogOut className="size-4" aria-hidden="true" />
              Sair
            </button>
          </nav>

          <main>
            <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                  {title}
                </h1>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {description}
                </p>
              </div>
              <div className="flex items-center gap-4">
                {medicoName ? (
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    <span className="sr-only">Médico logado: </span>
                    {medicoName}
                  </p>
                ) : null}
                <ThemeToggle />
              </div>
            </header>

            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
