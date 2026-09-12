"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSession } from "@/lib/authSession";
import { ThemeToggle } from "@/components/ThemeToggle";

type Paciente = {
  cpf: string;
  dataNascimento: string;
  telefone: string;
  endereco: string;
  historico: { data: string; especialidade: string; status: "Compareceu" | "Faltou" }[];
};

const pacientes: Record<string, Paciente> = {
  "Maria Silva": {
    cpf: "12925945007",
    dataNascimento: "14/03/1988",
    telefone: "(11) 98888-1234",
    endereco: "Rua das Acácias, 245 — Jardim Esperança, São Paulo/SP",
    historico: [
      { data: "10/08/2026", especialidade: "Clínica Geral", status: "Compareceu" },
      { data: "22/05/2026", especialidade: "Cardiologia", status: "Compareceu" },
    ],
  },
  "João Souza": {
    cpf: "98765432100",
    dataNascimento: "02/11/1975",
    telefone: "(11) 97777-5678",
    endereco: "Av. Vila Nova, 980 — Vila Nova, São Paulo/SP",
    historico: [
      { data: "30/07/2026", especialidade: "Clínica Geral", status: "Faltou" },
      { data: "18/04/2026", especialidade: "Ortopedia", status: "Compareceu" },
    ],
  },
  "Ana Costa": {
    cpf: "45678912300",
    dataNascimento: "27/06/1992",
    telefone: "(11) 96666-4321",
    endereco: "Rua das Orquídeas, 112 — Parque das Flores, São Paulo/SP",
    historico: [{ data: "05/06/2026", especialidade: "Dermatologia", status: "Compareceu" }],
  },
  "Pedro Lima": {
    cpf: "32165498700",
    dataNascimento: "19/09/1965",
    telefone: "(11) 95555-8765",
    endereco: "Av. Águia de Haia, 3300 — Cidade Líder, São Paulo/SP",
    historico: [
      { data: "12/07/2026", especialidade: "Cardiologia", status: "Faltou" },
      { data: "01/03/2026", especialidade: "Cardiologia", status: "Faltou" },
    ],
  },
};

function maskCpf(cpf: string) {
  const d = cpf.replace(/\D/g, "").padStart(11, "0");
  const masked = "*******" + d.slice(7);
  return `${masked.slice(0, 3)}.${masked.slice(3, 6)}.${masked.slice(6, 9)}-${masked.slice(9, 11)}`;
}

const statusStyles: Record<string, string> = {
  Compareceu: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  Faltou: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

function FichaPacienteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nome = searchParams.get("nome") ?? "";
  const paciente = pacientes[nome];

  const [checkedAuth, setCheckedAuth] = useState(false);
  const [isMedico, setIsMedico] = useState(false);

  useEffect(() => {
    const session = getSession();
    setIsMedico(Boolean(session?.token && session.role === "MEDICO"));
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

  if (!paciente) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-zinc-900">
        <div className="text-center">
          <p className="text-zinc-600 dark:text-zinc-400">Paciente não encontrado.</p>
          <button
            type="button"
            onClick={() => router.push("/dashboard-medico")}
            className="mt-4 text-sm font-semibold text-indigo-600 hover:underline"
          >
            ← Voltar ao painel
          </button>
        </div>
      </div>
    );
  }

  const totalConsultas = paciente.historico.length;
  const totalFaltas = paciente.historico.filter((h) => h.status === "Faltou").length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-indigo-50 to-white px-6 py-10 dark:bg-none dark:bg-zinc-900">
      <div className="mx-auto w-full max-w-4xl">
        <header className="flex flex-col gap-4 rounded-3xl bg-white p-8 shadow-lg dark:bg-zinc-950 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button
              type="button"
              onClick={() => router.push("/dashboard-medico")}
              className="text-xs font-semibold text-indigo-600 hover:underline"
            >
              ← Voltar ao painel
            </button>
            <h1 className="mt-1 text-3xl font-semibold text-zinc-900 dark:text-zinc-50">{nome}</h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Ficha do paciente</p>
          </div>
          <ThemeToggle />
        </header>

        <section className="mt-6 flex flex-wrap divide-y divide-zinc-100 overflow-hidden rounded-2xl bg-white shadow-sm dark:divide-zinc-800 dark:bg-zinc-950 sm:flex-nowrap sm:divide-y-0 sm:divide-x">
          <div className="flex-1 px-6 py-4 sm:min-w-[160px]">
            <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">CPF</p>
            <p className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              {maskCpf(paciente.cpf)}
            </p>
          </div>
          <div className="flex-1 px-6 py-4 sm:min-w-[160px]">
            <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Data de nascimento
            </p>
            <p className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              {paciente.dataNascimento}
            </p>
          </div>
          <div className="flex-1 px-6 py-4 sm:min-w-[160px]">
            <p className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Consultas / faltas
            </p>
            <p className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              {totalConsultas} / {totalFaltas}
            </p>
          </div>
        </section>

        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm dark:bg-zinc-950">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Contato
          </h2>
          <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">{paciente.telefone}</p>
          <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">{paciente.endereco}</p>
        </section>

        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm dark:bg-zinc-950">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Histórico de consultas
          </h2>
          <table className="mt-4 w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-xs uppercase text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                <th className="py-2 pr-4">Data</th>
                <th className="py-2 pr-4">Especialidade</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {paciente.historico.map((h) => (
                <tr key={`${h.data}-${h.especialidade}`}>
                  <td className="py-3 pr-4 text-zinc-700 dark:text-zinc-300">{h.data}</td>
                  <td className="py-3 pr-4 text-zinc-700 dark:text-zinc-300">{h.especialidade}</td>
                  <td className="py-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[h.status]}`}>
                      {h.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <p className="mt-4 text-xs text-zinc-400">
          Dados de exemplo — CPF exibido de forma mascarada, seguindo boa prática de proteção de
          dados sensíveis.
        </p>
      </div>
    </div>
  );
}

export default function FichaPacientePage() {
  return (
    <Suspense fallback={null}>
      <FichaPacienteContent />
    </Suspense>
  );
}
