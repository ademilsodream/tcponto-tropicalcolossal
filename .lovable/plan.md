# Novo menu "Compras" — pedidos de materiais para obras

## O que o funcionário vai ver
Novo item **Compras** no menu lateral (entre Ferramentas e Vale Salarial), com três abas:

1. **Novo pedido** — formulário com:
   - Obra (lista de obras ativas, em ordem alfabética)
   - Data em que os materiais serão usados (não permite data passada)
   - Lista de materiais (caixa de texto livre, ex.: "20 sacos de cimento, 5 tubos PVC 50mm")
   - Observações (opcional)
   - Botão "Enviar pedido"
2. **Solicitações feitas** — pedidos ainda não entregues, com o estado: Pendente, Aceito, Recusado (com motivo, se o TCObras informar).
3. **Entregues** — pedidos marcados como entregues na obra, com data de entrega e quem confirmou.

Cada pedido mostra obra, data de uso, lista de materiais, data do pedido e estado. O funcionário pode cancelar um pedido enquanto estiver "Pendente".

## Como liga ao TCObras
Os pedidos ficam gravados na mesma base de dados partilhada. O TCObras só precisa ler a nova tabela de pedidos e atualizar o estado (aceitar, recusar, marcar entregue). Nada é enviado por email ou mensagem — o TCPonto mostra automaticamente o estado atualizado. A tela do TCObras para aprovar/entregar será feita no próprio projeto TCObras (fora deste plano).

## Detalhes técnicos
- Nova tabela `pedidos_materiais`: `obra_id` (ref. obras), `solicitante_id` (auth.uid), `data_uso` (date), `lista_materiais` (text, até 5000 caracteres), `observacoes`, `status` (`pendente`, `aceito`, `recusado`, `entregue`, `cancelado`), `motivo_recusa`, `aceito_por`, `aceito_em`, `entregue_por`, `entregue_em`, `created_at`, `updated_at` (trigger).
- GRANTs para `authenticated` e `service_role`; RLS:
  - funcionário ativo cria pedidos só em seu nome (`solicitante_id = auth.uid()`, status inicial `pendente`);
  - funcionário vê os próprios pedidos; pode passar para `cancelado` apenas quando `pendente`;
  - administradores (`is_admin()`) veem e atualizam todos (usado pelo TCObras).
- Validação com zod no formulário; data de uso ≥ hoje.
- Novo componente `src/components/MaterialRequests.tsx` (Tabs), rota `/purchases` carregada sob demanda em `App.tsx`, item "Compras" (ícone carrinho) em `EmployeeDrawer.tsx`.
- Atualização em tempo real do estado via subscrição Realtime na tabela (com limpeza ao sair da tela).
- Nenhuma alteração em registro de ponto, cálculos ou outras regras.
