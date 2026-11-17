/**
 * O Supabase emite SIGNED_IN / TOKEN_REFRESHED sempre que o app volta do segundo plano
 * (ex.: depois da câmara). Nesses casos o perfil deve ser atualizado em silêncio,
 * sem mostrar o ecrã de verificação (que desmontaria a página atual).
 */
export function isSilentSessionRefresh(
  event: string,
  currentUserId: string | null | undefined,
  newUserId: string | null | undefined,
  hasProfile: boolean
): boolean {
  if (event !== 'SIGNED_IN' && event !== 'TOKEN_REFRESHED') return false;
  if (!currentUserId || !newUserId) return false;
  return currentUserId === newUserId && hasProfile;
}

/** O ecrã de verificação só aparece no arranque, nunca num refresh em segundo plano. */
export function shouldShowAuthSplash(isLoading: boolean, hasProfile: boolean): boolean {
  return isLoading && !hasProfile;
}
