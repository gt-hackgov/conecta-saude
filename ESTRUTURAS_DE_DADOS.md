# Estruturas de Dados Avançadas - Conecta Saúde

Este documento descreve como implementamos e utilizamos as estruturas de **Fila (Queue)**, **Pilha (Stack)** e **Lista Encadeada (LinkedList)** para suportar processos reais no ecossistema front-end e estado da API do Conecta Saúde.

## Arquivos Principais
- A definição rigorosa (classes com tipagem Genérica no TypeScript) das três estruturas encontra-se em `app/src/lib/dataStructures.ts`.

---

## 1. Fila (Queue) - Princípio FIFO (First-In, First-Out)
A Fila é implementada via a classe `Queue<T>` e utilizada ativamente no **Dashboard Principal do Paciente (`dashboard/page.tsx`)**.

**Qual problema resolve?**
- A Fila enfileira os "Alertas de Saúde Pública" e "Lembretes". Como os alertas chegam em ordem cronológica (os mais antigos chegam e devem ser lidos primeiro), uma Fila garante que o cidadão veja a notificação mais antiga no topo da lista. O usuário pode fazer o "Dequeue" explícito no painel para dispensar o alerta mais antigo da fila.

## 2. Pilha (Stack) - Princípio LIFO (Last-In, First-Out)
A Pilha foi implementada através da classe `Stack<T>` e opera principalmente na tela de **Agendamentos (`consultas-agendadas/page.tsx`)**.

**Qual problema resolve?**
- A Pilha atua como um sistema de **"Desfazer" (Undo)**. Sempre que o usuário clica em "Cancelar" uma consulta marcada, aquele registro da consulta (incluindo seu ID no banco) é empilhado (`undoStack.push`). Se o usuário clicar no botão amarelo "Desfazer", o sistema aplica um `pop()` e dispara novamente a API `POST` para reinserir o último agendamento deletado no sistema, respeitando o princípio de que a última ação feita é a primeira a ser desfeita.

## 3. Lista Encadeada (LinkedList)
A Lista Encadeada (`LinkedList<T>`) armazena os agendamentos visíveis para o usuário e lida com as renderizações. 

**Qual problema resolve?**
- Agendamentos sofrem constante modificação (adiciona no fim da fila, cancela um elemento do meio por ID específico, insere através de Undo). Uma Lista Encadeada pura abstrai essas modificações através de ponteiros, diminuindo o uso de `Arrays` massivos de manipulação no JavaScript e garantindo que cada nó de consulta aponte para a seguinte, otimizando o percurso e o isolamento dos dados. A renderização do React é feita pela sincronização através do método `toArray()`.
