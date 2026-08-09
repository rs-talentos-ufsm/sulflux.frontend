# 🛠️ Instruções Locais de Configuração e Execução (Frontend)

Este documento detalha como configurar as variáveis de ambiente necessárias para a interface (SPA) e como executar os comandos de desenvolvimento diretamente dentro da pasta `apps/frontend`, sem depender do orquestrador global (`Makefile`).

---

## 🔐 1. Configuração do Arquivo `.env`

A aplicação requer configurações locais para rodar corretamente e se comunicar com a API. Crie uma cópia do arquivo de exemplo para o seu ambiente de desenvolvimento:

```bash
cp .env.example .env.development

```

Abaixo está a explicação detalhada de cada variável presente no seu `.env` e como preenchê-las:

### Configurações Globais e Comunicação API

| Variável          | Descrição                                                                                                     | Exemplo de Valor            |
| ----------------- | ------------------------------------------------------------------------------------------------------------- | --------------------------- |
| `PROJECT_NAME`    | Nome do projeto para identificação nos contêineres Docker e logs.                                             | `meu_projeto_frontend`      |
| `PROJECT_VERSION` | Versão atual do frontend (útil para exibir no rodapé ou forçar invalidação de cache).                         | `1.0.0`                     |
| `FRONTEND_PORT`   | Porta onde o servidor Vite será exposto na sua máquina para visualização no navegador.                        | `3000`                      |
| `VITE_API_URL`    | URL base do Backend. O Vite exige o prefixo `VITE_` para injetar a variável no código compilado do navegador. | `http://localhost:5000/api` |

> **Nota sobre o `VITE_API_URL`:** Em desenvolvimento local, esta URL deve apontar para o `localhost` e a porta onde o seu Backend (`apps/backend`) está rodando.

---

## 💻 2. Executando Comandos Localmente (NPM Scripts)

Caso você esteja trabalhando exclusivamente no Frontend e não queira usar o `Makefile` da raiz, você pode usar os scripts nativos definidos no `package.json`.

> **Atenção:** Certifique-se de estar dentro da pasta `apps/frontend` no seu terminal antes de rodar os comandos abaixo.

### 🐳 Gerenciamento do Ambiente (Docker)

Os scripts abaixo sobem a interface lendo o seu `.env.development` e orquestrando o Vite dentro de um contêiner.

- `npm run dev-up` : Sobe o contêiner do frontend e exibe os logs travando o terminal atual.
- `npm run dev-upd` : Sobe o contêiner em **background (detached)** e libera o terminal.
- `npm run dev-down` : Desliga o contêiner de desenvolvimento.
- `npm run dev-reset` : Destrói o contêiner e limpa os volumes mapeados.
- `npm run log` : Conecta ao contêiner em background e exibe os logs do Vite em tempo real.

### ⚡ Desenvolvimento Local Direto (Vite)

Se preferir rodar o projeto diretamente no seu Node.js local (fora do Docker), utilize os scripts nativos do Vite:

- `npm run dev` : Inicia o servidor de desenvolvimento do Vite (HMR) localmente e rapidamente.
- `npm run build` : Compila e minifica o projeto React para a pasta `dist/` (Build de Produção).
- `npm run preview` : Sobe um servidor estático local para você visualizar e testar como a pasta `dist/` gerada no build se comportará em produção.

### 🧪 Qualidade e Testes

Mantenha a padronização visual e a integridade da interface rodando as suítes de validação.

- `npm run test` : Executa a suíte de testes (Vitest + React Testing Library) ponta a ponta uma única vez.
- `npm run lint-check` : Verifica erros estáticos, problemas com hooks do React e padrão de código (ESLint).
- `npm run lint-fix` : Tenta corrigir automaticamente os erros encontrados pelo ESLint.
- `npm run format-check` : Verifica se a formatação (espaçamentos, aspas) está de acordo com o padrão.
- `npm run format-fix` : Formata todos os arquivos do projeto automaticamente usando o Prettier.

```

```
