import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { App } from '@capacitor/app';

const PENDING_PHOTO_PATH_KEY = 'pendingInvoicePhotoPath';
const PENDING_PHOTO_BASE64_KEY = 'pendingInvoicePhotoBase64';
const PENDING_PHOTO_MIME_KEY = 'pendingInvoicePhotoMime';
const PENDING_ROUTE_KEY = 'pendingCameraRoute';
const PENDING_CAMERA_OPEN_KEY = 'pendingCameraOpen';

export type InvoiceCapture = { base64: string; mimeType: 'image/jpeg' | 'image/png' | 'image/webp' };

/** Extrai imagem do payload devolvido pela câmara (incl. appRestoredResult). */
export function parseRestoredCameraPayload(data: unknown): InvoiceCapture | null {
  if (!data || typeof data !== 'object') return null;
  const d = data as Record<string, unknown>;
  const rawB64 = d.base64String ?? d.base64;
  if (typeof rawB64 === 'string' && rawB64.length >= 100) {
    const fmt = typeof d.format === 'string' ? d.format.toLowerCase() : 'jpeg';
    const mime =
      fmt === 'png' ? 'image/png' : fmt === 'webp' ? 'image/webp' : ('image/jpeg' as const);
    return { base64: rawB64, mimeType: mime };
  }
  return null;
}

function storePendingCapture(capture: InvoiceCapture, webPath?: string): void {
  localStorage.setItem(PENDING_PHOTO_BASE64_KEY, capture.base64);
  localStorage.setItem(PENDING_PHOTO_MIME_KEY, capture.mimeType);
  if (webPath) localStorage.setItem(PENDING_PHOTO_PATH_KEY, webPath);
  localStorage.removeItem(PENDING_CAMERA_OPEN_KEY);
}

function clearPendingCaptureStorage(): void {
  localStorage.removeItem(PENDING_PHOTO_BASE64_KEY);
  localStorage.removeItem(PENDING_PHOTO_MIME_KEY);
  localStorage.removeItem(PENDING_PHOTO_PATH_KEY);
  localStorage.removeItem(PENDING_ROUTE_KEY);
  localStorage.removeItem(PENDING_CAMERA_OPEN_KEY);
}

function isCameraRestoreEvent(event: {
  pluginId?: string;
  methodName?: string;
  success?: boolean;
}): boolean {
  if (!event?.success) return false;
  const plugin = (event.pluginId ?? '').toLowerCase();
  const method = (event.methodName ?? '').toLowerCase();
  if (plugin.includes('camera')) return true;
  return method === 'getphoto' || method === 'pickimages';
}

/**
 * Se o Android fechar o app enquanto a câmara está aberta, o resultado chega
 * no arranque via appRestoredResult.
 */
export function setupCameraRestore(): void {
  if (!Capacitor.isNativePlatform()) return;
  App.addListener('appRestoredResult', (event: { pluginId?: string; methodName?: string; success?: boolean; data?: unknown }) => {
    const route = localStorage.getItem(PENDING_ROUTE_KEY);
    const wasOpening = localStorage.getItem(PENDING_CAMERA_OPEN_KEY) === '1';

    if (!isCameraRestoreEvent(event)) {
      if (!wasOpening) localStorage.removeItem(PENDING_ROUTE_KEY);
      return;
    }

    const capture = parseRestoredCameraPayload(event.data);
    const webPath =
      event.data && typeof event.data === 'object' && typeof (event.data as { webPath?: string }).webPath === 'string'
        ? (event.data as { webPath: string }).webPath
        : undefined;

    if (!capture && !webPath) {
      if (wasOpening) {
        localStorage.removeItem(PENDING_CAMERA_OPEN_KEY);
        localStorage.removeItem(PENDING_ROUTE_KEY);
      }
      return;
    }

    if (capture) {
      storePendingCapture(capture, webPath);
    } else if (webPath) {
      localStorage.setItem(PENDING_PHOTO_PATH_KEY, webPath);
      localStorage.removeItem(PENDING_CAMERA_OPEN_KEY);
    }

    window.dispatchEvent(new Event('pending-invoice-photo'));

    if (route && window.location.pathname !== route) {
      window.location.replace(route);
    }
  }).catch(() => {});
}

