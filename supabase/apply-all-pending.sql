-- ===== 20250605000000-patrimonios-ferramentas-rls.sql =====
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

-- ===== 20250606000000-ferramentas-transferencia-rls.sql =====
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

-- ===== 20250608100000-employee-app-devices.sql =====
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

-- ===== 20250614171026-43e3d36c-2e95-4087-990e-4f6b46e1c332.sql =====

-- Remover políticas existentes para evitar conflitos
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow read access to all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow admins to modify profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow profile creation during signup" ON public.profiles;

-- Habilitar RLS e criar políticas para time_records
ALTER TABLE public.time_records ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes de time_records se houver
DROP POLICY IF EXISTS "Employees can view their own time records" ON public.time_records;
DROP POLICY IF EXISTS "Employees can create their own time records" ON public.time_records;
DROP POLICY IF EXISTS "Employees can update their own time records" ON public.time_records;
DROP POLICY IF EXISTS "Admins can view all time records" ON public.time_records;

-- Políticas para time_records
CREATE POLICY "Employees can view their own time records" 
ON public.time_records 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Employees can create their own time records" 
ON public.time_records 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Employees can update their own time records" 
ON public.time_records 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all time records" 
ON public.time_records 
FOR ALL 
TO authenticated 
USING (public.get_current_user_role() = 'admin');

-- Políticas para profiles (usando a função security definer existente)
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = id);

CREATE POLICY "Admins can manage all profiles" 
ON public.profiles 
FOR ALL 
TO authenticated 
USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Allow profile creation during signup" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Habilitar RLS para allowed_locations
ALTER TABLE public.allowed_locations ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes de allowed_locations se houver
DROP POLICY IF EXISTS "Authenticated users can view active locations" ON public.allowed_locations;
DROP POLICY IF EXISTS "Admins can manage locations" ON public.allowed_locations;

CREATE POLICY "Authenticated users can view active locations" 
ON public.allowed_locations 
FOR SELECT 
TO authenticated 
USING (is_active = true);

CREATE POLICY "Admins can manage locations" 
ON public.allowed_locations 
FOR ALL 
TO authenticated 
USING (public.get_current_user_role() = 'admin');

-- Habilitar RLS para edit_requests
ALTER TABLE public.edit_requests ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes de edit_requests se houver
DROP POLICY IF EXISTS "Employees can view their own edit requests" ON public.edit_requests;
DROP POLICY IF EXISTS "Employees can create their own edit requests" ON public.edit_requests;
DROP POLICY IF EXISTS "Admins can view all edit requests" ON public.edit_requests;

CREATE POLICY "Employees can view their own edit requests" 
ON public.edit_requests 
FOR SELECT 
TO authenticated 
USING (auth.uid() = employee_id);

CREATE POLICY "Employees can create their own edit requests" 
ON public.edit_requests 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = employee_id);

CREATE POLICY "Admins can view all edit requests" 
ON public.edit_requests 
FOR ALL 
TO authenticated 
USING (public.get_current_user_role() = 'admin');

-- Habilitar realtime para time_records (para sincronização em tempo real)
ALTER TABLE public.time_records REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.time_records;

-- Habilitar realtime para profiles
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;

-- ===== 20250615182015-6b4358f7-1fb1-45bd-bb19-2cbfa28eff77.sql =====

-- Habilita Row-Level Security nas tabelas de férias
ALTER TABLE vacation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE vacation_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE vacation_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE vacation_request_history ENABLE ROW LEVEL SECURITY;

-- Permite que:
-- Funcionário veja e crie apenas suas próprias solicitações; Admin vê todas

-- SELECT para vacation_requests: Funcionário vê as suas, admin todas
CREATE POLICY "Funcionário vê próprias solicitações ou Admin vê todas" 
ON vacation_requests
FOR SELECT
USING (
  employee_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  )
);

