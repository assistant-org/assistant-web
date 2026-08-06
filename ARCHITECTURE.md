# ARCHITECTURE.md

# Arquitetura do Sistema

## Visão Geral

Este projeto representa uma plataforma SaaS White Label de gestão financeira e operacional para micro e pequenas empresas.

O objetivo do sistema não é ser um ERP completo.

O objetivo é fornecer uma solução simples, eficiente e escalável para que pequenos empresários consigam controlar:

* Financeiro
* Fluxo de Caixa
* Produtos
* Estoque
* Indicadores
* Relatórios

O sistema deve ser genérico o suficiente para atender diferentes segmentos.

Exemplos:

* Pequenos comércios
* Distribuidoras
* Cervejarias
* Prestadores de serviço
* Empresas de eventos
* Locadoras

Nenhuma regra específica de segmento deve existir dentro do Core.

Funcionalidades específicas devem existir como Features opcionais.

---

# Princípio Arquitetural Principal

O sistema deve ser desenvolvido baseado em domínio.

Nunca pensar:

```
Tela
 ↓
CRUD
 ↓
Banco
```

O correto:

```
Domínio
 ↓
Regra de Negócio
 ↓
Serviço
 ↓
Persistência
 ↓
Indicadores
```

A interface é apenas uma representação das regras do negócio.

---

# Arquitetura Core + Features

O sistema é dividido em:

* Core
* Features

---

# Core

O Core representa funcionalidades essenciais.

Todas as empresas possuem acesso ao Core.

Módulos:

## Financeiro

Responsável pelo controle financeiro da empresa.

Inclui:

* Transactions
* Categories
* Accounts
* Fluxo de Caixa
* Indicadores financeiros

## Produtos

Cadastro operacional de chopp (litros).

Na UI o produto expõe apenas **Nome** e **Ativo**.

Persistência fixa (sem exposição na UI):

* categoria = `BEVERAGE`
* unidade = `LITER`
* `track_stock = true`

O produto **não** representa saldo de estoque. Saldo vive em lotes/movimentações.

## Estoque

Controle físico de chopp em litros, baseado em:

* **Products** — cadastro
* **Stock Batches (Lotes)** — cada entrada gera um lote
* **Stock Movements** — única fonte de verdade do saldo

Listagem abre direto (sem gate de grupo). Quantidades são sempre em litros. Valor do lote = litros disponíveis × valor unitário.

Tipos operacionais na UI: Entrada, Saída, Perda, Consumo Interno. Ajuste permanece no enum/DB mas não é exposto.

## Dashboard

Responsável por apresentar informações estratégicas.

Não deve armazenar dados.

Indicadores financeiros e de estoque (consumo/perda) respeitam o **período** selecionado.

Período padrão: **Este ciclo** = dia 20 → dia 20 do mês seguinte.

Outros atalhos: Hoje, 7 dias, Mês, Ano, Personalizado.

## Relatórios

Responsável por análises:

* financeiras
* estoque
* produtos
* períodos

## Usuários e Permissões

Responsável pelo controle de acesso.

## Empresa

Representa o tenant dentro do modelo SaaS.

Cada empresa possui seus próprios dados isolados.

---

# Features

Features são módulos opcionais.

Uma empresa pode possuir ou não determinada funcionalidade.

Exemplos:

* Eventos
* Orçamentos
* Agenda
* Clientes
* Fornecedores
* Contratos
* Comissões

O Core nunca pode depender de uma Feature.

Features podem utilizar recursos do Core.

---

# Arquitetura Financeira

## Conceito principal

O financeiro utiliza uma única fonte de movimentações.

Não existem mais tabelas separadas para entradas e saídas.

Toda movimentação financeira é uma:

```
Transaction
```

---

# Transactions

Transactions representam o histórico financeiro completo da empresa.

Exemplos:

* Venda
* Compra
* Pagamento
* Recebimento

Tipos operacionais:

```
INCOME

EXPENSE
```

`TRANSFER` pode existir em dados legados no banco, mas **não** faz parte do modelo operacional atual (UI, schema de formulário e totais ignoram).

