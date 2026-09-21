export function LandingBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-white to-blue-100 dark:from-zinc-950 dark:via-zinc-950 dark:to-blue-950" />
      <div className="absolute inset-0 bg-landing-photo bg-cover bg-center bg-no-repeat" />
      <div className="absolute inset-0 bg-gradient-to-br from-white/55 via-white/35 to-white/15 dark:from-zinc-950/80 dark:via-zinc-950/65 dark:to-zinc-950/45" />
      <div className="absolute -top-40 -right-32 size-[520px] rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -bottom-48 -left-40 size-[460px] rounded-full bg-sky-200/40 blur-3xl dark:bg-sky-900/20" />
    </div>
  );
}
