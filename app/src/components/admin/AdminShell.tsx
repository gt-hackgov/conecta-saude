"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";
import { getSession, removeSession } from "@/lib/authSession";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NotificacoesMenu } from "@/components/NotificacoesMenu";
import { LogoMarca } from "@/components/layout/LogoMarca";

const navItems: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/dashboard-administrador", label: "Visão geral", icon: LayoutDashboard },
  { href: "/admin/usuarios", label: "Usuários", icon: Users },
  { href: "/dashboard-administrador#indicadores", label: "Indicadores", icon: BarChart3 },
  { href: "/dashboard-administrador/auditoria", label: "Auditoria", icon: ClipboardList },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];

function isCurrent(pathname: string, href: string) {
  if (href.includes("#")) return false;
  if (href === "/dashboard-administrador") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function navClass(current: boolean, collapsed: boolean) {
  return [
    "inline-flex items-center gap-2.5 rounded-xl py-2.5 text-sm font-medium whitespace-nowrap transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600",
    collapsed ? "justify-center px-2" : "justify-center px-2 lg:justify-start lg:px-3",
    current
      ? "bg-sky-50 text-sky-800 dark:bg-sky-950/60 dark:text-sky-100"
      : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-50",
  ].join(" ");
}

function AdminNavLinks({ pathname, collapsed = false }: { pathname: string; collapsed?: boolean }) {
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
            title={item.label}
          >
            <Icon className="size-4 shrink-0" aria-hidden="true" />
            <span className={collapsed ? "sr-only" : "sr-only lg:not-sr-only"}>{item.label}</span>
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

export function AdminShell({ title, description, children }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [checkedAuth, setCheckedAuth] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminName, setAdminName] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const session = getSession();
    const allowed = Boolean(session?.token && session.role === "ADMIN");
    setIsAdmin(allowed);
    setAdminName(allowed ? session?.nome ?? null : null);
    setCollapsed(localStorage.getItem("conectaAdminSidebar") === "collapsed");
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

  const toggleSidebar = () => {
    setCollapsed((current) => {
      const next = !current;
      localStorage.setItem("conectaAdminSidebar", next ? "collapsed" : "expanded");
      return next;
    });
  };

  if (!checkedAuth || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-b from-slate-50 via-white to-sky-50/80 font-sans dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-900">
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex flex-col border-r border-sky-100/90 bg-white/90 py-6 backdrop-blur-xl transition-[width,padding] duration-200 dark:border-zinc-800 dark:bg-zinc-950/90 ${
          collapsed ? "w-20 px-2" : "w-20 px-2 lg:w-64 lg:px-4"
        }`}
      >
        <Link
          href="/dashboard-administrador"
          className={collapsed ? "mx-auto flex size-10 items-center justify-center" : "mx-auto flex size-10 items-center justify-center lg:mx-0 lg:block lg:size-auto lg:px-2"}
        >
          <span className="lg:hidden">
            <LogoMarca compacto />
          </span>
          <span className="hidden lg:block">
            <LogoMarca compacto={collapsed} />
          </span>
        </Link>

        <nav aria-label="Navegação do dashboard administrativo" className="mt-8 flex flex-col gap-1">
          <AdminNavLinks pathname={pathname} collapsed={collapsed} />
        </nav>

        <div className="mt-auto flex flex-col gap-1">
          <NotificacoesMenu
            collapsed={collapsed}
            className={`inline-flex w-full items-center gap-2.5 rounded-xl py-2.5 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50 hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-50 ${
              collapsed ? "justify-center px-2" : "justify-center px-2 lg:justify-start lg:px-3"
            }`}
          />
          <button
            type="button"
            onClick={toggleSidebar}
            aria-expanded={!collapsed}
            aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
            title={collapsed ? "Expandir menu" : "Recolher menu"}
            className={`hidden items-center gap-2.5 rounded-xl py-2.5 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50 hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 lg:inline-flex dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-50 ${
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
            title="Sair"
            className={`inline-flex items-center gap-2.5 rounded-xl py-2.5 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50 hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-50 ${
              collapsed ? "justify-center px-2" : "justify-center px-2 lg:justify-start lg:px-3"
            }`}
          >
            <LogOut className="size-4" aria-hidden="true" />
            <span className={collapsed ? "sr-only" : "sr-only lg:not-sr-only"}>Sair</span>
          </button>
        </div>
      </aside>

      <div className={`transition-[padding] duration-200 pl-20 ${collapsed ? "lg:pl-20" : "lg:pl-64"}`}>
        <div className="mx-auto w-full max-w-[1400px] px-5 py-6 sm:px-8 lg:py-10">
          <main>
          <header className="flex items-start justify-between gap-4 sm:items-end">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                {title}
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                {description}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-4">
              {adminName ? (
                <p className="hidden text-sm sm:block text-zinc-500 dark:text-zinc-400">
                  <span className="sr-only">Administrador logado: </span>
                  {adminName}
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
