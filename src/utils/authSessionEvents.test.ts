import { describe, expect, it } from 'vitest';
import { isSilentSessionRefresh, shouldShowAuthSplash } from './authSessionEvents';

describe('isSilentSessionRefresh', () => {
  it('é silencioso para SIGNED_IN do mesmo utilizador com perfil carregado', () => {
    expect(isSilentSessionRefresh('SIGNED_IN', 'u1', 'u1', true)).toBe(true);
    expect(isSilentSessionRefresh('TOKEN_REFRESHED', 'u1', 'u1', true)).toBe(true);
  });

  it('não é silencioso no primeiro login (sem perfil)', () => {
    expect(isSilentSessionRefresh('SIGNED_IN', null, 'u1', false)).toBe(false);
    expect(isSilentSessionRefresh('SIGNED_IN', 'u1', 'u1', false)).toBe(false);
  });

  it('não é silencioso se mudou o utilizador ou o evento é outro', () => {
    expect(isSilentSessionRefresh('SIGNED_IN', 'u1', 'u2', true)).toBe(false);
    expect(isSilentSessionRefresh('SIGNED_OUT', 'u1', 'u1', true)).toBe(false);
    expect(isSilentSessionRefresh('USER_UPDATED', 'u1', 'u1', true)).toBe(false);
  });
});

describe('shouldShowAuthSplash', () => {
  it('mostra apenas quando carrega e ainda não há perfil', () => {
    expect(shouldShowAuthSplash(true, false)).toBe(true);
    expect(shouldShowAuthSplash(true, true)).toBe(false);
    expect(shouldShowAuthSplash(false, false)).toBe(false);
  });
});
