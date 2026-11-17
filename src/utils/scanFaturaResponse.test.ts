import { describe, expect, it } from 'vitest';
import { describeDiagnostic, parseScanResponse } from './scanFaturaResponse';

describe('parseScanResponse', () => {
  it('aceita objeto com dados', () => {
    const r = parseScanResponse({
      fornecedor_id: 'f1',
      fornecedor_nome: 'Ferro SA',
      fornecedor_nif: '123456789',
      numero_fatura: 'FT 2026/1',
      data_fatura: '2026-11-17',
      valor_total: 123.45,
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.fields.valor_total).toBe('123.45');
      expect(r.fields.fornecedor_id).toBe('f1');
    }
  });

  it('aceita string JSON', () => {
    const r = parseScanResponse(JSON.stringify({ numero_fatura: 'A1', valor_total: null }));
    expect(r.ok).toBe(true);
  });

  it('rejeita tudo vazio/null', () => {
    const r = parseScanResponse({ fornecedor_nome: null, numero_fatura: '', valor_total: null, diagnostic: { filled: 0 } });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.diagnostic?.filled).toBe(0);
  });

  it('rejeita respostas que não são objeto', () => {
    expect(parseScanResponse('texto solto').ok).toBe(false);
    expect(parseScanResponse(null).ok).toBe(false);
    expect(parseScanResponse([1, 2]).ok).toBe(false);
  });
});

describe('describeDiagnostic', () => {
  it('resume metadados', () => {
    expect(describeDiagnostic({ imageBytes: 204800, finishReason: 'stop', outputChars: 12 })).toBe(
      'foto 200 KB · fim: stop · resposta 12 car.'
    );
  });
});
