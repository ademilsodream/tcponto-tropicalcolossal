import { describe, expect, it } from 'vitest';
import { parseRestoredCameraPayload } from './nativeCamera';

describe('parseRestoredCameraPayload', () => {
  it('lê base64String e format jpeg', () => {
    const b64 = 'a'.repeat(120);
    const r = parseRestoredCameraPayload({ base64String: b64, format: 'jpeg' });
    expect(r).toEqual({ base64: b64, mimeType: 'image/jpeg' });
  });

  it('lê base64 e format png', () => {
    const b64 = 'b'.repeat(100);
    const r = parseRestoredCameraPayload({ base64: b64, format: 'png' });
    expect(r?.mimeType).toBe('image/png');
  });

  it('rejeita payload curto ou sem imagem', () => {
    expect(parseRestoredCameraPayload({ base64String: 'x' })).toBeNull();
    expect(parseRestoredCameraPayload(null)).toBeNull();
    expect(parseRestoredCameraPayload({ webPath: 'https://x' })).toBeNull();
  });
});