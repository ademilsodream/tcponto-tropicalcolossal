import React, { useMemo, useState } from 'react';
import { useOptimizedAuth } from '@/contexts/OptimizedAuthContext';
import { Wrench, QrCode, Loader2, MapPin, Undo2, X, ArrowRightLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
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
    employees,
    registerToolReturn,
    registerBulkToolReturn,
    registerEmployeeTransfer,
  } = useEmployeeTools(employeeId);

  const [scannerOpen, setScannerOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [employeeTransferOpen, setEmployeeTransferOpen] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState<EmployeeTool | null>(null);
  const [employeeTransferTool, setEmployeeTransferTool] = useState<EmployeeTool | null>(null);
  const [returnTools, setReturnTools] = useState<EmployeeTool[]>([]);
  const [selectedObraId, setSelectedObraId] = useState('');
  const [selectedDestEmployeeId, setSelectedDestEmployeeId] = useState('');
  const [employeeTransferObraId, setEmployeeTransferObraId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [lookingUp, setLookingUp] = useState(false);
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toolsEmObra = useMemo(
    () => tools.filter((t) => t.estado === 'em_obra'),
    [tools]
  );

  const isBulkReturn = returnTools.length > 1;

  const getValidObraPrefill = (obraAtualId: string | null) => {
    if (!obraAtualId) return '';
    return obras.some((o) => o.id === obraAtualId) ? obraAtualId : '';
  };

  const resetTransferForm = () => {
    setSelectedTool(null);
    setSelectedObraId('');
  };

  const resetReturnForm = () => {
    setReturnTools([]);
  };

  const resetEmployeeTransferForm = () => {
    setEmployeeTransferTool(null);
    setSelectedDestEmployeeId('');
    setEmployeeTransferObraId('');
  };

  const openEmployeeTransfer = (tool: EmployeeTool) => {
    setEmployeeTransferTool(tool);
    setEmployeeTransferObraId(getValidObraPrefill(tool.obra_atual_id));
    setEmployeeTransferOpen(true);
  };

  const exitBulkMode = () => {
    setBulkMode(false);
    setSelectedIds(new Set());
  };

  const toggleToolSelection = (toolId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(toolId)) {
        next.delete(toolId);
      } else {
        next.add(toolId);
      }
      return next;
    });
  };

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(toolsEmObra.map((t) => t.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const openSingleReturn = (tool: EmployeeTool) => {
    setReturnTools([tool]);
    setReturnOpen(true);
  };

  const openBulkReturn = () => {
    const selected = tools.filter((t) => selectedIds.has(t.id));
    if (selected.length === 0) return;
    setReturnTools(selected);
    setReturnOpen(true);
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
      setSelectedObraId(getValidObraPrefill(tool.obra_atual_id));
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

  const handleConfirmEmployeeTransfer = async () => {
    if (!employeeTransferTool || !selectedDestEmployeeId || !employeeTransferObraId || !employeeId) {
      return;
    }

    const destEmployee = employees.find((e) => e.id === selectedDestEmployeeId);
    const obra = obras.find((o) => o.id === employeeTransferObraId);

    if (!destEmployee) {
      toast({
        title: 'Funcionário inválido',
        description: 'Selecione um funcionário válido.',
        variant: 'destructive',
      });
      return;
    }

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
      await registerEmployeeTransfer({
        tool: employeeTransferTool,
        destFuncionarioId: destEmployee.id,
        destFuncionarioNome: destEmployee.name,
        obraId: obra.id,
        obraNome: obra.nome,
        currentFuncionarioId: employeeId,
        currentFuncionarioNome: funcionarioNome,
      });

      toast({
        title: 'Transferência registrada',
        description: `${employeeTransferTool.nome} foi transferida para ${destEmployee.name}.`,
      });

      setEmployeeTransferOpen(false);
      resetEmployeeTransferForm();
      refetch();
    } catch (err) {
      toast({
        title: 'Erro ao transferir',
        description: err instanceof Error ? err.message : 'Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmReturn = async () => {
    if (returnTools.length === 0 || !employeeId) return;

    setSubmitting(true);
    try {
      if (isBulkReturn) {
        const count = await registerBulkToolReturn({
          tools: returnTools,
          funcionarioId: employeeId,
          funcionarioNome,
        });

        toast({
          title: 'Devolução em massa registrada',
          description: `${count} ferramenta(s) devolvida(s) com sucesso.`,
        });

        exitBulkMode();
      } else {
        await registerToolReturn({
          tool: returnTools[0],
          funcionarioId: employeeId,
          funcionarioNome,
        });

        toast({
          title: 'Devolução registrada',
          description: `${returnTools[0].nome} foi devolvida com sucesso.`,
        });
      }

      setReturnOpen(false);
      resetReturnForm();
      refetch();
    } catch (err) {
      toast({
        title: 'Erro ao devolver',
        description: err instanceof Error ? err.message : 'Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const allSelected =
    toolsEmObra.length > 0 && selectedIds.size === toolsEmObra.length;

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4 pb-24">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Wrench className="h-6 w-6 text-blue-600" />
          <h1 className="text-xl font-bold">Ferramentas</h1>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {!bulkMode && toolsEmObra.length > 0 && (
            <Button
              variant="outline"
              onClick={() => setBulkMode(true)}
              className="gap-2"
            >
              <Undo2 className="h-4 w-4" />
              Devolução em massa
            </Button>
          )}
          {bulkMode && (
            <Button variant="outline" onClick={exitBulkMode} className="gap-2">
              <X className="h-4 w-4" />
              Cancelar seleção
            </Button>
          )}
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
          {bulkMode && toolsEmObra.length > 0 && (
            <div className="flex items-center gap-2 px-1">
              <Checkbox
                id="select-all"
                checked={allSelected}
                onCheckedChange={(checked) => toggleSelectAll(checked === true)}
              />
              <Label htmlFor="select-all" className="text-sm cursor-pointer">
                Selecionar todas ({toolsEmObra.length})
              </Label>
            </div>
          )}

          {tools.map((tool) => (
            <Card key={tool.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start gap-3">
                  {bulkMode && tool.estado === 'em_obra' && (
                    <Checkbox
                      checked={selectedIds.has(tool.id)}
                      onCheckedChange={() => toggleToolSelection(tool.id)}
                      className="mt-1"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base">{tool.nome}</CardTitle>
                      <Badge variant={estadoVariant[tool.estado] ?? 'secondary'}>
                        {estadoLabel[tool.estado] ?? tool.estado}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <div className="space-y-1">
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
                </div>

                {!bulkMode && tool.estado === 'em_obra' && (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => openEmployeeTransfer(tool)}
                    >
                      <ArrowRightLeft className="h-4 w-4" />
                      Transferir
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => openSingleReturn(tool)}
                    >
                      <Undo2 className="h-4 w-4" />
                      Devolver
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {bulkMode && selectedIds.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t shadow-lg z-50">
          <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
            <p className="text-sm font-medium">
              {selectedIds.size} ferramenta(s) selecionada(s)
            </p>
            <Button onClick={openBulkReturn} className="gap-2">
              <Undo2 className="h-4 w-4" />
              Devolver selecionadas
            </Button>
          </div>
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

      <Dialog
        open={employeeTransferOpen}
        onOpenChange={(open) => {
          setEmployeeTransferOpen(open);
          if (!open) resetEmployeeTransferForm();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transferir ferramenta</DialogTitle>
          </DialogHeader>

          {employeeTransferTool && (
            <div className="space-y-4">
              <div className="rounded-lg border p-3 text-sm space-y-1">
                <p className="font-medium">{employeeTransferTool.nome}</p>
                <p className="text-muted-foreground">
                  Patrimônio: {employeeTransferTool.numero_patrimonio}
                </p>
                {employeeTransferTool.obra?.nome && (
                  <p className="text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    Obra atual: {employeeTransferTool.obra.nome}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dest-employee-select">Funcionário destino</Label>
                <Select
                  value={selectedDestEmployeeId}
                  onValueChange={setSelectedDestEmployeeId}
                >
                  <SelectTrigger id="dest-employee-select">
                    <SelectValue placeholder="Selecione o funcionário" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.name}
                        {employee.employee_code ? ` (${employee.employee_code})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="employee-transfer-obra">Obra destino</Label>
                <Select
                  value={employeeTransferObraId}
                  onValueChange={setEmployeeTransferObraId}
                >
                  <SelectTrigger id="employee-transfer-obra">
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
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setEmployeeTransferOpen(false);
                resetEmployeeTransferForm();
              }}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmEmployeeTransfer}
              disabled={
                !selectedDestEmployeeId ||
                !employeeTransferObraId ||
                submitting
              }
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Transferindo...
                </>
              ) : (
                'Confirmar transferência'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={returnOpen}
        onOpenChange={(open) => {
          setReturnOpen(open);
          if (!open) resetReturnForm();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isBulkReturn ? 'Confirmar devolução em massa' : 'Confirmar devolução'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {isBulkReturn ? (
              <div className="rounded-lg border p-3 text-sm space-y-2 max-h-48 overflow-y-auto">
                {returnTools.map((tool) => (
                  <div key={tool.id} className="flex justify-between gap-2">
                    <span className="font-medium">{tool.nome}</span>
                    <span className="text-muted-foreground shrink-0">
                      {tool.numero_patrimonio}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              returnTools[0] && (
                <div className="rounded-lg border p-3 text-sm space-y-1">
                  <p className="font-medium">{returnTools[0].nome}</p>
                  <p className="text-muted-foreground">
                    Patrimônio: {returnTools[0].numero_patrimonio}
                  </p>
                  {returnTools[0].obra?.nome && (
                    <p className="text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      Obra: {returnTools[0].obra.nome}
                    </p>
                  )}
                </div>
              )
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setReturnOpen(false);
                resetReturnForm();
              }}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button onClick={handleConfirmReturn} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Devolvendo...
                </>
              ) : isBulkReturn ? (
                `Devolver ${returnTools.length} ferramenta(s)`
              ) : (
                'Confirmar devolução'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
