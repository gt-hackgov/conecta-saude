"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession, removeSession } from "@/lib/authSession";
import { BottomNav } from "@/components/BottomNav";

type Appointment = {
  id: string;
  date: string;
  time: string;
  location: string;
  specialty: string;
  notes: string;
  createdAt: string;
};

type AppointmentForm = {
  date: string;
  time: string;
  location: string;
  specialty: string;
  notes: string;
};

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

const emptyForm: AppointmentForm = {
  date: "",
  time: "",
  location: "",
  specialty: "",
  notes: "",
};

const inputClassName =
  "mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-indigo-400";

const buttonClassName =
  "inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-70";

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
      error?: unknown;
    };

    if (typeof data.message === "string" && data.message.trim()) {
      return data.message;
    }

    if (typeof data.error === "string" && data.error.trim()) {
      return data.error;
    }
  }

  if (status === 403) return "Acesso não permitido.";
  if (status >= 500) return "Erro ao carregar as consultas.";
  return "Não foi possível carregar suas consultas. Tente novamente.";
}

function extractCancelError(payload: unknown, status: number): string {
  if (payload && typeof payload === "object") {
    const data = payload as {
      message?: unknown;
      error?: unknown;
    };

    if (typeof data.error === "string" && data.error.trim()) {
      return data.error;
    }

    if (typeof data.message === "string" && data.message.trim()) {
      return data.message;
    }
  }

  if (status === 403) return "Acesso não permitido.";
  if (status === 404) return "Consulta não encontrada.";
  if (status >= 500) return "Erro ao cancelar a consulta.";
  return "Não foi possível cancelar a consulta. Tente novamente.";
}

