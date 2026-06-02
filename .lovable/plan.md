## Causa raiz

O Resumo Mensal filtra `time_records` apenas por `status = 'active'`, mas no banco existem registros com `status = 'approved'` (dias já validados pelo admin). Em maio/2026, Ademilson tem 22 registros: **15 `active` completos + 6 `approved` completos + 1 `active` incompleto (dia 10, só 2 batidas)**. Os 6 `approved` ficam de fora da consulta, por isso aparece 15 em vez de 21.

## Correção

Arquivo: `src/components/EmployeeMonthlySummary.tsx`

1. Trocar o filtro `eq('status','active')` por `in('status', ['active','approved'])` na busca de `time_records`.
2. Manter a regra "4 batidas" para contar como dia trabalhado (o dia 10 — com apenas clock_in/clock_out — continua não contando, resultando em 21 dias, conforme o usuário espera).
3. As horas trabalhadas, previstas, extras e almoço passam a refletir também os dias aprovados.

Sem outras mudanças.