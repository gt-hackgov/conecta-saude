import { FeatureHighlights } from "@/components/home/FeatureHighlights";

export function HeroSection() {
  return (
    <div className="max-w-xl space-y-7">
      <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold tracking-wide text-primary uppercase">
        Saúde pública digital
      </span>

      <h1 className="font-heading text-4xl leading-[1.1] font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
        Cuidado que <span className="text-primary">te acompanha</span> em cada etapa.
      </h1>

      <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
        Agende consultas, acompanhe os resultados dos seus exames e encontre a UBS mais próxima de
        você. Tudo em um só lugar, com seus dados protegidos do começo ao fim.
      </p>

      <FeatureHighlights />
    </div>
  );
}
