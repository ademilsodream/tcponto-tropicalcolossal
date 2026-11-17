export type ScanFields = {
  fornecedor_id: string;
  fornecedor_nome: string;
  fornecedor_nif: string;
  numero_fatura: string;
  data_fatura: string;
  valor_total: string;
};

export type ScanDiagnostic = {
  finishReason?: string | null;
  outputChars?: number;
  imageBytes?: number;
  filled?: number;
  gatewayStatus?: number;
};

export type ParsedScan =
  | { ok: true; fields: ScanFields; diagnostic?: ScanDiagnostic }
  | { ok: false; reason: string; diagnostic?: ScanDiagnostic };

const str = (v: unknown) => (v === null || v === undefined ? '' : String(v).trim());

/** Interpreta a resposta do scan-fatura (objeto ou string JSON) e deteta respostas vazias. */
export function parseScanResponse(data: unknown): ParsedScan {
  let obj: unknown = data;
  if (typeof data === 'string') {
    try {
      obj = JSON.parse(data);
    } catch {
      return { ok: false, reason: 'Resposta inesperada do servidor.' };
    }
  }
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    return { ok: false, reason: 'Resposta inesperada do servidor.' };
  }
  const d = obj as Record<string, unknown>;
  const diagnostic = (d.diagnostic && typeof d.diagnostic === 'object' ? d.diagnostic : undefined) as
    | ScanDiagnostic
    | undefined;

  const fields: ScanFields = {
    fornecedor_id: str(d.fornecedor_id),
    fornecedor_nome: str(d.fornecedor_nome),
    fornecedor_nif: str(d.fornecedor_nif),
    numero_fatura: str(d.numero_fatura),
    data_fatura: str(d.data_fatura),
    valor_total: d.valor_total === null || d.valor_total === undefined ? '' : String(d.valor_total),
  };

  const anyRead =
    fields.fornecedor_nome || fields.fornecedor_nif || fields.numero_fatura || fields.data_fatura || fields.valor_total;
  if (!anyRead) {
    return { ok: false, reason: 'A IA não encontrou dados legíveis na fatura.', diagnostic };
  }
  return { ok: true, fields, diagnostic };
}

export function describeDiagnostic(d?: ScanDiagnostic, extraKb?: number): string {
  const parts: string[] = [];
  const kb = extraKb ?? (d?.imageBytes ? Math.round(d.imageBytes / 1024) : undefined);
  if (kb !== undefined) parts.push(`foto ${kb} KB`);
  if (d?.gatewayStatus) parts.push(`gateway ${d.gatewayStatus}`);
  if (d?.finishReason) parts.push(`fim: ${d.finishReason}`);
  if (d?.outputChars !== undefined) parts.push(`resposta ${d.outputChars} car.`);
  return parts.join(' · ');
}
