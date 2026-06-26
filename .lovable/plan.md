
# Registro de ponto offline (com validação de localização mantida)

## Como a validação da obra funciona sem internet

A validação de "está dentro da obra permitida?" hoje já roda **inteiramente no celular** dentro de `UnifiedLocationSystem.validateLocation` — ela só precisa de 3 coisas:

1. **GPS do aparelho** → funciona offline (é sensor, não rede).
2. **Lista de obras permitidas** (`allowed_locations`: latitude, longitude, raio, restrições por funcionário) → hoje vem do Supabase, mas vamos **cachear localmente**.
3. **Cálculo de distância + range adaptativo + calibração** → 100% código no app, já roda local.

Ou seja, a única peça que falta offline é a lista de obras. Resolvendo o cache, a validação roda **idêntica** ao modo online — mesmas regras de raio, mesma tolerância adaptativa, mesma rejeição por GPS > 40m, mesma calibração.

### O cache de obras permitidas

- Toda vez que o funcionário abre o app **com internet**, salvamos no IndexedDB do aparelho:
  - Lista de `allowed_locations` ativas que ele pode usar (já filtradas pelas restrições dele).
  - Turno + horários (`work_shifts`, `work_shift_schedules`) para o ajuste de tolerância.
  - Carimbo de data/hora do último refresh.
- Esse cache é por funcionário e fica criptografado pelo próprio Android/iOS no storage do app.
- Se estiver offline, o `useUnifiedLocation` lê do cache em vez de chamar o Supabase. A função `validateLocation` recebe a mesma estrutura `AllowedLocation[]` e nem percebe a diferença.

### Regras de validade do cache

- **Cache fresco (≤ 7 dias)** → validação offline liberada normalmente.
- **Cache velho (> 7 dias sem refresh)** → bloqueia registro offline e mostra: "Conecte-se à internet para atualizar suas obras permitidas". Isso evita aceitar registro em obra que já foi desativada / removida do funcionário há muito tempo.
- **Sem cache (primeiro acesso nunca foi online)** → bloqueia com a mesma mensagem.

### Quando admin muda obras/raios

Se o admin altera o raio ou remove uma obra enquanto o funcionário está offline há dias, o registro offline desse funcionário ainda vai ser validado pela versão antiga das regras. Na hora da sincronização, o servidor **aceita o registro** (porque o ajuste foi feito conforme as regras vigentes na hora da batida — é o comportamento correto para auditoria; o funcionário não pode ser punido por algo que mudou depois). Vamos gravar no `time_records` um campo `offline_synced_at` + os metadados do cache usado, para o admin poder auditar se precisar.

## O que muda no fluxo de bater ponto

1. Funcionário aperta "Registrar Ponto".
2. App pega GPS (multi-amostra, exatamente como hoje).
3. App chama `validateLocation(allowedLocations)` — `allowedLocations` vem do **cache local** quando offline ou do Supabase quando online.
4. Se válido → aplica `calculateAdjustedTime` (cache de turno também é local) e:
   - **Online:** grava no Supabase (fluxo atual).
   - **Offline:** salva na fila local com toast "Ponto registrado offline — será sincronizado".
5. Quando voltar a internet, fila sincroniza em segundo plano usando idempotência (`client_id` UUID) e merge por ação (`clock_in`, `lunch_start`, etc.), sem sobrescrever batidas que outro dispositivo já enviou.

## Arquivos afetados

- `src/utils/offlineCache.ts` (novo) — guarda obras permitidas + turno do funcionário no IndexedDB.
- `src/utils/offlineQueue.ts` (novo) — fila de registros pendentes com `client_id`, contagem de tentativas, status.
- `src/hooks/useOnlineStatus.ts` (novo) — detecta online/offline (inclui ping leve para "Wi-Fi sem internet").
- `src/hooks/useOfflineSync.ts` (novo) — sincronizador em background, montado uma vez no `App.tsx`.
- `src/hooks/useUnifiedLocation.ts` — usa cache quando offline; popula cache quando online.
- `src/hooks/useWorkShiftValidation.ts` — usa cache quando offline; popula cache quando online.
- `src/components/UnifiedTimeRegistration.tsx` — badge "📴 Offline" / "⏳ X pendentes", chama `persistRegistration` que decide entre Supabase direto e fila.
- `src/App.tsx` — monta `useOfflineSync` global.
- `package.json` — adiciona `idb-keyval`.

## O que **não** muda

- `UnifiedLocationSystem.validateLocation` — mesmas regras, mesmos thresholds, mesma calibração.
- `calculateAdjustedTime` e tolerância de turno — idênticos.
- Tabela `time_records`, RLS, edge functions — sem alteração de schema.
- Fluxo online — quem tem internet não sente diferença nenhuma.

## Limitações honestas

- **Primeiro acesso precisa de internet** (para baixar sessão + cache de obras + turno).
- **Endereço textual** (reverse-geocoding via Mapbox/Nominatim) precisa de internet. Offline, grava "Coordenadas: lat,lng" e o admin enxerga o ponto no mapa normalmente.
- **Cache > 7 dias** bloqueia registro offline (proteção contra obras desativadas).
- **Conflito multi-dispositivo** (mesma ação batida em 2 aparelhos) → vence a mais recente; descarte é logado para auditoria.

## Resultado esperado

Funcionário em obra sem sinal:
- GPS pega coordenadas normalmente.
- App valida contra a lista de obras permitidas que está no celular (atualizada na última vez que abriu com internet).
- Se está dentro do raio da obra → registra offline com horário ajustado pelo turno.
- Se está fora → bloqueia com a mesma mensagem de hoje ("Você está a Xm de [obra]").
- Quando chegar em área com sinal, tudo sobe sozinho sem ele tocar em nada.
