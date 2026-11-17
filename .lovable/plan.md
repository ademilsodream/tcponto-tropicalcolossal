# Obra na fatura do Cartão Business

Depois de tirar a foto e aparecerem os dados lidos, o ecrã de confirmação passa a ter um campo **Obra** (lista suspensa) para escolher a obra a que a fatura pertence.

- A lista mostra apenas as obras ativas da lista de localizações permitidas (as mesmas usadas no registo de ponto), em ordem alfabética.
- A obra escolhida é guardada junto com a fatura e aparece na lista de faturas abaixo do fornecedor.
- O nome da obra mantém-se atualizado se for renomeada depois.
- Faturas antigas ficam sem obra ("Obra não informada").
- Nada muda no saldo do cartão, no envio para o Drive nem na leitura da fatura.

## Detalhes técnicos
- Migração: `business_card_faturas` ganha `location_id uuid null references allowed_locations(id) on delete set null`.
- `BusinessCard.tsx`: carregar `allowed_locations` (`id, name`) com `is_active = true`, ordenado com `localeCompare('pt-BR')`; `Draft.location_id`; Select no formulário de confirmação; incluir no insert; select das faturas com `location_id`, mostrar nome via mapa id→nome.
- Campo opcional por agora (pode tornar-se obrigatório se preferir).
