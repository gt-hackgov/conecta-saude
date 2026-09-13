"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { A11Y_KEYS, applyAccessibilityPreferences } from "@/lib/accessibility";

export default function ConfiguracoesPage() {
  const router = useRouter();
  const [fontInput, setFontInput] = useState("100");
  const [spacing, setSpacing] = useState<"padrao" | "medio" | "amplo">("padrao");
  const [contraste, setContraste] = useState<"padrao" | "alto-contraste">("padrao");
  const [reduceMotion, setReduceMotion] = useState(false);
  const [colorblind, setColorblind] = useState<"nenhum" | "protanopia" | "deuteranopia" | "tritanopia">("nenhum");
  const [lendo, setLendo] = useState(false);

  useEffect(() => {
    setFontInput(localStorage.getItem(A11Y_KEYS.fontScale) ?? "100");
    setSpacing((localStorage.getItem(A11Y_KEYS.spacing) as typeof spacing) ?? "padrao");
    setContraste((localStorage.getItem(A11Y_KEYS.contrast) as typeof contraste) ?? "padrao");
    setReduceMotion(localStorage.getItem(A11Y_KEYS.reduceMotion) === "true");
    setColorblind((localStorage.getItem(A11Y_KEYS.colorblind) as typeof colorblind) ?? "nenhum");
  }, []);

  const salvarFonte = () => {
    const valor = Math.min(200, Math.max(100, Number(fontInput) || 100));
    localStorage.setItem(A11Y_KEYS.fontScale, String(valor));
    applyAccessibilityPreferences();
  };

  const escolherSpacing = (valor: typeof spacing) => {
    setSpacing(valor);
    localStorage.setItem(A11Y_KEYS.spacing, valor);
    applyAccessibilityPreferences();
  };

  const escolherContraste = (valor: typeof contraste) => {
    setContraste(valor);
    localStorage.setItem(A11Y_KEYS.contrast, valor);
    applyAccessibilityPreferences();
  };

  const alternarReduceMotion = () => {
    const novo = !reduceMotion;
    setReduceMotion(novo);
    localStorage.setItem(A11Y_KEYS.reduceMotion, String(novo));
    applyAccessibilityPreferences();
  };

  const escolherColorblind = (valor: typeof colorblind) => {
    setColorblind(valor);
    localStorage.setItem(A11Y_KEYS.colorblind, valor);
    applyAccessibilityPreferences();
  };

  const lerPagina = () => {
    const texto = document.querySelector("main")?.textContent || document.body.innerText;
    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = "pt-BR";
    utterance.onend = () => setLendo(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setLendo(true);
  };

  const pausarLeitura = () => window.speechSynthesis.pause();
  const pararLeitura = () => {
    window.speechSynthesis.cancel();
    setLendo(false);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-indigo-50 to-white px-6 py-10 pb-24 dark:bg-none dark:bg-zinc-900">
      <div className="mx-auto w-full max-w-3xl">
        <header className="flex items-center justify-between rounded-3xl bg-white p-8 shadow-lg dark:bg-zinc-950">
          <div>
            <p className="text-sm font-semibold text-indigo-600">Configurações</p>
            <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50">Acessibilidade</h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Personalize o sistema para atender às suas necessidades visuais e de leitura.
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900"
          >
            Voltar
          </button>
        </header>

        <p className="mt-4 rounded-xl bg-indigo-50 px-4 py-3 text-xs text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-300">
          As preferências são salvas neste navegador, então já funcionam antes do login e continuam ativas depois que você entra.
        </p>

        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm dark:bg-zinc-950">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Tamanho da fonte</h2>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Ajuste o tamanho de todos os textos da aplicação (100% a 200%).
          </p>
          <div className="mt-3 flex items-center gap-3">
            <input
              type="number"
              min={100}
              max={200}
              value={fontInput}
              onChange={(e) => setFontInput(e.target.value)}
              className="w-24 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
            <span className="text-sm text-zinc-500 dark:text-zinc-400">%</span>
            <button
              type="button"
              onClick={salvarFonte}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              Confirmar
            </button>
          </div>
        </section>

        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm dark:bg-zinc-950">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Espaçamento de texto</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {(["padrao", "medio", "amplo"] as const).map((op) => (
              <button
                key={op}
                type="button"
                onClick={() => escolherSpacing(op)}
                className={`rounded-xl border px-4 py-3 text-left text-sm transition ${
                  spacing === op
                    ? "border-indigo-400 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-300"
                    : "border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
                }`}
              >
                {op === "padrao" ? "Padrão" : op === "medio" ? "Médio" : "Amplo"}
              </button>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm dark:bg-zinc-950">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Contraste</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {(["padrao", "alto-contraste"] as const).map((op) => (
              <button
                key={op}
                type="button"
                onClick={() => escolherContraste(op)}
                className={`rounded-xl border px-4 py-3 text-left text-sm transition ${
                  contraste === op
                    ? "border-indigo-400 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-300"
                    : "border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
                }`}
              >
                {op === "padrao" ? "Padrão" : "Alto contraste"}
              </button>
            ))}
          </div>
        </section>

        <section className="mt-6 flex items-center justify-between rounded-2xl bg-white p-6 shadow-sm dark:bg-zinc-950">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Movimento e animações</h2>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Reduza animações e transições para maior conforto visual.
            </p>
          </div>
          <button
            type="button"
            onClick={alternarReduceMotion}
            aria-pressed={reduceMotion}
            className={`relative h-7 w-12 rounded-full transition ${reduceMotion ? "bg-indigo-600" : "bg-zinc-300 dark:bg-zinc-700"}`}
          >
            <span
              className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-transform ${reduceMotion ? "translate-x-6" : "translate-x-1"}`}
            />
          </button>
        </section>

        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm dark:bg-zinc-950">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Leitura em voz</h2>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Permite que o conteúdo da página seja lido em voz alta.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={lerPagina}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              Ler conteúdo da página
            </button>
            <button
              type="button"
              onClick={pausarLeitura}
              disabled={!lendo}
              className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-700 disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-200"
            >
              Pausar
            </button>
            <button
              type="button"
              onClick={pararLeitura}
              disabled={!lendo}
              className="rounded-xl bg-red-100 px-4 py-2 text-sm font-semibold text-red-700 disabled:opacity-40 dark:bg-red-950/30 dark:text-red-300"
            >
              Parar
            </button>
          </div>
        </section>

        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm dark:bg-zinc-950">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Filtros de daltonismo</h2>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Aplicam filtros de coloração que ajudam na distinção de mapas, semáforos e gráficos.
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {(["nenhum", "protanopia", "deuteranopia", "tritanopia"] as const).map((op) => (
              <button
                key={op}
                type="button"
                onClick={() => escolherColorblind(op)}
                className={`rounded-xl border px-3 py-2 text-xs font-medium capitalize transition ${
                  colorblind === op
                    ? "border-indigo-400 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-300"
                    : "border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
                }`}
              >
                {op}
              </button>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
