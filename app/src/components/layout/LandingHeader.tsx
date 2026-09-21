import { Globe, HeartPulse } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LandingHeader() {
  return (
    <header className="flex items-center justify-between gap-4 py-6">
      <div className="flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
          <HeartPulse className="size-5" aria-hidden="true" />
        </span>
        <div>
          <p className="font-heading text-base font-semibold tracking-tight">Conecta Saúde</p>
          <p className="text-xs text-muted-foreground">Sua saúde em um só lugar</p>
        </div>
      </div>

      <Button
        variant="ghost"
        size="sm"
        disabled
        aria-label="Idioma selecionado: Português do Brasil"
        className="h-9 rounded-full px-3 text-xs font-medium text-muted-foreground opacity-100 disabled:opacity-100"
      >
        <Globe className="size-4" aria-hidden="true" />
        PT-BR
      </Button>
    </header>
  );
}
