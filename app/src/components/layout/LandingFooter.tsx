const integrantes = [
  { nome: "Bruna Boschi Santos", github: "https://github.com/bruboschi" },
  { nome: "Gabriela de Carvalho Gonçalves", github: "https://github.com/gabcrvlh" },
  { nome: "Lívia Scoralick", github: "https://github.com/lilicoralick" },
  { nome: "Michael Marotto", github: "https://github.com/marottomichael" },
  { nome: "Davi Grabalos", github: "https://github.com/davigrabalos" },
];

export function LandingFooter() {
  return (
    <footer className="flex flex-col items-center gap-3 border-t border-foreground/10 py-6 text-center lg:flex-row lg:justify-between lg:text-left">
      <p className="text-xs text-muted-foreground">
        Desenvolvido pelo grupo HackGov — Conecta Saúde
      </p>

      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
        {integrantes.map((integrante) => (
          <a
            key={integrante.nome}
            href={integrante.github}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-md text-xs text-muted-foreground transition hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49 0-.24-.01-1.04-.01-1.89-2.78.62-3.37-1.21-3.37-1.21-.45-1.18-1.11-1.5-1.11-1.5-.9-.63.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.05 0-1.12.39-2.03 1.03-2.74-.1-.26-.45-1.31.1-2.72 0 0 .84-.27 2.75 1.05a9.4 9.4 0 0 1 2.5-.34c.85 0 1.71.12 2.5.34 1.91-1.32 2.75-1.05 2.75-1.05.55 1.41.2 2.46.1 2.72.64.71 1.03 1.62 1.03 2.74 0 3.92-2.35 4.78-4.58 5.04.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.6.69.49A10.26 10.26 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z" />
            </svg>
            {integrante.nome}
          </a>
        ))}
      </div>
    </footer>
  );
}
