# Deixar o app mais rápido e estável no registro de ponto

Nenhuma regra de cálculo, tolerância, turno, raio de obra, cooldown ou fluxo de aprovação será alterada. O trabalho é só de desempenho e estabilidade — o mesmo resultado, sem travar.

## O que foi confirmado no código

- O relógio da tela é redesenhado a cada segundo por um temporizador que fica ativo mesmo quando não há contagem de espera. Isso redesenha o mapa e o painel de GPS junto.
- O painel de GPS atualiza informações de diagnóstico a cada 10 segundos, provocando mais redesenhos sem necessidade.
- O mapa (Leaflet) é carregado de um endereço externo da internet e nunca é destruído quando a tela sai. Cada nova entrada na tela cria outro mapa, acumulando consumo de memória — a causa mais provável do aviso "TCPonto não está respondendo" do print.
- A leitura de GPS mantém uma janela de coleta contínua de 8 segundos e o resultado só vale 8 segundos, então praticamente toda checagem reabre o sensor em alta precisão.
- Ao bater o ponto, o app consulta o endereço da rua na internet antes de gravar, atrasando a gravação.

## O que será feito

### 1. Parar os redesenhos desnecessários
- O relógio passa a atualizar de forma isolada, sem redesenhar o mapa nem o painel de GPS.
- O temporizador de espera só roda quando existe espera ativa.
- O diagnóstico de GPS deixa de ficar atualizando sozinho a cada 10 segundos.
- Mapa, painel de GPS e linha de marcações passam a ser redesenhados só quando os próprios dados mudam.

### 2. Corrigir o vazamento de memória do mapa
- O mapa é destruído corretamente ao sair da tela.
- A posição no mapa só é movida quando o deslocamento é relevante, evitando redesenho a cada leitura mínima do GPS.
- A altura do mapa fica menor no telemóvel, reduzindo o número de imagens carregadas.
- Se o mapa não puder carregar (sem internet), a tela mostra as coordenadas em texto em vez de ficar em branco.

### 3. Usar o GPS com menos desgaste, sem mudar as regras
- Os limites de precisão, o raio de cada obra e a decisão de aceitar ou recusar continuam exatamente como estão hoje.
- A leitura contínua do sensor é encerrada assim que a decisão é tomada, e é garantidamente encerrada se a tela for fechada no meio.
- Uma única leitura passa a servir para a exibição e para a validação daquele instante, em vez de abrir o sensor duas vezes seguidas.
- A leitura de fundo é feita uma vez ao abrir a tela e ao voltar do plano de fundo, em vez de repetidamente.

### 4. Deixar a batida mais rápida
- A busca do nome da rua deixa de atrasar a gravação: grava primeiro com as coordenadas e completa o endereço em seguida, com limite curto de espera.
- O botão continua com a trava imediata contra duplo toque, e a mensagem mostra a etapa atual.

### 5. Reduzir peso geral do app
- A tela de registro deixa de carregar em paralelo consultas que não são usadas na decisão da batida.
- O mapa passa a ser carregado só depois do conteúdo principal aparecer.

## Como validaremos
- Abrir e sair da tela de registro várias vezes seguidas e confirmar que o app não fica lento nem trava.
- Bater ponto no mesmo local e confirmar o mesmo horário gravado e o mesmo comportamento de tolerância de hoje.
- Confirmar recusa quando fora do raio e quando o GPS está impreciso, com as mesmas mensagens.
- Confirmar que o registro sem internet continua a ir para a fila e a subir depois.

## Detalhes técnicos
- `UnifiedTimeRegistration.tsx`: relógio extraído para componente próprio; intervalo de cooldown condicionado a `cooldownEndTime`; `LocationMap`, `UnifiedGPSStatus` e `TimeRegistrationProgress` memoizados; `reverseGeocode` movido para depois da gravação/enfileiramento.
- `LocationMap.tsx`: `map.remove()` no cleanup, `React.memo`, atualização de `setView` só acima de um limiar de metros, carregamento do Leaflet com fallback textual.
- `useUnifiedLocation.ts`: remover o `setInterval` de `updateDebugStats`; validação inicial única + revalidação em `visibilitychange`; cancelar coleta pendente no unmount.
- `unifiedLocationSystem.ts`: garantir `clearWatch` em todos os caminhos (incluindo o retorno antecipado do Capacitor), expor cancelamento da coleta; `CONFIG` de precisão, raio e thresholds mantido sem alteração.
