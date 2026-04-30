## Objetivo

Adicionar um botão no modal "Editar [data]" (Ajuste de Registros) que, ao ser apertado, preenche automaticamente os 4 campos de horário (Entrada, Início Almoço, Fim Almoço, Saída) com os horários oficiais do turno do funcionário para o dia da semana selecionado.

## Como vai funcionar

1. Ao abrir o modal de edição de um dia, o sistema busca o turno (`work_shift`) ativo do funcionário e o respectivo `work_shift_schedule` correspondente ao dia da semana da data selecionada (segunda, terça, etc.).
2. Um novo botão **"Preencher com horário do turno"** aparece logo acima dos 4 campos de horário (Entrada / Início Almoço / Fim Almoço / Saída).
3. Ao clicar, os 4 inputs `time` são preenchidos com:
   - Entrada ← `start_time` do schedule
   - Início Almoço ← `break_start_time`
   - Fim Almoço ← `break_end_time`
   - Saída ← `end_time`
4. O usuário ainda pode editar os valores manualmente depois.
5. Caso o funcionário não tenha turno definido, ou não haja schedule para aquele dia da semana (ex.: domingo sem expediente), o botão fica desabilitado e mostra um tooltip/texto explicativo (ex.: "Sem turno configurado para este dia").

## Detalhes técnicos

**Arquivo a modificar:** `src/components/AdjustPreviousDays.tsx`

1. Adicionar estado `shiftSchedule` (com `start_time`, `break_start_time`, `break_end_time`, `end_time`) e `loadingShift`.
2. Em `loadTimeRecord(date)`, após carregar o registro, fazer query:
   - Buscar `profile.shift_id` (já disponível via `useOptimizedAuth`).
   - Query em `work_shift_schedules` filtrando por `shift_id` e `day_of_week` (0-6, calculado via `date.getDay()`).
   - Salvar resultado em `shiftSchedule` state. Se não houver, setar como `null`.
3. Criar handler `handleFillFromShift()`:
   - Pega `shiftSchedule` e atualiza `editForm` com os 4 horários (formato `HH:mm`, removendo segundos se vierem).
4. No JSX do modal, adicionar acima do `<div className="grid grid-cols-2 gap-4">` (linha ~680):
   ```tsx
   <Button
     type="button"
     variant="secondary"
     onClick={handleFillFromShift}
     disabled={!shiftSchedule || submitting}
     className="w-full h-11"
   >
     <Clock className="w-4 h-4 mr-2" />
     Preencher com horário do turno
   </Button>
   ```
5. Resetar `shiftSchedule` em `handleCloseModal`.

## Escopo

- Apenas mudança de UI/comportamento no modal de Ajuste de Registros.
- Sem alterações em backend, schema ou outras telas.
