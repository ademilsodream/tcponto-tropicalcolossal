## Manual de Uso do Funcionário (PDF)

Vou gerar um PDF não-técnico explicando, em linguagem simples, o que cada menu da área do funcionário faz, com screenshots reais do app ilustrando cada seção.

### Pré-requisito
Para capturar as telas reais, preciso que você **faça login no preview** com uma conta de funcionário de teste antes de eu começar. A tela atual está em `/login`. Assim que estiver logado, eu sigo.

### Conteúdo do manual

1. **Capa** — Nome do app, título "Manual do Funcionário", data.
2. **Bem-vindo / Como acessar** — Login, recuperação de sessão, logout.
3. **Tela inicial e menu lateral** — Visão geral com screenshot do drawer e explicação de cada item.
4. **Bater Ponto** — Como registrar as 4 batidas (entrada, saída almoço, volta almoço, saída), uso do GPS e mensagens comuns.
5. **Resumo Mensal** — Como ler dias trabalhados, horas e saldo do banco de horas.
6. **Relatório Detalhado** — Consulta dia a dia, ajustes pendentes, justificativas.
7. **Documentos** — Onde ver e baixar holerites e documentos enviados pela empresa.
8. **Férias** — Consultar saldo, períodos disponíveis e abrir uma solicitação.
9. **Adiantamento Salarial** — Solicitar adiantamento e acompanhar o status.
10. **Ferramentas** — Lista das ferramentas vinculadas, leitura de QR code e registro da obra de destino.
11. **Perfil** — Dados pessoais, foto, troca de senha.
12. **Avisos / Comunicados** — Sino de notificações e como abrir avisos.
13. **Dicas e dúvidas frequentes** — GPS bloqueado, sessão expirada, ponto fora do horário, etc.

### Como vou produzir

1. Você loga no preview → eu navego com o browser por cada tela e tiro screenshots.
2. Gero o PDF com ReportLab (`/mnt/documents/manual-funcionario.pdf`):
   - Capa com cor da marca
   - 1 seção por menu: título, screenshot, parágrafo curto explicando o que faz, lista de "como usar" em passos numerados
   - Linguagem simples, sem termos técnicos
   - Rodapé com número de página
3. Faço QA visual (converto cada página em imagem e revisar) antes de entregar.
4. Entrego o arquivo via `<presentation-artifact>` para download.

### Observações
- Nenhum código do app será alterado — é apenas geração de documento.
- Se alguma tela exigir dados (ex.: férias sem saldo), o screenshot vai mostrar o estado atual da conta de teste; posso reordenar ou anotar caso fique vazio.
- Se preferir, depois posso gerar também em DOCX para você editar.
