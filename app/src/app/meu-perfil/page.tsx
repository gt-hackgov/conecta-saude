"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getHomeHref, getSession, type AuthSession } from "@/lib/authSession";
import { ThemeToggle } from "@/components/ThemeToggle";
import { BottomNav } from "@/components/BottomNav";

const roleLabel: Record<string, string> = {
  PACIENTE: "Paciente",
  MEDICO: "Profissional de saúde",
  ADMIN: "Administrador da UBS",
};

export default function MeuPerfilPage() {
  const router = useRouter();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const current = getSession();
    setSession(current?.token ? current : null);
    setChecked(true);
  }, []);

  useEffect(() => {
    if (checked && !session) {
      router.replace("/");
    }
  }, [checked, session, router]);

  if (!checked || !session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-indigo-50 to-white px-6 py-10 pb-24 dark:bg-none dark:bg-zinc-900">
      <div className="mx-auto w-full max-w-2xl">
        <header className="flex items-center justify-between rounded-3xl bg-white p-8 shadow-lg dark:bg-zinc-950">
          <div>
            <p className="text-sm font-semibold text-indigo-600">Meu perfil</p>
            <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
              {session.nome}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push(getHomeHref())}
              className="inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900"
            >
              Voltar ao painel
            </button>
            <ThemeToggle />
          </div>
        </header>

        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm dark:bg-zinc-950">
          <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Perfil de acesso
          </p>
          <p className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            {roleLabel[session.role] ?? session.role}
          </p>
        </section>
      </div>

      <BottomNav />
    </div>
  );
}
