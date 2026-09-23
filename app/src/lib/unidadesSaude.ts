/**
 * Unidades de saúde usadas no protótipo (dados de exemplo da região de Itaquera/SP).
 * Cada unidade informa o TIPO (UBS ou UPA) e as ESPECIALIDADES/serviços disponíveis,
 * que aparecem como "tags" na tela Buscar unidade e no mapa.
 */

export type TipoUnidade = "UBS" | "UPA";

export type UnidadeSaude = {
  nome: string;
  tipo: TipoUnidade;
  endereco: string;
  distanciaKm: number;
  horario: string;
  telefone: string;
  abertaAgora: boolean;
  lat: number;
  lon: number;
  especialidades: string[];
};

export const unidades: UnidadeSaude[] = [
  {
    nome: "UBS Jardim Esperança",
    tipo: "UBS",
    endereco: "Rua das Acácias, 245 — Jardim Esperança, São Paulo/SP",
    distanciaKm: 1.2,
    horario: "Seg a Sex, 7h–19h",
    telefone: "(11) 3123-4567",
    abertaAgora: true,
    lat: -23.5412,
    lon: -46.4721,
    especialidades: ["Clínica Geral", "Pediatria", "Ginecologia", "Vacinação", "Odontologia"],
  },
  {
    nome: "UBS Vila Nova",
    tipo: "UBS",
    endereco: "Av. Vila Nova, 980 — Vila Nova, São Paulo/SP",
    distanciaKm: 2.8,
    horario: "Seg a Sex, 7h–17h",
    telefone: "(11) 3123-8899",
    abertaAgora: true,
    lat: -23.5501,
    lon: -46.4652,
    especialidades: ["Clínica Geral", "Saúde Mental", "Vacinação", "Coleta de exames"],
  },
  {
    nome: "UBS Parque das Flores",
    tipo: "UBS",
    endereco: "Rua das Orquídeas, 112 — Parque das Flores, São Paulo/SP",
    distanciaKm: 3.5,
    horario: "Seg a Sáb, 7h–13h",
    telefone: "(11) 3123-2200",
    abertaAgora: false,
    lat: -23.5356,
    lon: -46.4589,
    especialidades: ["Clínica Geral", "Pediatria", "Odontologia", "Farmácia"],
  },
  {
    nome: "UBS Cidade Líder",
    tipo: "UBS",
    endereco: "Av. Águia de Haia, 3300 — Cidade Líder, São Paulo/SP",
    distanciaKm: 4.9,
    horario: "Seg a Sex, 7h–19h",
    telefone: "(11) 3123-7744",
    abertaAgora: true,
    lat: -23.5553,
    lon: -46.4861,
    especialidades: ["Clínica Geral", "Cardiologia", "Dermatologia", "Ginecologia", "Coleta de exames", "Farmácia"],
  },
  {
    nome: "UPA 24h Jardim Esperança",
    tipo: "UPA",
    endereco: "Av. Principal, 1500 — Jardim Esperança, São Paulo/SP",
    distanciaKm: 2.1,
    horario: "Todos os dias, 24 horas",
    telefone: "(11) 3124-0192",
    abertaAgora: true,
    lat: -23.5448,
    lon: -46.4777,
    especialidades: ["Urgência e Emergência", "Clínica Geral", "Pediatria", "Raio-X", "Sutura e curativos"],
  },
  {
    nome: "UPA 24h Cidade Líder",
    tipo: "UPA",
    endereco: "Rua do Pronto Atendimento, 80 — Cidade Líder, São Paulo/SP",
    distanciaKm: 5.4,
    horario: "Todos os dias, 24 horas",
    telefone: "(11) 3124-0193",
    abertaAgora: true,
    lat: -23.5598,
    lon: -46.4903,
    especialidades: ["Urgência e Emergência", "Clínica Geral", "Ortopedia", "Raio-X"],
  },
];
