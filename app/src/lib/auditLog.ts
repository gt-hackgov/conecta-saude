export type AcaoAuditoria =
  | "LOGIN"
  | "CONSULTA_DADO_SENSIVEL"
  | "EXPORTACAO_DADOS"
  | "CANCELAMENTO_AGENDAMENTO";

export type RegistroAuditoria = {
  timestamp: string;
  ator: string;
  perfil: string;
  acao: AcaoAuditoria;
  alvo: string;
};

const STORAGE_KEY = "saudeDigitalAuditoria";

export function registrarAuditoria(entrada: Omit<RegistroAuditoria, "timestamp">) {
  if (typeof window === "undefined") return;

  const registro: RegistroAuditoria = {
    ...entrada,
    timestamp: new Date().toISOString(),
  };

  const atuais = listarAuditoria();
  const atualizados = [registro, ...atuais].slice(0, 200);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(atualizados));
}

export function listarAuditoria(): RegistroAuditoria[] {
  if (typeof window === "undefined") return [];
  const salvos = localStorage.getItem(STORAGE_KEY);
  return salvos ? JSON.parse(salvos) : [];
}
