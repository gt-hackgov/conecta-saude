# API RESTful - Conecta Saúde

Esta API foi desenvolvida em Next.js (App Router) utilizando Route Handlers para oferecer os dados persistentes necessários para o painel de pacientes do HackGov. Todos os endpoints privados requerem Autenticação Bearer.

## Base URL
Todas as rotas estão na pasta base: `/api`

---

## 1. Autenticação

### `POST /api/auth/login`
Simula o login do cidadão no sistema, validando CPF e Senha (mock).

- **Payload Esperado (Body)**:
  ```json
  {
    "cpf": "123.456.789-00",
    "password": "senha"
  }
  ```
- **Retorno de Sucesso (200 OK)**:
  ```json
  {
    "message": "Login realizado com sucesso",
    "token": "mock-token-12345678",
    "user": {
      "id": "usr-12345",
      "name": "Cidadão Exemplo",
      "cpf": "123.456.789-00"
    }
  }
  ```
- **Retorno de Erro (400 Bad Request)**: Campos faltantes.

---

## 2. Agendamentos (Appointments)

### `GET /api/appointments`
Retorna a lista do histórico de consultas do usuário logado.

- **Header Requerido**: `Authorization: Bearer <token>`
- **Retorno de Sucesso (200 OK)**:
  ```json
  {
    "appointments": [
      {
        "id": "apt-12345",
        "date": "10/11/2026",
        "time": "14:00",
        "location": "UBS Centro",
        "specialty": "Clínico Geral",
        "notes": "",
        "createdAt": "2026-09-07T12:00:00Z"
      }
    ]
  }
  ```
- **Retorno de Erro (401 Unauthorized)**: Ausência de token válido.

### `POST /api/appointments`
Cria um novo agendamento.

- **Header Requerido**: `Authorization: Bearer <token>`
- **Payload Esperado (Body)**:
  ```json
  {
    "date": "12/12/2026",
    "time": "08:30",
    "location": "UBS Norte",
    "specialty": "Cardiologista",
    "notes": "Levar exames anteriores"
  }
  ```
- **Retorno de Sucesso (201 Created)**: Retorna o objeto criado com `id`.
- **Retorno de Erro (400 Bad Request)**: Falta de parâmetros essenciais.

### `DELETE /api/appointments/[id]`
Remove um agendamento específico.

- **Header Requerido**: `Authorization: Bearer <token>`
- **Retorno de Sucesso (200 OK)**:
  ```json
  {
    "message": "Consulta cancelada com sucesso"
  }
  ```
- **Retorno de Erro (404 Not Found)**: `id` não existe no banco de dados.

---

## 3. Notificações (Notifications)

### `GET /api/notifications`
Obtém os alertas de saúde pendentes do paciente, retornando em ordem de relevância/tempo (FIFO).

- **Header Requerido**: `Authorization: Bearer <token>`
- **Retorno de Sucesso (200 OK)**:
  ```json
  {
    "notifications": [
      {
        "id": "notif-1",
        "title": "Previna-se da Dengue",
        "message": "Cuidado com água parada...",
        "time": "Agora"
      }
    ]
  }
  ```
