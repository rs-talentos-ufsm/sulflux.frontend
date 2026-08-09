<a id="readme-top"></a>

<div align="center">

![Status](https://img.shields.io/badge/status-pronto--para--uso-success?style=for-the-badge)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg?style=for-the-badge)](https://opensource.org/licenses/Apache-2.0)

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![React 19](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)

![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white)
![React Query](https://img.shields.io/badge/React_Query-FF4154?style=for-the-badge&logo=reactquery&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-443E38?style=for-the-badge)

![Zod](https://img.shields.io/badge/Zod-3E67B1?style=for-the-badge&logo=zod&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white)

![Vitest](https://img.shields.io/badge/Vitest-729B1B?style=for-the-badge&logo=vitest&logoColor=white)
![ESLint](https://img.shields.io/badge/ESLint-4B3263?style=for-the-badge&logo=eslint&logoColor=white)
![Prettier](https://img.shields.io/badge/prettier-1A2C34?style=for-the-badge&logo=prettier&logoColor=F7B93E)

![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

</div>

<h1 align="center">
    💻 Frontend Template (React 19 + Vite)
</h1>

<p align="center">
  A Single Page Application (SPA) de alta performance que serve de interface para os projetos do monorepo. 
  <br />
  <a href="https://github.com/dornelesfernando/template"><strong>« Voltar para o Monorepo Raiz</strong></a>
  <br />
  <br />
  <a href="#visao-geral-do-template">Visão Geral</a>
  ·
  <a href="#documentacao-tecnica">Documentação Técnica</a>
  ·
  <a href="#como-rodar-a-interface">Como Rodar</a>
</p>

---

<a id="visao-geral-do-template"></a>

## 🔎 Visão Geral do Template

Este repositório contém o **módulo Frontend** da arquitetura base. Construído para ser reativo, escalável e de fácil manutenção, ele é o ponto de partida ideal para qualquer interface de usuário (UI) moderna, focado em sincronização assíncrona inteligente e tipagem End-to-End (E2E).

Ao utilizá-lo como base para seu novo projeto, você herda imediatamente:

- **Performance Extrema:** Construído sobre o **Vite**, oferecendo um servidor de desenvolvimento quase instantâneo via Hot Module Replacement (HMR) e builds otimizados.
- **Ecossistema React 19:** Utilizando as mais recentes features do React, integrado com o roteamento seguro e dinâmico do **React Router DOM**.
- **Sincronização com o Servidor:** Configuração nativa do **TanStack React Query**, lidando magicamente com cache, retries, paginação e background updates das requisições via **Axios**.
- **Estado Global Descomplicado:** Gerenciamento de estado local limpo e sem boilerplate usando o **Zustand**.
- **Tipagem e Validação E2E:** Consumo direto dos schemas Zod exportados pelo pacote `@lib/shared`. Suas validações de formulário cliente refletem exatamente as regras do backend.
- **Ambiente Padronizado:** Linting e Formatação rigorosos (`ESLint` + `Prettier`) acoplados com `Husky` para barrar commits fora do padrão, além de suíte de testes ultrarrápida usando `Vitest`.

---

<a id="documentacao-tecnica"></a>

## 📚 Documentação Técnica (Aprofundamento)

Este frontend foi montado integrando bibliotecas de ponta. Para entender as convenções adotadas na estrutura de pastas e no gerenciamento de dados, consulte nossos guias internos na pasta `docs/`:

| Tópico de Estudo                      | Arquivo de Documentação                               |
| :------------------------------------ | :---------------------------------------------------- |
| **Requisições & Cache (React Query)** | [`React-Query-Axios.md`](./docs/React-Query-Axios.md) |
| **Gerenciamento de Estado**           | [`Zustand-Store.md`](./docs/Zustand-Store.md)         |
| **Roteamento e Proteção de Rotas**    | [`React-Router.md`](./docs/React-Router.md)           |
| **Validação de Formulários (Shared)** | [`Formularios-Zod.md`](./docs/Formularios-Zod.md)     |
| **Qualidade & Git Hooks**             | [`Husky-Linting.md`](./docs/Husky-Linting.md)         |

_(Nota: Adicione e expanda os arquivos de documentação conforme o crescimento da complexidade visual do seu projeto)._

---

<a id="como-rodar-a-interface"></a>

## 🚀 Como Rodar a Interface

> **Aviso Importante:** Como este frontend faz parte de um ecossistema Monorepo, ele depende fortemente do pacote `@lib/shared`. **Não inicie este projeto de forma isolada** se o pacote compartilhado não tiver sido instalado e buildado.

### 1. Configurações de Ambiente (Obrigatório)

O Vite requer que as variáveis de ambiente sigam o prefixo `VITE_`.
👉 **[Leia o guia completo de instruções (`instructions.md`) antes de prosseguir](./instructions.md)** para saber como configurar portas e URLs da API.

### 2. Ciclo de Vida Local

Assim como no backend, a melhor forma de orquestrar os serviços é usando o **`Makefile` na raiz do monorepo** (`make dev-up`). No entanto, caso você já tenha o ecossistema pronto e queira interagir estritamente com o frontend _dentro desta pasta_:

- **Iniciar o Vite (Modo Dev - Docker):** `npm run dev-up`
- **Iniciar o Vite (Local Puro):** `npm run dev`
- **Build de Produção:** `npm run build`
- **Visualizar o Build Localmente:** `npm run preview`
- **Testes Unitários:** `npm run test`
- **Verificar Padrão de Código:** `npm run lint-check` e `npm run format-check`

---

<a id="autor"></a>

## 🎓 Autor

Template estruturado e mantido por:

- **Nome:** Fernando Dorneles da Silva
- **GitHub:** [dornelesfernando](https://github.com/dornelesfernando)

<p align="right">(<a href="#readme-top">voltar ao topo</a>)</p>
