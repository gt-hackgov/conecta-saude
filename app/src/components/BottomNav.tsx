"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Home, Menu, Settings, User } from "lucide-react";
import { getHomeHref, removeSession } from "@/lib/authSession";

export function BottomNav() {
  const router = useRouter();
  const [menuAberto, setMenuAberto] = useState(false);

  const handleSair = () => {
    removeSession();
    router.push("/");
  };

  return (
    <>
      {menuAberto ? (
        <div
          className="fixed inset-0 z-40 bg-black/20"
          onClick={() => setMenuAberto(false)}
        />
      ) : null}

      {menuAberto ? (
        <div className="fixed bottom-20 right-4 z-50 w-64 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
          <button
            type="button"
            onClick={() => {
              setMenuAberto(false);
              router.push("/meu-perfil");
            }}
            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-zinc-700 hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-zinc-900"
          >
            Meu perfil
          </button>
          <button
            type="button"
            disabled
            className="flex w-full items-center justify-between px-4 py-3 text-left text-sm text-zinc-300 dark:text-zinc-700"
          >
            Dúvidas frequentes <span className="text-[10px]">em breve</span>
          </button>
          <p className="px-4 pt-3 text-[10px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-600">
            Privacidade
          </p>
          <button
            type="button"
            disabled
            className="flex w-full items-center justify-between px-4 py-3 text-left text-sm text-zinc-300 dark:text-zinc-700"
          >
            Histórico de acessos <span className="text-[10px]">em breve</span>
          </button>
          <button
            type="button"
            disabled
            className="flex w-full items-center justify-between px-4 py-3 text-left text-sm text-zinc-300 dark:text-zinc-700"
          >
            Portal de Privacidade <span className="text-[10px]">em breve</span>
          </button>
          <button
            type="button"
            disabled
            className="flex w-full items-center justify-between border-b border-zinc-100 px-4 py-3 text-left text-sm text-zinc-300 dark:border-zinc-800 dark:text-zinc-700"
          >
            Termos de Uso <span className="text-[10px]">em breve</span>
          </button>
          <button
            type="button"
            onClick={handleSair}
            className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
          >
            Sair
          </button>
        </div>
      ) : null}

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto flex max-w-5xl items-center justify-around px-6 py-2">
          <button
            type="button"
            onClick={() => router.push(getHomeHref())}
            className="flex flex-col items-center gap-1 px-4 py-1 text-zinc-500 transition hover:text-indigo-600 dark:text-zinc-400"
          >
            <Home className="size-[22px] shrink-0" aria-hidden="true" />
            <span className="text-[11px]">Início</span>
          </button>

          <button
            type="button"
            onClick={() => router.push("/meu-perfil")}
            className="flex flex-col items-center gap-1 px-4 py-1 text-zinc-500 transition hover:text-indigo-600 dark:text-zinc-400"
          >
            <User className="size-[22px] shrink-0" aria-hidden="true" />
            <span className="text-[11px]">Perfil</span>
          </button>

          <button
            type="button"
            onClick={() => router.push("/configuracoes")}
            className="flex flex-col items-center gap-1 px-4 py-1 text-zinc-500 transition hover:text-indigo-600 dark:text-zinc-400"
          >
            <Settings className="size-[22px] shrink-0" aria-hidden="true" />
            <span className="text-[11px]">Config.</span>
          </button>

          <button
            type="button"
            onClick={() => setMenuAberto((v) => !v)}
            className="flex flex-col items-center gap-1 px-4 py-1 text-zinc-500 transition hover:text-indigo-600 dark:text-zinc-400"
          >
            <Menu className="size-[22px] shrink-0" aria-hidden="true" />
            <span className="text-[11px]">Mais</span>
          </button>
        </div>
      </nav>
    </>
  );
}
