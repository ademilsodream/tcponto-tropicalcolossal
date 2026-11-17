CREATE TABLE public.business_card_faturas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id uuid NOT NULL REFERENCES public.business_cards(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL,
  fornecedor_id uuid REFERENCES public.fornecedores(id) ON DELETE SET NULL,
  fornecedor_nome_lido text,
  fornecedor_nif_lido text,
  numero_fatura text NOT NULL,
  data_fatura date NOT NULL,
  valor numeric(12,2) NOT NULL,
  drive_file_id text,
  drive_link text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX business_card_faturas_unique ON public.business_card_faturas(fornecedor_id, lower(numero_fatura)) WHERE fornecedor_id IS NOT NULL;
CREATE INDEX business_card_faturas_card ON public.business_card_faturas(card_id, data_fatura DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.business_card_faturas TO authenticated;
GRANT ALL ON public.business_card_faturas TO service_role;
ALTER TABLE public.business_card_faturas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage card invoices" ON public.business_card_faturas FOR ALL TO authenticated USING (public.is_admin_any()) WITH CHECK (public.is_admin_any());
CREATE POLICY "Owner reads card invoices" ON public.business_card_faturas FOR SELECT TO authenticated
  USING (employee_id = auth.uid() AND EXISTS (SELECT 1 FROM public.business_cards c WHERE c.id = card_id AND c.employee_id = auth.uid()));
CREATE POLICY "Owner inserts card invoices" ON public.business_card_faturas FOR INSERT TO authenticated
  WITH CHECK (employee_id = auth.uid() AND public.is_active_employee() AND EXISTS (SELECT 1 FROM public.business_cards c WHERE c.id = card_id AND c.employee_id = auth.uid() AND c.is_active));
CREATE TRIGGER business_card_faturas_updated_at BEFORE UPDATE ON public.business_card_faturas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE POLICY "Owner reads own business card" ON public.business_cards FOR SELECT TO authenticated USING (employee_id = auth.uid());
CREATE POLICY "Owner reads own card credits" ON public.business_card_credits FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.business_cards c WHERE c.id = card_id AND c.employee_id = auth.uid()));
GRANT SELECT ON public.business_cards, public.business_card_credits TO authenticated;