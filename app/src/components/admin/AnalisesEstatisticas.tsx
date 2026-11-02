"use client";

/**
 * Análises estatísticas (correlação de Pearson e regressão linear) calculadas no back-end
 * e entregues junto com os indicadores (campo "analises" de GET /api/admin/indicadores).
 * O gráfico de dispersão é desenhado em SVG puro, sem biblioteca extra.
 */

export type Ponto = { x: number; y: number };
export type Analise = {
  id: string;
  titulo: string;
  pergunta: string;
  rotuloX: string;
  rotuloY: string;
  n: number;
  r: number;
  r2: number;
  inclinacao: number;
  intercepto: number;
  forca: "forte" | "moderada" | "fraca";
  sentido: "positiva" | "negativa" | "nula";
  interpretacao: string;
  acaoSugerida: string;
  previsao?: Ponto;
  pontos: Ponto[];
};

const fmt = (v: number, casas = 2) =>
  v.toLocaleString("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas });

const COR_FORCA: Record<Analise["forca"], string> = {
  forte: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
  moderada: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
  fraca: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
};

function Dispersao({ a }: { a: Analise }) {
  const L = 340, A = 190, M = { e: 40, d: 10, t: 10, b: 30 };
  const xs = a.pontos.map((p) => p.x);
  const ys = a.pontos.map((p) => p.y);
  const xMin = Math.min(...xs), xMax = Math.max(...xs);
  const yMin = Math.min(...ys, a.intercepto + a.inclinacao * xMin, a.intercepto + a.inclinacao * xMax);
  const yMax = Math.max(...ys, a.intercepto + a.inclinacao * xMin, a.intercepto + a.inclinacao * xMax);
  const px = (x: number) => M.e + ((x - xMin) / (xMax - xMin || 1)) * (L - M.e - M.d);
  const py = (y: number) => A - M.b - ((y - yMin) / (yMax - yMin || 1)) * (A - M.t - M.b);
  const descricao = `Gráfico de dispersão de ${a.rotuloX} por ${a.rotuloY}, ${a.n} pontos, com reta de regressão.`;

  return (
    <svg viewBox={`0 0 ${L} ${A}`} role="img" aria-label={descricao} className="mt-4 h-auto w-full">
      <line x1={M.e} y1={A - M.b} x2={L - M.d} y2={A - M.b} className="stroke-zinc-300 dark:stroke-zinc-700" />
      <line x1={M.e} y1={M.t} x2={M.e} y2={A - M.b} className="stroke-zinc-300 dark:stroke-zinc-700" />
      {a.pontos.map((p, i) => (
        <circle key={i} cx={px(p.x)} cy={py(p.y)} r={2.6} className="fill-sky-500/45" />
      ))}
      <line
        x1={px(xMin)} y1={py(a.intercepto + a.inclinacao * xMin)}
        x2={px(xMax)} y2={py(a.intercepto + a.inclinacao * xMax)}
        className="stroke-rose-600" strokeWidth={2}
      />
      <text x={M.e} y={A - 8} className="fill-zinc-500 text-[10px]">{fmt(xMin, 0)}</text>
      <text x={L - M.d} y={A - 8} textAnchor="end" className="fill-zinc-500 text-[10px]">{fmt(xMax, 0)}</text>
      <text x={(L + M.e) / 2} y={A - 8} textAnchor="middle" className="fill-zinc-600 text-[10px] dark:fill-zinc-400">{a.rotuloX}</text>
      <text x={M.e - 4} y={M.t + 8} textAnchor="end" className="fill-zinc-500 text-[10px]">{fmt(yMax, 0)}</text>
      <text x={M.e - 4} y={A - M.b} textAnchor="end" className="fill-zinc-500 text-[10px]">{fmt(yMin, 0)}</text>
    </svg>
  );
}

export function AnalisesEstatisticas({ analises }: { analises?: Analise[] }) {
  if (!analises || analises.length === 0) return null;

  return (
    <section className="mt-12" aria-labelledby="titulo-analises">
      <p className="text-[11px] font-semibold tracking-[0.16em] text-sky-700 uppercase dark:text-sky-300">
        Correlação e regressão
      </p>
      <h3 id="titulo-analises" className="mt-2 text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Análises estatísticas para decisão
      </h3>
      <p className="mt-1 max-w-3xl text-sm text-zinc-600 dark:text-zinc-400">
        O banco agrupa os atendimentos por dia e o sistema calcula a correlação de Pearson (r) e a reta de
        regressão (ŷ = a + b·x). Pontos azuis são os dias observados; a linha vermelha é a tendência.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {analises.map((a) => (
          <article key={a.id} className="rounded-3xl bg-white p-6 shadow-sm dark:bg-zinc-950">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h4 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">{a.titulo}</h4>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{a.pergunta}</p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${COR_FORCA[a.forca]}`}>
                Correlação {a.forca}
              </span>
            </div>

            <dl className="mt-4 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-xl bg-sky-50 p-2 dark:bg-zinc-900">
                <dt className="text-[11px] text-zinc-500">r (Pearson)</dt>
                <dd className="text-lg font-semibold text-sky-700 tabular-nums dark:text-sky-300">{fmt(a.r)}</dd>
              </div>
              <div className="rounded-xl bg-sky-50 p-2 dark:bg-zinc-900">
                <dt className="text-[11px] text-zinc-500">R²</dt>
                <dd className="text-lg font-semibold text-sky-700 tabular-nums dark:text-sky-300">{fmt(a.r2)}</dd>
              </div>
              <div className="rounded-xl bg-sky-50 p-2 dark:bg-zinc-900">
                <dt className="text-[11px] text-zinc-500">Reta</dt>
                <dd className="text-xs font-semibold text-sky-700 tabular-nums dark:text-sky-300">
                  ŷ = {fmt(a.intercepto, 1)} {a.inclinacao >= 0 ? "+" : "−"} {fmt(Math.abs(a.inclinacao))}·x
                </dd>
              </div>
            </dl>

            <Dispersao a={a} />

            <p className="mt-3 text-sm text-zinc-700 dark:text-zinc-300">{a.interpretacao}</p>
            {a.previsao && (
              <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
                <strong>Previsão:</strong> com {a.rotuloX} = {fmt(a.previsao.x, 0)}, o modelo estima{" "}
                {a.rotuloY.toLowerCase()} ≈ <strong>{fmt(a.previsao.y, 1)}</strong>.
              </p>
            )}
            <p className="mt-3 rounded-xl border-l-4 border-sky-500 bg-sky-50/70 p-3 text-sm text-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
              <strong>Decisão sugerida:</strong> {a.acaoSugerida}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
