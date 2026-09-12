"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/userDatabase";
import { ThemeToggle } from "@/components/ThemeToggle";

const dadosSucesso = [
  { label: "Médicos cadastrados", valor: "12" },
  { label: "Pacientes cadastrados", valor: "348" },
  { label: "Consultas agendadas (mês)", valor: "1.284" },
  { label: "Taxa de comparecimento", valor: "88%" },
];

const especialidades = [
  { nome: "Clínica Médica (Geral)", absoluta: 2250, relativa: 45, acumulada: 45, cor: "#4f46e5" },
  { nome: "Pediatria", absoluta: 1000, relativa: 20, acumulada: 65, cor: "#10b981" },
  { nome: "Ginecologia e Obstetrícia", absoluta: 750, relativa: 15, acumulada: 80, cor: "#f59e0b" },
  { nome: "Odontologia", absoluta: 600, relativa: 12, acumulada: 92, cor: "#0ea5e9" },
  { nome: "Saúde Mental (Psi.)", absoluta: 400, relativa: 8, acumulada: 100, cor: "#f43f5e" },
];

const insights = [
  "Clínica Médica concentra 45% da demanda — é a porta de entrada da UBS; atrasos aqui travam todo o fluxo de encaminhamentos.",
  "Pediatria representa 20% — em regiões populosas, mutirões sazonais (ex.: doenças respiratórias) podem aliviar picos.",
  "Saúde Mental é a menor fatia (8%), mas pode refletir dificuldade de acesso ou estigma — um canal digital discreto tende a aumentar a procura real.",
];

export default function AdministracaoPage() {
  const router = useRouter();
  const [checkedAuth, setCheckedAuth] = useState(false);
  const [isMedico, setIsMedico] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    setIsMedico(user?.role === "medico");
    setCheckedAuth(true);
  }, []);

  useEffect(() => {
    if (checkedAuth && !isMedico) {
      router.replace("/");
    }
  }, [checkedAuth, isMedico, router]);

  if (!checkedAuth || !isMedico) {
    return null;
  }

    const gradientePizza = (() => {
    let acumulado = 0;
    const partes: string[] = [];
    especialidades.forEach((e) => {
      partes.push(`${e.cor} ${acumulado}%`);
      acumulado += e.relativa;
      partes.push(`${e.cor} ${acumulado}%`);
    });
    return `conic-gradient(${partes.join(", ")})`;
  })();

  const maxAbsoluta = Math.max(...especialidades.map((e) => e.absoluta));

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-indigo-50 to-white px-6 py-10 dark:bg-none dark:bg-zinc-900">
      <div className="mx-auto w-full max-w-6xl">
        <header className="flex flex-col gap-4 rounded-3xl bg-white p-8 shadow-lg dark:bg-zinc-950 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-indigo-600">Administração</p>
            <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
              Administração da UBS
            </h1>
            <p className="mt-2 max-w-xl text-sm text-zinc-600 dark:text-zinc-400">
              Indicadores de uso do sistema e análise de demanda por especialidade.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/dashboard-medico")}
              className="inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900"
            >
              Voltar ao painel
            </button>
            <ThemeToggle />
          </div>
        </header>

                <section className="mt-8 flex flex-wrap divide-y divide-zinc-100 overflow-hidden rounded-2xl bg-white shadow-sm dark:divide-zinc-800 dark:bg-zinc-950 sm:flex-nowrap sm:divide-y-0 sm:divide-x">
          {dadosSucesso.map((item) => (
            <div key={item.label} className="flex-1 px-6 py-4 sm:min-w-[160px]">
              <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                {item.label}
              </p>
              <p className="mt-1 text-2xl font-semibold text-indigo-600">{item.valor}</p>
            </div>
          ))}
        </section>


        <section className="mt-16 grid gap-16">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Demanda por especialidade — barras
            </h2>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Amostra de 5.000 solicitações mensais
            </p>
            <div className="mt-6 flex items-start gap-4">
              {especialidades.map((item) => (
                <div key={item.nome} className="flex flex-1 flex-col items-center gap-2">
                  <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                    {item.absoluta}
                  </span>
                  <div className="flex h-32 w-full items-end">
                    <div
                      className="w-full rounded-t-lg"
                      style={{
                        height: `${(item.absoluta / maxAbsoluta) * 100}%`,
                        backgroundColor: item.cor,
                      }}
                    />
                  </div>
                  <span className="text-center text-[10px] leading-tight text-zinc-600 dark:text-zinc-400">
                    {item.nome}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Demanda por especialidade — pizza
            </h2>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Participação percentual de cada especialidade
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-10 sm:flex-row">
              <div
                className="h-64 w-64 shrink-0 rounded-full"
                style={{ backgroundImage: gradientePizza }}
              />
              <ul className="space-y-2">
                {especialidades.map((item) => (
                  <li key={item.nome} className="flex items-center gap-2 text-xs">
                    <span
                      className="h-3 w-3 rounded-sm"
                      style={{ backgroundColor: item.cor }}
                    />
                    <span className="text-zinc-700 dark:text-zinc-300">
                      {item.nome} — {item.relativa}%
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="mt-16 overflow-x-auto rounded-3xl bg-white p-8 shadow-lg dark:bg-zinc-950">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Tabela de frequência
          </h2>
          <table className="mt-6 w-full text-left text-sm">
            <thead>
            <tr className="border-b border-zinc-200 text-xs uppercase text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                <th className="py-2 pr-4">Especialidade</th>
                <th className="py-2 pr-4 text-center">Freq. Absoluta</th>
                <th className="py-2 pr-4 text-center">Freq. Relativa</th>
                <th className="py-2 text-center">Freq. Acumulada</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {especialidades.map((item) => (
                <tr key={item.nome}>
                  <td className="py-3 pr-4 text-zinc-900 dark:text-zinc-100">{item.nome}</td>
                  <td className="py-3 pr-4 text-center text-zinc-700 dark:text-zinc-300">{item.absoluta}</td>
                  <td className="py-3 pr-4 text-center text-zinc-700 dark:text-zinc-300">{item.relativa}%</td>
                  <td className="py-3 text-center text-zinc-700 dark:text-zinc-300">{item.acumulada}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="mt-8 rounded-3xl bg-white p-8 shadow-lg dark:bg-zinc-950">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Insights para gestão
          </h2>
            <ul className="mt-4 space-y-4">
            {insights.map((texto) => (
              <li key={texto} className="flex items-start gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                {texto}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}