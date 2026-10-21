import { Globe } from "lucide-react";
import { LogoMarca } from "@/components/layout/LogoMarca";
import { Button } from "@/components/ui/button";

export function LandingHeader() {
  return (
    <header className="flex items-center justify-between gap-4 py-6">
      <LogoMarca />

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
