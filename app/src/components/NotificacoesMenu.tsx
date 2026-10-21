"use client";

import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { getSession } from "@/lib/authSession";

type Notification = {
  id: string;
  title: string;
  message: string;
  time: string;
};

type Props = {
  /** Mostra só o ícone (menu lateral recolhido). */
  collapsed: boolean;
  className: string;
};

/** Notificações no menu lateral dos painéis de médico e administrador (GET /api/notifications). */
export function NotificacoesMenu({ collapsed, className }: Props) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Notification | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = getSession()?.token;
    if (!token) return;

    const load = async () => {
      try {
        const response = await fetch("/api/notifications", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          setError("Não foi possível carregar as notificações.");
          return;
        }
        const data = (await response.json()) as { notifications?: unknown };
        setNotifications(Array.isArray(data.notifications) ? (data.notifications as Notification[]) : []);
      } catch {
        setError("Não foi possível carregar as notificações.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const hasNew = !loading && !error && notifications.length > 0;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        title="Notificações"
        className={className}
      >
        <span className="relative">
          <Bell className="size-4 shrink-0" aria-hidden="true" />
          {hasNew ? (
            <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-sky-600 ring-2 ring-white dark:ring-zinc-950" />
          ) : null}
        </span>
        <span className={collapsed ? "sr-only" : "sr-only lg:not-sr-only"}>Notificações</span>
      </button>

      {open ? (
        <div className="absolute bottom-0 left-full z-40 ml-3 w-72 overflow-hidden rounded-2xl bg-white shadow-[0_24px_60px_-24px_rgba(15,23,42,0.35)] ring-1 ring-zinc-900/5 dark:bg-zinc-900 dark:ring-white/10">
          <p className="px-4 pt-4 pb-2 text-[11px] font-semibold tracking-[0.14em] text-zinc-400 uppercase dark:text-zinc-500">
            Notificações
          </p>
          <ul className="max-h-80 overflow-y-auto pb-2">
            {loading ? (
              <li className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-300">Carregando...</li>
            ) : error ? (
              <li className="px-4 py-3 text-sm text-red-600 dark:text-red-300">{error}</li>
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
                      setSelected(notification);
                      setOpen(false);
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
      ) : null}

      {selected ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-[0_30px_70px_-30px_rgba(15,23,42,0.5)] ring-1 ring-zinc-900/5 dark:bg-zinc-900 dark:ring-white/10">
            <h3 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              {selected.title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed whitespace-pre-wrap text-zinc-600 dark:text-zinc-400">
              {selected.message}
            </p>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="h-10 rounded-full bg-zinc-900/5 px-5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-900/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 dark:bg-white/10 dark:text-zinc-100 dark:hover:bg-white/15"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
