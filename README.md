# 🏥 Conecta Saúde

**O SUS na palma da mão: IA que orienta o cidadão para o lugar certo, na hora certa.**

Plataforma do projeto HackGov (FIAP · Sistemas de Informação) que conecta **cidadão**, **profissional de saúde** e **gestor** da rede pública. O cidadão descreve o que sente e recebe a orientação: **192 (SAMU), UPA ou UBS**. A fila da UPA é organizada por gravidade, e o gestor acompanha indicadores para decidir com dados.

> Projeto acadêmico. Os dados de atendimento são **sintéticos** (simulados), e o login gov.br é **simulado**.

Este repositório é o **front-end**. O back-end fica em [gt-hackgov/conectasaudebe](https://github.com/gt-hackgov/conectasaudebe).

---

## ✨ Funcionalidades

### 👤 Paciente (cidadão)
- **"O que você tem?"**: triagem assistida por IA com **trava de segurança** (detalhes abaixo).
- Chatbot de dúvidas.
- Agendamento de consultas e exames, histórico de consultas agendadas.
- Busca de UBS, resultados de exames, vacinas, ficha de saúde e perfil.

### 🩺 Médico
- **Fila de atendimento por risco** (Protocolo de Manchester), com o botão "Chamar próximo". A fila mostra só as iniciais do paciente.
- Consultas do dia, com indicação de risco de falta.
- Indicadores da unidade.

### 🛠️ Administrador
- **Indicadores da plataforma** calculados por consultas SQL no back-end: faltas por especialidade, espera média, demanda por dia e casos de baixo risco na UPA.
- Cadastro e gestão de usuários.
- Trilha de auditoria.
- A amostra demonstrativa da Fase 2 (demanda por especialidade) fica recolhida no painel.

### 🌗 Geral
- Modo claro e escuro, layout responsivo para celular e computador.

---

## 🤖 Como a triagem com IA decide

São três camadas, e o resultado final é **sempre o mais grave**:

1. **Regras fixas**: sinais de alarme (dor no peito, desmaio, falta de ar, sinais de AVC...) levam direto ao **192**.
2. **IA**: lê o relato livre e devolve o nível (192, UPA ou UBS) com a justificativa.
3. **Trava**: a IA pode **aumentar** a gravidade, nunca diminuir.

Se não houver chave de IA ou a IA estiver fora do ar, o sistema continua funcionando **só com as regras** (a tela mostra "Analisado por regras de segurança"). O relato do sintoma **não é salvo**.

IA usada (gratuita, sem cartão): **Llama 3.3 70B via Groq**. O **Gemini** (Google AI Studio) é uma alternativa, escolhida por configuração.

---

## 🧱 Arquitetura

```
Navegador ──► Front-end (Next.js, este repositório) ──/api/*──► Back-end (Spring Boot)
                    │                                                │
                    └── rotas /api/triagem e /api/chatbot ──► IA     └── Banco H2 (em memória)
                        (a chave da IA fica só no servidor)
```

- O front-end repassa as chamadas `/api/*` ao back-end (configurado em `next.config.ts`, pela variável `BACKEND_URL`).
- O login gera um token **JWT**; cada perfil (PACIENTE, MEDICO, ADMIN) só acessa as próprias rotas, e a verificação acontece no servidor.

## 🚀 Tecnologias

| Camada | Tecnologia |
|---|---|
| Front-end | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4 |
| Back-end | Java 21, Spring Boot, Spring Security (JWT + BCrypt), JPA, H2 |
| IA | Groq (Llama 3.3 70B) ou Google Gemini, ambos no plano gratuito |
| Qualidade | GitHub Actions (build em cada PR), testes automatizados no back-end |

---

## 📦 Como rodar localmente

São **dois projetos** e **dois terminais**: primeiro o back-end, depois o front-end.

### Pré-requisitos
- Node.js 20+ e npm
- Java 21 (o back-end já vem com o Maven Wrapper, `mvnw`)

### 1. Back-end (terminal 1)

```bash
git clone https://github.com/gt-hackgov/conectasaudebe.git
cd conectasaudebe/api
```

Defina as variáveis de ambiente e suba o servidor. Exemplo no **PowerShell (Windows)**:

```powershell
$env:JWT_SECRET="MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY="
$env:SPRING_PROFILES_ACTIVE="dev"
$env:DEV_USER_CPF="11111111111";     $env:DEV_USER_NAME="Admin";   $env:DEV_USER_PASSWORD="Admin@123"
$env:DEV_MEDICO_CPF="22222222222";   $env:DEV_MEDICO_NAME="Joao";  $env:DEV_MEDICO_PASSWORD="Medico@123"
$env:DEV_PACIENTE_CPF="33333333333"; $env:DEV_PACIENTE_NAME="Maria"; $env:DEV_PACIENTE_PASSWORD="Paciente@123"
.\mvnw.cmd spring-boot:run
```

No Linux ou macOS, use `export NOME=valor` e `./mvnw spring-boot:run`.

O back-end sobe em `http://localhost:8080`. O `JWT_SECRET` acima serve **só para desenvolvimento local**.

### 2. Front-end (terminal 2)

```bash
git clone https://github.com/gt-hackgov/conecta-saude.git
cd conecta-saude/app
npm install
```

Copie `app/.env.example` para `app/.env.local` e preencha:

```env
BACKEND_URL=http://localhost:8080
GROQ_API_KEY=sua_chave_gratuita        # https://console.groq.com/keys
GROQ_MODEL=llama-3.3-70b-versatile
# ou, no lugar do Groq:
# GEMINI_API_KEY=sua_chave_gratuita    # https://aistudio.google.com/apikey
```

> ⚠️ **Nunca** envie o `.env.local` nem chaves para o GitHub. Ele já está no `.gitignore`. Cada integrante gera a sua chave gratuita.

Rode:

```bash
npm run dev          # desenvolvimento
# ou, para apresentar (mais rápido e estável):
npm run build
npm start
```

Acesse: http://localhost:3000

### 🔐 Usuários de teste (perfil `dev` do back-end)

| Perfil | CPF | Senha |
|---|---|---|
| Paciente | 333.333.333-33 | Paciente@123 |
| Médico | 222.222.222-22 | Medico@123 |
| Administrador | 111.111.111-11 | Admin@123 |

Os usuários são criados ao iniciar o back-end. O banco é **em memória**: ao reiniciar o back-end, os dados voltam ao estado inicial.

### ❓ Problemas comuns

| Sintoma | Causa provável | Solução |
|---|---|---|
| "Erro interno" ou falha no login | O back-end não está rodando, ou faltaram as variáveis | Confira o terminal 1 e as variáveis `DEV_*` e `JWT_SECRET` |
| Login recusado com CPF antigo (129.259.450-07) | Esse usuário era da versão simulada antiga | Use os usuários de teste acima |
| Triagem mostra "Analisado por regras de segurança" | Sem chave de IA no `.env.local` | Preencha `GROQ_API_KEY` e reinicie o `npm run dev` |
| Indicadores não carregam | O back-end está fora do ar ou o login não é de ADMIN | Suba o back-end e entre como administrador |

---

## 🛣️ Rotas principais

| Rota | Perfil | Descrição |
|---|---|---|
| `/` | todos | Página inicial e login |
| `/dashboard` | Paciente | Painel do paciente |
| `/o-que-voce-tem` | Paciente | Triagem com IA |
| `/agendar-consulta`, `/agendar-exame` | Paciente | Agendamentos |
| `/consultas-agendadas` | Paciente | Histórico |
| `/buscar-ubs`, `/resultado-exames`, `/historico-vacinas`, `/minha-ficha-saude` | Paciente | Serviços |
| `/dashboard-medico` | Médico | Painel do médico |
| `/dashboard-medico/fila` | Médico | Fila por gravidade |
| `/dashboard-medico/consultas`, `/dashboard-medico/indicadores` | Médico | Consultas do dia e indicadores |
| `/dashboard-administrador` | Admin | Indicadores SQL e visão geral |
| `/admin/usuarios` | Admin | Gestão de usuários |

## 📁 Estrutura

```
app/
├── public/                 # imagens e logo
├── src/app/                # páginas (Next.js App Router)
│   └── api/                # rotas do servidor: triagem e chatbot (chamam a IA)
├── src/components/         # componentes (home, layout, admin, medico, ui...)
└── src/lib/                # sessão, regras de triagem, utilitários
```

## 🔒 Segurança e LGPD

- O relato da triagem não é salvo nem registrado em log.
- A fila mostra só as iniciais do paciente, sem CPF.
- O acesso é controlado por perfil no servidor. As senhas são guardadas com BCrypt, e o token tem validade.
- A trilha de auditoria registra as ações sensíveis.
- As chaves de IA ficam só no servidor (`.env.local`) e nunca no navegador ou no GitHub.

## ⚠️ Limitações conhecidas

- O login gov.br é **simulado** (o botão é visual).
- O banco H2 é **em memória** e os dados de atendimento são **sintéticos**.
- Ainda não há integração com sistemas reais do SUS (RNDS, CNES). Essas integrações estão previstas como próximos passos.
- A IA dá **orientação e não diagnóstico**. Em emergência, ligue 192.

---

## 🌿 Fluxo de contribuição

Branches novas a partir de `develop` → Pull Request para `develop` (com build verde e aprovação de outro integrante) → `develop` é promovida para `main` ao final de cada fase.

```bash
git checkout develop
git pull
git checkout -b feat/nome-da-sua-task
# ...alterações...
git add .
git commit -m "feat: descrição curta"
git push -u origin feat/nome-da-sua-task
```

Prefixos usados nos commits e branches: `feat:` (nova funcionalidade), `fix:` (correção), `design:` (visual), `docs:` (documentação), `chore:` (manutenção).

## 👥 Equipe

| Integrante | GitHub |
|---|---|
| Bruna Boschi Santos | [@bruboschi](https://github.com/bruboschi) |
| Gabriela de Carvalho Gonçalves | [@gabcrvlh](https://github.com/gabcrvlh) |
| Lívia Scoralick | [@lilicoralick](https://github.com/lilicoralick) |
| Michael Marotto | [@marottomichael](https://github.com/marottomichael) |
| Davi Grabalos | [@davigrabalos](https://github.com/davigrabalos) |

Projeto HackGov · FIAP · 2026
