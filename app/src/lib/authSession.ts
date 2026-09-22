export type AuthSession = {
  usuarioId: string;
  nome: string;
  role: string;
  token: string;
  /** CPF (somente dígitos) — usado para reconfirmar a senha antes de downloads sensíveis. */
  cpf?: string;
};

const STORAGE_KEY = "conectaSaudeSession";

export function saveSession(session: AuthSession) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function getSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

export function removeSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

const roleHomeHref: Record<string, string> = {
  PACIENTE: "/dashboard",
  MEDICO: "/dashboard-medico",
  ADMIN: "/dashboard-administrador",
};

export function getHomeHref(): string {
  const session = getSession();
  if (!session?.role) return "/";
  return roleHomeHref[session.role] ?? "/";
}
