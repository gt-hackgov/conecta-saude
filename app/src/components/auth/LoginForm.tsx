"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/auth/PasswordInput";
import type { Role } from "@/components/auth/RoleSelector";
import { saveSession } from "@/lib/authSession";
import { registrarAuditoria } from "@/lib/auditLog";
import { extractErrorMessage, formatCpf, isValidCpf, readErrorPayload } from "@/lib/authErrors";

type Props = {
  role: Role;
  successMessage?: string;
  onClearSuccessMessage?: () => void;
};

const ROLE_LABEL: Record<Role, string> = {
  PACIENTE: "paciente",
  MEDICO: "médico",
  ADMIN: "administrador",
};

function apiRoleLabel(apiRole: string): string {
  if (apiRole === "PACIENTE") return "paciente";
  if (apiRole === "MEDICO") return "médico";
  if (apiRole === "ADMIN") return "administrador";
  return apiRole.toLowerCase();
}

const fieldClassName = "h-11 rounded-xl px-4 text-sm";

export function LoginForm({ role, successMessage, onClearSuccessMessage }: Props) {
  const router = useRouter();
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (loading) return;

    if (!cpf || !password) {
      setError("Por favor, preencha todos os campos.");
      setNotice("");
      onClearSuccessMessage?.();
      return;
    }

    const normalizedCpf = cpf.replace(/\D/g, "");

    if (!isValidCpf(cpf)) {
      setError("Por favor, insira um CPF válido.");
      setNotice("");
      onClearSuccessMessage?.();
      return;
    }

    setLoading(true);
    setError("");
    setNotice("");
    onClearSuccessMessage?.();

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

      const apiRole = String(data.role);

      if (role !== apiRole) {
        setError(
          `Esse CPF pertence ao perfil de ${apiRoleLabel(apiRole)}, não a ${ROLE_LABEL[role]}. Volte e escolha o perfil correto.`
        );
        return;
      }

      saveSession({
        usuarioId: String(data.usuarioId),
        nome: String(data.nome),
        role: apiRole,
        token: String(data.token),
        cpf: normalizedCpf,
      });

      registrarAuditoria({
        ator: String(data.nome),
        perfil: String(data.role),
        acao: "LOGIN",
        alvo: "Sistema Conecta Saúde",
      });

      if (data.role === "PACIENTE") {
        router.push("/dashboard");
        return;
      }

      if (data.role === "MEDICO") {
        router.push("/dashboard-medico");
        return;
      }

      if (data.role === "ADMIN") {
        router.push("/dashboard-administrador");
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="login-cpf">CPF</Label>
        <Input
          id="login-cpf"
          value={cpf}
          onChange={(event) => setCpf(formatCpf(event.target.value))}
          className={fieldClassName}
          placeholder="000.000.000-00"
          type="text"
          inputMode="numeric"
          maxLength={14}
          autoComplete="username"
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="login-senha">Senha</Label>
        <PasswordInput
          id="login-senha"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className={fieldClassName}
          placeholder="••••••••"
          autoComplete="current-password"
          disabled={loading}
        />
      </div>

      {error ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-300">
          {error}
        </p>
      ) : null}

      {successMessage ? (
        <p className="text-sm text-green-700 dark:text-green-300">{successMessage}</p>
      ) : null}

      {notice ? <p className="text-sm text-muted-foreground">{notice}</p> : null}

      <Button
        type="submit"
        disabled={loading}
        variant="outline"
        className="h-12 w-full gap-3 rounded-full border-zinc-200 bg-white text-sm font-medium text-slate-800 shadow-sm hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900"
      >
        {loading ? (
          "Entrando..."
        ) : (
          <>
            <img
              src="/gov-br.png"
              alt=""
              width={72}
              height={24}
              className="h-6 w-auto"
              aria-hidden="true"
            />
            Entrar com gov.br
          </>
        )}
      </Button>
    </form>
  );
}
