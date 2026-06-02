## Causa raiz

`VacationRequest.tsx` usa `.maybeSingle()` na consulta de `vacation_balances`, mas Ademilson tem 2 registros (2025 e 2026). Isso faz a query falhar e o saldo aparecer como 0, ignorando os 22 dias elegíveis de 2026.

## Correção

Arquivo: `src/components/VacationRequest.tsx`

1. Substituir `.maybeSingle()` por uma query que filtra `eligible = true` e `enjoyment_deadline >= hoje`, ordenada por ano, somando `available_days` de todos os períodos válidos:
   ```ts
   const today = format(new Date(), "yyyy-MM-dd");
   const { data: balances } = await supabase
     .from("vacation_balances")
     .select("year, available_days, eligible, enjoyment_deadline")
     .eq("employee_id", user.id)
     .eq("eligible", true)
     .gte("enjoyment_deadline", today)
     .order("year", { ascending: true });
   const total = (balances ?? []).reduce((s, b) => s + (b.available_days ?? 0), 0);
   setBalance(total);
   setBalanceDetails(balances ?? []);
   ```

2. Exibir detalhamento por ano abaixo do campo de saldo (ex.: "2026: 22 dias — usar até dd/mm/aaaa").

3. Mensagem mais clara quando não houver período elegível, informando a próxima data de elegibilidade quando existir registro futuro.

Sem alterações em backend, RLS ou tabelas.