export function hasPendingInvoiceImage(): boolean {
  return (
    !!localStorage.getItem(PENDING_PHOTO_BASE64_KEY) || !!localStorage.getItem(PENDING_PHOTO_PATH_KEY)
  );
}

/** True enquanto a câmara está aberta e o WebView pode ter sido reiniciado. */
export function isCameraCaptureInFlight(): boolean {
  return localStorage.getItem(PENDING_CAMERA_OPEN_KEY) === '1';
}

/** Devolve (e limpa) foto pendente após reinício do app durante a câmara. */
export async function takePendingInvoiceImage(): Promise<InvoiceCapture | null> {
  const base64 = localStorage.getItem(PENDING_PHOTO_BASE64_KEY);
  const mime = (localStorage.getItem(PENDING_PHOTO_MIME_KEY) as InvoiceCapture['mimeType'] | null) || 'image/jpeg';
  if (base64 && base64.length >= 100) {
    clearPendingCaptureStorage();
    return { base64, mimeType: mime };
  }

  const path = localStorage.getItem(PENDING_PHOTO_PATH_KEY);
  if (!path) return null;
  clearPendingCaptureStorage();
  try {
    const blob = await (await fetch(path)).blob();
    const b64 = await blobToBase64(blob);
    const mimeType = (blob.type === 'image/png' || blob.type === 'image/webp'
      ? blob.type
      : 'image/jpeg') as InvoiceCapture['mimeType'];
    return { base64: b64, mimeType };
  } catch {
    return null;
  }
}

/** @deprecated Use takePendingInvoiceImage */
export async function takePendingPhotoFile(): Promise<File | null> {
  const img = await takePendingInvoiceImage();
  if (!img) return null;
  return base64ToFile(img.base64, img.mimeType);
}

async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const comma = result.indexOf(',');
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(new Error('Não foi possível ler a imagem'));
    reader.readAsDataURL(blob);
  });
}

function base64ToFile(base64: string, mimeType: string): File {
  const bin = atob(base64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  const ext = mimeType === 'image/png' ? 'png' : mimeType === 'image/webp' ? 'webp' : 'jpg';
  return new File([bytes], `fatura-${Date.now()}.${ext}`, { type: mimeType });
}

export function isNativeApp(): boolean {
  return Capacitor.isNativePlatform();
}

export async function requestCameraPermission(): Promise<boolean> {
  if (!isNativeApp()) return true;
  try {
    const status = await Camera.checkPermissions();
    if (status.camera === 'granted') return true;
    const requested = await Camera.requestPermissions({ permissions: ['camera', 'photos'] });
    return requested.camera === 'granted';
  } catch {
    return false;
  }
}

function photoResultToCapture(photo: { base64String?: string; format?: string }): InvoiceCapture | null {
  return parseRestoredCameraPayload(photo);
}

/** Abre a câmara nativa e devolve base64 (sem depender de fetch a URI). */
export async function captureInvoicePhoto(): Promise<InvoiceCapture | null> {
  const ok = await requestCameraPermission();
  if (!ok) return null;

  localStorage.setItem(PENDING_ROUTE_KEY, window.location.pathname);
  localStorage.setItem(PENDING_CAMERA_OPEN_KEY, '1');

  try {
    const photo = await Camera.getPhoto({
      quality: 70,
      width: 1600,
      saveToGallery: false,
      allowEditing: false,
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera,
      correctOrientation: true,
    });
    clearPendingCaptureStorage();
    const capture = photoResultToCapture(photo);
    if (!capture) throw new Error('Imagem vazia da câmara');
    return capture;
  } catch (err) {
    const msg = (err as Error)?.message ?? '';
    if (msg.includes('User cancelled') || msg.includes('canceled')) {
      clearPendingCaptureStorage();
      return null;
    }
    // Android pode matar o WebView: resultado chega via appRestoredResult
    if (localStorage.getItem(PENDING_CAMERA_OPEN_KEY) === '1') {
      return null;
    }
    clearPendingCaptureStorage();
    throw err;
  }
}

/** @deprecated Prefer captureInvoicePhoto */
export async function capturePhotoFile(): Promise<File | null> {
  const img = await captureInvoicePhoto();
  if (!img) return null;
  return base64ToFile(img.base64, img.mimeType);
}