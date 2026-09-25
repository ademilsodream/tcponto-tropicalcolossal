# Remover menu "Registros Incompletos" e melhorar o Espelho Ponto

## 1. Remover o menu "Registros Incompletos"

O item sai do menu e a tela deixa de existir no app:

- `src/components/EmployeeDrawer.tsx` — remover o item `incompleteRecords` da lista de menus.
- `src/App.tsx` — remover a rota `/incomplete-records` e o import do componente.
- `src/components/UltraOptimizedEmployeeDashboard.tsx` — remover o import e o caso `incompleteRecords`.
- Excluir o arquivo `src/components/IncompleteRecordsProfile.tsx` (não é mais usado).

Nada muda nos dados do banco: os registros continuam gravados; apenas o menu/some a tela.

## 2. Espelho Ponto: horários visíveis sem clicar

Em `src/components/EmployeeDetailedReport.tsx`, cada dia passa a mostrar os horários direto no cartão, sem precisar abrir:

- Para dias com registro, mostrar em linha os 4 horários com rótulos: Entrada · Almoço (saída/início e volta) · Saída — valores em `--:--` quando faltantes.
- Mostrar o total de horas do dia destacado à direita (e horas extras quando existirem).
- Remover o botão de expandir/recolher (chevron) e o bloco de detalhes oculto — todo o conteúdo fica visível.
- Manter as cores atuais (fim de semana em laranja, dia com registro em azul, sem registro em cinza) e o seletor de período como está.
- Se houver mais de um registro no mesmo dia, mostrar um bloco de horários por registro, um abaixo do outro.

Não altera cálculos, tolerâncias nem regras do sistema — apenas apresentação.
