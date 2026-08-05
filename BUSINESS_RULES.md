# BUSINESS_RULES.md

# Regras de Negócio do Sistema

## Objetivo

Este documento define as regras oficiais de negócio da aplicação.

Todas as implementações devem respeitar estas regras.

O sistema deve priorizar:

* simplicidade operacional;
* confiabilidade das informações;
* rastreabilidade;
* facilidade de uso;
* evolução futura.

O sistema não deve funcionar como um ERP complexo.

O objetivo é fornecer gestão financeira e operacional para micro e pequenas empresas.

---

# Conceito Geral

A aplicação representa uma plataforma SaaS White Label.

Cada empresa possui seus próprios dados isolados.

Nenhuma regra deve depender de um segmento específico.

O sistema deve trabalhar com conceitos genéricos:

* movimentação financeira;
* produto;
* estoque;
* categoria;
* indicadores;
* relatórios.

Funcionalidades específicas devem existir como Features.

---

# Empresas

Toda informação pertence a uma empresa.

Todas as entidades principais devem possuir referência à empresa.

Exemplo:

* produtos;
* transações;
* categorias;
* estoque;
* usuários.

Uma empresa nunca pode acessar dados de outra empresa.

---

# Financeiro

## Regra principal

Toda movimentação de dinheiro deve ser registrada como uma Transaction.

Não existem mais entidades separadas para entradas e saídas.

O histórico financeiro possui uma única fonte de verdade:

```
Transactions
```

---

# Transactions

Uma Transaction representa uma alteração financeira.

Exemplos:

* venda realizada;
* recebimento de cliente;
* pagamento de fornecedor;
* compra de chopp (despesa + entrada de estoque).

---

# Tipos de Transaction

Tipos operacionais:

## INCOME

Representa entrada de dinheiro.

Exemplos:

* venda;
* serviço;
* recebimento.

Impacto:

Aumenta o patrimônio financeiro.

Forma de pagamento é opcional.

---

## EXPENSE

Representa saída definitiva de dinheiro.

Exemplos:

* fornecedor;
* combustível;
* **Compra de Chopp** (categoria com nome exato; gera entrada de estoque).

Impacto:

Reduz o patrimônio financeiro.

---

# Transfer (legado)

`TRANSFER` pode existir em registros antigos, mas **não** é criado pela UI atual.

Listas, totais e filtros operacionais **ignoram** transferências.

---

# Regra de Transferência

Não aplicável ao fluxo operacional atual. Contas ainda existem para INCOME/EXPENSE (origem/destino conforme o tipo), com default automático na Conta Principal.

---

# Accounts

Accounts representam locais financeiros internos.

Não necessariamente representam bancos.

Podem representar:

* caixa principal;
* investimento;
* reserva financeira;
* outros agrupamentos.

---

# Conta Principal

Toda empresa deve possuir uma conta financeira principal.

Ela representa o fluxo operacional.

Por padrão:

Receitas entram nela.

Despesas operacionais saem dela.

O objetivo é reduzir complexidade para o usuário.

---

# Categorias

Categorias possuem apenas função de classificação.

Categorias não representam contas.

Exemplo:

Categoria:

```
Combustível
```

Conta:

```
Conta Principal
```

São conceitos diferentes.

---

# Resultado Financeiro

O sistema deve diferenciar:

## Movimentação Financeira

Representa movimentação de dinheiro.

Exemplo:

Transferência para investimento.

---

## Resultado Financeiro

Representa desempenho da empresa.

Cálculo:

```
Receitas

-

Despesas

=

Resultado
```

Transferências nunca entram nesse cálculo.

---

# Fluxo de Caixa

Fluxo de caixa deve demonstrar:

Quanto entrou.

Quanto saiu.

Quanto existe disponível.

O fluxo deve considerar movimentações reais de dinheiro.

---

# Produtos

Produtos operacionais representam chopp controlado em **litros**.

UI: apenas Nome + Ativo.

Persistência sempre define:

* categoria `BEVERAGE`;
* unidade `LITER`;
* `track_stock = true`.

Produtos **não** armazenam saldo. Saldo vive no domínio de Estoque.

---

# Estoque

## Regra principal

Estoque é controlado exclusivamente através de movimentações.

Nunca alterar saldo diretamente.

O saldo é calculado através do histórico de `stock_movements`.

Unidade operacional: **litros**.

---

# Criação de lotes

Uma movimentação do tipo **Entrada** sempre:

1. cria um registro em `stock_batches`;
2. cria o movimento `ENTRY` / `IN` correspondente.

A quantidade inicial do lote é o snapshot dessa primeira entrada.

---

# Cálculo do saldo

Para um lote:

```
availableQuantity = Σ quantity(IN) − Σ quantity(OUT)
```

Para um produto:

```
estoque do produto = Σ availableQuantity dos seus lotes ACTIVE
```

Valor imobilizado de um lote:

```
availableQuantity × unit_value
```

---

# Encerramento automático de lotes

Status do lote é derivado:

* `ACTIVE` quando `availableQuantity > 0`
* `CLOSED` quando `availableQuantity <= 0`

