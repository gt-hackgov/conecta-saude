"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getHomeHref, getSession, type AuthSession } from "@/lib/authSession";
import { ThemeToggle } from "@/components/ThemeToggle";
import { BottomNav } from "@/components/BottomNav";
import { listarAuditoria, type RegistroAuditoria } from "@/lib/auditLog";

const acaoLabel: Record<string, string> = {
  LOGIN: "Entrada no sistema",
  CONSULTA_DADO_SENSIVEL: "Consulta à sua ficha",
  EXPORTACAO_DADOS: "Download / exportação de dados",
  CANCELAMENTO_AGENDAMENTO: "Cancelamento de agendamento",
};

const roleLabel: Record<string, string> = {
  PACIENTE: "Paciente",
  MEDICO: "Profissional de saúde",
  ADMIN: "Administrador da UBS",
  AUDITOR: "Auditor",
};

export default function MeuPerfilPage() {
  const router = useRouter();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [checked, setChecked] = useState(false);
  const [historico, setHistorico] = useState<RegistroAuditoria[]>([]);

  useEffect(() => {
    const current = getSession();
    setSession(current?.token ? current : null);
    setChecked(true);
    if (current?.nome) {
      // Transparência (LGPD, art. 9º e 18): o titular vê as ações feitas na conta dele
      // e os acessos de profissionais aos dados dele.
      setHistorico(
        listarAuditoria()
          .filter((r) => r.ator === current.nome || r.alvo.includes(current.nome))
          .slice(0, 20)
      );
    }
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

        {session.role === "PACIENTE" ? (
          <button
            type="button"
            onClick={() => router.push("/minha-ficha-saude")}
            className="mt-6 flex w-full items-center justify-between rounded-2xl bg-white p-6 text-left shadow-sm transition hover:bg-zinc-50 dark:bg-zinc-950 dark:hover:bg-zinc-900"
          >
            <div>
              <p className="font-semibold text-zinc-900 dark:text-zinc-100">Minha ficha de saúde</p>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Tipo sanguíneo, alergias, dependentes e mais.
              </p>
            </div>
            <span className="text-indigo-600 dark:text-indigo-400">→</span>
          </button>
        ) : null}

        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm dark:bg-zinc-950">
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">Histórico de acessos</h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Por transparência (LGPD), você pode ver quem acessou ou baixou seus dados e quando.
          </p>
          <ul className="mt-4 divide-y divide-zinc-100 dark:divide-zinc-800">
            {historico.map((r, i) => (
              <li key={`${r.timestamp}-${i}`} className="flex flex-col gap-0.5 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">{acaoLabel[r.acao] ?? r.acao}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {r.ator === session.nome ? "Você" : `${r.ator} (${roleLabel[r.perfil] ?? r.perfil})`} · {r.alvo}
                  </p>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{new Date(r.timestamp).toLocaleString("pt-BR")}</p>
              </li>
            ))}
            {historico.length === 0 ? (
              <li className="py-4 text-sm text-zinc-500 dark:text-zinc-400">Nenhum acesso registrado ainda.</li>
            ) : null}
          </ul>
        </section>
      </div>

      <BottomNav />
    </div>
  );
}