-- INSERT: Funcionário cria apenas para si mesmo
CREATE POLICY "Funcionário pode criar solicitação apenas para si" 
ON vacation_requests
FOR INSERT
WITH CHECK (employee_id = auth.uid());

-- UPDATE: Apenas admin pode aprovar/rejeitar
CREATE POLICY "Somente Admin pode atualizar solicitações" 
ON vacation_requests
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  )
);

-- DELETE: Apenas admin pode deletar (opcional)
CREATE POLICY "Somente Admin pode deletar solicitações" 
ON vacation_requests
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  )
);

-- vacation_balances: Cada funcionário vê seu próprio saldo e admin vê todos
CREATE POLICY "Funcionário vê saldo próprio ou Admin vê todos" 
ON vacation_balances
FOR SELECT
USING (
  employee_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  )
);

-- vacation_policies: Todos podem consultar (política global)
CREATE POLICY "Todos podem consultar políticas de férias" 
ON vacation_policies
FOR SELECT
USING (true);

-- vacation_request_history: Funcionário vê histórico próprio, admin todos
CREATE POLICY "Funcionário vê histórico próprio ou Admin vê todos" 
ON vacation_request_history
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM vacation_requests vr
    WHERE vr.id = vacation_request_id
      AND (vr.employee_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
        )
      )
  )
);


-- ===== 20250615192626-d767cc47-7363-4d9b-a989-2303a9ca5dbb.sql =====

-- 1. Insere política global padrão (caso nenhuma exista)
INSERT INTO vacation_policies (min_period_days, allow_retroactive, max_split, max_days_per_year)
SELECT 5, false, 3, 30
WHERE NOT EXISTS (SELECT 1 FROM vacation_policies);

-- 2. Cria saldos iniciais de férias para todos os funcionários ativos que ainda não têm registro em vacation_balances para o ano atual
INSERT INTO vacation_balances (employee_id, year, total_days, used_days, available_days)
SELECT p.id, EXTRACT(YEAR FROM CURRENT_DATE)::int, 30, 0, 30
FROM profiles p
WHERE p.status = 'active'
  AND NOT EXISTS (
    SELECT 1 FROM vacation_balances vb
    WHERE vb.employee_id = p.id AND vb.year = EXTRACT(YEAR FROM CURRENT_DATE)::int
  );

-- Pronto! Agora todos os funcionários ativos terão saldo inicial de férias para este ano.

-- ===== 20250626185943-d107165f-5671-4fcb-836a-49d8f3165d4a.sql =====

-- Remover a política RLS atual que está incorreta
DROP POLICY IF EXISTS "Users can view announcements sent to them" ON announcements;

-- Criar a política RLS correta
CREATE POLICY "Users can view announcements sent to them" 
ON announcements 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM announcement_recipients ar 
    WHERE ar.announcement_id = announcements.id 
    AND ar.employee_id = auth.uid()
  )
);

-- ===== 20250630090002-f1f793af-9494-4ce0-8eb5-23a41f618d8f.sql =====

-- Criar tabela para solicitações de vale salarial
CREATE TABLE public.salary_advance_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES auth.users NOT NULL,
  requested_amount NUMERIC(10,2) NOT NULL CHECK (requested_amount > 0),
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  approved_amount NUMERIC(10,2),
  admin_notes TEXT,
  payment_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para histórico de solicitações
CREATE TABLE public.salary_advance_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  salary_advance_id UUID REFERENCES public.salary_advance_requests(id) NOT NULL,
  action TEXT NOT NULL,
  action_by UUID REFERENCES auth.users,
  action_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  previous_amount NUMERIC(10,2),
  new_amount NUMERIC(10,2),
  notes TEXT
);

-- Habilitar Row Level Security
ALTER TABLE public.salary_advance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salary_advance_history ENABLE ROW LEVEL SECURITY;

-- Política para salary_advance_requests: funcionário vê apenas suas próprias solicitações
CREATE POLICY "Funcionário vê próprias solicitações de vale" 
ON public.salary_advance_requests
FOR SELECT
USING (employee_id = auth.uid());

