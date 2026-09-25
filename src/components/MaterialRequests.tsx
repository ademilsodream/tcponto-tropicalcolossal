import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { z } from 'zod';
import { format } from 'date-fns';
import { ShoppingCart, Loader2, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useOptimizedAuth } from '@/contexts/OptimizedAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Pedido = {
  id: string;
  obra_id: string;
  data_uso: string;
  lista_materiais: string;
  observacoes: string | null;
  status: string;
  motivo_recusa: string | null;
  entregue_em: string | null;
  created_at: string;
};

const statusLabel: Record<string, string> = {
  pendente: 'Pendente',
  aceito: 'Aceito',
  recusado: 'Recusado',
  entregue: 'Entregue',
  cancelado: 'Cancelado',
};
const statusVariant: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  pendente: 'secondary',
  aceito: 'default',
  recusado: 'destructive',
  entregue: 'default',
  cancelado: 'outline',
};

const today = () => format(new Date(), 'yyyy-MM-dd');

const schema = z.object({
  obra_id: z.string().uuid({ message: 'Escolha a obra' }),
  data_uso: z.string().refine((d) => d >= today(), { message: 'A data não pode ser no passado' }),
  lista_materiais: z.string().trim().min(1, 'Digite a lista de materiais').max(5000, 'Máximo 5000 caracteres'),
  observacoes: z.string().trim().max(1000, 'Máximo 1000 caracteres').optional(),
});

const fmtDate = (d: string) => {
  const [y, m, day] = d.slice(0, 10).split('-');
  return `${day}/${m}/${y}`;
};

export default function MaterialRequests() {
  const { user } = useOptimizedAuth();
  const { toast } = useToast();
  const [obras, setObras] = useState<{ id: string; nome: string }[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('novo');
  const [form, setForm] = useState({ obra_id: '', data_uso: today(), lista_materiais: '', observacoes: '' });

  const loadPedidos = useCallback(async () => {
    if (!user?.id) return;
    const { data, error } = await (supabase as any)
      .from('pedidos_materiais')
      .select('id, obra_id, data_uso, lista_materiais, observacoes, status, motivo_recusa, entregue_em, created_at')
      .eq('solicitante_id', user.id)
      .order('created_at', { ascending: false });
    if (!error) setPedidos((data as Pedido[]) || []);
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    supabase
      .from('obras')
      .select('id, nome, status')
      .then(({ data }) => {
        const list = (data || [])
          .filter((o: any) => !o.status || !['concluida', 'concluída', 'cancelada', 'inativa'].includes(String(o.status).toLowerCase()))
          .map((o: any) => ({ id: o.id, nome: o.nome }))
          .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
        setObras(list);
      });
    loadPedidos();
  }, [loadPedidos]);

  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel('pedidos_materiais_' + user.id)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pedidos_materiais', filter: `solicitante_id=eq.${user.id}` }, () => loadPedidos())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, loadPedidos]);

  const obraNome = useMemo(() => Object.fromEntries(obras.map((o) => [o.id, o.nome])), [obras]);
  const abertos = pedidos.filter((p) => p.status !== 'entregue');
  const entregues = pedidos.filter((p) => p.status === 'entregue');

  const submit = async () => {
    const parsed = schema.safeParse({ ...form, observacoes: form.observacoes || undefined });
    if (!parsed.success) {
      toast({ title: 'Verifique o pedido', description: parsed.error.errors[0].message, variant: 'destructive' });
      return;
    }
    setSaving(true);
    const { error } = await (supabase as any).from('pedidos_materiais').insert({
      ...parsed.data,
      observacoes: parsed.data.observacoes ?? null,
      solicitante_id: user!.id,
    });
    setSaving(false);
    if (error) {
      toast({ title: 'Erro ao enviar pedido', description: 'Tente novamente.', variant: 'destructive' });
      return;
    }
    toast({ title: 'Pedido enviado', description: 'O pedido foi enviado para o TCObras.' });
    setForm({ obra_id: '', data_uso: today(), lista_materiais: '', observacoes: '' });
    await loadPedidos();
    setTab('solicitacoes');
  };

  const cancelar = async (id: string) => {
    const { error } = await (supabase as any).from('pedidos_materiais').update({ status: 'cancelado' }).eq('id', id);
    if (error) toast({ title: 'Não foi possível cancelar', variant: 'destructive' });
    else loadPedidos();
  };

  const renderList = (list: Pedido[], empty: string) =>
    loading ? (
      <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
    ) : list.length === 0 ? (
      <p className="py-8 text-center text-sm text-muted-foreground">{empty}</p>
    ) : (
      <div className="space-y-3">
        {list.map((p) => (
          <Card key={p.id}>
            <CardContent className="space-y-2 p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">{obraNome[p.obra_id] || 'Obra'}</p>
                  <p className="text-xs text-muted-foreground">
                    Pedido em {fmtDate(p.created_at)} · Uso em {fmtDate(p.data_uso)}
                  </p>
                </div>
                <Badge variant={statusVariant[p.status]}>{statusLabel[p.status] || p.status}</Badge>
              </div>
              <p className="whitespace-pre-wrap text-sm">{p.lista_materiais}</p>
              {p.observacoes && <p className="text-xs text-muted-foreground">Obs.: {p.observacoes}</p>}
              {p.status === 'recusado' && p.motivo_recusa && (
                <p className="text-xs text-destructive">Motivo: {p.motivo_recusa}</p>
              )}
              {p.status === 'entregue' && p.entregue_em && (
                <p className="text-xs text-muted-foreground">Entregue em {fmtDate(p.entregue_em)}</p>
              )}
              {p.status === 'pendente' && (
                <Button size="sm" variant="outline" onClick={() => cancelar(p.id)}>
                  <X className="mr-1 h-4 w-4" /> Cancelar pedido
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );

  return (
    <div className="mx-auto max-w-3xl p-4 pt-20">
      <div className="mb-4 flex items-center gap-2">
        <ShoppingCart className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Compras</h1>
      </div>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="novo">Novo pedido</TabsTrigger>
          <TabsTrigger value="solicitacoes">Solicitações ({abertos.length})</TabsTrigger>
          <TabsTrigger value="entregues">Entregues ({entregues.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="novo">
          <Card>
            <CardHeader><CardTitle className="text-lg">Pedido de materiais</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label>Obra</Label>
                <Select value={form.obra_id} onValueChange={(v) => setForm((f) => ({ ...f, obra_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Escolha a obra" /></SelectTrigger>
                  <SelectContent>
                    {obras.map((o) => <SelectItem key={o.id} value={o.id}>{o.nome}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Data de uso dos materiais</Label>
                <Input type="date" min={today()} value={form.data_uso} onChange={(e) => setForm((f) => ({ ...f, data_uso: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Lista de materiais</Label>
                <Textarea rows={6} maxLength={5000} placeholder="Ex.: 20 sacos de cimento, 5 tubos PVC 50mm" value={form.lista_materiais} onChange={(e) => setForm((f) => ({ ...f, lista_materiais: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Observações (opcional)</Label>
                <Textarea rows={2} maxLength={1000} value={form.observacoes} onChange={(e) => setForm((f) => ({ ...f, observacoes: e.target.value }))} />
              </div>
              <Button className="w-full" onClick={submit} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Enviar pedido
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="solicitacoes">{renderList(abertos, 'Nenhuma solicitação em aberto.')}</TabsContent>
        <TabsContent value="entregues">{renderList(entregues, 'Nenhum pedido entregue ainda.')}</TabsContent>
      </Tabs>
    </div>
  );
}
