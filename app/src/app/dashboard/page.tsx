"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { FeatureCard } from "@/components/FeatureCard";
import { ChatModal } from "@/components/ChatModal";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getSession, removeSession } from "@/lib/authSession";

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

  const handleAction = (action: string) => {
    alert(`Função: ${action} (demo)`);
  };

  if (!checkedAuth || !isPaciente) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-indigo-50 to-white px-6 py-10 dark:bg-none dark:bg-zinc-900">
      <div className="mx-auto w-full max-w-6xl">
        <header className="relative flex flex-col gap-6 rounded-3xl bg-white p-8 shadow-lg dark:bg-zinc-950">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-indigo-600">Painel do usuário</p>
              <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50">{welcomeMessage}</h1>
              <p className="mt-2 max-w-xl text-sm text-zinc-600 dark:text-zinc-400">
                Selecione uma opção abaixo para continuar.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <ThemeToggle />
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="rounded-xl border border-zinc-200 bg-white p-2 text-sm shadow-sm transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900"
                aria-label="Notificações"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C10.896 2 10 2.896 10 4V5.586L7.707 8.293C7.512 8.488 7.256 8.744 7.061 9.061L4.707 11.414C4.512 11.609 4.256 11.865 4.061 12.182L2 14.182V16H22V14.182L19.939 12.182C19.744 11.865 19.488 11.609 19.293 11.414L16.939 9.061C16.744 8.744 16.488 8.488 16.293 8.293L14 5.586V4C14 2.896 13.104 2 12 2Z" fill="currentColor"/>
                  <path d="M12 22C13.1046 22 14 21.1046 14 20H10C10 21.1046 10.8954 22 12 22Z" fill="currentColor"/>
                </svg>
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900"
              >
                Sair
              </button>
            </div>
          </div>

          {dropdownOpen && (
            <div
              ref={dropdownRef}
              className="absolute right-24 mt-16 w-64 rounded-xl bg-white shadow-lg dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700"
            >
              <ul className="py-2">
                {notificationsLoading ? (
                  <li className="px-4 py-2 text-sm text-zinc-700 dark:text-zinc-200">
                    Carregando...
                  </li>
                ) : notificationsError ? (
                  <li className="px-4 py-2 text-sm text-red-600 dark:text-red-300">
                    {notificationsError}
                  </li>
                ) : notifications.length === 0 ? (
                  <li className="px-4 py-2 text-sm text-zinc-700 dark:text-zinc-200">
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
                        className="w-full px-4 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
                      >
                        <span className="block">{notification.title}</span>
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
        </header>

        <section className="mt-10 grid gap-6 md:grid-cols-2">
          <FeatureCard
            title="Agendar consulta"
            description="Escolha data e horário para sua próxima consulta."
            onClick={() => router.push("/agendar-consulta")}
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.6"/>
                <path d="M12 7.5v9M7.5 12h9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            }
          />
          <FeatureCard
            title="Consultas agendadas"
            description="Veja suas consultas marcadas e histórico de agendamentos."
            onClick={() => router.push("/consultas-agendadas")}
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.6"/>
                <path d="M3 9h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
            }
          />
          <FeatureCard
            title="Agendar exame"
            description="Escolha o tipo de exame e o local de coleta."
            onClick={() => handleAction("Agendar exame")}
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
              </svg>
            }
          />
          <FeatureCard
            title="Resultado de exames"
            description="Veja os resultados dos exames já realizados."
            onClick={() => router.push("/resultado-exames")}
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 3h7l4 4v14H7z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
                <path d="M14 3v4h4" stroke="currentColor" strokeWidth="1.6"/>
                <path d="M9 12h6M9 16h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
            }
          />
          <FeatureCard
            title="Procurar UBS mais próxima"
            description="Encontre a unidade básica de saúde mais próxima de você."
            onClick={() => router.push("/buscar-ubs")}
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22s7-7.58 7-12a7 7 0 1 0-14 0c0 4.42 7 12 7 12Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
                <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.6"/>
              </svg>
            }
          />
          <FeatureCard
            title="Histórico de vacinas"
            description="Consulte suas doses aplicadas e as próximas previstas."
            onClick={() => router.push("/historico-vacinas")}
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 3l7 3v6c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6l7-3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
                <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            }
          />
        </section>
      </div>

      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsChatOpen(true)}
          className="rounded-full bg-indigo-600 p-4 text-white shadow-lg transition hover:bg-indigo-700"
          aria-label="Abrir chat"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12c0 1.54.36 3.05 1.05 4.42L2 22l5.58-1.05C9.95 21.64 11.46 22 13 22h7c1.1 0 2-.9 2-2V12c0-5.52-4.48-10-10-10z" fill="currentColor"/>
          </svg>
        </button>
      </div>

      {selectedNotification ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl dark:bg-zinc-900">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              {selectedNotification.title}
            </h3>
            <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-600 dark:text-zinc-400">
              {selectedNotification.message}
            </p>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedNotification(null)}
                className="rounded-xl bg-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <ChatModal open={isChatOpen} onClose={() => setIsChatOpen(false)} userName={displayName} />
    </div>
  );
}
