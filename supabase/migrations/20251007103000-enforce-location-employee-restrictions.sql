-- Restrição de obra por funcionário: validação no servidor (não confiar só no app).

CREATE OR REPLACE FUNCTION public.employee_may_register_at_location(
  p_user_id uuid,
  p_location_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF p_user_id IS NULL OR p_location_id IS NULL THEN
    RETURN true;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.location_employee_restrictions
    WHERE employee_id = p_user_id
  ) THEN
    RETURN true;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.location_employee_restrictions
    WHERE employee_id = p_user_id AND location_id = p_location_id
  );
END;
$$;

REVOKE ALL ON FUNCTION public.employee_may_register_at_location(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.employee_may_register_at_location(uuid, uuid) TO authenticated, service_role;

-- Funcionário precisa ler as próprias restrições para filtrar o GPS no app.
ALTER TABLE public.location_employee_restrictions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Employees read own location restrictions" ON public.location_employee_restrictions;
CREATE POLICY "Employees read own location restrictions"
ON public.location_employee_restrictions
FOR SELECT
TO authenticated
USING (employee_id = auth.uid() OR public.is_admin());

CREATE OR REPLACE FUNCTION public.stamp_time_record_location_ids()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  k text;
  v jsonb;
  lid uuid;
  lname text;
BEGIN
  IF NEW.locations IS NULL OR jsonb_typeof(NEW.locations) <> 'object' THEN
    RETURN NEW;
  END IF;

  FOREACH k IN ARRAY ARRAY['clock_in', 'lunch_start', 'lunch_end', 'clock_out'] LOOP
    v := NEW.locations -> k;
    IF v IS NULL OR jsonb_typeof(v) <> 'object' THEN
      CONTINUE;
    END IF;

    lname := v->>'locationName';
    IF lname IS NOT NULL AND lower(trim(lname)) = 'remoto' THEN
      CONTINUE;
    END IF;

    IF NOT (v ? 'locationId') THEN
      lid := public.resolve_location_id(
        v->>'locationName',
        NULLIF(v->>'latitude', '')::double precision,
        NULLIF(v->>'longitude', '')::double precision
      );
      IF lid IS NOT NULL THEN
        NEW.locations := jsonb_set(NEW.locations, ARRAY[k, 'locationId'], to_jsonb(lid::text));
      END IF;
    END IF;

    lid := NULLIF(NEW.locations -> k ->> 'locationId', '')::uuid;
    IF lid IS NOT NULL AND NOT public.employee_may_register_at_location(NEW.user_id, lid) THEN
      RAISE EXCEPTION 'Localização não autorizada para este funcionário'
        USING ERRCODE = '42501';
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$;
