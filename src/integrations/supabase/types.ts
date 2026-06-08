export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      allowances: {
        Row: {
          amount: number
          created_at: string
          created_by: string | null
          date: string
          description: string
          employee_id: string
          id: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          created_by?: string | null
          date?: string
          description: string
          employee_id: string
          id?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string | null
          date?: string
          description?: string
          employee_id?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "allowances_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "allowances_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "vw_falta_clock_in_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "allowances_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "vw_falta_clock_out_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "allowances_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "vw_falta_lunch_end_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "allowances_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "vw_falta_lunch_start_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "allowances_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "vw_pontos_faltantes_semana"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "allowances_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "allowances_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_falta_clock_in_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "allowances_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_falta_clock_out_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "allowances_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_falta_lunch_end_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "allowances_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_falta_lunch_start_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "allowances_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_pontos_faltantes_semana"
            referencedColumns: ["user_id"]
          },
        ]
      }
      allowed_locations: {
        Row: {
          address: string
          code: string | null
          created_at: string
          id: string
          is_active: boolean
          latitude: number
          longitude: number
          name: string
          range_meters: number
          updated_at: string
        }
        Insert: {
          address: string
          code?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          latitude: number
          longitude: number
          name: string
          range_meters?: number
          updated_at?: string
        }
        Update: {
          address?: string
          code?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          latitude?: number
          longitude?: number
          name?: string
          range_meters?: number
          updated_at?: string
        }
        Relationships: []
      }
      anexos_despesa: {
        Row: {
          caminho_arquivo: string
          created_at: string
          despesa_id: string
          id: string
          nome_arquivo: string
          tamanho_arquivo: number
          tipo_arquivo: string
          updated_at: string
        }
        Insert: {
          caminho_arquivo: string
          created_at?: string
          despesa_id: string
          id?: string
          nome_arquivo: string
          tamanho_arquivo: number
          tipo_arquivo: string
          updated_at?: string
        }
        Update: {
          caminho_arquivo?: string
          created_at?: string
          despesa_id?: string
          id?: string
          nome_arquivo?: string
          tamanho_arquivo?: number
          tipo_arquivo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "anexos_despesa_despesa_id_fkey"
            columns: ["despesa_id"]
            isOneToOne: false
            referencedRelation: "despesas"
            referencedColumns: ["id"]
          },
        ]
      }
      anexos_fatura_receita: {
        Row: {
          caminho_arquivo: string
          created_at: string
          fatura_id: string
          id: string
          nome_arquivo: string
          tamanho_arquivo: number
          tipo_arquivo: string
          updated_at: string
        }
        Insert: {
          caminho_arquivo: string
          created_at?: string
          fatura_id: string
          id?: string
          nome_arquivo: string
          tamanho_arquivo: number
          tipo_arquivo: string
          updated_at?: string
        }
        Update: {
          caminho_arquivo?: string
          created_at?: string
          fatura_id?: string
          id?: string
          nome_arquivo?: string
          tamanho_arquivo?: number
          tipo_arquivo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "anexos_fatura_receita_fatura_id_fkey"
            columns: ["fatura_id"]
            isOneToOne: false
            referencedRelation: "faturas_receita"
            referencedColumns: ["id"]
          },
        ]
      }
      announcement_recipients: {
        Row: {
          announcement_id: string
          created_at: string
          employee_id: string
          id: string
          is_read: boolean
          read_at: string | null
        }
        Insert: {
          announcement_id: string
          created_at?: string
          employee_id: string
          id?: string
          is_read?: boolean
          read_at?: string | null
        }
        Update: {
          announcement_id?: string
          created_at?: string
          employee_id?: string
          id?: string
          is_read?: boolean
          read_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "announcement_recipients_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "announcements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcement_recipients_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcement_recipients_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_falta_clock_in_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "announcement_recipients_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_falta_clock_out_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "announcement_recipients_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_falta_lunch_end_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "announcement_recipients_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_falta_lunch_start_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "announcement_recipients_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_pontos_faltantes_semana"
            referencedColumns: ["user_id"]
          },
        ]
      }
      announcements: {
        Row: {
          content: string
          created_at: string
          created_by: string
          expires_at: string | null
          id: string
          is_active: boolean
          priority: string | null
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          priority?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          priority?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "vw_falta_clock_in_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "announcements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "vw_falta_clock_out_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "announcements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "vw_falta_lunch_end_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "announcements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "vw_falta_lunch_start_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "announcements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "vw_pontos_faltantes_semana"
            referencedColumns: ["user_id"]
          },
        ]
      }
      app_settings: {
        Row: {
          description: string | null
          key: string
          updated_at: string
          updated_by: string | null
          value: string
        }
        Insert: {
          description?: string | null
          key: string
          updated_at?: string
          updated_by?: string | null
          value: string
        }
        Update: {
          description?: string | null
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          changed_fields: string[] | null
          created_at: string
          id: string
          ip_address: unknown
          metadata: Json | null
          new_values: Json | null
          old_values: Json | null
          operation: string
          record_id: string
          session_id: string | null
          table_name: string
          user_agent: string | null
          user_email: string | null
          user_id: string | null
          user_role: string | null
        }
        Insert: {
          changed_fields?: string[] | null
          created_at?: string
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          operation: string
          record_id: string
          session_id?: string | null
          table_name: string
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
          user_role?: string | null
        }
        Update: {
          changed_fields?: string[] | null
          created_at?: string
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          operation?: string
          record_id?: string
          session_id?: string | null
          table_name?: string
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
          user_role?: string | null
        }
        Relationships: []
      }
      auto_obras_values: {
        Row: {
          auto_value: number
          created_at: string
          department_id: string
          id: string
          is_active: boolean
          job_function_id: string
          updated_at: string
        }
        Insert: {
          auto_value: number
          created_at?: string
          department_id: string
          id?: string
          is_active?: boolean
          job_function_id: string
          updated_at?: string
        }
        Update: {
          auto_value?: number
          created_at?: string
          department_id?: string
          id?: string
          is_active?: boolean
          job_function_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "auto_obras_values_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "auto_obras_values_job_function_id_fkey"
            columns: ["job_function_id"]
            isOneToOne: false
            referencedRelation: "job_functions"
            referencedColumns: ["id"]
          },
        ]
      }
      blocked_periods: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          end_date: string
          id: string
          name: string
          start_date: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date: string
          id?: string
          name: string
          start_date: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string
          id?: string
          name?: string
          start_date?: string
        }
        Relationships: []
      }
      catalogo_itens_orcamento: {
        Row: {
          ativo: boolean | null
          categoria: string | null
          codigo: string | null
          created_at: string | null
          descricao: string | null
          id: string
          nome: string
          tipo: string
          unidade: string | null
          updated_at: string | null
          valor_referencia: number | null
        }
        Insert: {
          ativo?: boolean | null
          categoria?: string | null
          codigo?: string | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome: string
          tipo: string
          unidade?: string | null
          updated_at?: string | null
          valor_referencia?: number | null
        }
        Update: {
          ativo?: boolean | null
          categoria?: string | null
          codigo?: string | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome?: string
          tipo?: string
          unidade?: string | null
          updated_at?: string | null
          valor_referencia?: number | null
        }
        Relationships: []
      }
      catalogo_subtopicos: {
        Row: {
          created_at: string | null
          descricao: string
          id: string
          topico_id: string
          unidade: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          descricao: string
          id?: string
          topico_id: string
          unidade: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          descricao?: string
          id?: string
          topico_id?: string
          unidade?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "catalogo_subtopicos_topico_id_fkey"
            columns: ["topico_id"]
            isOneToOne: false
            referencedRelation: "catalogo_topicos"
            referencedColumns: ["id"]
          },
        ]
      }
      catalogo_topicos: {
        Row: {
          created_at: string | null
          descricao: string | null
          id: string
          nome: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      categorias: {
        Row: {
          ativo: boolean | null
          cor: string | null
          created_at: string | null
          id: string
          nome: string
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          cor?: string | null
          created_at?: string | null
          id?: string
          nome: string
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          cor?: string | null
          created_at?: string | null
          id?: string
          nome?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      clientes: {
        Row: {
          created_at: string
          email: string | null
          empresa: string | null
          endereco: string | null
          id: string
          nif: string | null
          nome: string
          observacoes: string | null
          telefone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          empresa?: string | null
          endereco?: string | null
          id?: string
          nif?: string | null
          nome: string
          observacoes?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          empresa?: string | null
          endereco?: string | null
          id?: string
          nif?: string | null
          nome?: string
          observacoes?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      departments: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      despesas: {
        Row: {
          arquivo_anexo: string | null
          atcud: string | null
          base_tributavel: number | null
          categoria_id: string | null
          created_at: string
          data_emissao: string | null
          fornecedor_id: string | null
          id: string
          iva: number | null
          nota_credito_vinculada_id: string | null
          numero_fatura: string | null
          obra_id: string | null
          status: Database["public"]["Enums"]["despesa_status"]
          tem_fatura: boolean | null
          tipo_fatura: string | null
          updated_at: string
          valor_fatura: number | null
        }
        Insert: {
          arquivo_anexo?: string | null
          atcud?: string | null
          base_tributavel?: number | null
          categoria_id?: string | null
          created_at?: string
          data_emissao?: string | null
          fornecedor_id?: string | null
          id?: string
          iva?: number | null
          nota_credito_vinculada_id?: string | null
          numero_fatura?: string | null
          obra_id?: string | null
          status?: Database["public"]["Enums"]["despesa_status"]
          tem_fatura?: boolean | null
          tipo_fatura?: string | null
          updated_at?: string
          valor_fatura?: number | null
        }
        Update: {
          arquivo_anexo?: string | null
          atcud?: string | null
          base_tributavel?: number | null
          categoria_id?: string | null
          created_at?: string
          data_emissao?: string | null
          fornecedor_id?: string | null
          id?: string
          iva?: number | null
          nota_credito_vinculada_id?: string | null
          numero_fatura?: string | null
          obra_id?: string | null
          status?: Database["public"]["Enums"]["despesa_status"]
          tem_fatura?: boolean | null
          tipo_fatura?: string | null
          updated_at?: string
          valor_fatura?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "despesas_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "despesas_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "despesas_nota_credito_vinculada_id_fkey"
            columns: ["nota_credito_vinculada_id"]
            isOneToOne: false
            referencedRelation: "despesas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "despesas_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
        ]
      }
      despesas_divisao: {
        Row: {
          created_at: string
          despesa_id: string
          id: string
          obra_id: string
          valor: number
        }
        Insert: {
          created_at?: string
          despesa_id: string
          id?: string
          obra_id: string
          valor: number
        }
        Update: {
          created_at?: string
          despesa_id?: string
          id?: string
          obra_id?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "despesas_divisao_despesa_id_fkey"
            columns: ["despesa_id"]
            isOneToOne: false
            referencedRelation: "despesas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "despesas_divisao_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
        ]
      }
      despesas_mao_obra: {
        Row: {
          created_at: string
          data_pagamento: string
          funcao: string
          funcionario_id_tcrh: string
          funcionario_nome: string
          id: string
          obra_id: string
          updated_at: string
          valor_pago: number
        }
        Insert: {
          created_at?: string
          data_pagamento?: string
          funcao: string
          funcionario_id_tcrh: string
          funcionario_nome: string
          id?: string
          obra_id: string
          updated_at?: string
          valor_pago: number
        }
        Update: {
          created_at?: string
          data_pagamento?: string
          funcao?: string
          funcionario_id_tcrh?: string
          funcionario_nome?: string
          id?: string
          obra_id?: string
          updated_at?: string
          valor_pago?: number
        }
        Relationships: [
          {
            foreignKeyName: "despesas_mao_obra_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
        ]
      }
      edit_requests: {
        Row: {
          created_at: string
          date: string
          employee_id: string
          employee_name: string
          field: string
          id: string
          location: Json | null
          location_name: string | null
          new_value: string
          old_value: string | null
          reason: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
        }
        Insert: {
          created_at?: string
          date: string
          employee_id: string
          employee_name: string
          field: string
          id?: string
          location?: Json | null
          location_name?: string | null
          new_value: string
          old_value?: string | null
          reason: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          date?: string
          employee_id?: string
          employee_name?: string
          field?: string
          id?: string
          location?: Json | null
          location_name?: string | null
          new_value?: string
          old_value?: string | null
          reason?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "edit_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edit_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_falta_clock_in_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "edit_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_falta_clock_out_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "edit_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_falta_lunch_end_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "edit_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_falta_lunch_start_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "edit_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_pontos_faltantes_semana"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "edit_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "edit_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "vw_falta_clock_in_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "edit_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "vw_falta_clock_out_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "edit_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "vw_falta_lunch_end_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "edit_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "vw_falta_lunch_start_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "edit_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "vw_pontos_faltantes_semana"
            referencedColumns: ["user_id"]
          },
        ]
      }
      employee_analytics: {
        Row: {
          anomaly_flags: Json | null
          average_daily_hours: number | null
          created_at: string | null
          days_worked: number | null
          employee_id: string
          id: string
          month: number
          productivity_score: number | null
          total_hours_worked: number | null
          total_overtime_hours: number | null
          updated_at: string | null
          year: number
        }
        Insert: {
          anomaly_flags?: Json | null
          average_daily_hours?: number | null
          created_at?: string | null
          days_worked?: number | null
          employee_id: string
          id?: string
          month: number
          productivity_score?: number | null
          total_hours_worked?: number | null
          total_overtime_hours?: number | null
          updated_at?: string | null
          year: number
        }
        Update: {
          anomaly_flags?: Json | null
          average_daily_hours?: number | null
          created_at?: string | null
          days_worked?: number | null
          employee_id?: string
          id?: string
          month?: number
          productivity_score?: number | null
          total_hours_worked?: number | null
          total_overtime_hours?: number | null
          updated_at?: string | null
          year?: number
        }
        Relationships: []
      }
      employee_balance_history: {
        Row: {
          accumulated_balance: number
          balance_difference: number
          balance_type: string
          calculated_amount: number
          created_at: string
          created_by: string | null
          description: string | null
          employee_id: string
          id: string
          paid_amount: number
          period_end: string
          period_start: string
          status: string
          updated_at: string
        }
        Insert: {
          accumulated_balance?: number
          balance_difference?: number
          balance_type: string
          calculated_amount?: number
          created_at?: string
          created_by?: string | null
          description?: string | null
          employee_id: string
          id?: string
          paid_amount?: number
          period_end: string
          period_start: string
          status?: string
          updated_at?: string
        }
        Update: {
          accumulated_balance?: number
          balance_difference?: number
          balance_type?: string
          calculated_amount?: number
          created_at?: string
          created_by?: string | null
          description?: string | null
          employee_id?: string
          id?: string
          paid_amount?: number
          period_end?: string
          period_start?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      employee_app_devices: {
        Row: {
          app_build: string | null
          app_version: string
          device_key: string
          device_model: string | null
          employee_id: string
          first_seen_at: string
          id: string
          last_seen_at: string
          os_version: string | null
          platform: string
        }
        Insert: {
          app_build?: string | null
          app_version: string
          device_key: string
          device_model?: string | null
          employee_id: string
          first_seen_at?: string
          id?: string
          last_seen_at?: string
          os_version?: string | null
          platform: string
        }
        Update: {
          app_build?: string | null
          app_version?: string
          device_key?: string
          device_model?: string | null
          employee_id?: string
          first_seen_at?: string
          id?: string
          last_seen_at?: string
          os_version?: string | null
          platform?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_app_devices_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_app_devices_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_falta_clock_in_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "employee_app_devices_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_falta_clock_out_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "employee_app_devices_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_falta_lunch_end_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "employee_app_devices_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_falta_lunch_start_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "employee_app_devices_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_pontos_faltantes_semana"
            referencedColumns: ["user_id"]
          },
        ]
      }
      employee_document_types: {
        Row: {
          created_at: string
          document_number: string
          document_type: string
          employee_id: string
          expiry_date: string | null
          id: string
          issue_date: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          document_number: string
          document_type: string
          employee_id: string
          expiry_date?: string | null
          id?: string
          issue_date?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          document_number?: string
          document_type?: string
          employee_id?: string
          expiry_date?: string | null
          id?: string
          issue_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_document_types_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_document_types_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_falta_clock_in_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "employee_document_types_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_falta_clock_out_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "employee_document_types_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_falta_lunch_end_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "employee_document_types_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_falta_lunch_start_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "employee_document_types_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_pontos_faltantes_semana"
            referencedColumns: ["user_id"]
          },
        ]
      }
      employee_documents: {
        Row: {
          category: string | null
          description: string | null
          employee_id: string
          expires_at: string | null
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string
          id: string
          is_read: boolean | null
          read_at: string | null
          title: string
          uploaded_at: string
          uploaded_by: string | null
        }
        Insert: {
          category?: string | null
          description?: string | null
          employee_id: string
          expires_at?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          file_type: string
          id?: string
          is_read?: boolean | null
          read_at?: string | null
          title: string
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Update: {
          category?: string | null
          description?: string | null
          employee_id?: string
          expires_at?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string
          id?: string
          is_read?: boolean | null
          read_at?: string | null
          title?: string
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_documents_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_documents_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_falta_clock_in_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "employee_documents_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_falta_clock_out_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "employee_documents_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_falta_lunch_end_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "employee_documents_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_falta_lunch_start_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "employee_documents_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_pontos_faltantes_semana"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "employee_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "vw_falta_clock_in_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "employee_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "vw_falta_clock_out_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "employee_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "vw_falta_lunch_end_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "employee_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "vw_falta_lunch_start_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "employee_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "vw_pontos_faltantes_semana"
            referencedColumns: ["user_id"]
          },
        ]
      }
      employee_work_schedules: {
        Row: {
          created_at: string
          daily_hours: number
          employee_id: string
          id: string
          is_active: boolean
          shift_id: string | null
          updated_at: string
          weekly_hours: number | null
        }
        Insert: {
          created_at?: string
          daily_hours?: number
          employee_id: string
          id?: string
          is_active?: boolean
          shift_id?: string | null
          updated_at?: string
          weekly_hours?: number | null
        }
        Update: {
          created_at?: string
          daily_hours?: number
          employee_id?: string
          id?: string
          is_active?: boolean
          shift_id?: string | null
          updated_at?: string
          weekly_hours?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_work_schedules_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_work_schedules_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_falta_clock_in_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "employee_work_schedules_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_falta_clock_out_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "employee_work_schedules_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_falta_lunch_end_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "employee_work_schedules_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_falta_lunch_start_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "employee_work_schedules_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_pontos_faltantes_semana"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "employee_work_schedules_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "work_shifts"
            referencedColumns: ["id"]
          },
        ]
      }
      faturas_receita: {
        Row: {
          cliente_id: string | null
          created_at: string
          data_emissao: string
          data_vencimento: string
          descricao: string | null
          id: string
          numero_fatura: string
          obra_id: string | null
          observacoes: string | null
          saldo_devedor: number | null
          status: Database["public"]["Enums"]["fatura_status"]
          updated_at: string
          valor_pago: number
          valor_total: number
        }
        Insert: {
          cliente_id?: string | null
          created_at?: string
          data_emissao?: string
          data_vencimento: string
          descricao?: string | null
          id?: string
          numero_fatura: string
          obra_id?: string | null
          observacoes?: string | null
          saldo_devedor?: number | null
          status?: Database["public"]["Enums"]["fatura_status"]
          updated_at?: string
          valor_pago?: number
          valor_total: number
        }
        Update: {
          cliente_id?: string | null
          created_at?: string
          data_emissao?: string
          data_vencimento?: string
          descricao?: string | null
          id?: string
          numero_fatura?: string
          obra_id?: string | null
          observacoes?: string | null
          saldo_devedor?: number | null
          status?: Database["public"]["Enums"]["fatura_status"]
          updated_at?: string
          valor_pago?: number
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "faturas_receita_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "faturas_receita_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
        ]
      }
      fornecedores: {
        Row: {
          categoria: string | null
          categoria_id: string | null
          created_at: string
          email: string | null
          endereco: string | null
          id: string
          nif: string | null
          nome: string
          status: Database["public"]["Enums"]["fornecedor_status"]
          telefone: string | null
          updated_at: string
        }
        Insert: {
          categoria?: string | null
          categoria_id?: string | null
          created_at?: string
          email?: string | null
          endereco?: string | null
          id?: string
          nif?: string | null
          nome: string
          status?: Database["public"]["Enums"]["fornecedor_status"]
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          categoria?: string | null
          categoria_id?: string | null
          created_at?: string
          email?: string | null
          endereco?: string | null
          id?: string
          nif?: string | null
          nome?: string
          status?: Database["public"]["Enums"]["fornecedor_status"]
          telefone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fornecedores_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
        ]
      }
      hour_bank_balances: {
        Row: {
          created_at: string
          current_balance: number
          employee_id: string
          id: string
          last_updated: string
        }
        Insert: {
          created_at?: string
          current_balance?: number
          employee_id: string
          id?: string
          last_updated?: string
        }
        Update: {
          created_at?: string
          current_balance?: number
          employee_id?: string
          id?: string
          last_updated?: string
        }
        Relationships: [
          {
            foreignKeyName: "hour_bank_balances_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hour_bank_balances_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: true
            referencedRelation: "vw_falta_clock_in_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "hour_bank_balances_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: true
            referencedRelation: "vw_falta_clock_out_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "hour_bank_balances_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: true
            referencedRelation: "vw_falta_lunch_end_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "hour_bank_balances_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: true
            referencedRelation: "vw_falta_lunch_start_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "hour_bank_balances_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: true
            referencedRelation: "vw_pontos_faltantes_semana"
            referencedColumns: ["user_id"]
          },
        ]
      }
      hour_bank_transactions: {
        Row: {
          admin_user_id: string | null
          created_at: string
          description: string | null
          employee_id: string
          expiration_date: string | null
          hours_amount: number
          id: string
          new_balance: number
          previous_balance: number
          time_record_id: string | null
          transaction_date: string
          transaction_type: string
        }
        Insert: {
          admin_user_id?: string | null
          created_at?: string
          description?: string | null
          employee_id: string
          expiration_date?: string | null
          hours_amount: number
          id?: string
          new_balance: number
          previous_balance: number
          time_record_id?: string | null
          transaction_date?: string
          transaction_type: string
        }
        Update: {
          admin_user_id?: string | null
          created_at?: string
          description?: string | null
          employee_id?: string
          expiration_date?: string | null
          hours_amount?: number
          id?: string
          new_balance?: number
          previous_balance?: number
          time_record_id?: string | null
          transaction_date?: string
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "hour_bank_transactions_admin_user_id_fkey"
            columns: ["admin_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hour_bank_transactions_admin_user_id_fkey"
            columns: ["admin_user_id"]
            isOneToOne: false
            referencedRelation: "vw_falta_clock_in_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "hour_bank_transactions_admin_user_id_fkey"
            columns: ["admin_user_id"]
            isOneToOne: false
            referencedRelation: "vw_falta_clock_out_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "hour_bank_transactions_admin_user_id_fkey"
            columns: ["admin_user_id"]
            isOneToOne: false
            referencedRelation: "vw_falta_lunch_end_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "hour_bank_transactions_admin_user_id_fkey"
            columns: ["admin_user_id"]
            isOneToOne: false
            referencedRelation: "vw_falta_lunch_start_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "hour_bank_transactions_admin_user_id_fkey"
            columns: ["admin_user_id"]
            isOneToOne: false
            referencedRelation: "vw_pontos_faltantes_semana"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "hour_bank_transactions_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hour_bank_transactions_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_falta_clock_in_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "hour_bank_transactions_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_falta_clock_out_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "hour_bank_transactions_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_falta_lunch_end_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "hour_bank_transactions_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_falta_lunch_start_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "hour_bank_transactions_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_pontos_faltantes_semana"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "hour_bank_transactions_time_record_id_fkey"
            columns: ["time_record_id"]
            isOneToOne: false
            referencedRelation: "time_records"
            referencedColumns: ["id"]
          },
        ]
      }
      hourly_rates_history: {
        Row: {
          change_reason: string | null
          changed_by: string | null
          created_at: string | null
          effective_date: string
          employee_id: string
          hourly_rate: number
          id: string
          overtime_rate: number
        }
        Insert: {
          change_reason?: string | null
          changed_by?: string | null
          created_at?: string | null
          effective_date?: string
          employee_id: string
          hourly_rate?: number
          id?: string
          overtime_rate?: number
        }
        Update: {
          change_reason?: string | null
          changed_by?: string | null
          created_at?: string | null
          effective_date?: string
          employee_id?: string
          hourly_rate?: number
          id?: string
          overtime_rate?: number
        }
        Relationships: []
      }
      hourly_rates_history_security_log: {
        Row: {
          attempted_at: string | null
          attempted_by: string | null
          attempted_operation: string
          blocked_reason: string
          id: string
          target_record_id: string | null
        }
        Insert: {
          attempted_at?: string | null
          attempted_by?: string | null
          attempted_operation: string
          blocked_reason: string
          id?: string
          target_record_id?: string | null
        }
        Update: {
          attempted_at?: string | null
          attempted_by?: string | null
          attempted_operation?: string
          blocked_reason?: string
          id?: string
          target_record_id?: string | null
        }
        Relationships: []
      }
      insumos: {
        Row: {
          ativo: boolean | null
          categoria_id: string | null
          codigo: string | null
          created_at: string
          descricao: string | null
          fornecedor_preferencial_id: string | null
          id: string
          nome: string
          preco_unitario_referencia: number | null
          unidade_medida: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean | null
          categoria_id?: string | null
          codigo?: string | null
          created_at?: string
          descricao?: string | null
          fornecedor_preferencial_id?: string | null
          id?: string
          nome: string
          preco_unitario_referencia?: number | null
          unidade_medida?: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean | null
          categoria_id?: string | null
          codigo?: string | null
          created_at?: string
          descricao?: string | null
          fornecedor_preferencial_id?: string | null
          id?: string
          nome?: string
          preco_unitario_referencia?: number | null
          unidade_medida?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "insumos_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "insumos_fornecedor_preferencial_id_fkey"
            columns: ["fornecedor_preferencial_id"]
            isOneToOne: false
            referencedRelation: "fornecedores"
            referencedColumns: ["id"]
          },
        ]
      }
      job_functions: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      location_employee_restrictions: {
        Row: {
          created_at: string
          created_by: string | null
          employee_id: string
          id: string
          location_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          employee_id: string
          id?: string
          location_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          employee_id?: string
          id?: string
          location_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "location_employee_restrictions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "location_employee_restrictions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "vw_falta_clock_in_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "location_employee_restrictions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "vw_falta_clock_out_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "location_employee_restrictions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "vw_falta_lunch_end_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "location_employee_restrictions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "vw_falta_lunch_start_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "location_employee_restrictions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "vw_pontos_faltantes_semana"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "location_employee_restrictions_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "location_employee_restrictions_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_falta_clock_in_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "location_employee_restrictions_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_falta_clock_out_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "location_employee_restrictions_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_falta_lunch_end_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "location_employee_restrictions_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_falta_lunch_start_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "location_employee_restrictions_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_pontos_faltantes_semana"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "location_employee_restrictions_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "allowed_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      mapbox_settings: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          mapbox_token: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          mapbox_token: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          mapbox_token?: string
          updated_at?: string
        }
        Relationships: []
      }
      materiais_obra: {
        Row: {
          codigo_material: string | null
          created_at: string | null
          data_fatura: string | null
          data_lancamento: string
          desconto: number | null
          fornecedor_fatura: string | null
          id: string
          insumo_id: string | null
          iva_incluido_item: boolean | null
          iva_percentual: number | null
          iva_rateado: boolean | null
          nome_material: string
          numero_fatura: string | null
          obra_id: string
          observacoes: string | null
          preco_unitario: number
          quantidade: number
          unidade_medida: string
          updated_at: string | null
          valor_iva: number | null
          valor_total: number
          valor_total_com_iva: number | null
        }
        Insert: {
          codigo_material?: string | null
          created_at?: string | null
          data_fatura?: string | null
          data_lancamento?: string
          desconto?: number | null
          fornecedor_fatura?: string | null
          id?: string
          insumo_id?: string | null
          iva_incluido_item?: boolean | null
          iva_percentual?: number | null
          iva_rateado?: boolean | null
          nome_material: string
          numero_fatura?: string | null
          obra_id: string
          observacoes?: string | null
          preco_unitario: number
          quantidade: number
          unidade_medida: string
          updated_at?: string | null
          valor_iva?: number | null
          valor_total: number
          valor_total_com_iva?: number | null
        }
        Update: {
          codigo_material?: string | null
          created_at?: string | null
          data_fatura?: string | null
          data_lancamento?: string
          desconto?: number | null
          fornecedor_fatura?: string | null
          id?: string
          insumo_id?: string | null
          iva_incluido_item?: boolean | null
          iva_percentual?: number | null
          iva_rateado?: boolean | null
          nome_material?: string
          numero_fatura?: string | null
          obra_id?: string
          observacoes?: string | null
          preco_unitario?: number
          quantidade?: number
          unidade_medida?: string
          updated_at?: string | null
          valor_iva?: number | null
          valor_total?: number
          valor_total_com_iva?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "materiais_obra_insumo_id_fkey"
            columns: ["insumo_id"]
            isOneToOne: false
            referencedRelation: "insumos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "materiais_obra_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_expected_hours: {
        Row: {
          created_at: string
          employee_id: string
          expected_hours: number
          id: string
          last_updated: string
          month: number
          updated_at: string
          working_days_elapsed: number
          working_days_in_month: number
          year: number
        }
        Insert: {
          created_at?: string
          employee_id: string
          expected_hours?: number
          id?: string
          last_updated?: string
          month: number
          updated_at?: string
          working_days_elapsed?: number
          working_days_in_month?: number
          year: number
        }
        Update: {
          created_at?: string
          employee_id?: string
          expected_hours?: number
          id?: string
          last_updated?: string
          month?: number
          updated_at?: string
          working_days_elapsed?: number
          working_days_in_month?: number
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "monthly_expected_hours_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_expected_hours_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_falta_clock_in_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "monthly_expected_hours_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_falta_clock_out_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "monthly_expected_hours_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_falta_lunch_end_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "monthly_expected_hours_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_falta_lunch_start_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "monthly_expected_hours_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_pontos_faltantes_semana"
            referencedColumns: ["user_id"]
          },
        ]
      }
      monthly_reconciliation: {
        Row: {
          calculated_allowances: number
          calculated_overtime: number
          calculated_total: number
          created_at: string
          deducted_salary_advance: number
          employee_id: string
          id: string
          month: number
          paid_allowances: number
          paid_overtime: number
          paid_total: number
          pending_allowances: number
          pending_overtime: number
          reconciled_at: string | null
          reconciled_by: string | null
          status: string
          updated_at: string
          year: number
        }
        Insert: {
          calculated_allowances?: number
          calculated_overtime?: number
          calculated_total?: number
          created_at?: string
          deducted_salary_advance?: number
          employee_id: string
          id?: string
          month: number
          paid_allowances?: number
          paid_overtime?: number
          paid_total?: number
          pending_allowances?: number
          pending_overtime?: number
          reconciled_at?: string | null
          reconciled_by?: string | null
          status?: string
          updated_at?: string
          year: number
        }
        Update: {
          calculated_allowances?: number
          calculated_overtime?: number
          calculated_total?: number
          created_at?: string
          deducted_salary_advance?: number
          employee_id?: string
          id?: string
          month?: number
          paid_allowances?: number
          paid_overtime?: number
          paid_total?: number
          pending_allowances?: number
          pending_overtime?: number
          reconciled_at?: string | null
          reconciled_by?: string | null
          status?: string
          updated_at?: string
          year?: number
        }
        Relationships: []
      }
      national_holidays: {
        Row: {
          created_at: string
          date: string
          description: string
          id: string
          is_mandatory: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          date: string
          description: string
          id?: string
          is_mandatory?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          date?: string
          description?: string
          id?: string
          is_mandatory?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      notification_logs: {
        Row: {
          created_at: string | null
          email_body: string | null
          email_subject: string | null
          employee_id: string
          error_message: string | null
          id: string
          metadata: Json | null
          notification_type: string
          sent_at: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          email_body?: string | null
          email_subject?: string | null
          employee_id: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          notification_type: string
          sent_at?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          email_body?: string | null
          email_subject?: string | null
          employee_id?: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          notification_type?: string
          sent_at?: string | null
          status?: string | null
        }
        Relationships: []
      }
      notification_settings: {
        Row: {
          created_at: string | null
          employee_id: string
          frequency: string | null
          id: string
          is_enabled: boolean | null
          notification_type: string
          push_enabled: boolean | null
          push_incomplete_records: boolean | null
          push_reminder_entry: boolean | null
          push_reminder_exit: boolean | null
          push_reminder_lunch_end: boolean | null
          push_reminder_lunch_start: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          employee_id: string
          frequency?: string | null
          id?: string
          is_enabled?: boolean | null
          notification_type: string
          push_enabled?: boolean | null
          push_incomplete_records?: boolean | null
          push_reminder_entry?: boolean | null
          push_reminder_exit?: boolean | null
          push_reminder_lunch_end?: boolean | null
          push_reminder_lunch_start?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          employee_id?: string
          frequency?: string | null
          id?: string
          is_enabled?: boolean | null
          notification_type?: string
          push_enabled?: boolean | null
          push_incomplete_records?: boolean | null
          push_reminder_entry?: boolean | null
          push_reminder_exit?: boolean | null
          push_reminder_lunch_end?: boolean | null
          push_reminder_lunch_start?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_settings_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_settings_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_falta_clock_in_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "notification_settings_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_falta_clock_out_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "notification_settings_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_falta_lunch_end_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "notification_settings_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_falta_lunch_start_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "notification_settings_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_pontos_faltantes_semana"
            referencedColumns: ["user_id"]
          },
        ]
      }
      obras: {
        Row: {
          cliente_id: string | null
          codigo: string | null
          created_at: string | null
          descricao: string | null
          endereco: string | null
          id: string
          latitude: number | null
          longitude: number | null
          nome: string
          prazo: string | null
          progresso: number
          status: string
          updated_at: string | null
          valor: number
        }
        Insert: {
          cliente_id?: string | null
          codigo?: string | null
          created_at?: string | null
          descricao?: string | null
          endereco?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          nome: string
          prazo?: string | null
          progresso?: number
          status?: string
          updated_at?: string | null
          valor?: number
        }
        Update: {
          cliente_id?: string | null
          codigo?: string | null
          created_at?: string | null
          descricao?: string | null
          endereco?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          nome?: string
          prazo?: string | null
          progresso?: number
          status?: string
          updated_at?: string | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "obras_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      orcamento_equipamentos: {
        Row: {
          created_at: string
          equipamento_base_id: string | null
          id: string
          nome: string
          orcamento_id: string
          periodo: string | null
          quantidade: number
          tipo: string
          total: number
          unidade: string
          valor_unitario: number
        }
        Insert: {
          created_at?: string
          equipamento_base_id?: string | null
          id?: string
          nome: string
          orcamento_id: string
          periodo?: string | null
          quantidade?: number
          tipo: string
          total?: number
          unidade: string
          valor_unitario?: number
        }
        Update: {
          created_at?: string
          equipamento_base_id?: string | null
          id?: string
          nome?: string
          orcamento_id?: string
          periodo?: string | null
          quantidade?: number
          tipo?: string
          total?: number
          unidade?: string
          valor_unitario?: number
        }
        Relationships: [
          {
            foreignKeyName: "orcamento_equipamentos_equipamento_base_id_fkey"
            columns: ["equipamento_base_id"]
            isOneToOne: false
            referencedRelation: "tipos_equipamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orcamento_equipamentos_orcamento_id_fkey"
            columns: ["orcamento_id"]
            isOneToOne: false
            referencedRelation: "orcamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      orcamento_mao_obra: {
        Row: {
          created_at: string
          funcao: string
          id: string
          observacoes: string | null
          orcamento_id: string
          quantidade_dias: number
          quantidade_pessoas: number
          terceirizado: boolean
          tipo_mao_obra_id: string | null
          total: number
          valor_dia: number
        }
        Insert: {
          created_at?: string
          funcao: string
          id?: string
          observacoes?: string | null
          orcamento_id: string
          quantidade_dias?: number
          quantidade_pessoas?: number
          terceirizado?: boolean
          tipo_mao_obra_id?: string | null
          total?: number
          valor_dia?: number
        }
        Update: {
          created_at?: string
          funcao?: string
          id?: string
          observacoes?: string | null
          orcamento_id?: string
          quantidade_dias?: number
          quantidade_pessoas?: number
          terceirizado?: boolean
          tipo_mao_obra_id?: string | null
          total?: number
          valor_dia?: number
        }
        Relationships: [
          {
            foreignKeyName: "orcamento_mao_obra_orcamento_id_fkey"
            columns: ["orcamento_id"]
            isOneToOne: false
            referencedRelation: "orcamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orcamento_mao_obra_tipo_mao_obra_id_fkey"
            columns: ["tipo_mao_obra_id"]
            isOneToOne: false
            referencedRelation: "tipos_mao_obra"
            referencedColumns: ["id"]
          },
        ]
      }
      orcamento_revisoes: {
        Row: {
          created_at: string | null
          data_revisao: string | null
          descricao: string | null
          id: string
          numero_revisao: number
          observacoes: string | null
          orcamento_id: string
          snapshot_dados: Json | null
          titulo: string
          total_com_iva: number | null
          total_sem_iva: number | null
          updated_at: string | null
          validade_dias: number | null
          versao_atual: boolean | null
        }
        Insert: {
          created_at?: string | null
          data_revisao?: string | null
          descricao?: string | null
          id?: string
          numero_revisao: number
          observacoes?: string | null
          orcamento_id: string
          snapshot_dados?: Json | null
          titulo: string
          total_com_iva?: number | null
          total_sem_iva?: number | null
          updated_at?: string | null
          validade_dias?: number | null
          versao_atual?: boolean | null
        }
        Update: {
          created_at?: string | null
          data_revisao?: string | null
          descricao?: string | null
          id?: string
          numero_revisao?: number
          observacoes?: string | null
          orcamento_id?: string
          snapshot_dados?: Json | null
          titulo?: string
          total_com_iva?: number | null
          total_sem_iva?: number | null
          updated_at?: string | null
          validade_dias?: number | null
          versao_atual?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "orcamento_revisoes_orcamento_id_fkey"
            columns: ["orcamento_id"]
            isOneToOne: false
            referencedRelation: "orcamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      orcamento_servicos: {
        Row: {
          categoria: string
          codigo: string
          created_at: string
          descricao: string
          id: string
          orcamento_id: string
          ordem: number
          quantidade: number
          servico_base_id: string | null
          total: number
          unidade_medida: string
          valor_unitario: number
        }
        Insert: {
          categoria: string
          codigo: string
          created_at?: string
          descricao: string
          id?: string
          orcamento_id: string
          ordem?: number
          quantidade?: number
          servico_base_id?: string | null
          total?: number
          unidade_medida: string
          valor_unitario?: number
        }
        Update: {
          categoria?: string
          codigo?: string
          created_at?: string
          descricao?: string
          id?: string
          orcamento_id?: string
          ordem?: number
          quantidade?: number
          servico_base_id?: string | null
          total?: number
          unidade_medida?: string
          valor_unitario?: number
        }
        Relationships: [
          {
            foreignKeyName: "orcamento_servicos_orcamento_id_fkey"
            columns: ["orcamento_id"]
            isOneToOne: false
            referencedRelation: "orcamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orcamento_servicos_servico_base_id_fkey"
            columns: ["servico_base_id"]
            isOneToOne: false
            referencedRelation: "servicos_base"
            referencedColumns: ["id"]
          },
        ]
      }
      orcamento_subtopicos: {
        Row: {
          created_at: string | null
          descricao: string
          id: string
          numero: number
          ordem: number | null
          quantidade: number
          topico_id: string
          unidade: string
          updated_at: string | null
          valor_total: number
          valor_unitario: number
        }
        Insert: {
          created_at?: string | null
          descricao: string
          id?: string
          numero: number
          ordem?: number | null
          quantidade?: number
          topico_id: string
          unidade: string
          updated_at?: string | null
          valor_total?: number
          valor_unitario?: number
        }
        Update: {
          created_at?: string | null
          descricao?: string
          id?: string
          numero?: number
          ordem?: number | null
          quantidade?: number
          topico_id?: string
          unidade?: string
          updated_at?: string | null
          valor_total?: number
          valor_unitario?: number
        }
        Relationships: [
          {
            foreignKeyName: "orcamento_subtopicos_topico_id_fkey"
            columns: ["topico_id"]
            isOneToOne: false
            referencedRelation: "orcamento_topicos"
            referencedColumns: ["id"]
          },
        ]
      }
      orcamento_topicos: {
        Row: {
          created_at: string | null
          id: string
          nome: string
          numero: number
          ordem: number | null
          revisao_id: string
          total: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          nome: string
          numero: number
          ordem?: number | null
          revisao_id: string
          total?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          nome?: string
          numero?: number
          ordem?: number | null
          revisao_id?: string
          total?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orcamento_topicos_revisao_id_fkey"
            columns: ["revisao_id"]
            isOneToOne: false
            referencedRelation: "orcamento_revisoes"
            referencedColumns: ["id"]
          },
        ]
      }
      orcamentos: {
        Row: {
          cliente_id: string | null
          created_at: string
          created_by: string | null
          data_orcamento: string
          descricao: string | null
          id: string
          numero: string
          numero_aleatorio: string | null
          obra_gerada_id: string | null
          obra_id: string | null
          observacoes: string | null
          revisao_atual: number | null
          status: Database["public"]["Enums"]["orcamento_status"]
          titulo: string
          total_com_iva: number
          total_sem_iva: number
          updated_at: string
          validade_dias: number
        }
        Insert: {
          cliente_id?: string | null
          created_at?: string
          created_by?: string | null
          data_orcamento?: string
          descricao?: string | null
          id?: string
          numero: string
          numero_aleatorio?: string | null
          obra_gerada_id?: string | null
          obra_id?: string | null
          observacoes?: string | null
          revisao_atual?: number | null
          status?: Database["public"]["Enums"]["orcamento_status"]
          titulo: string
          total_com_iva?: number
          total_sem_iva?: number
          updated_at?: string
          validade_dias?: number
        }
        Update: {
          cliente_id?: string | null
          created_at?: string
          created_by?: string | null
          data_orcamento?: string
          descricao?: string | null
          id?: string
          numero?: string
          numero_aleatorio?: string | null
          obra_gerada_id?: string | null
          obra_id?: string | null
          observacoes?: string | null
          revisao_atual?: number | null
          status?: Database["public"]["Enums"]["orcamento_status"]
          titulo?: string
          total_com_iva?: number
          total_sem_iva?: number
          updated_at?: string
          validade_dias?: number
        }
        Relationships: [
          {
            foreignKeyName: "orcamentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orcamentos_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orcamentos_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "vw_falta_clock_in_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "orcamentos_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "vw_falta_clock_out_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "orcamentos_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "vw_falta_lunch_end_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "orcamentos_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "vw_falta_lunch_start_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "orcamentos_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "vw_pontos_faltantes_semana"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "orcamentos_obra_gerada_id_fkey"
            columns: ["obra_gerada_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orcamentos_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
        ]
      }
      orcamentos_modelos_pdf: {
        Row: {
          ativo: boolean | null
          caminho_arquivo: string
          created_at: string | null
          descricao: string | null
          id: string
          nome: string
          nome_arquivo_original: string
          tamanho_arquivo: number
          tipo_trabalho: string | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          caminho_arquivo: string
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome: string
          nome_arquivo_original: string
          tamanho_arquivo: number
          tipo_trabalho?: string | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          caminho_arquivo?: string
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome?: string
          nome_arquivo_original?: string
          tamanho_arquivo?: number
          tipo_trabalho?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      overtime_pending_history: {
        Row: {
          created_at: string
          employee_id: string
          hourly_rate: number
          id: string
          metadata: Json | null
          original_period_end: string
          original_period_start: string
          overtime_hours: number
          overtime_value: number
          paid_amount: number
          paid_at: string | null
          paid_hours: number
          status: string
          transferred_to_period_end: string | null
          transferred_to_period_start: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          employee_id: string
          hourly_rate: number
          id?: string
          metadata?: Json | null
          original_period_end: string
          original_period_start: string
          overtime_hours: number
          overtime_value: number
          paid_amount?: number
          paid_at?: string | null
          paid_hours?: number
          status?: string
          transferred_to_period_end?: string | null
          transferred_to_period_start?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          employee_id?: string
          hourly_rate?: number
          id?: string
          metadata?: Json | null
          original_period_end?: string
          original_period_start?: string
          overtime_hours?: number
          overtime_value?: number
          paid_amount?: number
          paid_at?: string | null
          paid_hours?: number
          status?: string
          transferred_to_period_end?: string | null
          transferred_to_period_start?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      pagamentos_fatura: {
        Row: {
          created_at: string
          data_pagamento: string
          fatura_id: string
          id: string
          metodo_pagamento: string
          observacoes: string | null
          referencia: string | null
          valor_pago: number
        }
        Insert: {
          created_at?: string
          data_pagamento?: string
          fatura_id: string
          id?: string
          metodo_pagamento: string
          observacoes?: string | null
          referencia?: string | null
          valor_pago: number
        }
        Update: {
          created_at?: string
          data_pagamento?: string
          fatura_id?: string
          id?: string
          metodo_pagamento?: string
          observacoes?: string | null
          referencia?: string | null
          valor_pago?: number
        }
        Relationships: [
          {
            foreignKeyName: "pagamentos_fatura_fatura_id_fkey"
            columns: ["fatura_id"]
            isOneToOne: false
            referencedRelation: "faturas_receita"
            referencedColumns: ["id"]
          },
        ]
      }
      patrimonios_ferramentas: {
        Row: {
          id: string
          numero_patrimonio: string
          nome: string
          numero_serie: string | null
          modelo: string | null
          foto_url: string | null
          estado: string
          funcionario_atual_id: string | null
          funcionario_atual_nome: string | null
          obra_atual_id: string | null
          observacoes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          numero_patrimonio: string
          nome: string
          numero_serie?: string | null
          modelo?: string | null
          foto_url?: string | null
          estado?: string
          funcionario_atual_id?: string | null
          funcionario_atual_nome?: string | null
          obra_atual_id?: string | null
          observacoes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          numero_patrimonio?: string
          nome?: string
          numero_serie?: string | null
          modelo?: string | null
          foto_url?: string | null
          estado?: string
          funcionario_atual_id?: string | null
          funcionario_atual_nome?: string | null
          obra_atual_id?: string | null
          observacoes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patrimonios_ferramentas_obra_atual_id_fkey"
            columns: ["obra_atual_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
        ]
      }
      patrimonios_ferramentas_movimentos: {
        Row: {
          id: string
          ferramenta_id: string
          tipo: string
          funcionario_id: string | null
          funcionario_nome: string | null
          obra_id: string | null
          obra_nome: string | null
          observacoes: string | null
          data_movimento: string
          created_by: string | null
          created_at: string
          funcionario_anterior_id: string | null
          funcionario_anterior_nome: string | null
          obra_anterior_id: string | null
          obra_anterior_nome: string | null
          transferencia_escopo: string | null
        }
        Insert: {
          id?: string
          ferramenta_id: string
          tipo: string
          funcionario_id?: string | null
          funcionario_nome?: string | null
          obra_id?: string | null
          obra_nome?: string | null
          observacoes?: string | null
          data_movimento?: string
          created_by?: string | null
          created_at?: string
          funcionario_anterior_id?: string | null
          funcionario_anterior_nome?: string | null
          obra_anterior_id?: string | null
          obra_anterior_nome?: string | null
          transferencia_escopo?: string | null
        }
        Update: {
          id?: string
          ferramenta_id?: string
          tipo?: string
          funcionario_id?: string | null
          funcionario_nome?: string | null
          obra_id?: string | null
          obra_nome?: string | null
          observacoes?: string | null
          data_movimento?: string
          created_by?: string | null
          created_at?: string
          funcionario_anterior_id?: string | null
          funcionario_anterior_nome?: string | null
          obra_anterior_id?: string | null
          obra_anterior_nome?: string | null
          transferencia_escopo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patrimonios_ferramentas_movimentos_ferramenta_id_fkey"
            columns: ["ferramenta_id"]
            isOneToOne: false
            referencedRelation: "patrimonios_ferramentas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patrimonios_ferramentas_movimentos_obra_anterior_id_fkey"
            columns: ["obra_anterior_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patrimonios_ferramentas_movimentos_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
        ]
      }
      patrimonios_veiculos: {
        Row: {
          ano: number | null
          ativo: boolean | null
          cor: string | null
          created_at: string | null
          id: string
          marca: string | null
          matricula: string
          modelo: string | null
          observacoes: string | null
          updated_at: string | null
        }
        Insert: {
          ano?: number | null
          ativo?: boolean | null
          cor?: string | null
          created_at?: string | null
          id?: string
          marca?: string | null
          matricula: string
          modelo?: string | null
          observacoes?: string | null
          updated_at?: string | null
        }
        Update: {
          ano?: number | null
          ativo?: boolean | null
          cor?: string | null
          created_at?: string | null
          id?: string
          marca?: string | null
          matricula?: string
          modelo?: string | null
          observacoes?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      payment_history: {
        Row: {
          amount_paid: number
          amount_pending: number
          created_at: string
          created_by: string | null
          deduct_salary_advance: boolean
          description: string | null
          employee_id: string
          id: string
          pay_allowances: boolean
          pay_overtime_hours: boolean
          payment_date: string | null
          payroll_period_end: string
          payroll_period_start: string
          total_payroll_value: number
          updated_at: string
        }
        Insert: {
          amount_paid?: number
          amount_pending?: number
          created_at?: string
          created_by?: string | null
          deduct_salary_advance?: boolean
          description?: string | null
          employee_id: string
          id?: string
          pay_allowances?: boolean
          pay_overtime_hours?: boolean
          payment_date?: string | null
          payroll_period_end: string
          payroll_period_start: string
          total_payroll_value: number
          updated_at?: string
        }
        Update: {
          amount_paid?: number
          amount_pending?: number
          created_at?: string
          created_by?: string | null
          deduct_salary_advance?: boolean
          description?: string | null
          employee_id?: string
          id?: string
          pay_allowances?: boolean
          pay_overtime_hours?: boolean
          payment_date?: string | null
          payroll_period_end?: string
          payroll_period_start?: string
          total_payroll_value?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_history_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_history_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "vw_falta_clock_in_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "payment_history_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "vw_falta_clock_out_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "payment_history_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "vw_falta_lunch_end_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "payment_history_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "vw_falta_lunch_start_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "payment_history_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "vw_pontos_faltantes_semana"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "payment_history_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_history_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_falta_clock_in_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "payment_history_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_falta_clock_out_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "payment_history_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_falta_lunch_end_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "payment_history_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_falta_lunch_start_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "payment_history_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_pontos_faltantes_semana"
            referencedColumns: ["user_id"]
          },
        ]
      }
      payroll_calculation_settings: {
        Row: {
          applies_to: string
          created_at: string
          id: string
          is_enabled: boolean
          setting_description: string | null
          setting_name: string
          updated_at: string
        }
        Insert: {
          applies_to?: string
          created_at?: string
          id?: string
          is_enabled?: boolean
          setting_description?: string | null
          setting_name: string
          updated_at?: string
        }
        Update: {
          applies_to?: string
          created_at?: string
          id?: string
          is_enabled?: boolean
          setting_description?: string | null
          setting_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      payroll_overtime_settings: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          month: number
          pay_overtime_hours: boolean
          updated_at: string
          year: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          month: number
          pay_overtime_hours?: boolean
          updated_at?: string
          year: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          month?: number
          pay_overtime_hours?: boolean
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "payroll_overtime_settings_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payroll_overtime_settings_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "vw_falta_clock_in_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "payroll_overtime_settings_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "vw_falta_clock_out_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "payroll_overtime_settings_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "vw_falta_lunch_end_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "payroll_overtime_settings_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "vw_falta_lunch_start_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "payroll_overtime_settings_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "vw_pontos_faltantes_semana"
            referencedColumns: ["user_id"]
          },
        ]
      }
      payroll_transfers: {
        Row: {
          amount: number
          auto_generated: boolean | null
          created_at: string | null
          created_by: string | null
          description: string | null
          employee_id: string
          id: string
          original_period_end: string | null
          original_period_start: string | null
          overtime_hours: number | null
          pending_item_id: string | null
          source_period_end: string
          source_period_start: string
          target_period_end: string
          target_period_start: string
          transfer_subtype: string | null
          transfer_type: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          auto_generated?: boolean | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          employee_id: string
          id?: string
          original_period_end?: string | null
          original_period_start?: string | null
          overtime_hours?: number | null
          pending_item_id?: string | null
          source_period_end: string
          source_period_start: string
          target_period_end: string
          target_period_start: string
          transfer_subtype?: string | null
          transfer_type: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          auto_generated?: boolean | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          employee_id?: string
          id?: string
          original_period_end?: string | null
          original_period_start?: string | null
          overtime_hours?: number | null
          pending_item_id?: string | null
          source_period_end?: string
          source_period_start?: string
          target_period_end?: string
          target_period_start?: string
          transfer_subtype?: string | null
          transfer_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payroll_transfers_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payroll_transfers_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_falta_clock_in_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "payroll_transfers_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_falta_clock_out_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "payroll_transfers_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_falta_lunch_end_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "payroll_transfers_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_falta_lunch_start_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "payroll_transfers_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_pontos_faltantes_semana"
            referencedColumns: ["user_id"]
          },
        ]
      }
      payslips: {
        Row: {
          base_salary: number | null
          christmas_subsidy: number | null
          created_at: string | null
          created_by: string | null
          employee_id: string | null
          employee_name: string
          holiday_subsidy: number | null
          hourly_rate: number | null
          id: string
          irs_deduction: number | null
          meal_allowance: number | null
          meal_allowance_days: number | null
          meal_allowance_unit_value: number | null
          month_days: number | null
          net_pay: number | null
          nif: string | null
          other_allowances: Json | null
          other_deductions: Json | null
          pdf_filename: string | null
          period_end: string
          period_start: string
          raw_text: string | null
          social_security: number | null
          total_allowances: number | null
          total_deductions: number | null
          updated_at: string | null
          weekly_hours: number | null
        }
        Insert: {
          base_salary?: number | null
          christmas_subsidy?: number | null
          created_at?: string | null
          created_by?: string | null
          employee_id?: string | null
          employee_name: string
          holiday_subsidy?: number | null
          hourly_rate?: number | null
          id?: string
          irs_deduction?: number | null
          meal_allowance?: number | null
          meal_allowance_days?: number | null
          meal_allowance_unit_value?: number | null
          month_days?: number | null
          net_pay?: number | null
          nif?: string | null
          other_allowances?: Json | null
          other_deductions?: Json | null
          pdf_filename?: string | null
          period_end: string
          period_start: string
          raw_text?: string | null
          social_security?: number | null
          total_allowances?: number | null
          total_deductions?: number | null
          updated_at?: string | null
          weekly_hours?: number | null
        }
        Update: {
          base_salary?: number | null
          christmas_subsidy?: number | null
          created_at?: string | null
          created_by?: string | null
          employee_id?: string | null
          employee_name?: string
          holiday_subsidy?: number | null
          hourly_rate?: number | null
          id?: string
          irs_deduction?: number | null
          meal_allowance?: number | null
          meal_allowance_days?: number | null
          meal_allowance_unit_value?: number | null
          month_days?: number | null
          net_pay?: number | null
          nif?: string | null
          other_allowances?: Json | null
          other_deductions?: Json | null
          pdf_filename?: string | null
          period_end?: string
          period_start?: string
          raw_text?: string | null
          social_security?: number | null
          total_allowances?: number | null
          total_deductions?: number | null
          updated_at?: string | null
          weekly_hours?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "payslips_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payslips_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_falta_clock_in_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "payslips_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_falta_clock_out_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "payslips_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_falta_lunch_end_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "payslips_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_falta_lunch_start_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "payslips_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_pontos_faltantes_semana"
            referencedColumns: ["user_id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          admission_date: string | null
          birth_date: string | null
          can_access_tcobras: boolean
          can_register_time: boolean
          city: string | null
          contratado: boolean | null
          created_at: string
          department_id: string | null
          email: string
          employee_code: string | null
          gender: string | null
          hourly_rate: number
          iban: string | null
          id: string
          job_function_id: string | null
          name: string
          nif: string | null
          niss: string | null
          nome_seguradora_acidente: string | null
          nome_seguradora_contratado: string | null
          numero_apolice_acidente: string | null
          numero_apolice_contratado: string | null
          overtime_rate: number | null
          periodo_acidente_fim: string | null
          periodo_acidente_inicio: string | null
          phone: string | null
          photo: string | null
          postal_code: string | null
          role: string
          seguro_contracidentes: boolean | null
          shift_id: string | null
          status: Database["public"]["Enums"]["employee_status"] | null
          termination_date: string | null
          updated_at: string
          use_location_tracking: boolean
        }
        Insert: {
          address?: string | null
          admission_date?: string | null
          birth_date?: string | null
          can_access_tcobras?: boolean
          can_register_time?: boolean
          city?: string | null
          contratado?: boolean | null
          created_at?: string
          department_id?: string | null
          email: string
          employee_code?: string | null
          gender?: string | null
          hourly_rate?: number
          iban?: string | null
          id: string
          job_function_id?: string | null
          name: string
          nif?: string | null
          niss?: string | null
          nome_seguradora_acidente?: string | null
          nome_seguradora_contratado?: string | null
          numero_apolice_acidente?: string | null
          numero_apolice_contratado?: string | null
          overtime_rate?: number | null
          periodo_acidente_fim?: string | null
          periodo_acidente_inicio?: string | null
          phone?: string | null
          photo?: string | null
          postal_code?: string | null
          role?: string
          seguro_contracidentes?: boolean | null
          shift_id?: string | null
          status?: Database["public"]["Enums"]["employee_status"] | null
          termination_date?: string | null
          updated_at?: string
          use_location_tracking?: boolean
        }
        Update: {
          address?: string | null
          admission_date?: string | null
          birth_date?: string | null
          can_access_tcobras?: boolean
          can_register_time?: boolean
          city?: string | null
          contratado?: boolean | null
          created_at?: string
          department_id?: string | null
          email?: string
          employee_code?: string | null
          gender?: string | null
          hourly_rate?: number
          iban?: string | null
          id?: string
          job_function_id?: string | null
          name?: string
          nif?: string | null
          niss?: string | null
          nome_seguradora_acidente?: string | null
          nome_seguradora_contratado?: string | null
          numero_apolice_acidente?: string | null
          numero_apolice_contratado?: string | null
          overtime_rate?: number | null
          periodo_acidente_fim?: string | null
          periodo_acidente_inicio?: string | null
          phone?: string | null
          photo?: string | null
          postal_code?: string | null
          role?: string
          seguro_contracidentes?: boolean | null
          shift_id?: string | null
          status?: Database["public"]["Enums"]["employee_status"] | null
          termination_date?: string | null
          updated_at?: string
          use_location_tracking?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "profiles_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_job_function_id_fkey"
            columns: ["job_function_id"]
            isOneToOne: false
            referencedRelation: "job_functions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "work_shifts"
            referencedColumns: ["id"]
          },
        ]
      }
      push_tokens: {
        Row: {
          created_at: string | null
          device_info: Json | null
          employee_id: string
          id: string
          is_active: boolean | null
          platform: string
          token: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          device_info?: Json | null
          employee_id: string
          id?: string
          is_active?: boolean | null
          platform: string
          token: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          device_info?: Json | null
          employee_id?: string
          id?: string
          is_active?: boolean | null
          platform?: string
          token?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "push_tokens_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "push_tokens_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_falta_clock_in_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "push_tokens_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_falta_clock_out_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "push_tokens_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_falta_lunch_end_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "push_tokens_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_falta_lunch_start_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "push_tokens_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_pontos_faltantes_semana"
            referencedColumns: ["user_id"]
          },
        ]
      }
      rdo: {
        Row: {
          atividades_realizadas: string
          created_at: string
          data_relatorio: string
          descricao_materiais: string | null
          funcoes_pessoas: string | null
          id: string
          materiais_comprados: boolean | null
          obra_id: string
          observacoes: string | null
          quantidade_materiais: string | null
          quantidade_pessoas: number
          updated_at: string
          valor_materiais: number | null
        }
        Insert: {
          atividades_realizadas: string
          created_at?: string
          data_relatorio: string
          descricao_materiais?: string | null
          funcoes_pessoas?: string | null
          id?: string
          materiais_comprados?: boolean | null
          obra_id: string
          observacoes?: string | null
          quantidade_materiais?: string | null
          quantidade_pessoas?: number
          updated_at?: string
          valor_materiais?: number | null
        }
        Update: {
          atividades_realizadas?: string
          created_at?: string
          data_relatorio?: string
          descricao_materiais?: string | null
          funcoes_pessoas?: string | null
          id?: string
          materiais_comprados?: boolean | null
          obra_id?: string
          observacoes?: string | null
          quantidade_materiais?: string | null
          quantidade_pessoas?: number
          updated_at?: string
          valor_materiais?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "rdo_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
        ]
      }
      rdo_fotos: {
        Row: {
          caminho_arquivo: string
          created_at: string
          descricao: string | null
          id: string
          nome_arquivo: string
          ordem: number | null
          rdo_id: string
          tamanho_arquivo: number
          updated_at: string
        }
        Insert: {
          caminho_arquivo: string
          created_at?: string
          descricao?: string | null
          id?: string
          nome_arquivo: string
          ordem?: number | null
          rdo_id: string
          tamanho_arquivo: number
          updated_at?: string
        }
        Update: {
          caminho_arquivo?: string
          created_at?: string
          descricao?: string | null
          id?: string
          nome_arquivo?: string
          ordem?: number | null
          rdo_id?: string
          tamanho_arquivo?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rdo_fotos_rdo_id_fkey"
            columns: ["rdo_id"]
            isOneToOne: false
            referencedRelation: "rdo"
            referencedColumns: ["id"]
          },
        ]
      }
      rdo_materiais: {
        Row: {
          created_at: string
          descricao: string
          id: string
          quantidade: string
          rdo_id: string
          updated_at: string
          valor: number
        }
        Insert: {
          created_at?: string
          descricao: string
          id?: string
          quantidade: string
          rdo_id: string
          updated_at?: string
          valor: number
        }
        Update: {
          created_at?: string
          descricao?: string
          id?: string
          quantidade?: string
          rdo_id?: string
          updated_at?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "rdo_materiais_rdo_id_fkey"
            columns: ["rdo_id"]
            isOneToOne: false
            referencedRelation: "rdo"
            referencedColumns: ["id"]
          },
        ]
      }
      salary_advance_history: {
        Row: {
          action: string
          action_at: string
          action_by: string | null
          id: string
          new_amount: number | null
          notes: string | null
          previous_amount: number | null
          salary_advance_id: string
        }
        Insert: {
          action: string
          action_at?: string
          action_by?: string | null
          id?: string
          new_amount?: number | null
          notes?: string | null
          previous_amount?: number | null
          salary_advance_id: string
        }
        Update: {
          action?: string
          action_at?: string
          action_by?: string | null
          id?: string
          new_amount?: number | null
          notes?: string | null
          previous_amount?: number | null
          salary_advance_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "salary_advance_history_salary_advance_id_fkey"
            columns: ["salary_advance_id"]
            isOneToOne: false
            referencedRelation: "salary_advance_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      salary_advance_requests: {
        Row: {
          admin_notes: string | null
          approved_amount: number | null
          created_at: string
          employee_id: string
          id: string
          payment_date: string | null
          reason: string
          requested_amount: number
          requested_at: string
          reviewed_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          approved_amount?: number | null
          created_at?: string
          employee_id: string
          id?: string
          payment_date?: string | null
          reason: string
          requested_amount: number
          requested_at?: string
          reviewed_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          approved_amount?: number | null
          created_at?: string
          employee_id?: string
          id?: string
          payment_date?: string | null
          reason?: string
          requested_amount?: number
          requested_at?: string
          reviewed_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      servicos_base: {
        Row: {
          ativo: boolean
          categoria: string
          codigo: string
          created_at: string
          descricao: string
          id: string
          unidade_medida: string
          updated_at: string
          valor_unitario_base: number
        }
        Insert: {
          ativo?: boolean
          categoria: string
          codigo: string
          created_at?: string
          descricao: string
          id?: string
          unidade_medida: string
          updated_at?: string
          valor_unitario_base?: number
        }
        Update: {
          ativo?: boolean
          categoria?: string
          codigo?: string
          created_at?: string
          descricao?: string
          id?: string
          unidade_medida?: string
          updated_at?: string
          valor_unitario_base?: number
        }
        Relationships: []
      }
      stock_atual: {
        Row: {
          id: string
          insumo_id: string
          quantidade_disponivel: number
          quantidade_reservada: number
          stock_minimo: number | null
          ultima_atualizacao: string
        }
        Insert: {
          id?: string
          insumo_id: string
          quantidade_disponivel?: number
          quantidade_reservada?: number
          stock_minimo?: number | null
          ultima_atualizacao?: string
        }
        Update: {
          id?: string
          insumo_id?: string
          quantidade_disponivel?: number
          quantidade_reservada?: number
          stock_minimo?: number | null
          ultima_atualizacao?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_atual_insumo_id_fkey"
            columns: ["insumo_id"]
            isOneToOne: true
            referencedRelation: "insumos"
            referencedColumns: ["id"]
          },
        ]
      }
      subtopico_equipamentos: {
        Row: {
          created_at: string | null
          equipamento_id: string
          id: string
          periodo: string | null
          quantidade: number
          subtopico_id: string
          updated_at: string | null
          valor_total: number
          valor_unitario: number
        }
        Insert: {
          created_at?: string | null
          equipamento_id: string
          id?: string
          periodo?: string | null
          quantidade?: number
          subtopico_id: string
          updated_at?: string | null
          valor_total?: number
          valor_unitario?: number
        }
        Update: {
          created_at?: string | null
          equipamento_id?: string
          id?: string
          periodo?: string | null
          quantidade?: number
          subtopico_id?: string
          updated_at?: string | null
          valor_total?: number
          valor_unitario?: number
        }
        Relationships: [
          {
            foreignKeyName: "subtopico_equipamentos_equipamento_id_fkey"
            columns: ["equipamento_id"]
            isOneToOne: false
            referencedRelation: "tipos_equipamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subtopico_equipamentos_subtopico_id_fkey"
            columns: ["subtopico_id"]
            isOneToOne: false
            referencedRelation: "orcamento_subtopicos"
            referencedColumns: ["id"]
          },
        ]
      }
      subtopico_materiais: {
        Row: {
          created_at: string | null
          id: string
          insumo_id: string
          quantidade: number
          subtopico_id: string
          updated_at: string | null
          valor_total: number
          valor_unitario: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          insumo_id: string
          quantidade?: number
          subtopico_id: string
          updated_at?: string | null
          valor_total?: number
          valor_unitario?: number
        }
        Update: {
          created_at?: string | null
          id?: string
          insumo_id?: string
          quantidade?: number
          subtopico_id?: string
          updated_at?: string | null
          valor_total?: number
          valor_unitario?: number
        }
        Relationships: [
          {
            foreignKeyName: "subtopico_materiais_insumo_id_fkey"
            columns: ["insumo_id"]
            isOneToOne: false
            referencedRelation: "insumos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subtopico_materiais_subtopico_id_fkey"
            columns: ["subtopico_id"]
            isOneToOne: false
            referencedRelation: "orcamento_subtopicos"
            referencedColumns: ["id"]
          },
        ]
      }
      system_alerts: {
        Row: {
          alert_type: string
          created_at: string | null
          employee_id: string | null
          expires_at: string | null
          id: string
          is_read: boolean | null
          message: string
          metadata: Json | null
          severity: string | null
          title: string
        }
        Insert: {
          alert_type: string
          created_at?: string | null
          employee_id?: string | null
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          metadata?: Json | null
          severity?: string | null
          title: string
        }
        Update: {
          alert_type?: string
          created_at?: string | null
          employee_id?: string | null
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          metadata?: Json | null
          severity?: string | null
          title?: string
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          setting_key: string
          setting_value: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          setting_key: string
          setting_value: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: string
          updated_at?: string
        }
        Relationships: []
      }
      tcrh_api_keys: {
        Row: {
          api_key: string
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          key_name: string
          last_used_at: string | null
          permissions: Json | null
        }
        Insert: {
          api_key: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          key_name: string
          last_used_at?: string | null
          permissions?: Json | null
        }
        Update: {
          api_key?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          key_name?: string
          last_used_at?: string | null
          permissions?: Json | null
        }
        Relationships: []
      }
      time_records: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          clock_in: string | null
          clock_out: string | null
          created_at: string
          date: string
          id: string
          is_pending_approval: boolean | null
          locations: Json | null
          lunch_end: string | null
          lunch_start: string | null
          normal_hours: number
          normal_pay: number
          overtime_hours: number
          overtime_pay: number
          status: string | null
          total_hours: number
          total_pay: number
          updated_at: string
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          clock_in?: string | null
          clock_out?: string | null
          created_at?: string
          date: string
          id?: string
          is_pending_approval?: boolean | null
          locations?: Json | null
          lunch_end?: string | null
          lunch_start?: string | null
          normal_hours?: number
          normal_pay?: number
          overtime_hours?: number
          overtime_pay?: number
          status?: string | null
          total_hours?: number
          total_pay?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          clock_in?: string | null
          clock_out?: string | null
          created_at?: string
          date?: string
          id?: string
          is_pending_approval?: boolean | null
          locations?: Json | null
          lunch_end?: string | null
          lunch_start?: string | null
          normal_hours?: number
          normal_pay?: number
          overtime_hours?: number
          overtime_pay?: number
          status?: string | null
          total_hours?: number
          total_pay?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_records_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_records_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "vw_falta_clock_in_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "time_records_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "vw_falta_clock_out_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "time_records_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "vw_falta_lunch_end_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "time_records_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "vw_falta_lunch_start_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "time_records_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "vw_pontos_faltantes_semana"
            referencedColumns: ["user_id"]
          },
        ]
      }
      tipos_equipamentos: {
        Row: {
          ativo: boolean
          created_at: string
          id: string
          nome: string
          tipo: string
          unidade: string
          updated_at: string
          valor_unitario_base: number
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          id?: string
          nome: string
          tipo: string
          unidade: string
          updated_at?: string
          valor_unitario_base?: number
        }
        Update: {
          ativo?: boolean
          created_at?: string
          id?: string
          nome?: string
          tipo?: string
          unidade?: string
          updated_at?: string
          valor_unitario_base?: number
        }
        Relationships: []
      }
      tipos_mao_obra: {
        Row: {
          ativo: boolean
          created_at: string
          funcao: string
          id: string
          updated_at: string
          valor_dia_base: number
          valor_hora_base: number
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          funcao: string
          id?: string
          updated_at?: string
          valor_dia_base?: number
          valor_hora_base?: number
        }
        Update: {
          ativo?: boolean
          created_at?: string
          funcao?: string
          id?: string
          updated_at?: string
          valor_dia_base?: number
          valor_hora_base?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          api_key_id: string | null
          created_at: string
          expires_at: string | null
          id: string
          is_permanent: boolean | null
          session_token: string
          user_id: string
        }
        Insert: {
          api_key_id?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          is_permanent?: boolean | null
          session_token: string
          user_id: string
        }
        Update: {
          api_key_id?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          is_permanent?: boolean | null
          session_token?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "tcrh_api_keys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "vw_falta_clock_in_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "vw_falta_clock_out_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "vw_falta_lunch_end_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "vw_falta_lunch_start_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "vw_pontos_faltantes_semana"
            referencedColumns: ["user_id"]
          },
        ]
      }
      vacation_balances: {
        Row: {
          accumulated_days: number | null
          accumulated_from_year: number | null
          admission_year: boolean | null
          available_days: number
          eligibility_date: string | null
          eligible: boolean | null
          employee_id: string
          enjoyment_deadline: string | null
          id: string
          notes: string | null
          published_date: string | null
          total_days: number
          updated_at: string | null
          used_days: number
          vesting_date: string | null
          year: number
        }
        Insert: {
          accumulated_days?: number | null
          accumulated_from_year?: number | null
          admission_year?: boolean | null
          available_days?: number
          eligibility_date?: string | null
          eligible?: boolean | null
          employee_id: string
          enjoyment_deadline?: string | null
          id?: string
          notes?: string | null
          published_date?: string | null
          total_days?: number
          updated_at?: string | null
          used_days?: number
          vesting_date?: string | null
          year: number
        }
        Update: {
          accumulated_days?: number | null
          accumulated_from_year?: number | null
          admission_year?: boolean | null
          available_days?: number
          eligibility_date?: string | null
          eligible?: boolean | null
          employee_id?: string
          enjoyment_deadline?: string | null
          id?: string
          notes?: string | null
          published_date?: string | null
          total_days?: number
          updated_at?: string | null
          used_days?: number
          vesting_date?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_vb_employee"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_vb_employee"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_falta_clock_in_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "fk_vb_employee"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_falta_clock_out_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "fk_vb_employee"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_falta_lunch_end_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "fk_vb_employee"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_falta_lunch_start_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "fk_vb_employee"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_pontos_faltantes_semana"
            referencedColumns: ["user_id"]
          },
        ]
      }
      vacation_map: {
        Row: {
          created_at: string | null
          created_by: string | null
          employee_id: string
          id: string
          month: number
          notes: string | null
          year: number
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          employee_id: string
          id?: string
          month: number
          notes?: string | null
          year: number
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          employee_id?: string
          id?: string
          month?: number
          notes?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "vacation_map_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vacation_map_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "vw_falta_clock_in_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "vacation_map_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "vw_falta_clock_out_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "vacation_map_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "vw_falta_lunch_end_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "vacation_map_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "vw_falta_lunch_start_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "vacation_map_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "vw_pontos_faltantes_semana"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "vacation_map_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vacation_map_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_falta_clock_in_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "vacation_map_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_falta_clock_out_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "vacation_map_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_falta_lunch_end_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "vacation_map_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_falta_lunch_start_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "vacation_map_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_pontos_faltantes_semana"
            referencedColumns: ["user_id"]
          },
        ]
      }
      vacation_policies: {
        Row: {
          allow_retroactive: boolean
          created_at: string | null
          id: string
          max_days_per_year: number
          max_split: number
          min_period_days: number
          updated_at: string | null
        }
        Insert: {
          allow_retroactive?: boolean
          created_at?: string | null
          id?: string
          max_days_per_year?: number
          max_split?: number
          min_period_days?: number
          updated_at?: string | null
        }
        Update: {
          allow_retroactive?: boolean
          created_at?: string | null
          id?: string
          max_days_per_year?: number
          max_split?: number
          min_period_days?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      vacation_request_history: {
        Row: {
          action: string
          action_at: string | null
          action_by: string | null
          id: string
          justification: string | null
          vacation_request_id: string
        }
        Insert: {
          action: string
          action_at?: string | null
          action_by?: string | null
          id?: string
          justification?: string | null
          vacation_request_id: string
        }
        Update: {
          action?: string
          action_at?: string | null
          action_by?: string | null
          id?: string
          justification?: string | null
          vacation_request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vacation_request_history_vacation_request_id_fkey"
            columns: ["vacation_request_id"]
            isOneToOne: false
            referencedRelation: "vacation_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      vacation_requests: {
        Row: {
          accumulated_days_used: number | null
          adjust_reason: string | null
          approver_id: string | null
          days: number
          decided_at: string | null
          decision_justification: string | null
          department_id: string | null
          employee_id: string
          end_date: string
          id: string
          includes_accumulated: boolean | null
          job_function_id: string | null
          previous_end_date: string | null
          previous_start_date: string | null
          requested_at: string
          start_date: string
          status: string
          working_days: number | null
          year_reference: number | null
        }
        Insert: {
          accumulated_days_used?: number | null
          adjust_reason?: string | null
          approver_id?: string | null
          days: number
          decided_at?: string | null
          decision_justification?: string | null
          department_id?: string | null
          employee_id: string
          end_date: string
          id?: string
          includes_accumulated?: boolean | null
          job_function_id?: string | null
          previous_end_date?: string | null
          previous_start_date?: string | null
          requested_at?: string
          start_date: string
          status?: string
          working_days?: number | null
          year_reference?: number | null
        }
        Update: {
          accumulated_days_used?: number | null
          adjust_reason?: string | null
          approver_id?: string | null
          days?: number
          decided_at?: string | null
          decision_justification?: string | null
          department_id?: string | null
          employee_id?: string
          end_date?: string
          id?: string
          includes_accumulated?: boolean | null
          job_function_id?: string | null
          previous_end_date?: string | null
          previous_start_date?: string | null
          requested_at?: string
          start_date?: string
          status?: string
          working_days?: number | null
          year_reference?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_department"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_employee"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_employee"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_falta_clock_in_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "fk_employee"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_falta_clock_out_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "fk_employee"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_falta_lunch_end_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "fk_employee"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_falta_lunch_start_hoje"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "fk_employee"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "vw_pontos_faltantes_semana"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "fk_job_function"
            columns: ["job_function_id"]
            isOneToOne: false
            referencedRelation: "job_functions"
            referencedColumns: ["id"]
          },
        ]
      }
      veiculos_abastecimentos: {
        Row: {
          consumo_medio: number | null
          created_at: string | null
          custo_por_km: number | null
          data_abastecimento: string
          despesa_id: string | null
          id: string
          kilometragem: number
          km_anterior: number | null
          litros: number
          observacoes: string | null
          posto: string | null
          tipo_combustivel: string | null
          updated_at: string | null
          valor_total: number
          veiculo_id: string
        }
        Insert: {
          consumo_medio?: number | null
          created_at?: string | null
          custo_por_km?: number | null
          data_abastecimento?: string
          despesa_id?: string | null
          id?: string
          kilometragem: number
          km_anterior?: number | null
          litros: number
          observacoes?: string | null
          posto?: string | null
          tipo_combustivel?: string | null
          updated_at?: string | null
          valor_total: number
          veiculo_id: string
        }
        Update: {
          consumo_medio?: number | null
          created_at?: string | null
          custo_por_km?: number | null
          data_abastecimento?: string
          despesa_id?: string | null
          id?: string
          kilometragem?: number
          km_anterior?: number | null
          litros?: number
          observacoes?: string | null
          posto?: string | null
          tipo_combustivel?: string | null
          updated_at?: string | null
          valor_total?: number
          veiculo_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "veiculos_abastecimentos_despesa_id_fkey"
            columns: ["despesa_id"]
            isOneToOne: false
            referencedRelation: "despesas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "veiculos_abastecimentos_veiculo_id_fkey"
            columns: ["veiculo_id"]
            isOneToOne: false
            referencedRelation: "patrimonios_veiculos"
            referencedColumns: ["id"]
          },
        ]
      }
      veiculos_alertas: {
        Row: {
          created_at: string | null
          data_alerta: string
          descricao: string | null
          id: string
          resolvido: boolean | null
          tipo_alerta: string
          updated_at: string | null
          veiculo_id: string
        }
        Insert: {
          created_at?: string | null
          data_alerta: string
          descricao?: string | null
          id?: string
          resolvido?: boolean | null
          tipo_alerta: string
          updated_at?: string | null
          veiculo_id: string
        }
        Update: {
          created_at?: string | null
          data_alerta?: string
          descricao?: string | null
          id?: string
          resolvido?: boolean | null
          tipo_alerta?: string
          updated_at?: string | null
          veiculo_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "veiculos_alertas_veiculo_id_fkey"
            columns: ["veiculo_id"]
            isOneToOne: false
            referencedRelation: "patrimonios_veiculos"
            referencedColumns: ["id"]
          },
        ]
      }
      veiculos_inspecoes: {
        Row: {
          centro_inspecao: string | null
          created_at: string | null
          custo: number | null
          data_inspecao: string
          id: string
          observacoes: string | null
          proxima_inspecao: string | null
          resultado: string | null
          updated_at: string | null
          veiculo_id: string
        }
        Insert: {
          centro_inspecao?: string | null
          created_at?: string | null
          custo?: number | null
          data_inspecao: string
          id?: string
          observacoes?: string | null
          proxima_inspecao?: string | null
          resultado?: string | null
          updated_at?: string | null
          veiculo_id: string
        }
        Update: {
          centro_inspecao?: string | null
          created_at?: string | null
          custo?: number | null
          data_inspecao?: string
          id?: string
          observacoes?: string | null
          proxima_inspecao?: string | null
          resultado?: string | null
          updated_at?: string | null
          veiculo_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "veiculos_inspecoes_veiculo_id_fkey"
            columns: ["veiculo_id"]
            isOneToOne: false
            referencedRelation: "patrimonios_veiculos"
            referencedColumns: ["id"]
          },
        ]
      }
      veiculos_iuc: {
        Row: {
          ano_referencia: number
          created_at: string | null
          data_limite: string | null
          data_pagamento: string | null
          id: string
          observacoes: string | null
          pago: boolean | null
          updated_at: string | null
          valor: number
          veiculo_id: string
        }
        Insert: {
          ano_referencia: number
          created_at?: string | null
          data_limite?: string | null
          data_pagamento?: string | null
          id?: string
          observacoes?: string | null
          pago?: boolean | null
          updated_at?: string | null
          valor?: number
          veiculo_id: string
        }
        Update: {
          ano_referencia?: number
          created_at?: string | null
          data_limite?: string | null
          data_pagamento?: string | null
          id?: string
          observacoes?: string | null
          pago?: boolean | null
          updated_at?: string | null
          valor?: number
          veiculo_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "veiculos_iuc_veiculo_id_fkey"
            columns: ["veiculo_id"]
            isOneToOne: false
            referencedRelation: "patrimonios_veiculos"
            referencedColumns: ["id"]
          },
        ]
      }
      veiculos_seguros: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          data_fim: string
          data_inicio: string
          fornecedor_id: string | null
          id: string
          numero_apolice: string | null
          observacoes: string | null
          tipo_cobertura: string | null
          updated_at: string | null
          valor_premio: number | null
          veiculo_id: string
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          data_fim: string
          data_inicio: string
          fornecedor_id?: string | null
          id?: string
          numero_apolice?: string | null
          observacoes?: string | null
          tipo_cobertura?: string | null
          updated_at?: string | null
          valor_premio?: number | null
          veiculo_id: string
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          data_fim?: string
          data_inicio?: string
          fornecedor_id?: string | null
          id?: string
          numero_apolice?: string | null
          observacoes?: string | null
          tipo_cobertura?: string | null
          updated_at?: string | null
          valor_premio?: number | null
          veiculo_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "veiculos_seguros_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "fornecedores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "veiculos_seguros_veiculo_id_fkey"
            columns: ["veiculo_id"]
            isOneToOne: false
            referencedRelation: "patrimonios_veiculos"
            referencedColumns: ["id"]
          },
        ]
      }
      website_contacts: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          is_read: boolean | null
          mensagem: string
          nome: string
          telefone: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          is_read?: boolean | null
          mensagem: string
          nome: string
          telefone?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          is_read?: boolean | null
          mensagem?: string
          nome?: string
          telefone?: string | null
        }
        Relationships: []
      }
      website_gallery: {
        Row: {
          alt_text: string | null
          category: string | null
          created_at: string | null
          id: string
          image_url: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          alt_text?: string | null
          category?: string | null
          created_at?: string | null
          id?: string
          image_url: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          alt_text?: string | null
          category?: string | null
          created_at?: string | null
          id?: string
          image_url?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      website_pages: {
        Row: {
          content: Json | null
          created_at: string | null
          id: string
          page_key: string
          title: string
          updated_at: string | null
        }
        Insert: {
          content?: Json | null
          created_at?: string | null
          id?: string
          page_key: string
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: Json | null
          created_at?: string | null
          id?: string
          page_key?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      website_projects: {
        Row: {
          cover_image: string | null
          created_at: string | null
          date: string | null
          description: string | null
          id: string
          images: string[] | null
          is_featured: boolean | null
          is_published: boolean | null
          location: string | null
          slug: string
          sort_order: number | null
          title: string
          type: string | null
          updated_at: string | null
        }
        Insert: {
          cover_image?: string | null
          created_at?: string | null
          date?: string | null
          description?: string | null
          id?: string
          images?: string[] | null
          is_featured?: boolean | null
          is_published?: boolean | null
          location?: string | null
          slug: string
          sort_order?: number | null
          title: string
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          cover_image?: string | null
          created_at?: string | null
          date?: string | null
          description?: string | null
          id?: string
          images?: string[] | null
          is_featured?: boolean | null
          is_published?: boolean | null
          location?: string | null
          slug?: string
          sort_order?: number | null
          title?: string
          type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      website_services: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          sort_order: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          sort_order?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          sort_order?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      website_settings: {
        Row: {
          created_at: string | null
          id: string
          label: string | null
          setting_key: string
          setting_value: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          label?: string | null
          setting_key: string
          setting_value: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          label?: string | null
          setting_key?: string
          setting_value?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      work_shift_schedules: {
        Row: {
          break_end_time: string | null
          break_start_time: string | null
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          is_active: boolean
          shift_id: string
          start_time: string
          updated_at: string
        }
        Insert: {
          break_end_time?: string | null
          break_start_time?: string | null
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          is_active?: boolean
          shift_id: string
          start_time: string
          updated_at?: string
        }
        Update: {
          break_end_time?: string | null
          break_start_time?: string | null
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          is_active?: boolean
          shift_id?: string
          start_time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_shift_schedules_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "work_shifts"
            referencedColumns: ["id"]
          },
        ]
      }
      work_shifts: {
        Row: {
          break_tolerance_minutes: number | null
          created_at: string
          description: string | null
          early_tolerance_minutes: number | null
          id: string
          is_active: boolean
          late_tolerance_minutes: number | null
          name: string
          updated_at: string
        }
        Insert: {
          break_tolerance_minutes?: number | null
          created_at?: string
          description?: string | null
          early_tolerance_minutes?: number | null
          id?: string
          is_active?: boolean
          late_tolerance_minutes?: number | null
          name: string
          updated_at?: string
        }
        Update: {
          break_tolerance_minutes?: number | null
          created_at?: string
          description?: string | null
          early_tolerance_minutes?: number | null
          id?: string
          is_active?: boolean
          late_tolerance_minutes?: number | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      vw_falta_clock_in_hoje: {
        Row: {
          name: string | null
          phone: string | null
          user_id: string | null
        }
        Relationships: []
      }
      vw_falta_clock_out_hoje: {
        Row: {
          name: string | null
          phone: string | null
          user_id: string | null
        }
        Relationships: []
      }
      vw_falta_lunch_end_hoje: {
        Row: {
          name: string | null
          phone: string | null
          user_id: string | null
        }
        Relationships: []
      }
      vw_falta_lunch_start_hoje: {
        Row: {
          name: string | null
          phone: string | null
          user_id: string | null
        }
        Relationships: []
      }
      vw_pontos_faltantes_semana: {
        Row: {
          dia_sem_registro: string | null
          name: string | null
          phone: string | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      apply_balance_to_payment: {
        Args: { p_employee_id: string; p_payment_amount: number }
        Returns: {
          balance_applied: number
          final_payment_amount: number
          remaining_balance: number
        }[]
      }
      calculate_monthly_analytics: { Args: never; Returns: undefined }
      calculate_monthly_pending_items: {
        Args: { target_month: number; target_year: number }
        Returns: {
          employee_id: string
          pending_allowances: number
          pending_overtime_hours: number
          pending_overtime_value: number
          pending_salary_advance: number
        }[]
      }
      calculate_period_pending_items: {
        Args: { end_date: string; start_date: string }
        Returns: {
          employee_id: string
          pending_allowances: number
          pending_overtime_hours: number
          pending_overtime_value: number
          pending_salary_advance: number
        }[]
      }
      calculate_vacation_entitlement: {
        Args: { employee_id: string; reference_year: number }
        Returns: {
          accumulated_days: number
          admission_year: boolean
          enjoyment_deadline: string
          total_days: number
          vesting_date: string
        }[]
      }
      check_email_availability: { Args: { check_email: string }; Returns: Json }
      check_excessive_overtime: { Args: never; Returns: undefined }
      check_incomplete_records: { Args: never; Returns: undefined }
      cleanup_expired_sessions: { Args: never; Returns: undefined }
      cleanup_orphan_users: { Args: never; Returns: Json }
      count_working_days: {
        Args: { end_date: string; start_date: string }
        Returns: number
      }
      count_working_days_elapsed: {
        Args: { target_month: number; target_year: number }
        Returns: number
      }
      count_working_days_in_month: {
        Args: { target_month: number; target_year: number }
        Returns: number
      }
      create_or_update_employee_balance: {
        Args: {
          p_calculated_amount: number
          p_description?: string
          p_employee_id: string
          p_paid_amount: number
          p_period_end: string
          p_period_start: string
        }
        Returns: string
      }
      expire_old_hour_bank_hours: { Args: never; Returns: undefined }
      get_audit_logs: {
        Args: {
          p_end_date?: string
          p_limit?: number
          p_record_id?: string
          p_start_date?: string
          p_table_name?: string
        }
        Returns: {
          changed_fields: string[]
          created_at: string
          id: string
          new_values: Json
          old_values: Json
          operation: string
          record_id: string
          table_name: string
          user_email: string
          user_role: string
        }[]
      }
      get_audit_statistics: {
        Args: never
        Returns: {
          deletes: number
          inserts: number
          last_activity: string
          table_name: string
          total_operations: number
          updates: number
        }[]
      }
      get_current_user_role: { Args: never; Returns: string }
      get_employee_accumulated_balance: {
        Args: { p_employee_id: string }
        Returns: number
      }
      get_employee_balances_with_names: {
        Args: never
        Returns: {
          accumulated_balance: number
          balance_type: string
          employee_id: string
          employee_name: string
          id: string
          last_updated: string
        }[]
      }
      get_hourly_rate_at_date: {
        Args: { employee_uuid: string; target_date: string }
        Returns: {
          hourly_rate: number
          overtime_rate: number
        }[]
      }
      get_national_holidays_by_year: {
        Args: { target_year: number }
        Returns: {
          date: string
          description: string
          id: string
          is_mandatory: boolean
        }[]
      }
      get_payroll_overtime_setting: {
        Args: { target_month: number; target_year: number }
        Returns: boolean
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      is_admin_user: { Args: never; Returns: boolean }
      is_month_closed: { Args: { check_date: string }; Returns: boolean }
      is_national_holiday: { Args: { check_date: string }; Returns: boolean }
      is_working_day: { Args: { check_date: string }; Returns: boolean }
      process_automatic_transfers: {
        Args: {
          from_month: number
          from_year: number
          to_month: number
          to_year: number
        }
        Returns: undefined
      }
      process_hour_bank: {
        Args: {
          p_employee_id: string
          p_time_record_id: string
          p_work_date: string
          p_worked_hours: number
        }
        Returns: undefined
      }
      process_vacation_request: {
        Args: {
          p_action: string
          p_approver_id: string
          p_justification?: string
          p_request_id: string
        }
        Returns: undefined
      }
      send_scheduled_push_notifications: {
        Args: { check_time: string; notification_type: string }
        Returns: undefined
      }
      set_payroll_overtime_setting: {
        Args: {
          pay_overtime: boolean
          target_month: number
          target_year: number
        }
        Returns: undefined
      }
      update_monthly_expected_hours: { Args: never; Returns: undefined }
      update_vacation_balance: {
        Args: { p_employee_id: string; p_year: number }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "super_admin" | "user"
      despesa_status: "pendente" | "aprovada" | "paga" | "cancelada"
      employee_status: "active" | "inactive"
      fatura_status:
        | "pendente"
        | "parcialmente_paga"
        | "paga"
        | "cancelada"
        | "vencida"
      fornecedor_status: "ativo" | "inativo"
      orcamento_status: "rascunho" | "enviado" | "aprovado" | "rejeitado"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "super_admin", "user"],
      despesa_status: ["pendente", "aprovada", "paga", "cancelada"],
      employee_status: ["active", "inactive"],
      fatura_status: [
        "pendente",
        "parcialmente_paga",
        "paga",
        "cancelada",
        "vencida",
      ],
      fornecedor_status: ["ativo", "inativo"],
      orcamento_status: ["rascunho", "enviado", "aprovado", "rejeitado"],
    },
  },
} as const