---

# Regras de Transactions

Toda Transaction deve possuir:

* valor
* data
* tipo
* origem
* descrição opcional
* categoria (obrigatória para INCOME/EXPENSE)

Toda movimentação deve possuir rastreabilidade.

Conta é auto-preenchida com a Conta Principal quando há uma única conta ativa.

---

# Income

Receitas representam entrada de dinheiro.

Exemplo:

Venda realizada.

Impacto:

Aumenta o saldo financeiro.

Forma de pagamento é opcional.

---

# Expense

Despesas representam saída de dinheiro.

Exemplo:

Fornecedor / Compra de Chopp.

Impacto:

Reduz o saldo financeiro.

Quando a categoria tem nome exato `"Compra de Chopp"`, o wizard inclui passo de entrada de estoque e, ao salvar, cria `Transaction EXPENSE` + `Stock Movement ENTRY` com `origin=transacao` e `origin_id` da transação. O valor da despesa deve igualar litros × R$/L.

---

# Accounts

Accounts representam agrupamentos financeiros internos.

Não devem ser tratadas obrigatoriamente como contas bancárias.

São locais lógicos onde recursos podem estar organizados.

Exemplos:

* Conta Principal
* Investimentos
* Outros recursos financeiros

A arquitetura deve permitir múltiplas contas no futuro.

Porém a experiência inicial deve priorizar simplicidade.

O usuário comum não deve ser obrigado a gerenciar várias contas.

---

# Categorias

Categories classificam movimentações.

Categorias NÃO representam contas.

Exemplos:

Receitas:

* Venda
* Evento
* Serviço

Despesas:

* Insumos
* Marketing
* Combustível
* Manutenção

---

# Fluxo Financeiro

O sistema deve responder:

* Quanto entrou?
* Quanto saiu?
* Quanto sobrou?
* Qual lucro?
* Onde o dinheiro está?
* Quais categorias possuem maior impacto?

---

# Estoque

O estoque é dividido em três entidades Core:

```
Products
   ↓
Stock Batches (Lotes)
   ↓
Stock Movements
```

Operação atual: **chopp em litros** (sem insumos/equipamentos na UX).

## Products

Cadastro: **Nome**, **Preço padrão por litro**, **Status (Ativo)**. Persistência força `BEVERAGE` / `LITER` / `track_stock`.

## Stock Batches

Cada **Entrada** cria um novo lote com:

* produto
* data de entrada
* validade (opcional)
* quantidade inicial (litros)
* valor unitário (R$/L) — pré-preenchido do preço padrão do produto, editável
* evento da entrada (`event_id`, obrigatório na UI de ENTRY)
* observações

**Não** existem colunas de `available_quantity` ou `status` no banco.

Ambos são derivados em tempo de leitura:

```
availableQuantity = sum(movements IN) - sum(movements OUT)
status = ACTIVE se availableQuantity > 0, senão CLOSED
```

## Stock Movements

Toda alteração de estoque gera uma movimentação. Nunca alterar saldo diretamente.

Tipos na UI:

* Entrada (`ENTRY`) — cria lote + movimento IN; evento obrigatório; Individual ou Em lote
* Saída (`EXIT`) — OUT; evento obrigatório; lote mostra evento + litros disponíveis
* Perda (`LOSS`) / Consumo Interno (`INTERNAL_CONSUMPTION`) — OUT; evento opcional

`ADJUSTMENT` permanece no schema/DB (também usado internamente em reversões).

Campos relevantes:

* `event_id` — evento da operação
* `operation_group_id` — agrupa linhas de um lançamento multi-item
* `reverses_movement_id` — vínculo de auditoria quando a linha é reversão

Toda movimentação registra:

* lote
* produto (desnormalizado)
* tipo + direção
* quantidade (litros, magnitude positiva)
* data
* usuário responsável
* motivo
* origem (`manual` / `evento` / `transacao` / `ajuste`) + `origin_id`
* evento / grupo / reversão (quando aplicável)

## Separação do Financeiro

