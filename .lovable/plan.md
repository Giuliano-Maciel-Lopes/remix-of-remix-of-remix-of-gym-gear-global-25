

# Plano: Centralizar Calculos no Backend + Nova Aba Kits Preprontos

## Resumo

O backend ja retorna todos os calculos (FOB, CIF, Landed, containers) no objeto `calculations` de cada Quote. O problema e que o frontend ignora esses dados e recalcula tudo localmente. Vamos corrigir isso e criar a aba de Kits.

---

## Parte 1 -- Eliminar calculos duplicados no Frontend

### 1.1 QuoteDetail.tsx
- Remover a funcao local `calculateTotals()` (linhas 128-171) e as constantes `CONTAINER_CBM` / `DUTY_RATES` (linhas 61-73)
- Usar `quote.calculations` retornado pela API para popular todos os cards (FOB, Frete, Seguro, CIF, Landed)
- Usar `quote.calculations.lines` para exibir FOB unitario, FOB total, CBM e peso por linha, em vez de buscar precos localmente
- Manter funcionalidades de adicionar/remover linha e atualizar status sem alteracao

### 1.2 Comparator.tsx
- Criar uma nova rota no backend: `POST /api/quotes/compare` que recebe `{ catalog_item_id, qty, container_type, freight_per_container, insurance_rate, fixed_costs }` e retorna os calculos para cada fornecedor que tem preco para esse item
- No frontend, remover as constantes `DUTY_RATES` / `CONTAINERS` e os calculos inline (linhas 116-175)
- Chamar a nova rota e renderizar os resultados retornados
- Manter o botao "Adicionar ao Pedido" funcionando como esta

### 1.3 calculations.ts
- Manter apenas as funcoes utilitarias de formatacao: `formatCurrency`, `formatNumber`, `percentDifference`
- Remover `calculateLine`, `calculateQuote`, `getLandedForDestination`, constantes de taxas e containers
- Essas funcoes nao sao mais necessarias no frontend

---

## Parte 2 -- Nova Rota de Comparacao no Backend

Criar no modulo de quotes:

```text
POST /api/quotes/compare
Body: { catalog_item_id, qty, container_type, freight_per_container_usd, insurance_rate, fixed_costs_usd }
Response: Array de resultados por fornecedor com FOB, CIF, Landed por pais, containers
```

A logica reutiliza as mesmas formulas que ja existem em `QuoteService.calculateQuote`.

---

## Parte 3 -- Nova Aba "Kits Preprontos"

### 3.1 Backend: Nova rota de kits
Criar rota `POST /api/kits/generate` no backend (novo modulo `backend/src/modules/kits/`):

```text
POST /api/kits/generate
Body: { store_size: "small" | "medium" | "large", budget_usd: number }
Response: Array de kits, cada um com itens recomendados (catalog_item_id, qty, supplier, price_fob_usd)
```

Logica:
- Buscar itens ativos do catalogo agrupados por categoria
- Para cada item, buscar o menor preco FOB entre fornecedores
- Montar kit respeitando categorias obrigatorias (Cardio, Strength, Accessories)
- Ajustar quantidades para caber no orcamento
- Retornar apenas itens e quantidades, sem calculos de CIF/Landed (esses so existem quando vira um Quote)

### 3.2 Frontend: Pagina KitsPage.tsx
- Nova rota `/kits` no App.tsx
- Novo item no menu lateral "Kits Preprontos"
- Formulario com selects para tamanho da loja e input de orcamento
- Botao "Gerar Kit"
- Tabela de resultados com: Produto, Quantidade, Fornecedor, Preco FOB unitario, FOB Total
- Aviso: "Valores de CIF e Landed serao calculados apos criar o pedido"
- Botao "Criar Pedido com este Kit" que:
  1. Cria um Quote com status `pending` via `POST /api/quotes`
  2. Adiciona cada linha do kit via `POST /api/quotes/:id/lines`
  3. Redireciona para a pagina do pedido criado

---

## Parte 4 -- Detalhes Tecnicos

### Arquivos a criar:
- `backend/src/modules/kits/kit.service.ts`
- `backend/src/modules/kits/kit.controller.ts`
- `backend/src/modules/kits/kit.routes.ts`
- `src/pages/Kits.tsx`

### Arquivos a editar:
- `src/pages/QuoteDetail.tsx` -- remover calculos locais, usar `quote.calculations`
- `src/pages/Comparator.tsx` -- remover calculos locais, chamar API
- `src/lib/calculations.ts` -- manter apenas formatadores
- `backend/src/modules/quotes/quote.service.ts` -- adicionar metodo `compare()`
- `backend/src/modules/quotes/quote.routes.ts` -- adicionar rota POST `/compare`
- `backend/src/routes.ts` -- registrar rotas de kits
- `src/App.tsx` -- adicionar rota `/kits`
- `src/components/layout/AppLayout.tsx` -- adicionar item no menu
- `src/lib/api.ts` -- adicionar `kitsApi` e `quotesApi.compare()`
- `src/hooks/useApiQuery.ts` -- adicionar hooks para kits e comparacao

### Nao sera alterado:
- Backend de quotes existente (apenas adicao)
- Fluxo de pedidos atual
- Abas existentes (Catalogo, Clientes, Fornecedores, Precos, SKU Mapping)
- Logica de calculos no backend (`QuoteService.calculateQuote`)

