import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { format } from 'date-fns';
import { Camera, CreditCard, ExternalLink, Loader2, AlertTriangle } from 'lucide-react';
import { FunctionsHttpError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useOptimizedAuth } from '@/contexts/OptimizedAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Capacitor } from '@capacitor/core';
import {
  captureInvoicePhoto,
  hasPendingInvoiceImage,
  requestCameraPermission,
  takePendingInvoiceImage,
  type InvoiceCapture,
} from '@/utils/nativeCamera';
import { describeDiagnostic, parseScanResponse, type ScanDiagnostic, type ScanFields } from '@/utils/scanFaturaResponse';

const db = supabase as any;
const eur = (n: number) => new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(n || 0);

type Fatura = { id: string; fornecedor_id: string | null; fornecedor_nome_lido: string | null; numero_fatura: string; data_fatura: string; valor: number; drive_link: string | null; location_id: string | null };
type Draft = { fornecedor_id: string; fornecedor_nome_lido: string; fornecedor_nif_lido: string; numero_fatura: string; data_fatura: string; valor: string; location_id: string };

type ScanImage = { base64: string; preview: string; mimeType: 'image/jpeg' | 'image/png' | 'image/webp' };

async function errInfo(error: unknown): Promise<{ message: string; diagnostic?: ScanDiagnostic }> {
  if (error instanceof FunctionsHttpError) {
    try {
      const j = await error.context.json();
      return { message: j.error || 'Erro', diagnostic: j.diagnostic };
    } catch { return { message: 'Erro' }; }
  }
  return { message: (error as Error)?.message || 'Erro' };
}
async function errText(error: unknown) {
  return (await errInfo(error)).message;
}

function compressImageFile(file: File): Promise<ScanImage> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const max = 1600;
      const s = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
      c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
      const url = c.toDataURL('image/jpeg', 0.82);
      URL.revokeObjectURL(img.src);
      c.width = 0; c.height = 0;
      resolve({ base64: url.split(',')[1], preview: url, mimeType: 'image/jpeg' });
    };
    img.onerror = () => { URL.revokeObjectURL(img.src); reject(new Error('Imagem inválida')); };
    img.src = URL.createObjectURL(file);
  });
}

async function normalizeImageForScan(
  input: File | InvoiceCapture
): Promise<ScanImage> {
  if (input instanceof File) {
    return compressImageFile(input);
  }
  const mime = input.mimeType;
  const preview = `data:${mime};base64,${input.base64}`;
  if (input.base64.length > 6_000_000) {
    const blob = await (await fetch(preview)).blob();
    return compressImageFile(new File([blob], 'fatura.jpg', { type: mime }));
  }
  const mimeForScan =
    mime === 'image/png' || mime === 'image/webp' ? mime : ('image/jpeg' as const);
  return { base64: input.base64, preview, mimeType: mimeForScan };
}

