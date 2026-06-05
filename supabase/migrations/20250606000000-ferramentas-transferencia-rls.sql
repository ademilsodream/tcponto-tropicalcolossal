-- RLS para transferência de ferramentas entre funcionários

-- Listar funcionários ativos para seleção de destino
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'profiles'
      AND policyname = 'Funcionario lista colegas ativos'
  ) THEN
    CREATE POLICY "Funcionario lista colegas ativos"
    ON public.profiles
    FOR SELECT
    USING (
      auth.uid() IS NOT NULL
      AND role = 'user'
      AND (status IS NULL OR status = 'active')
    );
  END IF;
END $$;

-- Permitir INSERT quando o usuário é quem registra a movimentação
DROP POLICY IF EXISTS "Funcionario insere movimento proprio" ON public.patrimonios_ferramentas_movimentos;

CREATE POLICY "Funcionario registra movimentacao"
ON public.patrimonios_ferramentas_movimentos
FOR INSERT
WITH CHECK (created_by = auth.uid());

-- Quem transferiu, recebeu ou era titular anterior pode ver o movimento
DROP POLICY IF EXISTS "Funcionario ve proprios movimentos" ON public.patrimonios_ferramentas_movimentos;

CREATE POLICY "Funcionario ve movimentos relacionados"
ON public.patrimonios_ferramentas_movimentos
FOR SELECT
USING (
  funcionario_id = auth.uid()::text
  OR funcionario_anterior_id = auth.uid()::text
  OR created_by = auth.uid()
);
