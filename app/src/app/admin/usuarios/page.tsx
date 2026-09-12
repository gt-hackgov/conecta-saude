"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession, removeSession } from "@/lib/authSession";
import { ThemeToggle } from "@/components/ThemeToggle";

type AdminRole = "MEDICO" | "ADMIN" | "AUDITOR";

const roles: { value: AdminRole; label: string }[] = [
  { value: "MEDICO", label: "Médico" },
  { value: "ADMIN", label: "Administrador" },
  { value: "AUDITOR", label: "Auditor" },
];

const inputClassName =
  "mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-indigo-400";

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
  if (status === 403) return "Você não tem permissão para cadastrar usuários.";
  if (status === 409) return "Este CPF já está cadastrado.";
  if (status >= 500) return "Erro interno. Tente novamente.";
  return "Não foi possível cadastrar o usuário. Tente novamente.";
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

export default function AdminUsuariosPage() {
  const router = useRouter();
  const [checkedAuth, setCheckedAuth] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [senha, setSenha] = useState("");
  const [role, setRole] = useState<AdminRole>("MEDICO");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const session = getSession();
    const allowed = Boolean(session?.token && session.role === "ADMIN");
    setIsAdmin(allowed);
    setCheckedAuth(true);
  }, []);

  useEffect(() => {
    if (checkedAuth && !isAdmin) {
      router.replace("/");
    }
  }, [checkedAuth, isAdmin, router]);

  const handleLogout = () => {
    removeSession();
    router.push("/");
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (loading) return;

    if (!nome.trim() || !cpf || !senha || !role) {
      setError("Por favor, preencha todos os campos.");
      setSuccess("");
      return;
    }

    const normalizedCpf = cpf.replace(/\D/g, "");
    if (normalizedCpf.length !== 11) {
      setError("Por favor, insira um CPF válido.");
      setSuccess("");
      return;
    }

    const session = getSession();
    if (!session?.token || session.role !== "ADMIN") {
      removeSession();
      router.replace("/");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify({
          cpf: normalizedCpf,
          nome: nome.trim(),
          senha,
          role,
        }),
      });

      if (response.status === 401) {
        removeSession();
        setError("Sessão expirada ou inválida.");
        router.replace("/");
        return;
      }

      if (response.status === 201) {
        setSuccess("Usuário cadastrado com sucesso.");
        setNome("");
        setCpf("");
        setSenha("");
        setRole("MEDICO");
        return;
      }

      const payload = await readErrorPayload(response);
      setError(extractErrorMessage(payload, response.status));
    } catch {
      setError("Não foi possível conectar ao serviço. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (!checkedAuth || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-indigo-50 to-white px-6 py-10 dark:bg-none dark:bg-zinc-900">
      <div className="mx-auto w-full max-w-4xl rounded-3xl bg-white p-8 shadow-lg dark:bg-zinc-950">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-indigo-600">Administração</p>
            <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
              Cadastrar usuários
            </h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Crie contas de médico, administrador ou auditor.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900"
            >
              Sair
            </button>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">Nome</span>
              <input
                type="text"
                value={nome}
                onChange={(event) => setNome(event.target.value)}
                className={inputClassName}
                placeholder="Nome completo"
                disabled={loading}
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">CPF</span>
              <input
                type="text"
                value={cpf}
                onChange={(event) => setCpf(event.target.value)}
                className={inputClassName}
                placeholder="000.000.000-00"
                disabled={loading}
              />
            </label>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">Senha</span>
              <input
                type="password"
                value={senha}
                onChange={(event) => setSenha(event.target.value)}
                className={inputClassName}
                placeholder="••••••••"
                disabled={loading}
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">Perfil</span>
              <select
                value={role}
                onChange={(event) => setRole(event.target.value as AdminRole)}
                className={inputClassName}
                disabled={loading}
              >
                {roles.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {error ? <p className="text-sm text-red-600 dark:text-red-300">{error}</p> : null}
          {success ? (
            <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-800 dark:border-green-700 dark:bg-green-900/20 dark:text-green-100">
              {success}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Cadastrando..." : "Cadastrar usuário"}
          </button>
        </form>
      </div>
    </div>
  );
}
