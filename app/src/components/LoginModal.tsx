"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { saveSession } from "@/lib/authSession";

type Props = {
  open: boolean;
  onClose: () => void;
};

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
  if (status === 401) return "Credenciais inválidas.";
  if (status >= 500) return "Erro interno.";
  return "Não foi possível entrar. Tente novamente.";
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

export function LoginModal({ open, onClose }: Props) {
  const router = useRouter();
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const modalRef = useRef<HTMLDivElement | null>(null);

  const isValidCpf = (value: string) => {
    const onlyDigits = value.replace(/\D/g, "");
    return onlyDigits.length === 11;
  };

  useEffect(() => {
    if (!open) {
      setCpf("");
      setPassword("");
      setError("");
      setNotice("");
      setLoading(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    setTimeout(() => modalRef.current?.querySelector<HTMLInputElement>("input")?.focus(), 0);
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (loading) return;

    if (!cpf || !password) {
      setError("Por favor, preencha todos os campos.");
      setNotice("");
      return;
    }

    const normalizedCpf = cpf.replace(/\D/g, "");

    if (!isValidCpf(cpf)) {
      setError("Por favor, insira um CPF válido.");
      setNotice("");
      return;
    }

    setLoading(true);
    setError("");
    setNotice("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cpf: normalizedCpf,
          senha: password,
        }),
      });

      if (!response.ok) {
        const payload = await readErrorPayload(response);
        setError(extractErrorMessage(payload, response.status));
        return;
      }

      const data = (await response.json()) as {
        usuarioId?: unknown;
        nome?: unknown;
        role?: unknown;
        token?: unknown;
      };

      if (!data.usuarioId || !data.nome || !data.role || !data.token) {
        setError("Não foi possível entrar. Tente novamente.");
        return;
      }

      saveSession({
        usuarioId: String(data.usuarioId),
        nome: String(data.nome),
        role: String(data.role),
        token: String(data.token),
      });

      if (data.role === "PACIENTE") {
        router.push("/dashboard");
        onClose();
        return;
      }

      if (data.role === "MEDICO") {
        router.push("/dashboard-medico");
        onClose();
        return;
      }

      setNotice("Este perfil ainda não possui área disponível na interface.");
    } catch {
      setError("Não foi possível conectar ao serviço. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        ref={modalRef}
        className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl dark:bg-zinc-900"
        role="dialog"
        aria-modal="true"
      >
        <header className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              Entrar com gov.br
            </h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Faça login com sua conta gov.br para acessar os serviços.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            aria-label="Fechar modal"
          >
            ✕
          </button>
        </header>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
              CPF
            </label>
            <input
              value={cpf}
              onChange={(event) => setCpf(event.target.value)}
              className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-indigo-400"
              placeholder="000.000.000-00"
              type="text"
              disabled={loading}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
              Senha
            </label>
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-indigo-400"
              placeholder="••••••••"
              type="password"
              disabled={loading}
            />
          </div>

          {error ? (
            <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
          ) : null}

          {notice ? (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{notice}</p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Entrando..." : "Entrar com gov.br"}
          </button>
        </form>
      </div>
    </div>
  );
}
