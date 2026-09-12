"use client";

import { useState } from "react";
import Link from "next/link";
import { LoginModal } from "@/components/LoginModal";

export default function Home() {
  const [showLogin, setShowLogin] = useState(false);

  return (
        <div className="flex min-h-screen flex-col bg-gradient-to-b from-slate-50 via-white to-indigo-50 text-zinc-900 dark:bg-none dark:bg-zinc-900 dark:text-zinc-50">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white">
            CS
          </div>
          <div>
            <p className="text-sm font-semibold tracking-wide">Conecta Saúde</p>
            <p className="text-xs text-zinc-600">Acesso aos seus serviços de saúde</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowLogin(true)}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
          >
            Entrar
          </button>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-6 pb-20">
        <section className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="space-y-6">
            <h1 className="text-4xl font-semibold leading-tight tracking-tight text-zinc-900 sm:text-5xl">
              Bem-vindo ao Conecta Saúde
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-zinc-700">
              Acesse seus serviços de saúde de maneira simples e segura. Agende consultas, confira seus exames
              e encontre a UBS mais próxima usando um único lugar.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setShowLogin(true)}
                className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
              >
                Entrar com gov.br
              </button>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-10 shadow-lg ring-1 ring-zinc-100 dark:bg-zinc-950 dark:ring-zinc-800">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Como funciona</h2>
            <ul className="mt-6 space-y-4 text-sm text-zinc-600 dark:text-zinc-400">
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-indigo-600" />
                Acesse com sua conta gov.br para ativar todos os serviços.
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-indigo-600" />
                Agende consultas e exames em poucos cliques.
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-indigo-600" />
                Veja resultados e procure a UBS mais próxima.
              </li>
            </ul>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-200 bg-white py-8 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-6 text-center">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Desenvolvido pelo grupo HackGov — Conecta Saúde
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {[
              { nome: "Bruna Boschi Santos", github: "https://github.com/bruboschi" },
              { nome: "Gabriela de Carvalho Gonçalves", github: "https://github.com/gabcrvlh" },
              { nome: "Lívia Scoralick", github: "https://github.com/lilicoralick" },
              { nome: "Michael Marotto", github: "https://github.com/marottomichael" },
              { nome: "Davi Grabalos", github: "https://github.com/davigrabalos" },
            ].map((integrante) => (
              <a
                key={integrante.nome}
                href={integrante.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm text-zinc-600 transition hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49 0-.24-.01-1.04-.01-1.89-2.78.62-3.37-1.21-3.37-1.21-.45-1.18-1.11-1.5-1.11-1.5-.9-.63.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.05 0-1.12.39-2.03 1.03-2.74-.1-.26-.45-1.31.1-2.72 0 0 .84-.27 2.75 1.05a9.4 9.4 0 0 1 2.5-.34c.85 0 1.71.12 2.5.34 1.91-1.32 2.75-1.05 2.75-1.05.55 1.41.2 2.46.1 2.72.64.71 1.03 1.62 1.03 2.74 0 3.92-2.35 4.78-4.58 5.04.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.6.69.49A10.26 10.26 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z"/>
                </svg>
                {integrante.nome}
              </a>
            ))}
          </div>
          <p className="text-xs text-zinc-400">Todos os direitos reservados.</p>
        </div>
      </footer>

      <LoginModal open={showLogin} onClose={() => setShowLogin(false)} />
    </div>
  );
}
