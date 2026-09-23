"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  CalendarDays,
  CalendarPlus,
  FileText,
  HeartPulse,
  Siren,
  LogOut,
  MapPin,
  MessageCircle,
  ShieldCheck,
  TestTube,
} from "lucide-react";
import { FeatureCard } from "@/components/FeatureCard";
import { ChatModal } from "@/components/ChatModal";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getSession, removeSession } from "@/lib/authSession";
import { BottomNav } from "@/components/BottomNav";

type Notification = {
  id: string;
  title: string;
  message: string;
  time: string;
};

function extractNotificationsError(payload: unknown, status: number): string {
  if (status === 403) return "Acesso não permitido às notificações.";
  if (status >= 500) return "Erro ao carregar notificações.";

  if (payload && typeof payload === "object") {
    const data = payload as {
      message?: unknown;
      error?: unknown;
    };

    if (typeof data.message === "string" && data.message.trim()) {
      return data.message;
    }

    if (typeof data.error === "string" && data.error.trim()) {
      return data.error;
    }
  }

  return "Não foi possível carregar as notificações.";
}

async function readErrorPayload(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export default function DashboardPage() {
  const router = useRouter();
  const [userName, setUserName] = useState<string | null>(null);
  const [checkedAuth, setCheckedAuth] = useState(false);
  const [isPaciente, setIsPaciente] = useState(false);

  useEffect(() => {
    const session = getSession();
    const allowed = Boolean(session?.token && session.role === "PACIENTE");
    setIsPaciente(allowed);
    setUserName(allowed ? session?.nome ?? null : null);
    setCheckedAuth(true);
  }, []);
    
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const [notificationsError, setNotificationsError] = useState("");
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const displayName = useMemo(() => userName ?? "Usuário", [userName]);

  useEffect(() => {
    if (checkedAuth && !isPaciente) {
      router.replace("/");
    }
  }, [checkedAuth, isPaciente, router]);

  useEffect(() => {
    if (!checkedAuth || !isPaciente) return;

    const session = getSession();
    if (!session?.token || session.role !== "PACIENTE") {
      return;
    }

    const loadNotifications = async () => {
      setNotificationsLoading(true);
      setNotificationsError("");

      try {
        const response = await fetch("/api/notifications", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.token}`,
          },
        });

        if (response.status === 401) {
          removeSession();
          router.replace("/");
          return;
        }

        if (!response.ok) {
          const payload = await readErrorPayload(response);
          setNotificationsError(extractNotificationsError(payload, response.status));
          setNotifications([]);
          return;
        }

        const data = (await response.json()) as { notifications?: unknown };
        const list = Array.isArray(data.notifications)
          ? (data.notifications as Notification[])
          : [];
        setNotifications(list);
      } catch {
        setNotificationsError("Não foi possível carregar as notificações.");
        setNotifications([]);
      } finally {
        setNotificationsLoading(false);
      }
    };

    loadNotifications();
  }, [checkedAuth, isPaciente, router]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  const welcomeMessage = useMemo(() => {
    if (!userName) return "Olá";
    return `Olá, ${userName}!`;
  }, [userName]);

  const handleLogout = () => {
    removeSession();
    router.push("/");
  };

  if (!checkedAuth || !isPaciente) {
    return null;
  }

  return (
    <div className="relative isolate min-h-screen overflow-x-hidden bg-gradient-to-b from-slate-50 via-white to-indigo-50/60 px-5 pt-5 pb-28 font-sans sm:px-6 dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-900">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 -right-24 size-[460px] rounded-full bg-indigo-300/25 blur-3xl dark:bg-indigo-900/20" />
        <div className="absolute top-1/3 -left-40 size-[420px] rounded-full bg-sky-200/30 blur-3xl dark:bg-sky-950/25" />
      </div>

      <div className="mx-auto w-full max-w-6xl">
        <header className="sticky top-4 z-30 flex items-center justify-between gap-4 rounded-full bg-white/70 py-2.5 pr-2.5 pl-4 ring-1 ring-zinc-900/5 backdrop-blur-xl dark:bg-zinc-900/70 dark:ring-white/10">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 text-white shadow-md shadow-indigo-500/25">
              <HeartPulse className="size-4.5" aria-hidden="true" />
            </span>
            <span className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Conecta Saúde
            </span>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />

            <div ref={dropdownRef} className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="relative flex size-10 items-center justify-center rounded-full text-zinc-600 transition hover:bg-zinc-900/5 hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:text-zinc-300 dark:hover:bg-white/10 dark:hover:text-white"
                aria-label="Notificações"
                aria-expanded={dropdownOpen}
              >
                <Bell className="size-5" aria-hidden="true" />
                {!notificationsLoading && !notificationsError && notifications.length > 0 ? (
                  <span className="absolute top-2 right-2.5 size-2 rounded-full bg-indigo-600 ring-2 ring-white dark:ring-zinc-900" />
                ) : null}
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full z-40 mt-3 w-72 overflow-hidden rounded-2xl bg-white/90 shadow-[0_24px_60px_-24px_rgba(15,23,42,0.35)] ring-1 ring-zinc-900/5 backdrop-blur-xl dark:bg-zinc-900/95 dark:ring-white/10">
                  <p className="px-4 pt-4 pb-2 text-[11px] font-semibold tracking-[0.14em] text-zinc-400 uppercase dark:text-zinc-500">
                    Notificações
                  </p>
                  <ul className="pb-2">
                    {notificationsLoading ? (
                      <li className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-300">
                        Carregando...
                      </li>
                    ) : notificationsError ? (
                      <li className="px-4 py-3 text-sm text-red-600 dark:text-red-300">
                        {notificationsError}
                      </li>
                    ) : notifications.length === 0 ? (
                      <li className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-300">
                        Nenhuma notificação disponível.
                      </li>
                    ) : (
                      notifications.map((notification) => (
                        <li key={notification.id}>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedNotification(notification);
                              setDropdownOpen(false);
                            }}
                            className="w-full px-4 py-3 text-left text-sm text-zinc-700 transition hover:bg-zinc-900/5 dark:text-zinc-200 dark:hover:bg-white/5"
                          >
                            <span className="block font-medium">{notification.title}</span>
                            {notification.time ? (
                              <span className="mt-1 block text-xs text-zinc-500 dark:text-zinc-400">
                                {notification.time}
                              </span>
                            ) : null}
                          </button>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="flex h-10 items-center gap-2 rounded-full bg-zinc-900/5 px-4 text-sm font-medium text-zinc-700 transition hover:bg-zinc-900/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:bg-white/10 dark:text-zinc-100 dark:hover:bg-white/15"
            >
              <LogOut className="size-4" aria-hidden="true" />
              Sair
            </button>
          </div>
        </header>

        <section className="relative mt-6 overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-600 via-indigo-500 to-blue-500 px-8 py-12 text-white shadow-[0_30px_70px_-35px_rgba(79,70,229,0.7)] sm:px-12 sm:py-16">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay"
          />
          <div
            aria-hidden="true"
            className="absolute -top-24 -right-20 size-72 rounded-full bg-white/15 blur-3xl"
          />

          <div className="relative max-w-xl">
            <p className="text-[11px] font-semibold tracking-[0.18em] text-white/70 uppercase">
              Painel do paciente
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
              {welcomeMessage}
            </h1>
            <p className="mt-4 text-base leading-relaxed text-white/85">
              Selecione uma opção abaixo para continuar cuidando da sua saúde.
            </p>

            <div className="mt-7 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-medium text-white/90 ring-1 ring-white/20 backdrop-blur-sm">
              <ShieldCheck className="size-4" aria-hidden="true" />
              Seus dados estão protegidos
            </div>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="px-1 text-[11px] font-semibold tracking-[0.16em] text-zinc-500 uppercase dark:text-zinc-400">
            Serviços
          </h2>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <FeatureCard
              title="Agendar consulta"
              description="Escolha data e horário para sua próxima consulta."
              onClick={() => router.push("/agendar-consulta")}
              icon={<CalendarPlus className="size-5" aria-hidden="true" />}
            />
            <FeatureCard
              title="Consultas agendadas"
              description="Veja suas consultas marcadas e histórico de agendamentos."
              onClick={() => router.push("/consultas-agendadas")}
              icon={<CalendarDays className="size-5" aria-hidden="true" />}
            />
            <FeatureCard
              title="Agendar exame"
              description="Escolha o tipo de exame e o local de coleta."
              onClick={() => router.push("/agendar-exame")}
              icon={<TestTube className="size-5" aria-hidden="true" />}
            />
            <FeatureCard
              title="Resultado de exames"
              description="Veja os resultados dos exames já realizados."
              onClick={() => router.push("/resultado-exames")}
              icon={<FileText className="size-5" aria-hidden="true" />}
            />
            <FeatureCard
              title="O que você tem? UBS ou UPA"
              description="Responda o que está sentindo e saiba se deve ir à UBS, à UPA ou ligar 192."
              onClick={() => router.push("/o-que-voce-tem")}
              icon={<Siren className="size-5" aria-hidden="true" />}
            />
            <FeatureCard
              title="Procurar UBS ou UPA"
              description="Veja as especialidades de cada unidade no mapa e trace a rota."
              onClick={() => router.push("/buscar-ubs")}
              icon={<MapPin className="size-5" aria-hidden="true" />}
            />
            <FeatureCard
              title="Histórico de vacinas"
              description="Consulte suas doses aplicadas e as próximas previstas."
              onClick={() => router.push("/historico-vacinas")}
              icon={<ShieldCheck className="size-5" aria-hidden="true" />}
            />
          </div>
        </section>

        <section className="mt-10 grid overflow-hidden rounded-[2rem] bg-white/70 ring-1 ring-zinc-900/5 backdrop-blur-xl md:grid-cols-[1.05fr_1fr] dark:bg-zinc-900/60 dark:ring-white/10">
          <div className="p-8 sm:p-10">
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Precisa de ajuda?
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              Fale com o assistente virtual do Conecta Saúde para tirar dúvidas sobre consultas,
              exames e unidades de atendimento.
            </p>
            <button
              type="button"
              onClick={() => setIsChatOpen(true)}
              className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-zinc-900 px-6 text-sm font-medium text-white transition hover:bg-zinc-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              <MessageCircle className="size-4" aria-hidden="true" />
              Abrir assistente
            </button>
          </div>

          <div className="relative min-h-56 bg-gradient-to-br from-indigo-100 via-sky-100 to-indigo-50 dark:from-indigo-950/40 dark:via-sky-950/30 dark:to-zinc-900">
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-dashboard-care bg-cover bg-center"
            />
          </div>
        </section>
      </div>

      <div className="fixed right-6 bottom-24 z-40">
        <button
          onClick={() => setIsChatOpen(true)}
          className="flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 text-white shadow-[0_16px_32px_-12px_rgba(79,70,229,0.65)] transition hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
          aria-label="Abrir chat"
        >
          <MessageCircle className="size-6" aria-hidden="true" />
        </button>
      </div>

      {selectedNotification ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-[0_30px_70px_-30px_rgba(15,23,42,0.5)] ring-1 ring-zinc-900/5 dark:bg-zinc-900 dark:ring-white/10">
            <h3 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              {selectedNotification.title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed whitespace-pre-wrap text-zinc-600 dark:text-zinc-400">
              {selectedNotification.message}
            </p>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedNotification(null)}
                className="h-10 rounded-full bg-zinc-900/5 px-5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-900/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:bg-white/10 dark:text-zinc-100 dark:hover:bg-white/15"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <ChatModal open={isChatOpen} onClose={() => setIsChatOpen(false)} userName={displayName} />

      <BottomNav />
    </div>
  );
}
