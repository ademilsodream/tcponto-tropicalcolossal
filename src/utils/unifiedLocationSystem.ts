/**
 * Sistema Unificado de Localização para TCPonto
 * Versão precisa: coleta multi-amostra com convergência, thresholds rigorosos
 * e range adaptativo limitado.
 */

import { AllowedLocation } from '@/types/index';

export interface UnifiedLocationResult {
  valid: boolean;
  message: string;
  location?: {
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: number;
  };
  closestLocation?: AllowedLocation;
  distance?: number;
  gpsAccuracy?: number;
  confidence?: number;
  locationChanged?: boolean;
  previousLocation?: string;
  needsCalibration?: boolean;
  calibrationApplied?: boolean;
  debug?: {
    attempts: number;
    timeouts: number;
    calibrationUsed: boolean;
    locationChangeDetected: boolean;
    environment: 'APK' | 'WEB';
    samplesCollected?: number;
    converged?: boolean;
  };
}

export interface CalibrationData {
  locationId: string;
  offset: { latitude: number; longitude: number };
  accuracy: number;
  timestamp: number;
  locationName: string;
}

// Configurações otimizadas para máxima precisão
const CONFIG = {
  // Coleta multi-amostra
  COLLECTION_WINDOW_MS: 8000,           // janela total de coleta
  CONVERGENCE_SAMPLES: 3,               // amostras consecutivas estáveis
  CONVERGENCE_ACCURACY: 10,             // acc <= 10m para considerar convergido
  CONVERGENCE_SPREAD_M: 10,             // dispersão entre amostras
  SAMPLE_DISCARD_ACCURACY: 50,          // descarta amostras com acc > 50m
  MIN_SAMPLES_FOR_MEDIAN: 3,

  // Calibração
  CALIBRATION_SAMPLES: 6,
  CALIBRATION_INTERVAL: 2000,
  CALIBRATION_MAX_OFFSET_M: 30,         // rejeita offset acima disso
  CALIBRATION_VALIDITY_HOURS: 24,       // reduzido (era 72)

  // Thresholds de qualidade
  HIGH_ACCURACY_THRESHOLD: 10,          // EXCELENTE
  MEDIUM_ACCURACY_THRESHOLD: 25,        // BOM
  MAX_ACCEPTABLE_ACCURACY: 40,          // acima disso bloqueia

  // Range adaptativo (limitado)
  MAX_RANGE_EXTRA_M: 25,                // tolerância extra máxima

  // Cache
  CACHE_DURATION: 8000,                 // 8s (era 30s)
  GPS_MAX_AGE_MS: 5000,                 // 5s (era 60-120s)

  // Histórico
  LOCATION_CHANGE_THRESHOLD: 200,

  // Timeouts
  GPS_TIMEOUT: 15000,
};

const STORAGE_KEYS = {
  CALIBRATIONS: 'unified_gps_calibrations',
  LAST_LOCATION: 'unified_last_location',
};

// Cache leve
let locationCache: {
  location: { latitude: number; longitude: number };
  accuracy: number;
  timestamp: number;
} | null = null;

let pendingLocationRequest: Promise<{ location: { latitude: number; longitude: number }; accuracy: number }> | null = null;

type SampleListener = (info: { samples: number; bestAccuracy: number | null; converged: boolean }) => void;
let progressListener: SampleListener | null = null;
export const setLocationProgressListener = (l: SampleListener | null) => { progressListener = l; };

const isNativeApp = (): boolean => {
  return !!(window as any)?.Capacitor?.Plugins?.Geolocation ||
         navigator.userAgent.includes('Capacitor');
};

const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371e3;
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

interface Sample { latitude: number; longitude: number; accuracy: number; timestamp: number; }