Não existe update manual de status.

---

# Regras de movimentação

Tipos na UI:

* Entrada (`ENTRY`) → direção `IN` (cria lote);
* Saída (`EXIT`) → direção `OUT`;
* Perda (`LOSS`) → direção `OUT`;
* Consumo Interno (`INTERNAL_CONSUMPTION`) → direção `OUT`.

`ADJUSTMENT` existe no banco/enum mas **não** é exposto na UI.

Toda movimentação deve possuir:

* produto;
* lote (exceto a Entrada, que cria o lote);
* quantidade > 0 (litros);
* data;
* origem;
* usuário responsável (quando autenticado).

Entrada exige valor unitário (R$/L). Saídas / perdas / consumo **não** pedem valor.

Movimentações OUT **não podem** resultar em saldo negativo no lote.

---

# Comportamento da tela de Estoque

1. Listagem de lotes abre imediatamente (sem escolha de grupo).
2. Cards-resumo exibem litros disponíveis agregados por produto.
3. A listagem mostra lotes (não produtos).
4. “Nova Movimentação” usa wizard por tipo (Entrada vs Saída/Perda/Consumo) com resumo e confirmação de descarte.

---

# Indicadores de Estoque (Dashboard)

Calculados a partir de dados reais (sem mocks):

* Valor total imobilizado = Σ (availableQuantity × unit_value) dos lotes ACTIVE;
* Produto com maior estoque = ranking por litros disponíveis;
* Produtos abaixo do mínimo = available < `min_stock` do produto (quando preenchido);
* Maior consumo / maior perda = somatório do tipo no **período** selecionado.

Período padrão do dashboard: ciclo **20 → 20** (dia 20 do mês até dia 20 do mês seguinte).

---

# Integração Financeiro + Estoque

Implementada para categoria de despesa com nome exato **`Compra de Chopp`** (criada automaticamente se ausente):

1. Wizard financeiro inclui passo de estoque (produto, litros, R$/L, validade opcional);
2. Valor da despesa = litros × R$/L;
3. Ao salvar: cria `Transaction` EXPENSE e em seguida `Stock Movement` ENTRY com `origin = 'transacao'` e `origin_id` = id da transação;
4. Se o estoque falhar, a transação é cancelada e o erro é exibido.

Vínculo técnico: `stock_movements.origin = 'transacao'` e `origin_id` = id da Transaction.

---

# Eventos (Feature)

Eventos são opcionais.

O Core não depende deles.

Quando habilitado:

Um evento pode possuir:

* receitas associadas;
* despesas associadas;
* movimentações de estoque associadas.

---

# Métricas de Evento

Eventos podem calcular:

* faturamento;
* despesas;
* lucro;
* margem;
* produtos utilizados.

---

# Orçamentos (Feature)

Orçamentos são opcionais.

Devem permitir:

* criar proposta;
* adicionar produtos;
* calcular valores.

Futuras evoluções:

* gerar PDF;
* enviar WhatsApp;
* aprovação;
* reserva de estoque;
* criação automática de movimentações.

---

# Dashboard

O Dashboard deve apresentar informações úteis para decisão.

Não deve apenas exibir números.

---

# Perguntas que o Dashboard deve responder

Financeiro:

* Quanto vendemos?
* Quanto gastamos?
* Quanto sobrou?
* Estamos crescendo?

Produtos:

* Qual produto vende mais?
* Qual produto possui maior margem?
* Qual produto está parado?

Estoque:

* Quanto dinheiro está parado em estoque?
* Quais produtos precisam reposição?

---

# Indicadores

Indicadores principais:

## Financeiros

* Receita;
* Despesas;
* Resultado;
* Margem;
* Fluxo de Caixa;
* Saldo disponível.

## Produtos

* Mais vendidos;
* Maior margem;
* Rentabilidade.

## Estoque

* Valor total;
* Giro;
* Produtos sem movimentação;
* Estoque mínimo.

## Evolução

* Comparação entre períodos;
* Crescimento;
* Tendência.

---

# Usuários e Permissões

Usuários possuem permissões.

Permissões devem controlar:

* acesso a módulos;
* visualização;
* criação;
* edição;
* exclusão.

---

# Auditoria

Operações importantes devem possuir rastreabilidade.

Registrar quando possível:

* usuário;
* data;
* ação realizada.

---

# Exclusões

Dados financeiros nunca devem ser apagados sem necessidade.

Priorizar:

* cancelamento;
* inativação;
* histórico.

---

# Regras Obrigatórias

Nunca:

* criar regra específica para um segmento dentro do Core;
* considerar transferência como receita ou despesa;
* alterar estoque sem movimentação;
* duplicar regras;
* acessar banco diretamente pela interface.

Sempre:

* preservar histórico;
* manter rastreabilidade;
* centralizar regras;
* validar dados;
* respeitar arquitetura definida.

---

# Objetivo Final

Criar um sistema simples para o usuário final, mas sólido internamente.

A aplicação deve permitir que pequenos empresários tenham controle financeiro e operacional confiável, mantendo uma arquitetura preparada para crescimento como SaaS White Label.