function extractUpdateError(payload: unknown, status: number): string {
  if (payload && typeof payload === "object") {
    const data = payload as {
      message?: unknown;
      error?: unknown;
      fieldErrors?: unknown;
    };

    const fieldErrorsMessage = formatFieldErrors(data.fieldErrors);
    if (fieldErrorsMessage) return fieldErrorsMessage;

    if (typeof data.message === "string" && data.message.trim()) {
      return data.message;
    }

    if (typeof data.error === "string" && data.error.trim()) {
      return data.error;
    }
  }

  if (status === 400) return "Dados inválidos.";
  if (status === 403) return "Acesso não permitido.";
  if (status === 404) return "Consulta não encontrada.";
  if (status >= 500) return "Erro ao atualizar a consulta.";
  return "Não foi possível atualizar a consulta. Tente novamente.";
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

export default function ScheduledAppointmentsPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelError, setCancelError] = useState("");
  const [updateError, setUpdateError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<AppointmentForm>(emptyForm);

  useEffect(() => {
    const session = getSession();
    if (!session?.token || session.role !== "PACIENTE") {
      router.replace("/");
      return;
    }

    const loadAppointments = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch("/api/appointments", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.token}`,
          },
        });

        if (response.status === 401) {
          removeSession();
          router.replace("/");
          return;
        }

        if (!response.ok) {
          const payload = await readErrorPayload(response);
          setError(extractErrorMessage(payload, response.status));
          setAppointments([]);
          return;
        }

        const data = (await response.json()) as { appointments?: unknown };
        const list = Array.isArray(data.appointments)
          ? (data.appointments as Appointment[])
          : [];
        setAppointments(list);
      } catch {
        setError("Não foi possível carregar suas consultas. Tente novamente.");
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };

    loadAppointments();
  }, [router]);

  const startEdit = (appointment: Appointment) => {
    setEditingId(appointment.id);
    setEditForm({
      date: appointment.date,
      time: appointment.time.slice(0, 5),
      location: appointment.location,
      specialty: appointment.specialty,
      notes: appointment.notes ?? "",
    });
    setUpdateError("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(emptyForm);
    setUpdateError("");
  };

  const handleSave = async (appointmentId: string) => {
    if (updatingId === appointmentId) return;

    if (!editForm.date || !editForm.time || !editForm.location || !editForm.specialty) {
      setUpdateError("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    const session = getSession();
    if (!session?.token || session.role !== "PACIENTE") {
      if (!session?.token) {
        removeSession();
      }
      router.replace("/");
      return;
    }

    setUpdatingId(appointmentId);
    setUpdateError("");
    setSuccessMessage("");

    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify({
          date: editForm.date,
          time: editForm.time,
          location: editForm.location,
          specialty: editForm.specialty,
          notes: editForm.notes,
        }),
      });

      if (response.status === 401) {
        removeSession();
        router.replace("/");
        return;
      }

      if (response.status !== 200) {
        const payload = await readErrorPayload(response);
        setUpdateError(extractUpdateError(payload, response.status));
        return;
      }

      const data = (await response.json()) as {
        message?: unknown;
        appointment?: Appointment;
      };

      if (!data.appointment) {
        setUpdateError("Erro ao atualizar a consulta.");
        return;
      }

      setAppointments((current) =>
        current.map((item) => (item.id === appointmentId ? data.appointment as Appointment : item))
      );
      setEditingId(null);
      setEditForm(emptyForm);
      setSuccessMessage(
        typeof data.message === "string" && data.message.trim()
          ? data.message
          : "Agendamento atualizado com sucesso"
      );
    } catch {
      setUpdateError("Não foi possível atualizar a consulta. Tente novamente.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCancel = async (appointmentId: string) => {
    if (deletingId === appointmentId) return;

    if (!window.confirm("Tem certeza que deseja cancelar esta consulta?")) {
      return;
    }

    const session = getSession();
    if (!session?.token || session.role !== "PACIENTE") {
      if (!session?.token) {
        removeSession();
      }
      router.replace("/");
      return;
    }

    setDeletingId(appointmentId);
    setCancelError("");
    setSuccessMessage("");

    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.token}`,
        },
      });

      if (response.status === 401) {
        removeSession();
        router.replace("/");
        return;
      }

      if (response.status !== 200) {
        const payload = await readErrorPayload(response);
        setCancelError(extractCancelError(payload, response.status));
        return;
      }

      const data = (await response.json()) as { message?: unknown };
      setAppointments((current) => current.filter((item) => item.id !== appointmentId));
      if (editingId === appointmentId) {
        setEditingId(null);
        setEditForm(emptyForm);
      }
      setSuccessMessage(
        typeof data.message === "string" && data.message.trim()
          ? data.message
          : "Consulta cancelada com sucesso"
      );
    } catch {
      setCancelError("Não foi possível cancelar a consulta. Tente novamente.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
      <div className="min-h-screen bg-gradient-to-b from-white via-indigo-50 to-white px-6 py-10 pb-24 dark:bg-none dark:bg-zinc-900">
      <div className="mx-auto w-full max-w-6xl rounded-3xl bg-white p-8 shadow-lg dark:bg-zinc-950">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-indigo-600">Consultas agendadas</p>
            <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50">Histórico de agendamentos</h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Veja as consultas que você já agendou e volte ao painel para novos agendamentos.
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

        {successMessage ? (
          <p className="mb-6 text-sm text-green-700 dark:text-green-300">{successMessage}</p>
        ) : null}
        {updateError ? (
          <p className="mb-6 text-sm text-red-600 dark:text-red-300">{updateError}</p>
        ) : null}
        {cancelError ? (
          <p className="mb-6 text-sm text-red-600 dark:text-red-300">{cancelError}</p>
        ) : null}

        {error ? (
          <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
        ) : loading ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Carregando consultas...</p>
        ) : appointments.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-zinc-200 bg-zinc-50 p-10 text-center text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
            <p className="text-lg font-semibold">Nenhuma consulta agendada ainda.</p>
            <p className="mt-2 text-sm">Use a página de agendamento para marcar sua primeira consulta.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {appointments.map((appointment) => {
              const isEditing = editingId === appointment.id;
              const locationOptions = locations.includes(editForm.location)
                ? locations
                : [editForm.location, ...locations];
              const specialtyOptions = specialties.includes(editForm.specialty)
                ? specialties
                : [editForm.specialty, ...specialties];

              return (
              <div key={appointment.id} className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                {isEditing ? (
                  <div className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="block">
                        <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Data da consulta</span>
                        <input
                          type="date"
                          value={editForm.date}
                          onChange={(event) => setEditForm((current) => ({ ...current, date: event.target.value }))}
                          className={inputClassName}
                        />
                      </label>
                      <label className="block">
                        <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Horário</span>
                        <input
                          type="time"
                          value={editForm.time}
                          onChange={(event) => setEditForm((current) => ({ ...current, time: event.target.value }))}
                          className={inputClassName}
                        />
                      </label>
                      <label className="block">
                        <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Unidade</span>
                        <select
                          value={editForm.location}
                          onChange={(event) => setEditForm((current) => ({ ...current, location: event.target.value }))}
                          className={inputClassName}
                        >
                          {locationOptions.filter(Boolean).map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="block">
                        <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Especialidade</span>
                        <select
                          value={editForm.specialty}
                          onChange={(event) => setEditForm((current) => ({ ...current, specialty: event.target.value }))}
                          className={inputClassName}
                        >
                          {specialtyOptions.filter(Boolean).map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <label className="block">
                      <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Observações</span>
                      <textarea
                        value={editForm.notes}
                        onChange={(event) => setEditForm((current) => ({ ...current, notes: event.target.value }))}
                        rows={4}
                        className={inputClassName}
                      />
                    </label>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Data e horário</p>
                        <p className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                          {appointment.date} às {appointment.time}
                        </p>
                      </div>
                      <span className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-semibold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-200">
                        {appointment.specialty}
                      </span>
                    </div>

                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Unidade</p>
                        <p className="mt-1 text-sm text-zinc-900 dark:text-zinc-100">{appointment.location}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Agendado em</p>
                        <p className="mt-1 text-sm text-zinc-900 dark:text-zinc-100">{new Date(appointment.createdAt).toLocaleString()}</p>
                      </div>
                    </div>

                    {appointment.notes ? (
                      <div className="mt-6 rounded-2xl bg-zinc-50 p-4 text-sm text-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
                        <p className="font-semibold">Observações</p>
                        <p className="mt-2 whitespace-pre-wrap">{appointment.notes}</p>
                      </div>
                    ) : null}
                  </>
                )}

                <div className="mt-6 flex flex-wrap justify-end gap-3">
                  {isEditing ? (
                    <>
                      <button type="button" onClick={cancelEdit} className={buttonClassName}>
                        Cancelar edição
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSave(appointment.id)}
                        disabled={updatingId === appointment.id}
                        className={buttonClassName}
                      >
                        {updatingId === appointment.id ? "Salvando..." : "Salvar alterações"}
                      </button>
                    </>
                  ) : (
                    <button type="button" onClick={() => startEdit(appointment)} className={buttonClassName}>
                      Editar consulta
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleCancel(appointment.id)}
                    disabled={deletingId === appointment.id}
                    className={buttonClassName}
                  >
                    {deletingId === appointment.id ? "Cancelando..." : "Cancelar consulta"}
                  </button>
                </div>
              </div>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
