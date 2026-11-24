
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // SECURITY: exigir sessão válida de administrador
  {
    const authHeader = req.headers.get('Authorization') ?? ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
    const deny = (error: string, status: number) =>
      new Response(JSON.stringify({ error }), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    if (!token) return deny('Não autenticado', 401)
    const admin = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '')
    const { data: u, error: ue } = await admin.auth.getUser(token)
    if (ue || !u?.user) return deny('Sessão inválida', 401)
    const { data: roles } = await admin.from('user_roles').select('role').eq('user_id', u.user.id)
    const { data: prof } = await admin.from('profiles').select('role').eq('id', u.user.id).maybeSingle()
    const isAdmin = (roles ?? []).some((r: { role: string }) => r.role === 'admin' || r.role === 'super_admin')
      || prof?.role === 'admin' || prof?.role === 'super_admin'
    if (!isAdmin) return deny('Apenas administradores podem criar funcionários', 403)
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    const { email, password, name, role, hourlyRate, overtimeRate, employeeCode } = await req.json()

    // Criar usuário via admin API (não faz login)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError) {
      return new Response(
        JSON.stringify({ error: authError.message }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Criar perfil
    if (authData.user) {
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: authData.user.id,
          name,
          email,
          role: role || 'user',
          hourly_rate: parseFloat(hourlyRate) || 50,
          overtime_rate: parseFloat(overtimeRate) || 75,
          employee_code: employeeCode || null
        })

      if (profileError) {
        console.error('Erro ao criar perfil:', profileError)
        return new Response(
          JSON.stringify({ error: 'Erro ao criar perfil do usuário' }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }
    }

    return new Response(
      JSON.stringify({ message: 'Usuário criado com sucesso!', user: authData.user }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Erro na função:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
