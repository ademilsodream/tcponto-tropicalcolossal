CREATE TABLE public.pedidos_materiais (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  obra_id uuid NOT NULL REFERENCES public.obras(id),
  solicitante_id uuid NOT NULL DEFAULT auth.uid(),
  data_uso date NOT NULL,
  lista_materiais text NOT NULL CHECK (char_length(lista_materiais) BETWEEN 1 AND 5000),
  observacoes text CHECK (observacoes IS NULL OR char_length(observacoes) <= 1000),
  status text NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente','aceito','recusado','entregue','cancelado')),
  motivo_recusa text,
  aceito_por uuid, aceito_em timestamptz,
  entregue_por uuid, entregue_em timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.pedidos_materiais TO authenticated;
GRANT ALL ON public.pedidos_materiais TO service_role;
ALTER TABLE public.pedidos_materiais ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Funcionario cria pedido" ON public.pedidos_materiais FOR INSERT TO authenticated
  WITH CHECK (solicitante_id = auth.uid() AND status = 'pendente' AND public.is_active_employee());
CREATE POLICY "Funcionario ve pedidos" ON public.pedidos_materiais FOR SELECT TO authenticated
  USING (solicitante_id = auth.uid() OR public.is_admin());
CREATE POLICY "Funcionario cancela pendente" ON public.pedidos_materiais FOR UPDATE TO authenticated
  USING (solicitante_id = auth.uid() AND status = 'pendente')
  WITH CHECK (solicitante_id = auth.uid() AND status = 'cancelado');
CREATE POLICY "Admins gerem pedidos" ON public.pedidos_materiais FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE INDEX ON public.pedidos_materiais (solicitante_id, created_at DESC);
CREATE TRIGGER pedidos_materiais_updated_at BEFORE UPDATE ON public.pedidos_materiais
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
ALTER PUBLICATION supabase_realtime ADD TABLE public.pedidos_materiais;