export default function BusinessCard() {
  const { user } = useOptimizedAuth();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [card, setCard] = useState<{ id: string; card_number: string | null; reference_number: string | null } | null>(null);
  const [credito, setCredito] = useState(0);
  const [faturas, setFaturas] = useState<Fatura[]>([]);
  const [fornecedores, setFornecedores] = useState<{ id: string; nome: string }[]>([]);
  const [obras, setObras] = useState<{ id: string; name: string }[]>([]);
  const [scanning, setScanning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [image, setImage] = useState<ScanImage | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [scanIssue, setScanIssue] = useState<{ message: string; detail: string } | null>(null);

  const userId = user?.id;
  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data: c } = await db.from('business_cards').select('id, card_number, reference_number').eq('employee_id', userId).eq('is_active', true).maybeSingle();
    setCard(c);
    if (c) {
      const [{ data: cr }, { data: fs }, { data: fo }, { data: ob }] = await Promise.all([
        db.from('business_card_credits').select('amount').eq('card_id', c.id),
        db.from('business_card_faturas').select('id, fornecedor_id, fornecedor_nome_lido, numero_fatura, data_fatura, valor, drive_link, location_id').eq('card_id', c.id).order('data_fatura', { ascending: false }).order('created_at', { ascending: false }),
        db.from('fornecedores').select('id, nome').order('nome'),
        db.from('allowed_locations').select('id, name').eq('is_active', true),
      ]);
      setCredito((cr || []).reduce((s: number, r: any) => s + Number(r.amount || 0), 0));
      setFaturas(fs || []);
      setFornecedores(fo || []);
      setObras(((ob || []) as { id: string; name: string }[]).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')));
    }
    setLoading(false);
  }, [userId]);
  useEffect(() => { load(); }, [load]);

  const gasto = useMemo(() => faturas.reduce((s, f) => s + Number(f.valor || 0), 0), [faturas]);
  const saldo = credito - gasto;
  const fornNome = useMemo(() => Object.fromEntries(fornecedores.map((f) => [f.id, f.nome])), [fornecedores]);
  const obraNome = useMemo(() => Object.fromEntries(obras.map((o) => [o.id, o.name])), [obras]);
  const valorNum = Number((draft?.valor || '').replace(',', '.')) || 0;

  const applyScanResult = (f: ScanFields) => {
    setDraft({
      fornecedor_id: f.fornecedor_id,
      fornecedor_nome_lido: f.fornecedor_nome,
      fornecedor_nif_lido: f.fornecedor_nif,
      numero_fatura: f.numero_fatura,
      data_fatura: /^\d{4}-\d{2}-\d{2}$/.test(f.data_fatura) ? f.data_fatura : format(new Date(), 'yyyy-MM-dd'),
      valor: f.valor_total,
      location_id: '',
    });
  };

  const emptyDraft = (): Draft => ({
    fornecedor_id: '',
    fornecedor_nome_lido: '',
    fornecedor_nif_lido: '',
    numero_fatura: '',
    data_fatura: format(new Date(), 'yyyy-MM-dd'),
    valor: '',
    location_id: '',
  });

  const processInvoiceImage = async (input: File | InvoiceCapture) => {
    setScanning(true);
    setScanIssue(null);
    let photoKb: number | undefined;
    try {
      const img = await normalizeImageForScan(input);
      photoKb = Math.round((img.base64.length * 3) / 4 / 1024);
      setImage(img);
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error('Sessão expirada. Faça login novamente.');
      }
      const { data, error } = await supabase.functions.invoke('scan-fatura', {
        body: { image: img.base64, mimeType: img.mimeType },
      });
      if (error) {
        const info = await errInfo(error);
        const e = new Error(info.message) as Error & { diagnostic?: ScanDiagnostic };
        e.diagnostic = info.diagnostic;
        throw e;
      }
      const parsed = parseScanResponse(data);
      if (!parsed.ok) {
        setScanIssue({ message: parsed.reason, detail: describeDiagnostic(parsed.diagnostic, photoKb) });
        setDraft(emptyDraft());
        return;
      }
      applyScanResult(parsed.fields);
    } catch (err) {
      const message = (err as Error).message || 'Erro desconhecido';
      const diagnostic = (err as { diagnostic?: ScanDiagnostic }).diagnostic;
      setScanIssue({ message, detail: describeDiagnostic(diagnostic, photoKb) });
      toast({ title: 'Não foi possível ler a fatura', description: message, variant: 'destructive' });
      setDraft(emptyDraft());
    } finally {
      setScanning(false);
    }
  };

  // Rede de segurança: foto pendente quando o Android realmente reinicia o app durante a câmara
  const recoverPendingPhoto = useCallback(async () => {
    if (!hasPendingInvoiceImage()) return;
    toast({ title: 'A processar foto…', description: 'A ler a fatura digitalizada.' });
    const pending = await takePendingInvoiceImage();
    if (!pending) {
      toast({
        title: 'Foto não recuperada',
        description: 'A foto perdeu-se ao voltar da câmara. Tente digitalizar outra vez.',
        variant: 'destructive',
      });
      return;
    }
    await processInvoiceImage(pending);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- processInvoiceImage is stable enough for this flow
  }, [toast]);

  useEffect(() => {
    if (loading || !card) return;
    void recoverPendingPhoto();
    const onPending = () => void recoverPendingPhoto();
    window.addEventListener('pending-invoice-photo', onPending);
    return () => window.removeEventListener('pending-invoice-photo', onPending);
  }, [loading, card, recoverPendingPhoto]);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    await processInvoiceImage(file);
  };

  const openCamera = async () => {
    if (Capacitor.isNativePlatform()) {
      const granted = await requestCameraPermission();
      if (!granted) {
        toast({
          title: 'Permissão de câmara necessária',
          description: 'Ative a câmara nas definições do telemóvel para digitalizar faturas.',
          variant: 'destructive',
        });
        return;
      }
      try {
        const capture = await captureInvoicePhoto();
        if (capture) await processInvoiceImage(capture);
      } catch (err) {
        toast({
          title: 'Não foi possível abrir a câmara',
          description: (err as Error).message,
          variant: 'destructive',
        });
      }
      return;
    }
    fileRef.current?.click();
  };

  const save = async () => {
    if (!draft || !card || !user || !image) return;
    if (!draft.numero_fatura.trim() || !draft.data_fatura || valorNum <= 0) {
      toast({ title: 'Preencha nº da fatura, data e valor', variant: 'destructive' }); return;
    }
    if (draft.fornecedor_id && faturas.some((f) => f.fornecedor_id === draft.fornecedor_id && f.numero_fatura.trim().toLowerCase() === draft.numero_fatura.trim().toLowerCase())) {
      toast({ title: 'Fatura já registada', description: 'Este fornecedor já tem uma fatura com esse número.', variant: 'destructive' }); return;
    }
    setSaving(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) throw new Error('Sessão expirada. Faça login novamente.');
      const nome = (draft.fornecedor_id && fornNome[draft.fornecedor_id]) || draft.fornecedor_nome_lido || 'fornecedor';
      const { data: up, error: upErr } = await supabase.functions.invoke('upload-fatura-drive', {
        body: { image: image.base64, mimeType: image.mimeType, date: draft.data_fatura, fileName: `${nome}_${draft.numero_fatura}_${draft.data_fatura}` },
      });
      if (upErr) throw new Error(await errText(upErr));
      const { error } = await db.from('business_card_faturas').insert({
        card_id: card.id, employee_id: user.id,
        fornecedor_id: draft.fornecedor_id || null,
        fornecedor_nome_lido: draft.fornecedor_nome_lido || null,
        fornecedor_nif_lido: draft.fornecedor_nif_lido || null,
        numero_fatura: draft.numero_fatura.trim(), data_fatura: draft.data_fatura, valor: valorNum,
        location_id: draft.location_id || null,
        drive_file_id: up.drive_file_id, drive_link: up.drive_link,
      });
      if (error) throw new Error(error.code === '23505' ? 'Esta fatura já foi registada.' : error.message);
      toast({ title: 'Fatura registada', description: `Novo saldo: ${eur(saldo - valorNum)}` });
      setDraft(null); setImage(null); setScanIssue(null);
      load();
    } catch (err) {
      toast({ title: 'Erro ao gravar', description: (err as Error).message, variant: 'destructive' });
    } finally { setSaving(false); }
  };

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  if (!card) return (
    <div className="p-4 max-w-xl mx-auto">
      <Card><CardContent className="p-6 text-center space-y-2">
        <CreditCard className="h-10 w-10 mx-auto text-muted-foreground" />
        <p className="font-medium">Não tem um Cartão Business ativo.</p>
        <p className="text-sm text-muted-foreground">Fale com o escritório para associar um cartão à sua conta.</p>
      </CardContent></Card>
    </div>
  );

  return (
    <div className="p-4 max-w-xl mx-auto space-y-4">
      <Card className="bg-primary text-primary-foreground">
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm opacity-80">Cartão Business</span>
            <CreditCard className="h-5 w-5 opacity-80" />
          </div>
          <div className="font-mono tracking-widest">{card.card_number || card.reference_number || '•••• ••••'}</div>
          <div>
            <div className="text-xs opacity-80">Saldo disponível</div>
            <div className="text-3xl font-bold tabular-nums">{eur(saldo)}</div>
          </div>
          <div className="flex justify-between text-sm opacity-90 tabular-nums">
            <span>Crédito: {eur(credito)}</span><span>Gasto: {eur(gasto)}</span>
          </div>
        </CardContent>
      </Card>

      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
      {!draft && (
        <Button size="lg" className="w-full h-14 text-base" disabled={scanning} onClick={openCamera}>
          {scanning ? <><Loader2 className="h-5 w-5 mr-2 animate-spin" />A ler a fatura...</> : <><Camera className="h-5 w-5 mr-2" />Digitalizar fatura</>}
        </Button>
      )}

      {draft && (
        <Card>
          <CardHeader><CardTitle className="text-base">Confirmar dados da fatura</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {scanIssue && (
              <div role="alert" className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm space-y-2">
                <div className="flex items-start gap-2 text-destructive font-medium">
                  <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>Não foi possível ler os dados da fatura. {scanIssue.message}</span>
                </div>
                {scanIssue.detail && <p className="text-xs text-muted-foreground">{scanIssue.detail}</p>}
                <p className="text-xs text-muted-foreground">Pode preencher os campos manualmente e gravar, ou tentar de novo.</p>
                <Button size="sm" variant="outline" disabled={scanning || saving} onClick={() => { setDraft(null); setImage(null); setScanIssue(null); void openCamera(); }}>
                  <Camera className="h-4 w-4 mr-1" />Tentar de novo
                </Button>
              </div>
            )}
            {image && <img src={image.preview} alt="Fatura" className="w-full max-h-64 object-contain rounded-md border" />}
            <div className="space-y-1">
              <Label>Fornecedor</Label>
              <Select value={draft.fornecedor_id} onValueChange={(v) => setDraft({ ...draft, fornecedor_id: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione o fornecedor" /></SelectTrigger>
                <SelectContent>{fornecedores.map((f) => <SelectItem key={f.id} value={f.id}>{f.nome}</SelectItem>)}</SelectContent>
              </Select>
              {!draft.fornecedor_id && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Fornecedor não encontrado{draft.fornecedor_nome_lido ? `: lido "${draft.fornecedor_nome_lido}"` : ''}{draft.fornecedor_nif_lido ? ` (NIF ${draft.fornecedor_nif_lido})` : ''}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <Label>Obra</Label>
              <Select value={draft.location_id} onValueChange={(v) => setDraft({ ...draft, location_id: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione a obra" /></SelectTrigger>
                <SelectContent>{obras.map((o) => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label>Nº da fatura</Label><Input value={draft.numero_fatura} onChange={(e) => setDraft({ ...draft, numero_fatura: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label>Data</Label><Input type="date" value={draft.data_fatura} onChange={(e) => setDraft({ ...draft, data_fatura: e.target.value })} /></div>
              <div className="space-y-1"><Label>Valor (€)</Label><Input inputMode="decimal" value={draft.valor} onChange={(e) => setDraft({ ...draft, valor: e.target.value })} /></div>
            </div>
            <div className="rounded-md bg-muted p-3 text-sm tabular-nums space-y-1">
              <div className="flex justify-between"><span>Saldo atual</span><span>{eur(saldo)}</span></div>
              <div className="flex justify-between font-medium"><span>Saldo após fatura</span><span>{eur(saldo - valorNum)}</span></div>
              {valorNum > saldo && <p className="text-destructive text-xs flex items-center gap-1"><AlertTriangle className="h-3 w-3" />O valor ultrapassa o saldo disponível.</p>}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" disabled={saving} onClick={() => { setDraft(null); setImage(null); setScanIssue(null); }}>Cancelar</Button>
              <Button className="flex-1" disabled={saving} onClick={save}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Gravar fatura'}</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-base">Faturas ({faturas.length})</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {faturas.length === 0 && <p className="text-sm text-muted-foreground">Ainda não há faturas registadas.</p>}
          {faturas.map((f) => (
            <div key={f.id} className="flex items-center justify-between gap-3 border rounded-md p-3">
              <div className="min-w-0">
                <div className="font-medium truncate">{(f.fornecedor_id && fornNome[f.fornecedor_id]) || f.fornecedor_nome_lido || 'Fornecedor não identificado'}</div>
                <div className="text-xs text-muted-foreground">Nº {f.numero_fatura} · {format(new Date(f.data_fatura + 'T00:00:00'), 'dd/MM/yyyy')}</div>
                <div className="text-xs text-muted-foreground truncate">{(f.location_id && obraNome[f.location_id]) || 'Obra não informada'}</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-semibold tabular-nums">{eur(Number(f.valor))}</span>
                {f.drive_link && <a href={f.drive_link} target="_blank" rel="noreferrer" aria-label="Abrir no Google Drive" className="text-muted-foreground hover:text-foreground"><ExternalLink className="h-4 w-4" /></a>}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}