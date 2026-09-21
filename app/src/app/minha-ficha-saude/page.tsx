"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/authSession";
import { ThemeToggle } from "@/components/ThemeToggle";
import { BottomNav } from "@/components/BottomNav";

type FichaSaude = {
  nome: string;
  parentesco: string;
  tipoSanguineo: string;
  doadorSangue: boolean;
  doadorOrgaos: boolean;
  religiao: string;
  alergias: string[];
  atividadeFisica: string;
  condicaoCardiovascular: string;
  statusSorologico: string;
  contatoEmergencia: { nome: string; parentesco: string; telefone: string };
};

const DEPENDENTES_PADRAO: FichaSaude[] = [
  {
    nome: "Sofia Silva",
    parentesco: "Filha",
    tipoSanguineo: "O+",
    doadorSangue: false,
    doadorOrgaos: false,
    religiao: "Não informado",
    alergias: ["Nenhuma relatada"],
    atividadeFisica: "Ativa",
    condicaoCardiovascular: "Nenhuma relatada",
    statusSorologico: "Não se aplica (menor de idade)",
    contatoEmergencia: { nome: "Maria Silva", parentesco: "Mãe", telefone: "(11) 98888-1234" },
  },
  {
    nome: "José Silva",
    parentesco: "Pai",
    tipoSanguineo: "A-",
    doadorSangue: false,
    doadorOrgaos: false,
    religiao: "Testemunha de Jeová",
    alergias: [],
    atividadeFisica: "Sedentário",
    condicaoCardiovascular: "Hipertensão controlada",
    statusSorologico: "Não reagente",
    contatoEmergencia: { nome: "Maria Silva", parentesco: "Filha", telefone: "(11) 98888-1234" },
  },
];

const STORAGE_KEY = "saudeDigitalDependentes";

