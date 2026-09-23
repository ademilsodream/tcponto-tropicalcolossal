-- 1) Pin search_path on SECURITY DEFINER routines
ALTER FUNCTION public.apply_balance_to_payment(uuid, numeric) SET search_path = public, pg_temp;
ALTER FUNCTION public.audit_trigger_function() SET search_path = public, pg_temp;
ALTER FUNCTION public.calculate_monthly_pending_items(integer, integer) SET search_path = public, pg_temp;
ALTER FUNCTION public.calculate_period_pending_items(date, date) SET search_path = public, pg_temp;
ALTER FUNCTION public.can_modify_employee_status() SET search_path = public, pg_temp;
ALTER FUNCTION public.check_email_availability(text) SET search_path = public, pg_temp, auth;
ALTER FUNCTION public.cleanup_orphan_users() SET search_path = public, pg_temp, auth;
ALTER FUNCTION public.create_or_update_employee_balance(uuid, date, date, numeric, numeric, text) SET search_path = public, pg_temp;
ALTER FUNCTION public.get_audit_logs(text, uuid, timestamp without time zone, timestamp without time zone, integer) SET search_path = public, pg_temp;
ALTER FUNCTION public.get_audit_statistics() SET search_path = public, pg_temp;
ALTER FUNCTION public.get_employee_accumulated_balance(uuid) SET search_path = public, pg_temp;
ALTER FUNCTION public.get_employee_balances_with_names() SET search_path = public, pg_temp;
ALTER FUNCTION public.handle_new_user() SET search_path = public, pg_temp;
ALTER FUNCTION public.process_automatic_transfers(integer, integer, integer, integer) SET search_path = public, pg_temp;
ALTER FUNCTION public.process_automatic_transfers_on_payment() SET search_path = public, pg_temp;
ALTER FUNCTION public.process_vacation_request(uuid, text, uuid, text) SET search_path = public, pg_temp;
ALTER FUNCTION public.send_scheduled_push_notifications(text, time without time zone) SET search_path = public, pg_temp;

-- 2) Helper: active employee account
CREATE OR REPLACE FUNCTION public.is_active_employee()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND (p.status IS NULL OR p.status = 'active')
  );
$$;
GRANT EXECUTE ON FUNCTION public.is_active_employee() TO authenticated;

-- 3) Reference data readable only by active, signed-in employees
DROP POLICY IF EXISTS "Users view blocked periods" ON public.blocked_periods;
CREATE POLICY "Active employees view blocked periods"
  ON public.blocked_periods FOR SELECT TO authenticated
  USING (public.is_active_employee());

DROP POLICY IF EXISTS "system_settings_read" ON public.system_settings;
CREATE POLICY "Active employees read system settings"
  ON public.system_settings FOR SELECT TO authenticated
  USING (public.is_active_employee());

DROP POLICY IF EXISTS "Todos podem consultar políticas de férias" ON public.vacation_policies;
CREATE POLICY "Active employees read vacation policies"
  ON public.vacation_policies FOR SELECT TO authenticated
  USING (public.is_active_employee());

DROP POLICY IF EXISTS "Users view shift schedules" ON public.work_shift_schedules;
DROP POLICY IF EXISTS "Everyone can view work shift schedules" ON public.work_shift_schedules;
CREATE POLICY "Active employees view shift schedules"
  ON public.work_shift_schedules FOR SELECT TO authenticated
  USING (public.is_active_employee());

DROP POLICY IF EXISTS "Users view work shifts" ON public.work_shifts;
DROP POLICY IF EXISTS "Everyone can view work shifts" ON public.work_shifts;
CREATE POLICY "Active employees view work shifts"
  ON public.work_shifts FOR SELECT TO authenticated
  USING (public.is_active_employee());

-- 4) Obras: reading requires an active employee account
DROP POLICY IF EXISTS "Funcionario autenticado le obras" ON public.obras;
CREATE POLICY "Active employees read obras"
  ON public.obras FOR SELECT TO authenticated
  USING (public.is_active_employee());

-- 5) Tools: read for active employees, writes for admins / own movements
DROP POLICY IF EXISTS "Authenticated read ferramentas" ON public.patrimonios_ferramentas;
DROP POLICY IF EXISTS "Authenticated insert ferramentas" ON public.patrimonios_ferramentas;
DROP POLICY IF EXISTS "Authenticated update ferramentas" ON public.patrimonios_ferramentas;
DROP POLICY IF EXISTS "Authenticated delete ferramentas" ON public.patrimonios_ferramentas;
CREATE POLICY "Active employees read ferramentas"
  ON public.patrimonios_ferramentas FOR SELECT TO authenticated
  USING (public.is_active_employee());
CREATE POLICY "Admins manage ferramentas"
  ON public.patrimonios_ferramentas FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Authenticated read mov" ON public.patrimonios_ferramentas_movimentos;
DROP POLICY IF EXISTS "Authenticated insert mov" ON public.patrimonios_ferramentas_movimentos;
DROP POLICY IF EXISTS "Authenticated update mov" ON public.patrimonios_ferramentas_movimentos;
DROP POLICY IF EXISTS "Authenticated delete mov" ON public.patrimonios_ferramentas_movimentos;
CREATE POLICY "Active employees read mov"
  ON public.patrimonios_ferramentas_movimentos FOR SELECT TO authenticated
  USING (public.is_active_employee());
CREATE POLICY "Admins manage mov"
  ON public.patrimonios_ferramentas_movimentos FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 6) Employee documents: remove blanket listing/reading of the whole bucket
DROP POLICY IF EXISTS "Listar arquivos permitidos do bucket employee-documents" ON storage.objects;