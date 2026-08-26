export type RegistrationAttemptStage =
  | 'starting'
  | 'gps'
  | 'preparing'
  | 'saving'
  | 'queued'
  | 'saved'
  | 'failed';

export interface RegistrationAttemptLog {
  timestamp: string;
  stage: RegistrationAttemptStage;
  action?: string;
  online: boolean;
  gpsAccuracy?: number;
  distance?: number;
  locationName?: string;
  errorCode?: string;
  message?: string;
}

const LOG_KEY = 'tcponto:registration-attempts';
const MAX_LOGS = 30;

export function logRegistrationAttempt(attempt: Omit<RegistrationAttemptLog, 'timestamp' | 'online'>): void {
  try {
    const previous = JSON.parse(localStorage.getItem(LOG_KEY) || '[]');
    const logs = Array.isArray(previous) ? previous : [];
    logs.push({
      ...attempt,
      timestamp: new Date().toISOString(),
      online: typeof navigator === 'undefined' ? true : navigator.onLine,
    });
    localStorage.setItem(LOG_KEY, JSON.stringify(logs.slice(-MAX_LOGS)));
  } catch {
    // O diagnóstico nunca pode impedir o registro.
  }
}

export function isRecoverableNetworkError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;

  const candidate = error as {
    message?: string;
    details?: string;
    code?: string;
    status?: number;
  };
  const text = `${candidate.message || ''} ${candidate.details || ''} ${candidate.code || ''}`.toLowerCase();

  if (candidate.status && [408, 429, 500, 502, 503, 504].includes(candidate.status)) return true;

  return [
    'failed to fetch',
    'fetch failed',
    'networkerror',
    'network error',
    'timeout',
    'timed out',
    'connection',
    'load failed',
  ].some((fragment) => text.includes(fragment));
}

export function getRegistrationErrorMessage(error: unknown): string {
  if (isRecoverableNetworkError(error)) {
    return 'A internet está instável. O ponto foi preservado no aparelho e será enviado automaticamente.';
  }

  if (!error || typeof error !== 'object') return 'Não foi possível registrar o ponto.';
  const candidate = error as { message?: string; code?: string; status?: number };
  const text = `${candidate.message || ''} ${candidate.code || ''}`.toLowerCase();

  if (candidate.status === 401 || text.includes('jwt') || text.includes('session')) {
    return 'A sessão expirou. Entre novamente para registrar o ponto.';
  }
  if (candidate.status === 403 || text.includes('row-level security') || text.includes('permission')) {
    return 'O seu utilizador não tem permissão para gravar este ponto. Contacte o RH.';
  }
  if (candidate.code === '23505' || text.includes('duplicate')) {
    return 'Este ponto já foi registrado. Atualize a página para ver os dados.';
  }

  return candidate.message || 'Não foi possível registrar o ponto.';
}