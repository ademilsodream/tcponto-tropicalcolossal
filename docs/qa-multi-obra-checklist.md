# Checklist manual — multi-obra no mesmo dia

1. Funcionário com restrições em Obra A e Obra B: registrar entrada em A e saída em B no mesmo dia; confirmar no Supabase `time_records.locations` quatro chaves com obras corretas.
2. Tentativa em Obra C (fora da lista): GPS recusa no app; INSERT forçado deve falhar com erro de autorização após migration.
3. Espelho Ponto: cada coluna (entrada, almoço, saída) mostra obra diferente quando aplicável.
4. Ajustar Registros: alterar só a saída com obra B mantém obra A nas batidas não alteradas no pedido enviado.
