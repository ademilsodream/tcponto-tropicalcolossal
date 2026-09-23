# Segurança: corrigir apenas o que pertence ao TCPonto

Verifiquei no código quais dados e ficheiros esta aplicação realmente usa. Só esses vão ser alterados. As tabelas de gestão de obras, orçamentos, despesas, frota, faturas, catálogos, stock e do site público ficam intocadas — essas resolve nos outros sistemas.

## O que esta aplicação usa

Registos de ponto, perfis, pedidos de edição, ausências e férias, banco de horas, adiantamentos, avisos, dispositivos, sessões, locais permitidos, obras (só leitura), turnos e horários, feriados/períodos bloqueados, ferramentas, definições do sistema, documentos do funcionário e fotos de perfil.

## Correções

1. **Rotinas internas da base de dados (18 avisos)**
   Fixar o caminho de pesquisa em todas as rotinas com privilégios elevados. É uma alteração puramente técnica: nenhum cálculo, tolerância, turno ou regra muda.

2. **Dados que hoje qualquer visitante sem sessão consegue ler**
   Passar a exigir sessão (deixa de ser acessível a quem não tem conta) em: períodos bloqueados, definições do sistema, políticas de férias, turnos e horários de turno.

3. **Obras**
   A leitura deixa de bastar "estar com sessão": passa a exigir uma conta de funcionário ativa. Escrita continua como está, para não afetar o sistema de obras.

4. **Ferramentas e movimentos de ferramentas**
   Leitura para contas ativas. Criar, alterar e apagar passa a ser de administradores ou do próprio funcionário associado ao movimento.

5. **Documentos do funcionário (ficheiros)**
   Remover a regra que permite a qualquer pessoa, mesmo sem sessão, listar e abrir todos os documentos. Continua a valer: cada funcionário vê os seus, administradores veem todos.

6. **Fotos de perfil (avatares)**
   A leitura pública mantém-se (as fotos têm de aparecer na aplicação); só se confirma que alterar e apagar continua restrito ao dono da foto.

7. **Passwords já expostas em fugas de dados**
   É uma opção do painel de autenticação da Supabase, disponível no plano Pro. Não se resolve por código — indico onde ativar.

## Fora do âmbito (não mexo)

Clientes, fornecedores, despesas e anexos, faturas e pagamentos, orçamentos e catálogos, insumos, stock, RDO, veículos, folha salarial, radius, estabelecimentos, departamentos, funções, categorias, transações do site e os ficheiros de faturas, imagens do site e fotos de ferramentas. Esses avisos ficam abertos no separador de Segurança para tratar nos sistemas respetivos.

## Notas técnicas

- Uma migração única: `ALTER FUNCTION ... SET search_path = public` nas 17 rotinas `SECURITY DEFINER` sem caminho fixo; `DROP POLICY`/`CREATE POLICY` com `TO authenticated` e predicados reais nas tabelas listadas; remoção da política `Listar arquivos permitidos do bucket employee-documents` em `storage.objects`.
- Predicado de conta ativa: `EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.status = 'active')`; administradores via `public.is_admin()`.
- Nenhuma alteração em código da aplicação, cálculos, tolerâncias, raio de obra, cooldown ou fluxo de aprovação.
- Depois da migração, marco como corrigidos apenas os avisos acima e deixo os restantes ativos.