Financeiro e estoque são **processos independentes**. Não há integração automática (ex.: despesa que cria lote). Compra financeira e entrada física podem ocorrer em datas diferentes.

## UX do módulo Estoque

1. Listagem de lotes (cards mobile / tabela desktop) + paginação
2. Cards-resumo de litros por produto
3. Detalhes do lote com histórico; ação **Editar chopp** (resumo → campo → salvar/excluir)
4. Wizard **Nova Movimentação**: tipo → Individual|Em lote + evento + itens → datas → resumo
5. Tela **Histórico** (`/stock/history`) com filtros e ação **Reverter**

---

# Produtos

Produtos operacionais são chopp controlado em litros.

UI: Nome + Preço padrão/L + Ativo.

Campos fixos na persistência:

* categoria `BEVERAGE`
* unidade `LITER`
* `track_stock = true`

Preço padrão pré-preenche o valor unitário nas entradas (editável antes de confirmar).

---

# Eventos (Feature)

Eventos não pertencem ao Core.

São uma Feature opcional.

Quando habilitados permitem:

Relacionar:

* receitas
* despesas
* produtos
* estoque

Gerar indicadores:

* faturamento do evento
* custo do evento
* lucro
* margem

Exemplo:

Festival

Feira

Evento corporativo

---

# Orçamentos (Feature)

Módulo comercial habilitado (`FEATURES.budgets`).

Fluxo wizard:

* tipo (Totem / Kombi)
* pessoas, duração, perfil de consumo
* outras bebidas, sabores (produtos ativos), distância
* extras via registry configurável
* dados do cliente

Cálculo centralizado em `BudgetCalculatorService` (UI não contém regras).

Total (interno) = litros×preço + km + extras + custo operacional.

PDF e WhatsApp expõem apenas dados comerciais (sem memória de custo interno).

Persistência em `budgets` com snapshot de auditoria (`calculated_total` vs `final_total`).

Evoluções futuras:

* aprovação
* reserva de estoque
* geração automática de venda/movimentação

---

# Dashboard

O Dashboard deve responder perguntas.

Não deve apenas mostrar números.

Exemplos:

Financeiro:

* Quanto faturou?
* Quanto gastou?
* Qual lucro?
* Como está o caixa?

Produtos:

* Qual produto vende mais?
* Qual possui maior margem?
* Qual está parado?

Estoque:

* Quanto está investido?
* Quais produtos estão acabando?
* Quais produtos possuem baixa movimentação?

---

# Indicadores Principais

Priorizar:

Financeiros:

* Receita
* Despesas
* Lucro
* Margem
* Fluxo de Caixa
* Saldo disponível

Produtos:

* Produtos mais vendidos
* Produtos mais lucrativos
* Margem por produto

Estoque:

* Valor total estoque
* Giro
* Produtos sem movimentação
* Estoque mínimo

Períodos:

* Comparação mensal
* Evolução histórica
* Tendências

---

# Camadas da Aplicação

A arquitetura deve seguir:

```
Presentation

↓

Container

↓

Services

↓

Repository

↓

Database
```

---

# Regras Técnicas

Nunca:

* acessar banco diretamente pela interface;
* colocar regra de negócio em componentes;
* duplicar validações;
* criar regra específica de segmento no Core;
* criar dependência entre Features e Core.

Sempre:

* TypeScript estrito;
* Zod para validação;
* Services centralizados;
* componentes reutilizáveis;
* baixo acoplamento;
* alta coesão.

---

# Histórico e Auditoria

Dados importantes nunca devem ser apagados sem necessidade.

Priorizar:

* status ativo/inativo;
* histórico;
* auditoria.

---

# Objetivo Final

Criar um SaaS White Label profissional.

A aplicação deve possuir:

* Core simples;
* Features independentes;
* regras claras;
* dados confiáveis;
* boa experiência;
* arquitetura preparada para crescimento.

A complexidade deve existir internamente quando necessária.

A experiência do usuário deve permanecer simples.

O sistema deve ser fácil para pequenos empresários, mas possuir fundamentos técnicos suficientes para evoluir como produto SaaS.
