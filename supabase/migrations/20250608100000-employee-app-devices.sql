-- Rastreamento de dispositivos/app por funcionário
CREATE TABLE IF NOT EXISTS public.employee_app_devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  device_key text NOT NULL,
  platform text NOT NULL,
  app_version text NOT NULL,
  app_build text,
  device_model text,
  os_version text,
  first_seen_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (employee_id, device_key)
);

CREATE INDEX IF NOT EXISTS employee_app_devices_employee_id_idx ON public.employee_app_devices(employee_id);
CREATE INDEX IF NOT EXISTS employee_app_devices_app_version_idx ON public.employee_app_devices(app_version);

ALTER TABLE public.employee_app_devices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Employees can view their own app devices" ON public.employee_app_devices;
CREATE POLICY "Employees can view their own app devices"
ON public.employee_app_devices
FOR SELECT
TO authenticated
USING (auth.uid() = employee_id);

DROP POLICY IF EXISTS "Employees can insert their own app devices" ON public.employee_app_devices;
CREATE POLICY "Employees can insert their own app devices"
ON public.employee_app_devices
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = employee_id);

DROP POLICY IF EXISTS "Employees can update their own app devices" ON public.employee_app_devices;
CREATE POLICY "Employees can update their own app devices"
ON public.employee_app_devices
FOR UPDATE
TO authenticated
USING (auth.uid() = employee_id)
WITH CHECK (auth.uid() = employee_id);

DROP POLICY IF EXISTS "Admins can view all app devices" ON public.employee_app_devices;
CREATE POLICY "Admins can view all app devices"
ON public.employee_app_devices
FOR SELECT
TO authenticated
USING (public.get_current_user_role() IN ('admin', 'super_admin'));