-- Política para inserir: funcionário pode criar apenas para si mesmo
CREATE POLICY "Funcionário pode criar solicitação para si" 
ON public.salary_advance_requests
FOR INSERT
WITH CHECK (employee_id = auth.uid());

-- Política para histórico: funcionário vê apenas histórico de suas solicitações
CREATE POLICY "Funcionário vê histórico próprio" 
ON public.salary_advance_history
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.salary_advance_requests sar
    WHERE sar.id = salary_advance_history.salary_advance_id 
    AND sar.employee_id = auth.uid()
  )
);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_salary_advance_requests_updated_at 
  BEFORE UPDATE ON public.salary_advance_requests 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Inserir algumas configurações do sistema para limites
INSERT INTO public.system_settings (setting_key, setting_value, description) VALUES
('salary_advance_min_amount', '100.00', 'Valor mínimo para solicitação de vale salarial em R$'),
('salary_advance_max_amount', '2000.00', 'Valor máximo para solicitação de vale salarial em R$')
ON CONFLICT (setting_key) DO NOTHING;

-- ===== 20250702082806-5968f7ae-69dd-439b-8249-cada6ac11a50.sql =====

-- Ajustar política de férias para 22 dias (legislação portuguesa)
UPDATE vacation_policies 
SET max_days_per_year = 22 
WHERE max_days_per_year = 30;

-- Ajustar saldos existentes de férias proporcionalmente
UPDATE vacation_balances 
SET total_days = 22,
    available_days = GREATEST(0, 22 - used_days)
WHERE total_days = 30;

-- Ajustar valores padrão para novos funcionários (na migração que cria saldos iniciais)
-- Atualizar a próxima inserção para usar 22 dias em vez de 30
UPDATE vacation_balances 
SET total_days = 22,
    available_days = 22
WHERE total_days = 30 AND used_days = 0;

-- ===== 20250725074922-4ef5b52e-5306-4674-beea-d2a15e3d0a6e.sql =====

-- Inserir configurações de sessão no sistema
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
  ('session_duration_days', '30', 'Duração da sessão em dias (padrão: 30 dias)'),
  ('auto_refresh_enabled', 'true', 'Habilita renovação automática de tokens'),
  ('remember_me_enabled', 'true', 'Habilita opção "Lembrar-me" no login'),
  ('session_warning_minutes', '60', 'Minutos antes da expiração para mostrar aviso'),
  ('permanent_session_enabled', 'true', 'Permite sessões permanentes para usuários')
ON CONFLICT (setting_key) DO UPDATE SET 
  setting_value = EXCLUDED.setting_value,
  description = EXCLUDED.description,
  updated_at = now();

-- Criar tabela para gerenciar sessões permanentes
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  device_info JSONB,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_permanent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS na tabela de sessões
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Política para usuários verem apenas suas próprias sessões
CREATE POLICY "Users can view their own sessions" ON user_sessions
  FOR SELECT USING (auth.uid() = user_id);

-- Política para usuários criarem suas próprias sessões
CREATE POLICY "Users can create their own sessions" ON user_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para usuários atualizarem suas próprias sessões
CREATE POLICY "Users can update their own sessions" ON user_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Política para usuários deletarem suas próprias sessões
CREATE POLICY "Users can delete their own sessions" ON user_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_last_activity ON user_sessions(last_activity);

-- Função para limpar sessões expiradas
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void
LANGUAGE sql
AS $$
  DELETE FROM public.user_sessions 
  WHERE is_permanent = false 
  AND expires_at < now();
$$;

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger à tabela de sessões
DROP TRIGGER IF EXISTS set_updated_at ON user_sessions;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON user_sessions
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- ===== 20250731000000-blocked-periods.sql =====
-- Criar tabela para períodos bloqueados
CREATE TABLE public.blocked_periods (
  id uuid not null default gen_random_uuid(),
  name text not null,
  description text null,
  start_date date not null,
  end_date date not null,
  created_by uuid null,
  created_at timestamp with time zone null default now(),
  constraint blocked_periods_pkey primary key (id)
) TABLESPACE pg_default;

