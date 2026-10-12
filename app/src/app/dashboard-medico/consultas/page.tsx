"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/authSession";
import { registrarAuditoria } from "@/lib/auditLog";
import { SenhaModal } from "@/components/SenhaModal";
import { MedicoShell } from "@/components/medico/MedicoShell";

const consultasHoje = [
  { paciente: "Maria Silva", horario: "08:00", risco: "Baixo" as const },
  { paciente: "João Souza", horario: "09:30", risco: "Alto" as const },
  { paciente: "Ana Costa", horario: "10:15", risco: "Médio" as const },
  { paciente: "Pedro Lima", horario: "11:00", risco: "Alto" as const },
];

const riscoStyles: Record<string, string> = {
  Baixo: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  Médio: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  Alto: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

export default function ConsultasMedicoPage() {
  const router = useRouter();
  const [busca, setBusca] = useState("");
  const [filtroRisco, setFiltroRisco] = useState<"Todos" | "Baixo" | "Médio" | "Alto">("Todos");
  const [senhaExportAberta, setSenhaExportAberta] = useState(false);

  const openFicha = (paciente: string) => {
    router.push(`/dashboard-medico/paciente?nome=${encodeURIComponent(paciente)}`);
  };

  const handleExportarTriagem = () => {
    const session = getSession();
    if (session?.token) {
      registrarAuditoria({
        ator: session.nome,
        perfil: session.role,
        acao: "EXPORTACAO_DADOS",
        alvo: "Lista de triagem (CSV) - pacientes de risco alto",
      });
    }

    const pacientesAltoRisco = consultasHoje.filter((c) => c.risco === "Alto");

    const cabecalho = "Paciente;Horario;Risco";
    const linhas = pacientesAltoRisco.map(
      (c) => `${c.paciente};${c.horario};${c.risco}`
    );
    const conteudoCsv = [cabecalho, ...linhas].join("\n");

    const blob = new Blob(["\uFEFF" + conteudoCsv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `triagem-acs-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <MedicoShell
      title="Consultas de hoje"
      description="Risco de falta calculado por modelo de IA."
    >
      <section className="mt-8 rounded-2xl border border-sky-100 bg-white p-6 shadow-sm sm:p-8 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Consultas de hoje
            </h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Risco de falta calculado por modelo de IA
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSenhaExportAberta(true)}
            className="whitespace-nowrap rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
          >
            Exportar lista de triagem (CSV)
          </button>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar paciente..."
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm outline-none focus:border-sky-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 sm:w-64"
          />
          <select
            value={filtroRisco}
            onChange={(e) => setFiltroRisco(e.target.value as typeof filtroRisco)}
            className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm outline-none focus:border-sky-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          >
            <option value="Todos">Todos os riscos</option>
            <option value="Baixo">Risco Baixo</option>
            <option value="Médio">Risco Médio</option>
            <option value="Alto">Risco Alto</option>
          </select>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-xs uppercase text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                <th className="py-2 pr-4">Paciente</th>
                <th className="py-2 pr-4">Horário</th>
                <th className="py-2 pr-4">Risco de falta</th>
                <th className="py-2">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {consultasHoje
                .filter(
                  (c) =>
                    c.paciente.toLowerCase().includes(busca.toLowerCase()) &&
                    (filtroRisco === "Todos" || c.risco === filtroRisco)
                )
                .map((consulta) => (
                  <tr key={`${consulta.paciente}-${consulta.horario}`}>
                    <td className="py-3 pr-4 font-medium text-zinc-900 dark:text-zinc-100">
                      <button
                        type="button"
                        onClick={() => openFicha(consulta.paciente)}
                        className="text-left font-medium text-sky-700 hover:underline dark:text-sky-300"
                      >
                        {consulta.paciente}
                      </button>
                    </td>
                    <td className="py-3 pr-4 text-zinc-700 dark:text-zinc-300">
                      {consulta.horario}
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${riscoStyles[consulta.risco]}`}
                      >
                        Risco {consulta.risco}
                      </span>
                    </td>
                    <td className="py-3">
                      <button
                        type="button"
                        onClick={() => openFicha(consulta.paciente)}
                        className="whitespace-nowrap rounded-xl border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-700 shadow-sm transition hover:bg-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
                      >
                        Ver ficha
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>

      <SenhaModal
        open={senhaExportAberta}
        titulo="Exportar lista de triagem"
        descricao="A lista contém dados sensíveis de pacientes. Confirme sua senha de acesso para exportar — a exportação fica registrada na trilha de auditoria."
        textoBotao="Confirmar e exportar"
        onClose={() => setSenhaExportAberta(false)}
        onConfirmado={() => handleExportarTriagem()}
      />
    </MedicoShell>
  );
}