export default function MinhaFichaSaudePage() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [autorizado, setAutorizado] = useState(false);
  const [nomeUsuario, setNomeUsuario] = useState("Você");
  const [abaAtiva, setAbaAtiva] = useState(0);
  const [dependentes, setDependentes] = useState<FichaSaude[]>([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [novoNome, setNovoNome] = useState("");
  const [novoParentesco, setNovoParentesco] = useState("");
  const [novoTipoSanguineo, setNovoTipoSanguineo] = useState("");

  useEffect(() => {
    const session = getSession();
    setAutorizado(Boolean(session?.token && session.role === "PACIENTE"));
    setNomeUsuario(session?.nome ?? "Você");
    setChecked(true);

    const salvos = localStorage.getItem(STORAGE_KEY);
    if (salvos) {
      setDependentes(JSON.parse(salvos));
    } else {
      setDependentes(DEPENDENTES_PADRAO);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEPENDENTES_PADRAO));
    }
  }, []);

  useEffect(() => {
    if (checked && !autorizado) {
      router.replace("/");
    }
  }, [checked, autorizado, router]);

  if (!checked || !autorizado) {
    return null;
  }

  const titular: FichaSaude = {
    nome: nomeUsuario,
    parentesco: "Você",
    tipoSanguineo: "O+",
    doadorSangue: true,
    doadorOrgaos: true,
    religiao: "Não informado",
    alergias: ["Dipirona"],
    atividadeFisica: "Moderadamente ativa",
    condicaoCardiovascular: "Nenhuma relatada",
    statusSorologico: "Não reagente",
    contatoEmergencia: { nome: "João Silva", parentesco: "Cônjuge", telefone: "(11) 97777-2222" },
  };

  const perfis: FichaSaude[] = [titular, ...dependentes];

  const handleCadastrarDependente = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoNome || !novoParentesco) return;

    const novo: FichaSaude = {
      nome: novoNome,
      parentesco: novoParentesco,
      tipoSanguineo: novoTipoSanguineo || "Não informado",
      doadorSangue: false,
      doadorOrgaos: false,
      religiao: "Não informado",
      alergias: [],
      atividadeFisica: "Não informado",
      condicaoCardiovascular: "Não informado",
      statusSorologico: "Não informado",
      contatoEmergencia: { nome: "Não informado", parentesco: "—", telefone: "—" },
    };

    const atualizados = [...dependentes, novo];
    setDependentes(atualizados);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(atualizados));
    setAbaAtiva(atualizados.length);
    setMostrarForm(false);
    setNovoNome("");
    setNovoParentesco("");
    setNovoTipoSanguineo("");
  };

  const perfil = perfis[abaAtiva];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-indigo-50 to-white px-6 py-10 pb-24 dark:bg-none dark:bg-zinc-900">
      <div className="mx-auto w-full max-w-3xl">
        <header className="flex items-center justify-between rounded-3xl bg-white p-8 shadow-lg dark:bg-zinc-950">
          <div>
            <p className="text-sm font-semibold text-indigo-600">Minha ficha de saúde</p>
            <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-50">
              Informações e dependentes
            </h1>
            <p className="mt-2 max-w-xl text-sm text-zinc-600 dark:text-zinc-400">
              Dados visíveis apenas para você e a equipe de saúde que te atende.
            </p>
          </div>
          <ThemeToggle />
        </header>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          {perfis.map((p, index) => (
            <button
              key={`${p.nome}-${index}`}
              type="button"
              onClick={() => setAbaAtiva(index)}
              className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold transition ${
                abaAtiva === index
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-zinc-600 shadow-sm hover:bg-zinc-50 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900"
              }`}
            >
              {p.parentesco === "Você" ? `${p.nome.split(" ")[0]} (você)` : `${p.nome.split(" ")[0]} (${p.parentesco.toLowerCase()})`}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setMostrarForm((v) => !v)}
            className="whitespace-nowrap rounded-xl border border-dashed border-indigo-300 px-4 py-2 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-400 dark:hover:bg-indigo-950/30"
          >
            + Cadastrar dependente
          </button>
        </div>

        {mostrarForm ? (
          <form
            onSubmit={handleCadastrarDependente}
            className="mt-4 rounded-2xl bg-white p-6 shadow-sm dark:bg-zinc-950"
          >
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Novo dependente</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <input
                value={novoNome}
                onChange={(e) => setNovoNome(e.target.value)}
                placeholder="Nome completo"
                required
                className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm outline-none focus:border-indigo-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
              <input
                value={novoParentesco}
                onChange={(e) => setNovoParentesco(e.target.value)}
                placeholder="Parentesco (ex: Filho, Mãe)"
                required
                className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm outline-none focus:border-indigo-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
              <input
                value={novoTipoSanguineo}
                onChange={(e) => setNovoTipoSanguineo(e.target.value)}
                placeholder="Tipo sanguíneo (opcional)"
                className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm outline-none focus:border-indigo-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>
            <div className="mt-4 flex gap-2">
              <button
                type="submit"
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                Salvar dependente
              </button>
              <button
                type="button"
                onClick={() => setMostrarForm(false)}
                className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-700 dark:border-zinc-700 dark:text-zinc-200"
              >
                Cancelar
              </button>
            </div>
          </form>
        ) : null}

        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm dark:bg-zinc-950">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{perfil.nome}</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Tipo sanguíneo</p>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{perfil.tipoSanguineo}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Doador de sangue / órgãos</p>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {!perfil.doadorSangue && !perfil.doadorOrgaos
                  ? "Não é doador"
                  : [perfil.doadorSangue ? "Sangue" : null, perfil.doadorOrgaos ? "Órgãos" : null]
                      .filter(Boolean)
                      .join(" · ")}
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Religião (relevante p/ transfusão)</p>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{perfil.religiao}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Atividade física</p>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{perfil.atividadeFisica}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Alergias</p>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {perfil.alergias.length > 0 ? perfil.alergias.join(", ") : "Nenhuma relatada"}
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Condição cardiovascular</p>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{perfil.condicaoCardiovascular}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Status sorológico</p>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{perfil.statusSorologico}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Contato de emergência</p>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {perfil.contatoEmergencia.nome} ({perfil.contatoEmergencia.parentesco}) — {perfil.contatoEmergencia.telefone}
              </p>
            </div>
          </div>
        </section>

        <p className="mt-4 text-xs text-zinc-400">
          Para adicionar ou editar um dependente, procure atendimento presencial na UBS com um documento de identificação.
        </p>
      </div>

      <BottomNav />
    </div>
  );
}