-- Habilitar Row Level Security
ALTER TABLE public.blocked_periods ENABLE ROW LEVEL SECURITY;

-- Política para visualização: todos os usuários autenticados podem ver períodos bloqueados
CREATE POLICY "Authenticated users can view blocked periods" 
ON public.blocked_periods
FOR SELECT
TO authenticated
USING (true);

-- Política para inserção: apenas admins podem criar períodos bloqueados
CREATE POLICY "Admins can create blocked periods" 
ON public.blocked_periods
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Política para atualização: apenas admins podem atualizar períodos bloqueados
CREATE POLICY "Admins can update blocked periods" 
ON public.blocked_periods
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Política para exclusão: apenas admins podem deletar períodos bloqueados
CREATE POLICY "Admins can delete blocked periods" 
ON public.blocked_periods
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Índice para melhorar performance de consultas por data
CREATE INDEX idx_blocked_periods_dates 
ON public.blocked_periods (start_date, end_date);

-- Índice para consultas por criador
CREATE INDEX idx_blocked_periods_created_by 
ON public.blocked_periods (created_by);

-- Comentários na tabela
COMMENT ON TABLE public.blocked_periods IS 'Períodos bloqueados para edição de registros de ponto';
COMMENT ON COLUMN public.blocked_periods.name IS 'Nome do período bloqueado';
COMMENT ON COLUMN public.blocked_periods.description IS 'Descrição opcional do período';
COMMENT ON COLUMN public.blocked_periods.start_date IS 'Data de início do período bloqueado';
COMMENT ON COLUMN public.blocked_periods.end_date IS 'Data de fim do período bloqueado';
COMMENT ON COLUMN public.blocked_periods.created_by IS 'ID do usuário que criou o período bloqueado';
COMMENT ON COLUMN public.blocked_periods.created_at IS 'Data e hora de criação do registro';

-- Habilitar realtime para blocked_periods
ALTER TABLE public.blocked_periods REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.blocked_periods; 
-- ===== 20250813000000-employee-documents-rls.sql =====
-- Enable RLS on employee_documents table
ALTER TABLE public.employee_documents ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own documents
CREATE POLICY "Users can view their own documents" ON public.employee_documents
    FOR SELECT USING (auth.uid() = employee_id);

-- Policy for users to insert their own documents
CREATE POLICY "Users can insert their own documents" ON public.employee_documents
    FOR INSERT WITH CHECK (auth.uid() = employee_id);

-- Policy for users to update their own documents (for marking as read)
CREATE POLICY "Users can update their own documents" ON public.employee_documents
    FOR UPDATE USING (auth.uid() = employee_id);

-- Policy for users to delete their own documents (optional)
CREATE POLICY "Users can delete their own documents" ON public.employee_documents
    FOR DELETE USING (auth.uid() = employee_id);

-- Policy for admins to view all documents (if needed)
-- Uncomment if you want admins to see all documents
-- CREATE POLICY "Admins can view all documents" ON public.employee_documents
--     FOR SELECT USING (
--         EXISTS (
--             SELECT 1 FROM public.profiles 
--             WHERE id = auth.uid() AND role = 'admin'
--         )
--     );

-- Create bucket policy for employee-documents storage
-- This allows users to upload files to their own folder
INSERT INTO storage.buckets (id, name, public) 
VALUES ('employee-documents', 'employee-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Policy for users to upload files to their own folder
CREATE POLICY "Users can upload to their own folder" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'employee-documents' 
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Policy for users to view files in their own folder
CREATE POLICY "Users can view files in their own folder" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'employee-documents' 
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Policy for users to update files in their own folder
CREATE POLICY "Users can update files in their own folder" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'employee-documents' 
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Policy for users to delete files in their own folder
CREATE POLICY "Users can delete files in their own folder" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'employee-documents' 
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

