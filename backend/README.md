# GymTrade Pro - Backend

Backend modular para o sistema de Trading e Importação de Equipamentos de Academia.

## Tecnologias

- **Node.js** + **Express** - Servidor web
- **Prisma** - ORM e migrations
- **PostgreSQL** - Banco de dados
- **Zod** - Validação de dados
- **JWT** + **bcrypt** - Autenticação segura
- **Docker** - Containerização

## Estrutura de Pastas

```
backend/
├── src/
│   ├── modules/
│   │   ├── auth/           # Autenticação JWT
│   │   ├── clients/        # CRUD de clientes
│   │   ├── suppliers/      # CRUD de fornecedores
│   │   ├── catalog_items/  # CRUD de produtos
│   │   ├── sku_mapping/    # Mapeamento de SKU
│   │   ├── supplier_prices/# Preços FOB
│   │   └── quotes/         # Cotações com cálculos
│   ├── shared/
│   │   ├── middleware/     # Auth, error handler
│   │   ├── prisma.ts       # Cliente Prisma
│   │   └── types.ts        # Tipos compartilhados
│   ├── routes.ts           # Rotas centralizadas
│   ├── app.ts              # Configuração Express
│   └── server.ts           # Entry point
├── prisma/
│   └── schema.prisma       # Schema do banco
├── Dockerfile
├── docker-compose.yml
└── package.json
```

## Como Rodar

### Com Docker (Recomendado)

```bash
# Copie as variáveis de ambiente
cp .env.example .env

# Edite o .env com suas configurações

# Suba os containers
docker-compose up -d

# A API estará disponível em http://localhost:3000
```

### Desenvolvimento Local

```bash
# Instale as dependências
npm install

# Configure o .env com DATABASE_URL do seu PostgreSQL

# Gere o cliente Prisma
npm run prisma:generate

# Rode as migrations
npm run prisma:migrate

# Inicie em modo de desenvolvimento
npm run dev
```

## Endpoints da API

### Auth
- `POST /api/auth/register` - Criar conta
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Perfil (autenticado)

### Clients
- `GET /api/clients` - Listar clientes
- `GET /api/clients/:id` - Buscar cliente
- `POST /api/clients` - Criar cliente
- `PUT /api/clients/:id` - Atualizar cliente
- `DELETE /api/clients/:id` - Excluir cliente

### Suppliers
- `GET /api/suppliers` - Listar fornecedores
- `GET /api/suppliers/:id` - Buscar fornecedor
- `POST /api/suppliers` - Criar fornecedor
- `PUT /api/suppliers/:id` - Atualizar fornecedor
- `DELETE /api/suppliers/:id` - Excluir fornecedor

### Catalog
- `GET /api/catalog` - Listar produtos
- `GET /api/catalog/:id` - Buscar produto
- `POST /api/catalog` - Criar produto
- `PUT /api/catalog/:id` - Atualizar produto
- `DELETE /api/catalog/:id` - Excluir produto

### SKU Mapping
- `GET /api/sku-mapping` - Listar mapeamentos
- `POST /api/sku-mapping` - Criar mapeamento
- `PUT /api/sku-mapping/:id` - Atualizar mapeamento
- `DELETE /api/sku-mapping/:id` - Excluir mapeamento

### Supplier Prices
- `GET /api/supplier-prices` - Listar preços
- `POST /api/supplier-prices` - Criar preço
- `PUT /api/supplier-prices/:id` - Atualizar preço
- `DELETE /api/supplier-prices/:id` - Excluir preço

### Quotes
- `GET /api/quotes` - Listar cotações
- `GET /api/quotes/:id` - Buscar cotação (com cálculos)
- `POST /api/quotes` - Criar cotação
- `PUT /api/quotes/:id` - Atualizar cotação
- `DELETE /api/quotes/:id` - Excluir cotação
- `POST /api/quotes/:id/lines` - Adicionar linha
- `PUT /api/quotes/:id/lines/:lineId` - Atualizar linha
- `DELETE /api/quotes/:id/lines/:lineId` - Excluir linha

## Cálculos de Landed Cost

O sistema calcula automaticamente:

- **FOB Total** = Σ(qty × price_fob_usd)
- **Freight** = container_qty × freight_per_container_usd
- **Insurance** = (FOB + Freight) × insurance_rate
- **CIF** = FOB + Freight + Insurance
- **Landed US** = CIF × 1.301 + fixed_costs
- **Landed AR Standard** = CIF × 1.8081 + fixed_costs
- **Landed AR Simplified** = CIF × 1.51 + fixed_costs
- **Landed BR** = CIF × 1.668 + fixed_costs

## Segurança

- ✅ Validação com Zod em todas as rotas
- ✅ Senhas hasheadas com bcrypt (12 rounds)
- ✅ JWT para autenticação
- ✅ Middleware de autorização
- ✅ Tratamento de erros consistente
