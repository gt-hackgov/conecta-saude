"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { RoleSelector, type Role } from "@/components/auth/RoleSelector";

const loginDescription: Record<Role, string> = {
  PACIENTE: "Faça login com sua conta gov.br para acessar os serviços.",
  MEDICO: "Acesso exclusivo para profissionais de saúde cadastrados.",
  ADMIN: "Acesso exclusivo para administradores do sistema.",
};

export function AuthCard() {
  const [role, setRole] = useState<Role>("PACIENTE");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [successMessage, setSuccessMessage] = useState("");

  const handleRoleChange = (nextRole: Role) => {
    setRole(nextRole);
    if (nextRole !== "PACIENTE") {
      setMode("login");
    }
  };

  const goToLogin = (message = "") => {
    setSuccessMessage(message);
    setMode("login");
  };

  const isRegister = mode === "register";

  return (
    <Card className="w-full max-w-md rounded-3xl bg-card/85 py-8 shadow-[0_24px_60px_-24px_rgba(15,23,42,0.35)] ring-foreground/5 backdrop-blur-xl">
      <CardHeader className="px-8">
        {isRegister ? (
          <button
            type="button"
            onClick={() => goToLogin()}
            className="mb-2 inline-flex w-fit items-center gap-1.5 text-xs font-semibold text-primary transition hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            Voltar ao login
          </button>
        ) : null}

        <CardTitle className="text-2xl font-semibold tracking-tight">
          {isRegister ? "Criar conta" : "Entrar com gov.br"}
        </CardTitle>
        <CardDescription>
          {isRegister
            ? "Cadastre-se para acessar os serviços como paciente."
            : loginDescription[role]}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5 px-8">
        {isRegister ? null : (
          <RoleSelector value={role} onChange={handleRoleChange} />
        )}

        {isRegister ? (
          <RegisterForm onRegistered={goToLogin} />
        ) : (
          <LoginForm
            role={role}
            successMessage={successMessage}
            onClearSuccessMessage={() => setSuccessMessage("")}
          />
        )}

        {!isRegister && role === "PACIENTE" ? (
          <p className="text-center text-sm text-muted-foreground">
            Não tem conta?{" "}
            <button
              type="button"
              onClick={() => {
                setSuccessMessage("");
                setMode("register");
              }}
              className="font-semibold text-primary transition hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Criar conta
            </button>
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
