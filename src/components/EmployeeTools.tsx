import React, { useState } from 'react';
import { useOptimizedAuth } from '@/contexts/OptimizedAuthContext';
import { Wrench, QrCode, Loader2, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { useEmployeeTools, EmployeeTool } from '@/hooks/useEmployeeTools';
import ToolQrScanner from '@/components/ToolQrScanner';

const estadoLabel: Record<string, string> = {
  disponivel: 'Disponível',
  em_obra: 'Em obra',
};

const estadoVariant: Record<string, 'default' | 'secondary' | 'outline'> = {
  disponivel: 'outline',
  em_obra: 'default',
};

export default function EmployeeTools() {
  const { user, profile } = useOptimizedAuth();
  const { toast } = useToast();
  const employeeId = user?.id ?? '';
  const funcionarioNome = profile?.name ?? user?.email ?? 'Funcionário';

  const {
    tools,
    obras,
    loading,
    error,
    refetch,
    findToolByPatrimonio,
    registerToolMovement,
  } = useEmployeeTools(employeeId);

  const [scannerOpen, setScannerOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState<EmployeeTool | null>(null);
  const [selectedObraId, setSelectedObraId] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [lookingUp, setLookingUp] = useState(false);

  const resetTransferForm = () => {
    setSelectedTool(null);
    setSelectedObraId('');
    setObservacoes('');
  };

  const handleQrScan = async (codigo: string) => {
    setLookingUp(true);
    try {
      const tool = await findToolByPatrimonio(codigo);
      if (!tool) {
        toast({
          title: 'Ferramenta não encontrada',
          description: 'Nenhuma ferramenta corresponde a este QR Code.',
          variant: 'destructive',
        });
        return;
      }

      if (
        tool.funcionario_atual_id &&
        tool.funcionario_atual_id !== employeeId
      ) {
        toast({
          title: 'Ferramenta indisponível',
          description: `Esta ferramenta está com ${tool.funcionario_atual_nome ?? 'outro funcionário'}.`,
          variant: 'destructive',
        });
        return;
      }

      setSelectedTool(tool);
      setTransferOpen(true);
    } catch {
      toast({
        title: 'Erro',
        description: 'Não foi possível buscar a ferramenta.',
        variant: 'destructive',
      });
    } finally {
      setLookingUp(false);
    }
  };

  const handleConfirmTransfer = async () => {
    if (!selectedTool || !selectedObraId || !employeeId) return;

    const obra = obras.find((o) => o.id === selectedObraId);
    if (!obra) {
      toast({
        title: 'Obra inválida',
        description: 'Selecione uma obra válida.',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      await registerToolMovement({
        tool: selectedTool,
        obraId: obra.id,
        obraNome: obra.nome,
        funcionarioId: employeeId,
        funcionarioNome,
        observacoes: observacoes.trim() || undefined,
      });

      toast({
        title: 'Movimentação registrada',
        description: `${selectedTool.nome} foi vinculada à obra ${obra.nome}.`,
      });

      setTransferOpen(false);
      resetTransferForm();
      refetch();
    } catch (err) {
      toast({
        title: 'Erro ao registrar',
        description: err instanceof Error ? err.message : 'Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Wrench className="h-6 w-6 text-blue-600" />
          <h1 className="text-xl font-bold">Ferramentas</h1>
        </div>
        <Button
          onClick={() => setScannerOpen(true)}
          disabled={lookingUp}
          className="gap-2"
        >
          {lookingUp ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <QrCode className="h-4 w-4" />
          )}
          Ler QR Code
        </Button>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive text-center">{error}</p>
      )}

      {!loading && !error && tools.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            <Wrench className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p>Nenhuma ferramenta vinculada a você.</p>
            <p className="text-sm mt-1">
              Use o botão &quot;Ler QR Code&quot; para retirar uma ferramenta.
            </p>
          </CardContent>
        </Card>
      )}

      {!loading && tools.length > 0 && (
        <div className="space-y-3">
          {tools.map((tool) => (
            <Card key={tool.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base">{tool.nome}</CardTitle>
                  <Badge variant={estadoVariant[tool.estado] ?? 'secondary'}>
                    {estadoLabel[tool.estado] ?? tool.estado}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-1 text-sm text-muted-foreground">
                <p>
                  <span className="font-medium text-foreground">Patrimônio:</span>{' '}
                  {tool.numero_patrimonio}
                </p>
                {tool.modelo && (
                  <p>
                    <span className="font-medium text-foreground">Modelo:</span>{' '}
                    {tool.modelo}
                  </p>
                )}
                {tool.obra?.nome && (
                  <p className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {tool.obra.nome}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ToolQrScanner
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScan={handleQrScan}
      />

      <Dialog
        open={transferOpen}
        onOpenChange={(open) => {
          setTransferOpen(open);
          if (!open) resetTransferForm();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Levar ferramenta para obra</DialogTitle>
          </DialogHeader>

          {selectedTool && (
            <div className="space-y-4">
              <div className="rounded-lg border p-3 text-sm space-y-1">
                <p className="font-medium">{selectedTool.nome}</p>
                <p className="text-muted-foreground">
                  Patrimônio: {selectedTool.numero_patrimonio}
                </p>
                {selectedTool.modelo && (
                  <p className="text-muted-foreground">
                    Modelo: {selectedTool.modelo}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="obra-select">Obra de destino</Label>
                <Select value={selectedObraId} onValueChange={setSelectedObraId}>
                  <SelectTrigger id="obra-select">
                    <SelectValue placeholder="Selecione a obra" />
                  </SelectTrigger>
                  <SelectContent>
                    {obras.map((obra) => (
                      <SelectItem key={obra.id} value={obra.id}>
                        {obra.nome}
                        {obra.codigo ? ` (${obra.codigo})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações (opcional)</Label>
                <Textarea
                  id="observacoes"
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Informações adicionais..."
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setTransferOpen(false);
                resetTransferForm();
              }}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmTransfer}
              disabled={!selectedObraId || submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Registrando...
                </>
              ) : (
                'Confirmar'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
