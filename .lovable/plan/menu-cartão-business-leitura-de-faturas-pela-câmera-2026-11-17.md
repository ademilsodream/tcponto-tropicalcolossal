# Menu "Cartão Business" — leitura de faturas pela câmera

## O que o funcionário vai ver
Novo item **Cartão Business** no menu lateral, com:
1. **Resumo do cartão**: número/referência do cartão ligado ao funcionário, crédito total carregado, total gasto e **saldo disponível** (crédito − faturas).
2. **Botão "Digitalizar fatura"**: abre a câmera do telemóvel (ou escolhe foto da galeria). A foto é analisada por IA, que devolve:
   - Fornecedor (comparado com os fornecedores cadastrados, pelo NIF e depois pelo nome)
   - Número da fatura
   - Data
   - Valor total
3. **Ecrã de confirmação**: os dados aparecem preenchidos e podem ser corrigidos antes de gravar (fornecedor escolhido numa lista do banco; aviso se não houver correspondência). Mostra o saldo antes e depois; avisa se o valor ultrapassar o saldo.
4. **Lista de faturas**: todas as faturas do cartão (fornecedor, nº, data, valor, miniatura da foto), mais recente primeiro.

Se o funcionário não tiver cartão ativo, aparece uma mensagem a explicar.

## Como fica guardado
- Usa as tabelas já existentes **business_cards** (cartão do funcionário) e **business_card_credits** (carregamentos de crédito).
- Nova tabela **business_card_faturas**, separada das despesas: cartão, funcionário, fornecedor (ligado a fornecedores), NIF lido, nome do fornecedor lido, nº da fatura, data, valor, foto, estado.
- Fotos das faturas guardadas no **Google Drive** da empresa (o mesmo usado pelos outros sistemas), numa pasta própria (ex.: `Cartão Business/<ano>/<mês>/`), com nome `fornecedor_nºfatura_data`. A fatura no app guarda o link para abrir o ficheiro no Drive.
- Saldo = soma dos créditos − soma das faturas do cartão.
- Regras de acesso: funcionário vê e cria só faturas do seu cartão; administradores veem todas.
- Proteção contra fatura duplicada (mesmo fornecedor + mesmo número).

## Pensado para telemóvel
- Câmera traseira aberta direto pelo campo de foto (funciona no navegador e depois no app nativo).
- Foto reduzida antes do envio para ser rápido em rede móvel.
- Layout em coluna, botões grandes.

## Detalhes técnicos
- Migração: `business_card_faturas` (card_id, employee_id, fornecedor_id null, fornecedor_nome_lido, fornecedor_nif_lido, numero_fatura, data_fatura, valor numeric, imagem_path, created_at, updated_at) + GRANTs + RLS (is_admin() ou dono do cartão) + unique(fornecedor_id, numero_fatura) + trigger updated_at. Verificar/ajustar RLS de business_cards e business_card_credits para leitura pelo próprio funcionário.
- Google Drive via conector do Lovable (conta da empresa, ligado ao projeto). Edge Function `upload-fatura-drive` envia o ficheiro (upload multipart) para a pasta definida e grava `drive_file_id` e `drive_link` na fatura. Coluna `imagem_path` substituída por `drive_file_id` + `drive_link`. Pasta raiz: `1z3QyUvhf6rsMjDHwmQf8KRAbx_2BdHMq` (subpastas ano/mês criadas automaticamente).
- Edge Function `scan-fatura`: recebe imagem (base64), chama Lovable AI Gateway (Responses, modelo padrão com entrada de imagem, saída em JSON schema estrito), cruza NIF/nome com `fornecedores` e devolve os campos. Requer ativar Lovable AI (chave LOVABLE_API_KEY) neste Supabase externo.
- Frontend: `src/components/BusinessCard.tsx`, rota `/business-card` sob demanda, item no `EmployeeDrawer.tsx` (ícone CreditCard). `<input type="file" accept="image/*" capture="environment">` + compressão via canvas.
- Nada alterado em despesas, ponto ou cálculos existentes.
