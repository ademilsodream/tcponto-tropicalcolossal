# Estabilizar o registro de ponto

## Objetivo
Tornar a batida confiável no mesmo local e no mesmo dia, mantendo as regras atuais de obra permitida, precisão GPS, turno, tolerância de horário, sequência das quatro batidas e intervalo de 20 minutos.

## Situação confirmada
- O fluxo ativo é o `UnifiedTimeRegistration`.
- A validação final coleta GPS por até 8 segundos e rejeita precisão acima de 40 m; portanto, leituras instáveis podem alternar entre aceitas e recusadas mesmo sem a pessoa mudar de lugar.
- O bloqueio de processamento só é ativado depois da coleta do GPS. Durante essa espera, mais de um toque pode iniciar operações concorrentes para a mesma batida.
- A fila offline só é usada quando `navigator.onLine` já está falso. Se o telefone indicar “online”, mas a requisição ao Supabase falhar por sinal instável, a batida termina em erro e não é preservada.
- Depois de enfileirar uma batida offline, a tela consulta novamente apenas o banco; ela não incorpora imediatamente a batida local. Assim, a próxima ação pode continuar sendo identificada como a anterior.
- A mensagem final de gravação é genérica, então hoje não é possível distinguir falha de GPS, rede, sessão, conflito ou permissão a partir do relato do funcionário.
- O banco possui uma única linha por funcionário e data (`UNIQUE (user_id, date)`), e os registros recentes têm localização; não há histórico das tentativas recusadas no cliente. Portanto, uma única causa passada não pode ser comprovada pelos dados atuais.

## Implementação

### 1. Impedir concorrência e duplo toque
- Criar uma trava imediata e síncrona no começo da ação, antes de iniciar a coleta GPS.
- Desabilitar o botão e mostrar o estado “Confirmando GPS…” durante todo o processo.
- Garantir liberação da trava em todos os retornos e erros.
- Manter o cooldown de 20 minutos somente após a batida ter sido gravada no banco ou preservada na fila local.

### 2. Tornar a validação GPS determinística sem afrouxar as regras
- Manter os limites atuais de precisão e o raio configurado para cada obra.
- Evitar que a validação automática em segundo plano concorra com a validação final da batida.
- Na batida, usar uma única sessão fresca de coleta e escolher de forma consistente a melhor amostra/conjunto convergente.
- Se a primeira coleta falhar apenas por instabilidade ou timeout, realizar uma nova tentativa controlada antes de recusar.
- Exibir o motivo real da recusa: precisão obtida, distância da obra, falta de permissão ou timeout.

### 3. Fazer a gravação sobreviver à internet instável
- Tratar timeout, falha de conexão e indisponibilidade do Supabase como falhas recuperáveis, mesmo quando `navigator.onLine` estiver `true`.
- Nesses casos, preservar a batida na fila local já validada, sem pedir ao funcionário para bater novamente.
- Não enfileirar erros de autenticação, RLS, dados inválidos ou conflito lógico; mostrar a mensagem correspondente.
- Manter a sincronização automática quando a conexão voltar e impedir duplicação por funcionário, data e ação.

### 4. Corrigir sequência e estado local/offline
- Montar o “registro efetivo do dia” combinando a linha do Supabase com as batidas pendentes da fila.
- Após uma batida offline, atualizar imediatamente a linha de progresso e avançar para a próxima ação.
- Consultar de forma consistente registros `active` e `approved` ao determinar a linha do dia.
- Sincronizar as ações pendentes em ordem cronológica, mesclando localização e horário sem apagar batidas existentes.
- Atualizar imediatamente o contador de pendências após enfileirar ou sincronizar.

### 5. Melhorar diagnóstico e retorno ao funcionário
- Substituir o erro genérico por mensagens específicas e curtas para GPS, distância, internet, sessão e gravação.
- Registrar localmente metadados seguros da tentativa: etapa, precisão, distância, obra identificada, condição de rede e código de erro, sem guardar credenciais.
- Diferenciar claramente “registrado no servidor” de “registrado no aparelho e aguardando envio”.

## Validação
- Testar um toque normal online e confirmar uma única gravação.
- Testar vários toques rápidos durante a coleta GPS e confirmar que apenas uma ação é processada.
- Simular GPS oscilando dentro do mesmo local e confirmar tentativa controlada e mensagem precisa, sem alterar os limites existentes.
- Simular queda de rede com `navigator.onLine` ainda verdadeiro e confirmar que a batida vai para a fila.
- Registrar as quatro ações offline, confirmar a progressão correta e depois sincronizar sem duplicação ou perda.
- Testar linha diária `active` e `approved`.
- Verificar no Supabase os horários, a localização de cada ação e a fila vazia após sincronização.