const median = (nums: number[]): number => {
  const s = [...nums].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

/**
 * Coleta multi-amostra com convergência.
 * - Abre watchPosition por COLLECTION_WINDOW_MS.
 * - Descarta amostras com accuracy > SAMPLE_DISCARD_ACCURACY.
 * - Para assim que 3 amostras consecutivas tiverem acc <= 10m e spread <= 10m.
 * - Senão, usa MEDIANA das 3 melhores.
 */
const collectConvergedLocation = async (forceFresh: boolean): Promise<{ location: { latitude: number; longitude: number }; accuracy: number; converged: boolean; samples: number }> => {
  // Cache
  if (!forceFresh && locationCache && (Date.now() - locationCache.timestamp) < CONFIG.CACHE_DURATION) {
    return { location: locationCache.location, accuracy: locationCache.accuracy, converged: true, samples: 1 };
  }

  if (pendingLocationRequest) {
    const r = await pendingLocationRequest;
    return { ...r, converged: true, samples: 1 };
  }

  pendingLocationRequest = new Promise(async (resolve, reject) => {
    const samples: Sample[] = [];
    let watchId: number | null = null;
    let capacitorWatchId: string | null = null;
    let settled = false;

    const finish = (result: { location: { latitude: number; longitude: number }; accuracy: number } | null, error?: Error) => {
      if (settled) return;
      settled = true;
      if (watchId !== null && navigator.geolocation) {
        try { navigator.geolocation.clearWatch(watchId); } catch {}
      }
      if (capacitorWatchId && (window as any)?.Capacitor?.Plugins?.Geolocation) {
        try { (window as any).Capacitor.Plugins.Geolocation.clearWatch({ id: capacitorWatchId }); } catch {}
      }
      pendingLocationRequest = null;
      if (error || !result) {
        reject(error || new Error('Falha ao obter localização'));
      } else {
        locationCache = { location: result.location, accuracy: result.accuracy, timestamp: Date.now() };
        resolve(result);
      }
    };

    const handleSample = (lat: number, lng: number, acc: number) => {
      if (settled) return;
      if (!Number.isFinite(lat) || !Number.isFinite(lng) || !Number.isFinite(acc)) return;
      if (acc > CONFIG.SAMPLE_DISCARD_ACCURACY) {
        progressListener?.({ samples: samples.length, bestAccuracy: samples.length ? Math.min(...samples.map(s => s.accuracy)) : null, converged: false });
        return;
      }
      samples.push({ latitude: lat, longitude: lng, accuracy: acc, timestamp: Date.now() });
      progressListener?.({ samples: samples.length, bestAccuracy: Math.min(...samples.map(s => s.accuracy)), converged: false });

      // Checar convergência nas últimas N amostras
      if (samples.length >= CONFIG.CONVERGENCE_SAMPLES) {
        const last = samples.slice(-CONFIG.CONVERGENCE_SAMPLES);
        const allAccurate = last.every(s => s.accuracy <= CONFIG.CONVERGENCE_ACCURACY);
        if (allAccurate) {
          let maxSpread = 0;
          for (let i = 0; i < last.length; i++) {
            for (let j = i + 1; j < last.length; j++) {
              const d = calculateDistance(last[i].latitude, last[i].longitude, last[j].latitude, last[j].longitude);
              if (d > maxSpread) maxSpread = d;
            }
          }
          if (maxSpread <= CONFIG.CONVERGENCE_SPREAD_M) {
            const best = [...last].sort((a, b) => a.accuracy - b.accuracy)[0];
            progressListener?.({ samples: samples.length, bestAccuracy: best.accuracy, converged: true });
            finish({ location: { latitude: best.latitude, longitude: best.longitude }, accuracy: best.accuracy });
          }
        }
      }
    };

    // Timeout final da janela
    const windowTimeout = setTimeout(() => {
      if (settled) return;
      if (samples.length >= CONFIG.MIN_SAMPLES_FOR_MEDIAN) {
        const best3 = [...samples].sort((a, b) => a.accuracy - b.accuracy).slice(0, 3);
        const lat = median(best3.map(s => s.latitude));
        const lng = median(best3.map(s => s.longitude));
        const acc = median(best3.map(s => s.accuracy));
        finish({ location: { latitude: lat, longitude: lng }, accuracy: acc });
      } else if (samples.length > 0) {
        const best = [...samples].sort((a, b) => a.accuracy - b.accuracy)[0];
        finish({ location: { latitude: best.latitude, longitude: best.longitude }, accuracy: best.accuracy });
      } else {
        finish(null, new Error('GPS não estabilizou. Vá para um local aberto e tente novamente.'));
      }
    }, CONFIG.COLLECTION_WINDOW_MS);

    // Capacitor (APK)
    if (isNativeApp() && (window as any)?.Capacitor?.Plugins?.Geolocation) {
      try {
        const { Geolocation } = (window as any).Capacitor.Plugins;
        capacitorWatchId = await Geolocation.watchPosition(
          { enableHighAccuracy: true, timeout: CONFIG.GPS_TIMEOUT, maximumAge: CONFIG.GPS_MAX_AGE_MS },
          (position: any, err: any) => {
            if (err || !position) return;
            handleSample(position.coords.latitude, position.coords.longitude, position.coords.accuracy || 999);
          }
        );
        // mantém o setTimeout cuidando do término
        return;
      } catch (e) {
        console.warn('Capacitor watchPosition falhou, tentando navigator', e);
      }
    }

    // Navigator
    if (!navigator.geolocation) {
      clearTimeout(windowTimeout);
      finish(null, new Error('Geolocalização não suportada neste dispositivo'));
      return;
    }

    watchId = navigator.geolocation.watchPosition(
      (pos) => handleSample(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy || 999),
      (err) => {
        // Não aborta de imediato — espera mais amostras virem ou o timeout estourar
        console.warn('watchPosition error:', err);
      },
      { enableHighAccuracy: true, timeout: CONFIG.GPS_TIMEOUT, maximumAge: CONFIG.GPS_MAX_AGE_MS }
    );
  });

  const r = await pendingLocationRequest!;
  return { ...r, converged: true, samples: 0 };
};

const validateGPSQuality = (accuracy: number) => {
  if (accuracy <= CONFIG.HIGH_ACCURACY_THRESHOLD) {
    return { quality: 'EXCELENTE' as const, acceptable: true, confidence: 95, message: 'GPS com excelente precisão' };
  } else if (accuracy <= CONFIG.MEDIUM_ACCURACY_THRESHOLD) {
    return { quality: 'BOM' as const, acceptable: true, confidence: 80, message: 'GPS com boa precisão' };
  } else if (accuracy <= CONFIG.MAX_ACCEPTABLE_ACCURACY) {
    return { quality: 'REGULAR' as const, acceptable: true, confidence: 60, message: 'GPS com precisão regular' };
  }
  return { quality: 'RUIM' as const, acceptable: false, confidence: 30, message: `GPS impreciso (${Math.round(accuracy)}m). Vá a céu aberto.` };
};

/**
 * Range adaptativo limitado — NÃO compensa GPS ruim com raio maior.
 */
const calculateAdaptiveRange = (baseRange: number, gpsAccuracy: number): number => {
  const extra = Math.min(Math.max(0, gpsAccuracy * 1.5 - baseRange), CONFIG.MAX_RANGE_EXTRA_M);
  return baseRange + extra;
};

class CalibrationManager {
  static saveCalibration(locationId: string, calibration: CalibrationData): boolean {
    const offsetMeters = calculateDistance(0, 0, calibration.offset.latitude, calibration.offset.longitude);
    if (offsetMeters > CONFIG.CALIBRATION_MAX_OFFSET_M) {
      console.warn(`Calibração rejeitada (offset ${Math.round(offsetMeters)}m > ${CONFIG.CALIBRATION_MAX_OFFSET_M}m)`);
      return false;
    }
    try {
      const calibrations = JSON.parse(localStorage.getItem(STORAGE_KEYS.CALIBRATIONS) || '{}');
      calibrations[locationId] = calibration;
      localStorage.setItem(STORAGE_KEYS.CALIBRATIONS, JSON.stringify(calibrations));
      return true;
    } catch { return false; }
  }

  static getCalibration(locationId: string): CalibrationData | null {
    try {
      const calibrations = JSON.parse(localStorage.getItem(STORAGE_KEYS.CALIBRATIONS) || '{}');
      const c = calibrations[locationId];
      if (!c) return null;
      const ageH = (Date.now() - c.timestamp) / 3.6e6;
      if (ageH > CONFIG.CALIBRATION_VALIDITY_HOURS) {
        delete calibrations[locationId];
        localStorage.setItem(STORAGE_KEYS.CALIBRATIONS, JSON.stringify(calibrations));
        return null;
      }
      return c;
    } catch { return null; }
  }

  static applyCalibration(location: { latitude: number; longitude: number; accuracy: number }, locationId: string) {
    const c = this.getCalibration(locationId);
    if (!c) return { ...location, calibrationApplied: false };
    return {
      latitude: location.latitude + c.offset.latitude,
      longitude: location.longitude + c.offset.longitude,
      accuracy: location.accuracy, // não mascarar accuracy real
      calibrationApplied: true,
    };
  }

  static clearCalibration(locationId: string): void {
    try {
      const calibrations = JSON.parse(localStorage.getItem(STORAGE_KEYS.CALIBRATIONS) || '{}');
      delete calibrations[locationId];
      localStorage.setItem(STORAGE_KEYS.CALIBRATIONS, JSON.stringify(calibrations));
    } catch {}
  }
}

class LocationHistoryManager {
  static saveLastLocation(locationId: string, location: { latitude: number; longitude: number }): void {
    try { localStorage.setItem(STORAGE_KEYS.LAST_LOCATION, JSON.stringify({ locationId, location, timestamp: Date.now() })); } catch {}
  }
  static getLastLocation() {
    try { const d = localStorage.getItem(STORAGE_KEYS.LAST_LOCATION); return d ? JSON.parse(d) : null; } catch { return null; }
  }
  static detectLocationChange(current: { latitude: number; longitude: number }, last: { latitude: number; longitude: number } | null): boolean {
    if (!last) return false;
    return calculateDistance(current.latitude, current.longitude, last.latitude, last.longitude) > CONFIG.LOCATION_CHANGE_THRESHOLD;
  }
}

export class UnifiedLocationSystem {
  static async validateLocation(
    allowedLocations: AllowedLocation[],
    confidenceThreshold: number = 0.6,
    options?: { forceFresh?: boolean }
  ): Promise<UnifiedLocationResult> {
    const environment = (isNativeApp() ? 'APK' : 'WEB') as 'APK' | 'WEB';
    const debug = { attempts: 0, timeouts: 0, calibrationUsed: false, locationChangeDetected: false, environment, samplesCollected: 0, converged: false };

    try {
      if (!allowedLocations || allowedLocations.length === 0) {
        return { valid: false, message: 'Sistema sem localizações permitidas configuradas', debug };
      }

      const gpsResult = await collectConvergedLocation(options?.forceFresh ?? false);
      const { location: rawLocation, accuracy, converged, samples } = gpsResult;
      debug.samplesCollected = samples;
      debug.converged = converged;

      const gpsQuality = validateGPSQuality(accuracy);

      if (!gpsQuality.acceptable) {
        return {
          valid: false,
          message: gpsQuality.message,
          location: { ...rawLocation, accuracy, timestamp: Date.now() },
          gpsAccuracy: accuracy,
          needsCalibration: true,
          debug,
        };
      }

      let bestMatch: { location: AllowedLocation; distance: number; adaptiveRange: number; calibrationApplied: boolean } | null = null;

      for (const allowed of allowedLocations) {
        if (!allowed.is_active) continue;
        const cal = CalibrationManager.applyCalibration({ ...rawLocation, accuracy }, allowed.id);
        if (cal.calibrationApplied) debug.calibrationUsed = true;
        const distance = calculateDistance(cal.latitude, cal.longitude, Number(allowed.latitude), Number(allowed.longitude));
        const adaptiveRange = calculateAdaptiveRange(Number(allowed.range_meters), cal.accuracy);
        if (distance <= adaptiveRange) {
          if (!bestMatch || distance < bestMatch.distance) {
            bestMatch = { location: allowed, distance, adaptiveRange, calibrationApplied: cal.calibrationApplied };
          }
        }
      }

      if (!bestMatch) {
        let closest: AllowedLocation | null = null;
        let minD = Infinity;
        for (const allowed of allowedLocations) {
          if (!allowed.is_active) continue;
          const d = calculateDistance(rawLocation.latitude, rawLocation.longitude, Number(allowed.latitude), Number(allowed.longitude));
          if (d < minD) { minD = d; closest = allowed; }
        }
        return {
          valid: false,
          message: closest ? `Você está a ${Math.round(minD)}m de ${closest.name}. Aproxime-se para registrar o ponto.` : 'Nenhuma localização permitida próxima',
          location: { ...rawLocation, accuracy, timestamp: Date.now() },
          closestLocation: closest || undefined,
          distance: minD === Infinity ? undefined : minD,
          gpsAccuracy: accuracy,
          debug,
        };
      }

      const last = LocationHistoryManager.getLastLocation();
      const locationChanged = LocationHistoryManager.detectLocationChange(rawLocation, last?.location || null);
      if (locationChanged) debug.locationChangeDetected = true;
      LocationHistoryManager.saveLastLocation(bestMatch.location.id, rawLocation);

      const isValid = gpsQuality.confidence >= confidenceThreshold * 100 || gpsQuality.confidence >= confidenceThreshold;
      return {
        valid: true,
        message: `Localização autorizada em ${bestMatch.location.name}`,
        location: { ...rawLocation, accuracy, timestamp: Date.now() },
        closestLocation: bestMatch.location,
        distance: bestMatch.distance,
        gpsAccuracy: accuracy,
        confidence: gpsQuality.confidence,
        locationChanged,
        previousLocation: last?.locationId,
        calibrationApplied: bestMatch.calibrationApplied,
        debug,
      };
    } catch (error: any) {
      return { valid: false, message: error.message || 'Erro ao validar localização. Verifique se o GPS está ativo.', debug };
    }
  }

  /**
   * Validação final antes de gravar o registro de ponto.
   * Força fix novo (sem cache) e aplica regras estritas.
   */
  static async finalValidation(allowedLocations: AllowedLocation[]): Promise<UnifiedLocationResult> {
    locationCache = null;
    return this.validateLocation(allowedLocations, 0.6, { forceFresh: true });
  }

  static async calibrateForLocation(locationId: string, locationName: string, targetLocation?: { latitude: number; longitude: number }) {
    try {
      const samples: { latitude: number; longitude: number; accuracy: number }[] = [];
      for (let i = 0; i < CONFIG.CALIBRATION_SAMPLES; i++) {
        const r = await collectConvergedLocation(true);
        samples.push({ latitude: r.location.latitude, longitude: r.location.longitude, accuracy: r.accuracy });
        if (i < CONFIG.CALIBRATION_SAMPLES - 1) await new Promise(res => setTimeout(res, CONFIG.CALIBRATION_INTERVAL));
      }

      const sorted = samples.sort((a, b) => a.accuracy - b.accuracy);
      const best = sorted.slice(0, Math.min(3, sorted.length));
      const weights = best.map(s => 1 / (s.accuracy * s.accuracy));
      const totalW = weights.reduce((a, b) => a + b, 0);
      const wLat = best.reduce((s, x, i) => s + x.latitude * weights[i] / totalW, 0);
      const wLng = best.reduce((s, x, i) => s + x.longitude * weights[i] / totalW, 0);

      const offset = targetLocation
        ? { latitude: targetLocation.latitude - wLat, longitude: targetLocation.longitude - wLng }
        : { latitude: 0, longitude: 0 };

      const calibration: CalibrationData = { locationId, offset, accuracy: best[0].accuracy, timestamp: Date.now(), locationName };
      const saved = CalibrationManager.saveCalibration(locationId, calibration);
      if (!saved) return { success: false, message: 'Calibração rejeitada (offset muito grande). Tente em local com melhor sinal.' };
      return { success: true, message: `GPS calibrado para ${locationName} (${Math.round(best[0].accuracy)}m)`, calibration };
    } catch (e: any) {
      return { success: false, message: e.message || 'Erro durante a calibração' };
    }
  }

  static clearCache(): void { locationCache = null; pendingLocationRequest = null; }

  static getSystemStats() {
    const environment = (isNativeApp() ? 'APK' : 'WEB') as 'APK' | 'WEB';
    const cacheValid = !!(locationCache && (Date.now() - locationCache.timestamp) < CONFIG.CACHE_DURATION);
    let calibrationsCount = 0;
    try { calibrationsCount = Object.keys(JSON.parse(localStorage.getItem(STORAGE_KEYS.CALIBRATIONS) || '{}')).length; } catch {}
    return { environment, cacheValid, calibrationsCount, lastLocation: LocationHistoryManager.getLastLocation() };
  }
}
