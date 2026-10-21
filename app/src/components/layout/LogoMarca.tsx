import { HeartPulse } from "lucide-react";

type LogoMarcaProps = {
  /** Mostra só o ícone (menu lateral recolhido). */
  compacto?: boolean;
};

/** Logo do Conecta Saúde: ícone de coração + nome + frase. Usado na home e nos painéis. */
export function LogoMarca({ compacto = false }: LogoMarcaProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
        <HeartPulse className="size-5" aria-hidden="true" />
      </span>
      {compacto ? (
        <span className="sr-only">Conecta Saúde</span>
      ) : (
        <div>
          <p className="font-heading text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Conecta Saúde
          </p>
          <p className="text-xs text-muted-foreground">Sua saúde em um só lugar</p>
        </div>
      )}
    </div>
  );
}
