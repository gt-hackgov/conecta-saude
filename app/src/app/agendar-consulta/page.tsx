"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSession, removeSession } from "@/lib/authSession";
import { BottomNav } from "@/components/BottomNav";

const locations = [
  "UBS Centro",
  "UBS Vila Nova",
  "UBS Jardim das Flores",
  "UBS Santa Maria",
];

const specialties = [
  "Clínica Geral",
  "Pediatria",
  "Ginecologia",
  "Dermatologia",
  "Cardiologia",
];

function formatFieldErrors(fieldErrors: unknown): string | null {
  if (!fieldErrors) return null;

  if (Array.isArray(fieldErrors)) {
    const messages = fieldErrors
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object" && "message" in item) {
          const message = (item as { message?: unknown }).message;
          return typeof message === "string" ? message : null;
        }
        return null;
      })
      .filter((message): message is string => Boolean(message?.trim()));

    return messages.length ? messages.join(" ") : null;
  }

  if (typeof fieldErrors === "object") {
    const messages = Object.values(fieldErrors as Record<string, unknown>)
      .map((value) => {
        if (typeof value === "string") return value;
        if (Array.isArray(value)) {
          return value.filter((item) => typeof item === "string").join(" ");
        }
        return null;
      })
      .filter((message): message is string => Boolean(message?.trim()));

    return messages.length ? messages.join(" ") : null;
  }

  return null;
}

function extractErrorMessage(payload: unknown, status: number): string {
  if (payload && typeof payload === "object") {
    const data = payload as {
      message?: unknown;
      fieldErrors?: unknown;
    };

    const fieldErrorsMessage = formatFieldErrors(data.fieldErrors);
    if (fieldErrorsMessage) return fieldErrorsMessage;

    if (typeof data.message === "string" && data.message.trim()) {
      return data.message;
    }
  }

  if (status === 400) return "Dados inválidos.";
  if (status === 403) return "Acesso não permitido.";
  if (status === 404) return "Não foi possível concluir o agendamento.";
  if (status >= 500) return "Erro interno.";
  return "Não foi possível agendar a consulta. Tente novamente.";
}

async function readErrorPayload(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export default function SchedulePage() {
  const router = useRouter();
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState(locations[0]);
  const [specialty, setSpecialty] = useState(specialties[0]);
  const [notes, setNotes] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (loading) return;

    if (!date || !time || !location || !specialty) {
      setError("Por favor, preencha todos os campos obrigatórios.");
      setSuccessMessage("");
      return;
    }

    const session = getSession();
    if (!session?.token || session.role !== "PACIENTE") {
      router.replace("/");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify({
          date,
          time,
          location,
          specialty,
          notes,
        }),
      });

      if (response.status === 401) {
        removeSession();
        setError("Sessão expirada ou inválida.");
        router.replace("/");
        return;
      }

      if (response.status !== 201) {
        const payload = await readErrorPayload(response);
        setError(extractErrorMessage(payload, response.status));
        return;
      }

      const data = (await response.json()) as { message?: unknown };
      const message =
        typeof data.message === "string" && data.message.trim()
          ? data.message
          : "Consulta agendada com sucesso! Verifique seus dados no painel.";

      setSuccessMessage(message);
      setNotes("");
    } catch {
      setError("Não foi possível conectar ao serviço. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
          <div className="min-h-screen bg-gradient-to-b from-white via-indigo-50 to-white px-6 py-10 pb-24 dark:bg-none dark:bg-zinc-900">
      <div className="mx-auto w-full max-w-4xl rounded-3xl bg-white p-8 shadow-lg dark:bg-zinc-950">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-indigo-600">Agendamento de consulta</p>
            <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50">Marque sua consulta</h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Preencha os dados abaixo para agendar sua consulta em uma UBS.
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900"
          >
            Voltar ao painel
          </button>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">Data da consulta</span>
              <input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-indigo-400"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">Horário</span>
              <input
                type="time"
                value={time}
                onChange={(event) => setTime(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-indigo-400"
              />
            </label>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">Unidade básica de saúde</span>
              <select
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-indigo-400"
              >
                {locations.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">Especialidade</span>
              <select
                value={specialty}
                onChange={(event) => setSpecialty(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-indigo-400"
              >
                {specialties.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">Observações</span>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={4}
              placeholder="Descreva sintomas ou outros detalhes importantes"
              className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-indigo-400"
            />
          </label>

          {error ? <p className="text-sm text-red-600 dark:text-red-300">{error}</p> : null}
          {successMessage ? (
            <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-800 dark:border-green-700 dark:bg-green-900/20 dark:text-green-100">
              {successMessage}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Agendando..." : "Agendar consulta"}
          </button>
        </form>
      </div>

      <BottomNav />
    </div>
  );
}
