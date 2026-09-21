"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { extractErrorMessage, formatCpf, isValidCpf, readErrorPayload } from "@/lib/authErrors";

type Props = {
  onRegistered: (message: string) => void;
};

const fieldClassName = "h-11 rounded-xl px-4 text-sm";

export function RegisterForm({ onRegistered }: Props) {
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (loading) return;

    if (!nome.trim() || !cpf || !password || !confirmPassword) {
      setError("Por favor, preencha todos os campos.");
      return;
    }

    const normalizedCpf = cpf.replace(/\D/g, "");

    if (!isValidCpf(cpf)) {
      setError("Por favor, insira um CPF válido.");
      return;
    }

    if (password !== confirmPassword) {
      setError("A senha e a confirmação precisam ser iguais.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cpf: normalizedCpf,
          nome: nome.trim(),
          senha: password,
        }),
      });

      if (response.status === 201) {
        onRegistered("Cadastro realizado com sucesso. Faça login para continuar.");
        return;
      }

      const payload = await readErrorPayload(response);

      if (response.status === 409) {
        setError(
          payload && typeof payload === "object" && "message" in payload && typeof (payload as { message?: unknown }).message === "string"
            ? String((payload as { message: string }).message)
            : "Este CPF já está cadastrado."
        );
        return;
      }

      if (response.status === 400) {
        setError(extractErrorMessage(payload, 400));
        return;
      }

      if (response.status >= 500) {
        setError("Erro interno. Tente novamente.");
        return;
      }

      setError(extractErrorMessage(payload, response.status));
    } catch {
      setError("Não foi possível conectar ao serviço. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="register-nome">Nome</Label>
        <Input
          id="register-nome"
          value={nome}
          onChange={(event) => setNome(event.target.value)}
          className={fieldClassName}
          placeholder="Seu nome completo"
          type="text"
          autoComplete="name"
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-cpf">CPF</Label>
        <Input
          id="register-cpf"
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
        <Label htmlFor="register-senha">Senha</Label>
        <PasswordInput
          id="register-senha"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className={fieldClassName}
          placeholder="••••••••"
          autoComplete="new-password"
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-confirmar-senha">Confirmar senha</Label>
        <PasswordInput
          id="register-confirmar-senha"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          className={fieldClassName}
          placeholder="••••••••"
          autoComplete="new-password"
          disabled={loading}
        />
      </div>

      {error ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-300">
          {error}
        </p>
      ) : null}

      <Button type="submit" disabled={loading} className="h-11 w-full rounded-xl text-sm">
        {loading ? "Criando conta..." : "Criar conta"}
      </Button>
    </form>
  );
}
