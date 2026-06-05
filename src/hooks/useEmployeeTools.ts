import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface EmployeeTool {
  id: string;
  numero_patrimonio: string;
  nome: string;
  numero_serie: string | null;
  modelo: string | null;
  foto_url: string | null;
  estado: string;
  funcionario_atual_id: string | null;
  funcionario_atual_nome: string | null;
  obra_atual_id: string | null;
  observacoes: string | null;
  obra?: { id: string; nome: string } | null;
}

export interface Obra {
  id: string;
  nome: string;
  codigo: string | null;
  status: string;
}

export function parsePatrimonioFromQr(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return trimmed;
  if (trimmed.includes('/')) {
    const segment = trimmed.split('/').filter(Boolean).pop();
    if (segment) return segment.trim();
  }
  return trimmed;
}

export function useEmployeeTools(employeeId: string | undefined | null) {
  const [tools, setTools] = useState<EmployeeTool[]>([]);
  const [obras, setObras] = useState<Obra[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTools = useCallback(async () => {
    if (!employeeId) return;
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from('patrimonios_ferramentas')
      .select('*, obra:obra_atual_id(id, nome)')
      .eq('funcionario_atual_id', employeeId)
      .order('nome');

    if (fetchError) {
      setError('Erro ao buscar ferramentas.');
      setLoading(false);
      return;
    }

    setTools((data ?? []) as EmployeeTool[]);
    setLoading(false);
  }, [employeeId]);

  const fetchObras = useCallback(async () => {
    const { data, error: fetchError } = await supabase
      .from('obras')
      .select('id, nome, codigo, status')
      .order('nome');

    if (fetchError) {
      console.error('Erro ao buscar obras:', fetchError);
      return;
    }

    setObras((data ?? []) as Obra[]);
  }, []);

  useEffect(() => {
    fetchTools();
    fetchObras();
  }, [fetchTools, fetchObras]);

  const findToolByPatrimonio = useCallback(async (codigo: string) => {
    const numeroPatrimonio = parsePatrimonioFromQr(codigo);
    const { data, error: fetchError } = await supabase
      .from('patrimonios_ferramentas')
      .select('*')
      .eq('numero_patrimonio', numeroPatrimonio)
      .maybeSingle();

    if (fetchError) {
      throw new Error('Erro ao buscar ferramenta.');
    }

    return data as EmployeeTool | null;
  }, []);

  const registerToolMovement = useCallback(
    async ({
      tool,
      obraId,
      obraNome,
      funcionarioId,
      funcionarioNome,
      observacoes,
    }: {
      tool: EmployeeTool;
      obraId: string;
      obraNome: string;
      funcionarioId: string;
      funcionarioNome: string;
      observacoes?: string;
    }) => {
      if (
        tool.funcionario_atual_id &&
        tool.funcionario_atual_id !== funcionarioId
      ) {
        throw new Error(
          `Esta ferramenta está com ${tool.funcionario_atual_nome ?? 'outro funcionário'}.`
        );
      }

      const isTransfer =
        tool.estado === 'em_obra' &&
        tool.funcionario_atual_id === funcionarioId &&
        tool.obra_atual_id !== obraId;

      const tipo = tool.estado === 'disponivel' ? 'retirada' : isTransfer ? 'transferencia' : 'retirada';

      let obraAnteriorNome: string | null = null;
      if (tool.obra_atual_id) {
        const obraAtual = obras.find((o) => o.id === tool.obra_atual_id);
        obraAnteriorNome = obraAtual?.nome ?? null;
        if (!obraAnteriorNome) {
          const { data: obraData } = await supabase
            .from('obras')
            .select('nome')
            .eq('id', tool.obra_atual_id)
            .maybeSingle();
          obraAnteriorNome = obraData?.nome ?? null;
        }
      }

      const { error: movimentoError } = await supabase
        .from('patrimonios_ferramentas_movimentos')
        .insert({
          ferramenta_id: tool.id,
          tipo,
          funcionario_id: funcionarioId,
          funcionario_nome: funcionarioNome,
          obra_id: obraId,
          obra_nome: obraNome,
          funcionario_anterior_id: tool.funcionario_atual_id,
          funcionario_anterior_nome: tool.funcionario_atual_nome,
          obra_anterior_id: tool.obra_atual_id,
          obra_anterior_nome: obraAnteriorNome,
          transferencia_escopo: isTransfer ? 'obra' : null,
          observacoes: observacoes || null,
          created_by: funcionarioId,
        });

      if (movimentoError) {
        throw new Error('Erro ao registrar movimentação.');
      }

      const { error: updateError } = await supabase
        .from('patrimonios_ferramentas')
        .update({
          funcionario_atual_id: funcionarioId,
          funcionario_atual_nome: funcionarioNome,
          obra_atual_id: obraId,
          estado: 'em_obra',
        })
        .eq('id', tool.id);

      if (updateError) {
        throw new Error('Erro ao atualizar ferramenta.');
      }
    },
    [obras]
  );

  const resolveObraNome = useCallback(
    async (obraId: string | null, tool?: EmployeeTool) => {
      if (!obraId) return null;
      if (tool?.obra?.nome) return tool.obra.nome;
      const obraAtual = obras.find((o) => o.id === obraId);
      if (obraAtual?.nome) return obraAtual.nome;
      const { data: obraData } = await supabase
        .from('obras')
        .select('nome')
        .eq('id', obraId)
        .maybeSingle();
      return obraData?.nome ?? null;
    },
    [obras]
  );

  const returnSingleTool = useCallback(
    async ({
      tool,
      funcionarioId,
      funcionarioNome,
      observacoes,
    }: {
      tool: EmployeeTool;
      funcionarioId: string;
      funcionarioNome: string;
      observacoes?: string;
    }) => {
      if (tool.funcionario_atual_id !== funcionarioId) {
        throw new Error(
          `A ferramenta "${tool.nome}" não pertence a você.`
        );
      }

      if (tool.estado !== 'em_obra') {
        throw new Error(
          `A ferramenta "${tool.nome}" já está disponível.`
        );
      }

      const obraAnteriorNome = await resolveObraNome(tool.obra_atual_id, tool);

      const { error: movimentoError } = await supabase
        .from('patrimonios_ferramentas_movimentos')
        .insert({
          ferramenta_id: tool.id,
          tipo: 'devolucao',
          funcionario_id: funcionarioId,
          funcionario_nome: funcionarioNome,
          obra_id: null,
          obra_nome: null,
          funcionario_anterior_id: tool.funcionario_atual_id,
          funcionario_anterior_nome: tool.funcionario_atual_nome,
          obra_anterior_id: tool.obra_atual_id,
          obra_anterior_nome: obraAnteriorNome,
          observacoes: observacoes || null,
          created_by: funcionarioId,
        });

      if (movimentoError) {
        throw new Error(`Erro ao registrar devolução de "${tool.nome}".`);
      }

      const { error: updateError } = await supabase
        .from('patrimonios_ferramentas')
        .update({
          funcionario_atual_id: null,
          funcionario_atual_nome: null,
          obra_atual_id: null,
          estado: 'disponivel',
        })
        .eq('id', tool.id);

      if (updateError) {
        throw new Error(`Erro ao atualizar "${tool.nome}" após devolução.`);
      }
    },
    [resolveObraNome]
  );

  const registerToolReturn = useCallback(
    async ({
      tool,
      funcionarioId,
      funcionarioNome,
      observacoes,
    }: {
      tool: EmployeeTool;
      funcionarioId: string;
      funcionarioNome: string;
      observacoes?: string;
    }) => {
      await returnSingleTool({ tool, funcionarioId, funcionarioNome, observacoes });
    },
    [returnSingleTool]
  );

  const registerBulkToolReturn = useCallback(
    async ({
      tools: toolsToReturn,
      funcionarioId,
      funcionarioNome,
      observacoes,
    }: {
      tools: EmployeeTool[];
      funcionarioId: string;
      funcionarioNome: string;
      observacoes?: string;
    }) => {
      for (const tool of toolsToReturn) {
        await returnSingleTool({ tool, funcionarioId, funcionarioNome, observacoes });
      }
      return toolsToReturn.length;
    },
    [returnSingleTool]
  );

  return {
    tools,
    obras,
    loading,
    error,
    refetch: fetchTools,
    findToolByPatrimonio,
    registerToolMovement,
    registerToolReturn,
    registerBulkToolReturn,
  };
}
