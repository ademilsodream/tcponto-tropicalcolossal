
# Melhorar precisão do GPS para registro de ponto

## Diagnóstico atual

O sistema hoje (`src/utils/unifiedLocationSystem.ts` + `useUnifiedLocation.ts`) tem comportamentos que **prejudicam a precisão**:

1. **Range adaptativo que ALARGA quando o GPS é ruim** — se a precisão piora, o raio aceito aumenta até 2x (ou +200m). Isso é o oposto do que queremos.
2. **Aceita leitura única** do GPS (`getCurrentPosition` uma vez). Sem média, sem descarte de outliers.
3. **Aceita precisão de até 100m** como "REGULAR" e válida para bater ponto.
4. **Cache de 30s + `maximumAge` de 60–120s** pode retornar fix antigo, longe da posição real.
5. **Calibração** soma um offset salvo no localStorage — se foi calibrado errado uma vez, contamina todas as marcações.
6. Validação roda em qualquer leitura, sem exigir estabilidade entre amostras.

## O que vou fazer (apenas frontend, regras de negócio mantidas)

### 1. Coleta multi-amostra com convergência
Em vez de 1 leitura, abrir `watchPosition` (e equivalente Capacitor) por até ~8s e coletar várias amostras:
- Descartar amostras com `accuracy > 50m`.
- Parar assim que tiver **3 amostras consecutivas com accuracy ≤ 15m** dentro de 10m entre si (fix estável) → usa a melhor.
- Se não convergir, usar a **mediana** das melhores 3 amostras (mais robusto que média contra outliers).
- Fallback para `getCurrentPosition` só se o watch falhar.

### 2. Thresholds mais rigorosos
- `HIGH_ACCURACY_THRESHOLD`: 15m → **10m**
- `MEDIUM_ACCURACY_THRESHOLD`: 35m → **25m**
- Limite máximo aceito para registrar: **40m** (hoje aceita até 100m). Acima disso → bloqueia e pede para tentar de novo / ir a céu aberto.

### 3. Range adaptativo invertido (corrige o bug conceitual)
Hoje: GPS ruim → raio maior (aceita qualquer coisa).
Novo: raio efetivo = `max(range_base, accuracy * 1.5)` **mas nunca maior que `range_base + 25m`**. Ou seja, a tolerância extra é pequena e limitada — não compensa GPS ruim aceitando o ponto longe.

### 4. Cache e maximumAge mais curtos
- `CACHE_DURATION`: 30s → **8s**
- `maximumAge`: 60–120s → **5s** (sempre forçar fix novo na hora de bater ponto)
- Antes de gravar o ponto em `UnifiedTimeRegistration.handleTimeRegistration`, forçar **refresh** da localização (ignorar cache) para garantir leitura fresca no momento exato da batida.

### 5. Calibração mais segura
- Limitar offset máximo da calibração a **30m** (se calibrar com offset maior, rejeita — era leitura ruim).
- Reduzir validade de 72h → **24h**.
- Quando aplicar calibração, **não melhorar artificialmente a `accuracy`** reportada (hoje faz `Math.min(accuracy, calibration.accuracy)` — isso mascara GPS ruim).

### 6. Sanity check final antes de gravar
Em `handleTimeRegistration`, antes do `INSERT/UPDATE`:
- Refazer 1 leitura fresca.
- Confirmar que distância ao local permitido ≤ `range_base + 25m`.
- Confirmar `accuracy ≤ 40m`.
- Se falhar → toast "Sinal GPS instável, tente novamente em alguns segundos" e não grava.

### 7. UI/feedback (mínimo)
- `UnifiedGPSStatus` já mostra qualidade — só ajustar os textos dos thresholds (10/25/40) e mostrar "coletando amostras… X/3" durante a convergência.

## Arquivos afetados

- `src/utils/unifiedLocationSystem.ts` — core das mudanças (coleta multi-amostra, thresholds, range adaptativo, calibração).
- `src/hooks/useUnifiedLocation.ts` — expor progresso de convergência e função `forceFreshLocation()`.
- `src/components/UnifiedTimeRegistration.tsx` — chamar `forceFreshLocation()` + sanity check antes de gravar.
- `src/components/UnifiedGPSStatus.tsx` — textos dos novos thresholds e indicador de coleta.

## Detalhes técnicos

```text
Fluxo de coleta (novo)
─────────────────────
start watchPosition (high accuracy)
  ├─ sample arrives
  │    ├─ accuracy > 50m? descarta
  │    └─ push em buffer[]
  ├─ buffer tem 3 últimas com acc<=10m e spread<=10m? → CONVERGIU, usa melhor
  ├─ 8s passaram?
  │    ├─ buffer >= 3? → usa MEDIANA das 3 melhores
  │    └─ buffer < 3?  → erro "GPS não estabilizou"
  └─ clearWatch
```

Regras de negócio (turnos, tolerâncias, ajuste de horário em `calculateAdjustedTime`, RLS, tabelas) ficam **inalteradas**. A mudança é puramente na camada de obtenção/validação de coordenadas.

## Resultado esperado

- Marcações deixam de ser aceitas com GPS de 50–100m.
- Fix sempre fresco no momento da batida (não cache antigo).
- Menos falsos positivos por calibração ruim acumulada.
- Quando o sinal está bom, a experiência fica igual à de hoje (o tempo extra de convergência é ≤ 2–3s).
