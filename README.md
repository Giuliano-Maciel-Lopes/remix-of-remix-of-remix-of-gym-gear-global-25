# 💪 GymTrade Pro

Sistema completo para gestão de trading e importação de equipamentos de academia, com backend em Node.js/Express + docker + Prisma/PostgreSQL e frontend em React/Vite.

---

<p align="center">
  <!-- Tech stack -->
  <img alt="Node.js" src="https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white" />
  <img alt="Express" src="https://img.shields.io/badge/Express-4+-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5+-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img alt="React" src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=000000" />
  <img alt="Vite" src="https://img.shields.io/badge/Vite-4+-646CFF?style=for-the-badge&logo=vite&logoColor=FFD62E" />
  <img alt="PostgreSQL" src="https://img.shields.io/badge/PostgreSQL-15-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" />
</p>

<p align="center">
  <!-- Tools -->
  <img alt="Prisma" src="https://img.shields.io/badge/Prisma-ORM-0C344B?style=for-the-badge&logo=prisma&logoColor=white" />
  <img alt="Docker" src="https://img.shields.io/badge/Docker-Desktop-2496ED?style=for-the-badge&logo=docker&logoColor=white" />
  <img alt="JWT" src="https://img.shields.io/badge/Auth-JWT%20%2B%20bcrypt-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" />
</p>

<p align="center">
  <!-- Meta -->
  <img alt="License" src="https://img.shields.io/badge/License-Custom-lightgrey?style=for-the-badge&logo=book" />
  <img alt="Status" src="https://img.shields.io/badge/Status-Em%20Desenvolvimento-yellow?style=for-the-badge&logo=progress" />
</p>

---

## 🧭 Sumário

