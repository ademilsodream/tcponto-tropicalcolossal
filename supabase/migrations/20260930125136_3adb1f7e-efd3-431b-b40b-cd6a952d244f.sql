CREATE OR REPLACE FUNCTION public.resolve_location_id(p_name text, p_lat double precision, p_lng double precision)
RETURNS uuid LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE v_id uuid;
BEGIN
  IF p_name IS NOT NULL THEN
    SELECT id INTO v_id FROM allowed_locations
    WHERE lower(trim(name)) = lower(trim(p_name)) LIMIT 1;
    IF v_id IS NOT NULL THEN RETURN v_id; END IF;
  END IF;
  IF p_lat IS NOT NULL AND p_lng IS NOT NULL THEN
    SELECT id INTO v_id FROM (
      SELECT id, range_meters,
        6371000 * 2 * asin(sqrt(power(sin(radians(latitude - p_lat)/2),2) +
          cos(radians(p_lat)) * cos(radians(latitude)) * power(sin(radians(longitude - p_lng)/2),2))) AS d
      FROM allowed_locations) s
    WHERE d <= COALESCE(range_meters, 100) + 25
    ORDER BY d LIMIT 1;
  END IF;
  RETURN v_id;
END $$;

CREATE OR REPLACE FUNCTION public.stamp_time_record_location_ids()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE k text; v jsonb; lid uuid;
BEGIN
  IF NEW.locations IS NULL OR jsonb_typeof(NEW.locations) <> 'object' THEN RETURN NEW; END IF;
  FOREACH k IN ARRAY ARRAY['clock_in','lunch_start','lunch_end','clock_out'] LOOP
    v := NEW.locations -> k;
    IF v IS NOT NULL AND jsonb_typeof(v) = 'object' AND NOT (v ? 'locationId') THEN
      lid := public.resolve_location_id(v->>'locationName',
        NULLIF(v->>'latitude','')::double precision, NULLIF(v->>'longitude','')::double precision);
      IF lid IS NOT NULL THEN
        NEW.locations := jsonb_set(NEW.locations, ARRAY[k,'locationId'], to_jsonb(lid::text));
      END IF;
    END IF;
  END LOOP;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS a_stamp_location_ids ON public.time_records;
CREATE TRIGGER a_stamp_location_ids BEFORE INSERT OR UPDATE OF locations ON public.time_records
FOR EACH ROW EXECUTE FUNCTION public.stamp_time_record_location_ids();

-- Skip pay recalculation only for location-name maintenance updates (math unchanged)
CREATE OR REPLACE FUNCTION public.calculate_time_and_pay()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  user_hourly_rate NUMERIC; user_overtime_rate NUMERIC;
  clock_in_minutes INTEGER; clock_out_minutes INTEGER;
  lunch_start_minutes INTEGER; lunch_end_minutes INTEGER;
  lunch_break_minutes INTEGER; total_worked_minutes INTEGER; effective_worked_minutes INTEGER;
  calculated_total_hours NUMERIC; calculated_normal_hours NUMERIC; calculated_overtime_hours NUMERIC;
  calculated_normal_pay NUMERIC; calculated_overtime_pay NUMERIC; calculated_total_pay NUMERIC;
BEGIN
  IF TG_OP = 'UPDATE' AND current_setting('app.location_maintenance', true) = 'on' THEN
    RETURN NEW;
  END IF;

  SELECT hourly_rate, overtime_rate INTO user_hourly_rate, user_overtime_rate
  FROM public.profiles WHERE id = NEW.user_id;
  IF user_hourly_rate IS NULL THEN user_hourly_rate := 50.00; END IF;
  IF user_overtime_rate IS NULL THEN user_overtime_rate := 75.00; END IF;

  IF NEW.clock_in IS NULL OR NEW.clock_out IS NULL THEN
    NEW.total_hours := 0; NEW.normal_hours := 0; NEW.overtime_hours := 0;
    NEW.normal_pay := 0; NEW.overtime_pay := 0; NEW.total_pay := 0;
    RETURN NEW;
  END IF;

  clock_in_minutes := EXTRACT(HOUR FROM NEW.clock_in) * 60 + EXTRACT(MINUTE FROM NEW.clock_in);
  clock_out_minutes := EXTRACT(HOUR FROM NEW.clock_out) * 60 + EXTRACT(MINUTE FROM NEW.clock_out);
  lunch_break_minutes := 0;
  IF NEW.lunch_start IS NOT NULL AND NEW.lunch_end IS NOT NULL THEN
    lunch_start_minutes := EXTRACT(HOUR FROM NEW.lunch_start) * 60 + EXTRACT(MINUTE FROM NEW.lunch_start);
    lunch_end_minutes := EXTRACT(HOUR FROM NEW.lunch_end) * 60 + EXTRACT(MINUTE FROM NEW.lunch_end);
    lunch_break_minutes := lunch_end_minutes - lunch_start_minutes;
  END IF;

  total_worked_minutes := clock_out_minutes - clock_in_minutes - lunch_break_minutes;
  effective_worked_minutes := total_worked_minutes;
  IF total_worked_minutes > 480 AND total_worked_minutes <= 495 THEN effective_worked_minutes := 480; END IF;

  calculated_total_hours := GREATEST(0, effective_worked_minutes::NUMERIC / 60);
  calculated_normal_hours := LEAST(calculated_total_hours, 8);
  calculated_overtime_hours := GREATEST(0, calculated_total_hours - 8);
  calculated_normal_pay := calculated_normal_hours * user_hourly_rate;
  calculated_overtime_pay := calculated_overtime_hours * user_overtime_rate;
  calculated_total_pay := calculated_normal_pay + calculated_overtime_pay;

  NEW.total_hours := calculated_total_hours; NEW.normal_hours := calculated_normal_hours;
  NEW.overtime_hours := calculated_overtime_hours; NEW.normal_pay := calculated_normal_pay;
  NEW.overtime_pay := calculated_overtime_pay; NEW.total_pay := calculated_total_pay;

  IF NEW.clock_in IS NOT NULL AND NEW.clock_out IS NOT NULL THEN
    PERFORM process_hour_bank(NEW.user_id, NEW.id, calculated_total_hours, NEW.date);
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.propagate_location_rename()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE k text;
BEGIN
  IF NEW.name IS NOT DISTINCT FROM OLD.name THEN RETURN NEW; END IF;
  PERFORM set_config('app.location_maintenance', 'on', true);
  FOREACH k IN ARRAY ARRAY['clock_in','lunch_start','lunch_end','clock_out'] LOOP
    UPDATE public.time_records
      SET locations = jsonb_set(locations, ARRAY[k,'locationName'], to_jsonb(NEW.name))
    WHERE locations -> k ->> 'locationId' = NEW.id::text;
  END LOOP;
  PERFORM set_config('app.location_maintenance', 'off', true);
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS propagate_location_rename_trigger ON public.allowed_locations;
CREATE TRIGGER propagate_location_rename_trigger AFTER UPDATE OF name ON public.allowed_locations
FOR EACH ROW EXECUTE FUNCTION public.propagate_location_rename();

REVOKE EXECUTE ON FUNCTION public.resolve_location_id(text,double precision,double precision) FROM anon;