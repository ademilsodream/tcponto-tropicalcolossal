
## Objetivo
Corrigir os dados imprecisos do dashboard "Resumo Mensal" (`src/components/EmployeeMonthlySummary.tsx`).

## Mudanças

### 1. Horas previstas — baseadas no turno do funcionário
- Buscar `shift_id` do funcionário em `profiles`.
- Buscar todos os registros de `work_shift_schedules` para esse turno (um por `day_of_week` 0–6).
- Para cada dia do período (do dia 1 até hoje, se for mês atual; senão até o último dia do mês):
  - Pegar o schedule do `day_of_week` correspondente.
  - Se houver `start_time` e `end_time`, somar `(end - start) - (break_end - break_start)` em horas.
  - Se não houver schedule (folga), prever 0h — exceto se houver registro real no dia (mantém comportamento atual de contar fim de semana trabalhado, usando a jornada do dia mais próximo ou jornada padrão como fallback).
- Fallback: se o funcionário não tiver `shift_id`, usar o cálculo antigo (`jornada_padrao_horas` × dias úteis) para não quebrar.

### 2. Dias trabalhados — só dias completos
Contar o dia apenas quando o registro tem os **4 horários preenchidos**: `clock_in`, `lunch_start`, `lunch_end`, `clock_out`.

### 3. Horas extras — manter total do mês
`overtime = max(0, totalHours - plannedHours)` (sem mudança).

### 4. Período até hoje
Para o mês corrente, somar previstas apenas até o dia atual (já é o comportamento, mas garantir que o último dia inclua o dia de hoje).

### 5. Parse de datas consistente
Usar parser explícito para `record.date` (formato ISO `YYYY-MM-DD`) evitando `new Date(string)` para não pegar timezone errado ao identificar `day_of_week` de fins de semana.

## Arquivos
- `src/components/EmployeeMonthlySummary.tsx` — única alteração; refatorar `loadMonthlySummary` para buscar turno e calcular previstas por dia, e ajustar contagem de `workingDays`.

## Fora do escopo
- Não tratar feriados nem férias/faltas (não solicitado).
- Não alterar UI/layout, apenas os cálculos.