- [🌐 Visão geral](#-visão-geral)
- [🧰 Tecnologias](#-tecnologias)
  - [🛠 Backend](#-backend)
  - [🎨 Frontend](#-frontend)
- [📁 Estrutura de pastas](#-estrutura-de-pastas)
  - [📦 Backend](#-estrutura-de-pastas-backend)
  - [🖥 Frontend](#-estrutura-de-pastas-frontend)
- [🚀 Como rodar localmente](#-como-rodar-localmente)
  - [✅ Pré-requisitos](#-pré-requisitos)
  - [🔙 Subindo o backend](#-subindo-o-backend)
  - [🖼 Subindo o frontend](#-subindo-o-frontend)
- [📡 Endpoints da API](#-endpoints-da-api)
  - [🔐 Autenticação](#-autenticação)
  - [👥 Clientes](#-clientes)
  - [🏭 Fornecedores](#-fornecedores)
  - [📦 Catálogo](#-catálogo)
  - [🔁 SKU Mapping](#-sku-mapping)
  - [💲 Preços de fornecedores](#-preços-de-fornecedores)
  - [📑 Cotações](#-cotações)
  - [🧩 Kits](#-kits)
  - [📥 Importação via Excel](#-importação-via-excel)
- [🔁 Fluxo de autenticação e uso da API](#-fluxo-de-autenticação-e-uso-da-api)
- [📊 Cálculos importantes (Landed Cost)](#-cálculos-importantes-landed-cost)
- [🛡 Segurança](#-segurança)
- [📌 Observações finais e boas práticas](#-observações-finais-e-boas-práticas)

---

## 🌐 Visão geral

- 🔹 **Backend**: API REST modular para autenticação, clientes, fornecedores, catálogo, preços, cotações, kits e importação de dados.
- 🔹 **Frontend**: SPA em React com layout profissional, navegação protegida por login e telas focadas no fluxo de trading/logística.
- 🔹 **Banco**: Docker com PostgreSQL com schema modelado via Prisma.

> 💡 **Visão rápida**: o GymTrade Pro integra o fluxo de ponta a ponta — cadastro de clientes/fornecedores, cálculo de landed cost, cotações e kits — em um só lugar.

---

## 🧰 Tecnologias

### 🛠 Backend

- Node.js + Express  
- TypeScript  
- Prisma ORM  
- PostgreSQL  
- Zod (validação)  
- JWT + bcrypt (auth)  
- Multer + xlsx (importação)  
- Docker / docker-compose  

### 🎨 Frontend

- React 18 + TypeScript  
- Vite  
- React Router DO  
- @tanstack/react-query  
- react-hook-form + Zod  
- TailwindCSS + shadcn/ui + Radix UI  
- Recharts  

> 🔎 **Stack pensada para produtividade**: tipagem forte (TypeScript), DX moderna (Vite, React Query) e UI consistente (shadcn/ui + Tailwind).

---

## 📁 Estrutura de pastas

### 📦 Estrutura de pastas (backend)

```text
backend/
├── src/
│   ├── modules/
│   │   ├── auth/           # Autenticação JWT
│   │   ├── clients/        # Clientes
│   │   ├── suppliers/      # Fornecedores
│   │   ├── catalog_items/  # Produtos
│   │   ├── sku_mapping/    # Mapeamento SKU x fornecedor
│   │   ├── supplier_prices/# Preços FOB
│   │   ├── quotes/         # Cotações + cálculos
│   │   ├── import/         # Import via Excel (multer + xlsx)
│   │   └── kits/           # Geração de kits
│   ├── shared/
│   │   ├── middleware/     # Auth, error handler
│   │   ├── prisma.ts       # Prisma Client singleton
│   │   └── types.ts        # Tipos compartilhados
│   ├── routes.ts           # Agregador de rotas
│   ├── app.ts              # Configuração Express
│   └── server.ts           # Entry point HTTP
├── prisma/
│   ├── schema.prisma       # Schema do banco
│   └── migrations/         # Migrações geradas
├── docker-compose.yml      # Serviço Postgres local
├── Dockerfile
└── package.json
```

### 🖥 Estrutura de pastas (frontend)

```text
src/
├── pages/                  # Telas (Dashboard, Auth, Clients, Quotes, etc.)
├── components/
│   ├── layout/             # AppLayout (shell da aplicação)
│   ├── common/             # ImportExcelButton, FormError, etc.
│   └── ui/                 # Componentes shadcn/ui
├── contexts/
│   └── AuthContext.tsx     # Contexto de autenticação
├── hooks/
│   ├── useApiAuth.ts       # Lógica de login/logout (JWT)
│   ├── useApiQuery.ts      # Wrapper React Query
│   └── use-toast.ts        # Toasts
├── lib/
│   ├── api.ts              # Cliente HTTP para a API
│   ├── validationSchemas.ts# Schemas Zod (frontend)
│   ├── calculations.ts     # Cálculos auxiliares
│   └── exportExcel.ts      # Exportação de dados para Excel
├── data/                   # Mock data
├── index.css               # Estilos globais
├── App.tsx                 # Rotas e provedores
└── main.tsx                # Bootstrap React
```

> 📂 **Dica**: mantenha a organização por módulos (auth, clients, quotes, etc.) para facilitar a evolução e onboarding de novos devs.

---

## 🚀 Como rodar localmente

### ✅ Pré-requisitos

- Node.js LTS  
- Docker + Docker Compose  

> ⚙️ **Ambiente isolado**: o PostgreSQL roda via Docker, evitando poluir o ambiente local e garantindo reprodutibilidade.

### 🔙 Subindo o backend

```bash
# 1. Subir o Postgres via Docker
cd backend
docker-compose up -d

# 2. Instalar dependências
npm install

# 3. Configurar .env no backend
# Exemplo mínimo:
# DATABASE_URL=postgresql://gymtr:gymtrade_sec@localhost:5432/gymte?schema=public
# JWT_SECRET=uma_senha_bem_secreta
# FRONTEND_URL=http://localhost:5173

# 4. Prisma: gerar client e rodar migrações
npm run prisma:generate
npm run prisma:migrate

# 5. Rodar em desenvolvimento
npm run dev
# API em: http://localhost:3000
```

> 🔐 **Importante**: nunca commitar seu `.env`. Use `.env.example` para documentar variáveis necessárias.

Build/produção do backend:

```bash
cd backend
npm run build
npm start
```

> 📌 **Comando crítico (backend)**

```diff
+ npm run dev     # Ambiente de desenvolvimento
+ npm run build   # Build de produção
+ npm start       # Servir build em produção
```

### 🖼 Subindo o frontend

```bash
# 1. Instalar dependências (na raiz do projeto)
npm install

# 2. Configurar .env na raiz
# VITE_API_URL=http://localhost:3000/api

# 3. Rodar em desenvolvimento
npm run dev
# Frontend em: http://localhost:5173
```

Build e preview:

```bash
npm run build      # Gera dist/ do frontend
npm run preview    # Servidor estático de preview
```

> 🌍 **Atenção**: garanta que `VITE_API_URL` aponte para a mesma origem onde o backend está exposto (incluindo `/api`).

---

## 📡 Endpoints da API

Base URL: `http://localhost:3000/api`

### 🔐 Autenticação

| Método | Rota             | Descrição           |
|--------|------------------|---------------------|
| POST   | `/auth/register` | Criar usuário       |
| POST   | `/auth/login`    | Login (retorna JWT) |
| GET    | `/auth/profile`  | Perfil autenticado  |

Exemplo de login:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"senha123"}'
```

> ✅ **Resposta esperada (exemplo)**

```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  },
  "token": "jwt_aqui"
}
```

### 👥 Clientes

| Método | Rota            | Descrição         |
|--------|-----------------|-------------------|
| GET    | `/clients`      | Listar clientes   |
| GET    | `/clients/:id`  | Detalhar cliente  |
| POST   | `/clients`      | Criar cliente     |
| PUT    | `/clients/:id`  | Atualizar cliente |
| DELETE | `/clients/:id`  | Excluir cliente   |

### 🏭 Fornecedores

| Método | Rota              | Descrição           |
|--------|-------------------|---------------------|
| GET    | `/suppliers`      | Listar fornecedores |
| GET    | `/suppliers/:id`  | Detalhar fornecedor |
| POST   | `/suppliers`      | Criar fornecedor    |
| PUT    | `/suppliers/:id`  | Atualizar fornecedor|
| DELETE | `/suppliers/:id`  | Excluir fornecedor  |

### 📦 Catálogo

| Método | Rota           | Descrição          |
|--------|----------------|--------------------|
| GET    | `/catalog`     | Listar produtos    |
| GET    | `/catalog/:id` | Detalhar produto   |
| POST   | `/catalog`     | Criar produto      |
| PUT    | `/catalog/:id` | Atualizar produto  |
| DELETE | `/catalog/:id` | Excluir produto    |

### 🔁 SKU Mapping

| Método | Rota               | Descrição              |
|--------|--------------------|------------------------|
| GET    | `/sku-mapping`     | Listar mapeamentos     |
| POST   | `/sku-mapping`     | Criar mapeamento       |
| PUT    | `/sku-mapping/:id` | Atualizar mapeamento   |
| DELETE | `/sku-mapping/:id` | Excluir mapeamento     |

### 💲 Preços de fornecedores

| Método | Rota                    | Descrição       |
|--------|-------------------------|-----------------|
| GET    | `/supplier-prices`      | Listar preços   |
| POST   | `/supplier-prices`      | Criar preço     |
| PUT    | `/supplier-prices/:id`  | Atualizar preço |
| DELETE | `/supplier-prices/:id`  | Excluir preço   |

### 📑 Cotações

| Método | Rota                            | Descrição                               |
|--------|---------------------------------|-----------------------------------------|
| GET    | `/quotes`                       | Listar cotações                         |
| GET    | `/quotes/:id`                   | Detalhar cotação (com cálculos)        |
| POST   | `/quotes`                       | Criar cotação                           |
| PUT    | `/quotes/:id`                   | Atualizar cotação                       |
| DELETE | `/quotes/:id`                   | Excluir cotação                         |
| POST   | `/quotes/:id/lines`             | Adicionar linha                         |
| PUT    | `/quotes/:id/lines/:lineId`     | Atualizar linha                         |
| DELETE | `/quotes/:id/lines/:lineId`     | Excluir linha                           |
| POST   | `/quotes/compare`               | Comparar fornecedores para um item      |
| PATCH  | `/quotes/:id/change-client`     | Alterar cliente de uma cotação          |

> 🚨 **Endpoints críticos para o fluxo principal**

```diff
+ POST   /auth/login              # Autenticação e obtenção do JWT
+ GET    /quotes/:id              # Retorna cotação com todos os cálculos
+ POST   /quotes/compare          # Comparação rápida entre fornecedores
```

### 🧩 Kits

| Método | Rota             | Descrição                                   |
|--------|------------------|---------------------------------------------|
| POST   | `/kits/generate` | Gerar kit a partir de perfil/ orçamento     |

### 📥 Importação via Excel

| Método | Rota          | Descrição                                      |
|--------|---------------|-----------------------------------------------|
| POST   | `/import/...` | Upload/parse de planilhas Excel (módulo de importação) |

> ⚠️ Para endpoints protegidos, enviar sempre o cabeçalho `Authorization: Bearer <token>`.

```bash
-H "Authorization: Bearer SEU_TOKEN_AQUI"
```

---

## 🔁 Fluxo de autenticação e uso da API

1. **Registro ou login** via `/auth/register` ou `/auth/login`.  
2. Backend retorna `{ user, token }` (JWT).  
3. Frontend salva o token (localStorage) e passa a enviar `Authorization: Bearer <token>`.  
4. Middleware `authenticate` valida o token, popula `req.user`.  
5. Controllers usam `req.user` para associar ações ao usuário e, quando necessário, aplicam `requireAdmin`.  

> 🔐 **Padrão recomendado (frontend, pseudo-código em TS)**

```ts
// api.ts
import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("gymtrade:token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

## 📊 Cálculos importantes (Landed Cost)

Para cada cotação, o backend calcula automaticamente: cauculos dados pelo Tadeu

- `FOB Total` = Σ(qty × price_fob_usd)  
- `Freight` = container_qty × freight_per_container_usd  
- `Insurance` = (FOB + Freight) × insurance_rate  
- `CIF` = FOB + Freight + Insurance  
- `Landed US` = CIF × 1.301 + fixed_costs_usd  
- `Landed AR Standard` = CIF × 1.8081 + fixed_costs_usd  
- `Landed AR Simplified` = CIF × 1.51 + fixed_costs_usd  
- `Landed BR` = CIF × 1.668 + fixed_costs_usd  

Os resultados são retornados junto à cotação detalhada (`GET /quotes/:id`).

> 📈 **Uso prático**: a aplicação já entrega os principais cenários de landed cost (US, AR, BR) prontos para análise e tomada de decisão.

---

## 🛡 Segurança

- ✅ Validação de entrada com **Zod** em todas as rotas.  
- ✅ Senhas armazenadas com **bcrypt** (12 rounds).  
- ✅ Autenticação **JWT** (tokens com expiração configurável).  
- ✅ Middlewares de autenticação/autorização (`authenticate`, `requireAdmin`).  
- ✅ Tratamento de erros centralizado (`AppError` + `errorHandler`).  

> 🧱 **Boas práticas de segurança**: combine validação forte (Zod) + hashing de senha + tokens com expiração e rotacionáveis para mitigar riscos comuns (SQL injection, brute force, XSS indireto via payloads).

---

## 📌 Observações finais e boas práticas

- Manter as variáveis de ambiente (`.env`) fora do controle de versão.  
- Usar `npm run prisma:migrate` em desenvolvimento e `npm run prisma:deploy` em produção/CI.  
- Validar sempre os dados no frontend (Zod) antes de enviar para a API, alinhado aos schemas do backend.  
- Configurar CORS (`FRONTEND_URL`) e `VITE_API_URL` corretamente para cada ambiente (dev, staging, prod).  

> ✅ **Checklist rápido antes de subir para produção**
>
> - [ ] `.env` configurado (backend + frontend)  
> - [ ] `FRONTEND_URL` e CORS ajustados  
> - [ ] Banco migrado (`prisma:migrate` / `prisma:deploy`)  
> - [ ] Builds gerados sem erros (`npm run build` em ambos)  

---
