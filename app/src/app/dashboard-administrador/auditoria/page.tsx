"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/authSession";
import { listarAuditoria, type RegistroAuditoria } from "@/lib/auditLog";
import { AdminShell } from "@/components/admin/AdminShell";

const acaoLabel: Record<string, string> = {
  LOGIN: "Autenticação no sistema",
  CONSULTA_DADO_SENSIVEL: "Consulta a dado sensível",
  EXPORTACAO_DADOS: "Exportação de dados",
  CANCELAMENTO_AGENDAMENTO: "Cancelamento de agendamento",
};

export default function AuditoriaPage() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [autorizado, setAutorizado] = useState(false);
  const [registros, setRegistros] = useState<RegistroAuditoria[]>([]);

  useEffect(() => {
    const session = getSession();
    setAutorizado(Boolean(session?.token && session.role === "ADMIN"));
    setChecked(true);
    setRegistros(listarAuditoria());
  }, []);

  useEffect(() => {
    if (checked && !autorizado) {
      router.replace("/");
    }
  }, [checked, autorizado, router]);

  if (!checked || !autorizado) {
    return null;
  }

  return (
    <AdminShell
      title="Auditoria"
      description="Registro de ações sensíveis: autenticações, consultas a dados de pacientes e exportações."
    >
        <section className="mt-8 overflow-hidden rounded-2xl border border-sky-100 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-xs uppercase text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                  <th className="py-2 pr-4">Data/hora</th>
                  <th className="py-2 pr-4">Usuário</th>
                  <th className="py-2 pr-4">Perfil</th>
                  <th className="py-2 pr-4">Ação</th>
                  <th className="py-2">Alvo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {registros.map((r, i) => (
                  <tr key={i}>
                    <td className="py-3 pr-4 text-zinc-700 dark:text-zinc-300">
                      {new Date(r.timestamp).toLocaleString("pt-BR")}
                    </td>
                    <td className="py-3 pr-4 text-zinc-900 dark:text-zinc-100">{r.ator}</td>
                    <td className="py-3 pr-4 text-zinc-700 dark:text-zinc-300 capitalize">{r.perfil}</td>
                    <td className="py-3 pr-4 text-zinc-700 dark:text-zinc-300">
                      {acaoLabel[r.acao] ?? r.acao}
                    </td>
                    <td className="py-3 text-zinc-700 dark:text-zinc-300">{r.alvo}</td>
                  </tr>
                ))}
                {registros.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
                      Nenhum registro de auditoria ainda. Navegue pelo sistema (login, consulta de
                      paciente, exportação de dados) para gerar registros.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
    </AdminShell>
  );
}
