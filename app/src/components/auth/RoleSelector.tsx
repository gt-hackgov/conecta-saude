"use client";

import { Stethoscope, ShieldCheck, User } from "lucide-react";
import { cn } from "@/lib/utils";

export type Role = "PACIENTE" | "MEDICO" | "ADMIN";

const roles: { value: Role; label: string; icon: typeof User }[] = [
  { value: "PACIENTE", label: "Paciente", icon: User },
  { value: "MEDICO", label: "Médico", icon: Stethoscope },
  { value: "ADMIN", label: "Administrador", icon: ShieldCheck },
];

type Props = {
  value: Role;
  onChange: (role: Role) => void;
  disabled?: boolean;
};

export function RoleSelector({ value, onChange, disabled }: Props) {
  return (
    <div
      role="radiogroup"
      aria-label="Selecione o perfil de acesso"
      className="grid grid-cols-3 gap-2 rounded-xl bg-muted/60 p-1"
    >
      {roles.map((role) => {
        const Icon = role.icon;
        const selected = role.value === value;

        return (
          <button
            key={role.value}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => onChange(role.value)}
            className={cn(
              "flex flex-col items-center gap-1 rounded-lg px-2 py-2.5 text-xs font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-60",
              selected
                ? "bg-background text-primary shadow-sm ring-1 ring-primary/20"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="size-4" aria-hidden="true" />
            {role.label}
          </button>
        );
      })}
    </div>
  );
}
