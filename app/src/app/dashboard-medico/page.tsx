"use client";

import Link from "next/link";
import { BarChart3, CalendarDays, ListOrdered, type LucideIcon } from "lucide-react";
import { MedicoShell } from "@/components/medico/MedicoShell";

const areas: { href: string; title: string; description: string; icon: LucideIcon }[] = [
  {
    href: "/dashboard-medico/fila",
    title: "Fila de atendimento",
    description: "Acompanhe a ordem por risco e chame o próximo paciente.",
    icon: ListOrdered,
  },
  {
    href: "/dashboard-medico/consultas",
    title: "Consultas de hoje",
    description: "Veja os pacientes do dia, o risco de falta e abra a ficha.",
    icon: CalendarDays,
  },
  {
    href: "/dashboard-medico/indicadores",
    title: "Indicadores",
    description: "Consulte o volume de agendamentos por especialidade.",
    icon: BarChart3,
  },
];

export default function DashboardMedicoPage() {
  return (
    <MedicoShell
      title="Painel do médico"
      description="Acompanhe a rotina clínica com mais clareza e agilidade."
    >
      <section
        className="relative mt-8 overflow-hidden rounded-2xl border border-sky-100 bg-sky-50 bg-cover bg-right bg-no-repeat md:bg-[url('/banner-medico.png')]"
      >
        <div className="relative max-w-xl px-6 py-8 sm:px-10 sm:py-10">
          <p className="text-[11px] font-semibold tracking-[0.18em] text-sky-700 uppercase">
            Cuidado em cada encontro
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
            Mais organização
            <span className="mt-1 block text-sky-600">para um atendimento ainda melhor.</span>
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-zinc-600">
            Acesse sua fila, acompanhe as consultas do dia e visualize os principais indicadores da sua unidade, tudo em um só lugar.
          </p>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        {areas.map((area) => {
          const Icon = area.icon;

          return (
            <Link
              key={area.href}
              href={area.href}
              className="rounded-2xl border border-sky-100 bg-white p-6 shadow-sm transition hover:border-sky-200 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"
            >
              <span className="flex size-10 items-center justify-center rounded-xl bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-200">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <h2 className="mt-4 text-base font-semibold text-zinc-900 dark:text-zinc-50">{area.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{area.description}</p>
            </Link>
          );
        })}
      </section>
    </MedicoShell>
  );
}
