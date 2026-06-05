-- RLS para patrimonios_ferramentas e patrimonios_ferramentas_movimentos
-- Assumes tables already exist in remote Supabase

ALTER TABLE public.patrimonios_ferramentas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patrimonios_ferramentas_movimentos ENABLE ROW LEVEL SECURITY;

-- Funcionário vê ferramentas vinculadas a ele
CREATE POLICY "Funcionario ve proprias ferramentas"
ON public.patrimonios_ferramentas
FOR SELECT
USING (funcionario_atual_id = auth.uid()::text);

-- Funcionário autenticado pode buscar qualquer ferramenta (necessário para QR)
CREATE POLICY "Funcionario autenticado busca ferramenta por patrimonio"
ON public.patrimonios_ferramentas
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Funcionário pode atualizar ferramenta ao registrar retirada/transferência
CREATE POLICY "Funcionario atualiza ferramenta na movimentacao"
ON public.patrimonios_ferramentas
FOR UPDATE
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Funcionário vê movimentos em que participou
CREATE POLICY "Funcionario ve proprios movimentos"
ON public.patrimonios_ferramentas_movimentos
FOR SELECT
USING (funcionario_id = auth.uid()::text);

-- Funcionário pode registrar movimento para si
CREATE POLICY "Funcionario insere movimento proprio"
ON public.patrimonios_ferramentas_movimentos
FOR INSERT
WITH CHECK (
  funcionario_id = auth.uid()::text
  AND (created_by IS NULL OR created_by = auth.uid())
);

-- Funcionários autenticados podem listar obras (para seleção no app)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'obras'
      AND policyname = 'Funcionario autenticado le obras'
  ) THEN
    CREATE POLICY "Funcionario autenticado le obras"
    ON public.obras
    FOR SELECT
    USING (auth.uid() IS NOT NULL);
  END IF;
END $$;
