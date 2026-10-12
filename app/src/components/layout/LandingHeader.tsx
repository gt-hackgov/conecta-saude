import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LandingHeader() {
  return (
    <header className="flex items-center justify-between gap-4 py-6">
      <img
        src="/conecta_saude_logo_transparente_8k.png"
        alt="Conecta Saúde"
        className="h-24 w-auto sm:h-32 dark:rounded-lg dark:bg-white dark:p-1.5"
      />

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
