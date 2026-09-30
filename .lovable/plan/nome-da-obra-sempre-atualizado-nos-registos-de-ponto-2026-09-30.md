# Nome da obra sempre atualizado nos registos de ponto

## Objetivo
Quando o nome de uma obra for alterado, todos os registos já feitos nessa obra passam a mostrar o novo nome, sem quebrar as versões do app instaladas que continuam gravando só o nome (`locationName`).

## Como vai funcionar
1. **Cada batida passa a guardar também o identificador da obra** (`locationId`) junto ao que já é gravado hoje. Nada é removido: `locationName`, endereço, coordenadas e distância continuam iguais, então quem lê esses dados (TCRh, relatórios) não é afetado.
2. **O servidor completa sozinho o identificador** para as versões antigas do app: sempre que um registo é gravado ou alterado sem `locationId`, a base de dados procura a obra pelo nome (e, se o nome não bater, pela obra permitida mais próxima das coordenadas dentro do raio) e acrescenta o identificador. Assim as APKs antigas funcionam sem atualização.
3. **Ao renomear uma obra**, a base de dados atualiza automaticamente o `locationName` em todos os registos que tenham o identificador dessa obra. Como o nome continua gravado no mesmo campo, qualquer sistema ou versão antiga que leia o registo já vê o nome novo.
4. **Registos antigos**: uma única atualização preenche o `locationId` nos registos já existentes, usando a mesma correspondência por nome/coordenadas. Registos que não correspondam a nenhuma obra ficam como estão.

## O que não muda
- Regras de GPS, raio, tolerância, turno, cálculos de horas e aprovação.
- O formato atual do registo (apenas um campo novo é acrescentado).

## Detalhes técnicos
- Função `resolve_location_id(name, lat, lng)` (SECURITY DEFINER, search_path fixo): match por `allowed_locations.name` (case/trim-insensitive), fallback por distância haversine ≤ `range_meters`.
- Trigger `BEFORE INSERT OR UPDATE OF locations` em `time_records`: para cada chave (clock_in, lunch_start, lunch_end, clock_out) sem `locationId`, preenche via função.
- Trigger `AFTER UPDATE OF name` em `allowed_locations`: `UPDATE time_records` reescrevendo `locationName` das ações cujo `locationId` = id da obra (usa `jsonb_set`). Para não disparar recálculos, o trigger de horas só é afetado se já reagir a `locations` — verificar antes e, se necessário, limitar a atualização ao campo JSON.
- App novo (`UnifiedTimeRegistration` e fila offline): incluir `locationId` no objeto de localização; tipo `LocationDetails` ganha `locationId?: string`.
- Backfill único via SQL de dados após a migração.

## Validação
- Gravar batida pelo app novo e simular gravação sem `locationId` (versão antiga): ambos ficam com identificador.
- Renomear uma obra de teste e confirmar o novo nome nos registos antigos e novos.
- Confirmar que horas e valores dos registos não mudaram.
