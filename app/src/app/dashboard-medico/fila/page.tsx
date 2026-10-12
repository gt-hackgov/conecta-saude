"use client";

import { FilaAtendimento } from "@/components/medico/FilaAtendimento";
import { MedicoShell } from "@/components/medico/MedicoShell";

export default function FilaMedicoPage() {
  return (
    <MedicoShell
      title="Fila de atendimento"
      description="Ordenada por gravidade e depois por chegada."
    >
      <FilaAtendimento />
    </MedicoShell>
  );
}
