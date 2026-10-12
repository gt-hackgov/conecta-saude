"use client";

import { MedicoShell } from "@/components/medico/MedicoShell";

const especialidades = [
  { nome: "Clínica Geral", quantidade: 42 },
  { nome: "Pediatria", quantidade: 27 },
  { nome: "Cardiologia", quantidade: 15 },
  { nome: "Dermatologia", quantidade: 9 },
];

export default function IndicadoresMedicoPage() {
  const maxQuantidade = Math.max(...especialidades.map((e) => e.quantidade));

  return (
    <MedicoShell
      title="Indicadores"
      description="Volume de agendamentos por especialidade."
    >
      <section className="mt-8 rounded-2xl border border-dashed border-sky-200 bg-white/70 p-6 sm:p-8 dark:border-zinc-700 dark:bg-zinc-950/60">
        <p className="text-[11px] font-semibold tracking-[0.16em] text-zinc-500 uppercase dark:text-zinc-400">
          Amostra demonstrativa
        </p>
        <h2 className="mt-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Volume de agendamentos por especialidade
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Últimos 30 dias. Estes valores não são indicadores operacionais.
        </p>

        <div className="mt-6 space-y-3">
          {especialidades.map((item) => (
            <div key={item.nome}>
              <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400">
                <span>{item.nome}</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {item.quantidade}
                </span>
              </div>
              <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                <div
                  className="h-full rounded-full bg-sky-500 dark:bg-sky-600"
                  style={{ width: `${(item.quantidade / maxQuantidade) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </MedicoShell>
  );
}
