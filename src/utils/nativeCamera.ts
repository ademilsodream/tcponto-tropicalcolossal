import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { App } from '@capacitor/app';

const PENDING_PHOTO_KEY = 'pendingInvoicePhotoPath';
const PENDING_ROUTE_KEY = 'pendingCameraRoute';

/**
 * Se o Android fechar o app enquanto a câmara está aberta, o resultado chega
 * no arranque via 'appRestoredResult'. Guardamos o caminho da foto e voltamos
 * ao ecrã de onde a câmara foi aberta.
 */
export function setupCameraRestore(): void {
  if (!Capacitor.isNativePlatform()) return;
  App.addListener('appRestoredResult', (event: any) => {
    const route = localStorage.getItem(PENDING_ROUTE_KEY);
    if (event?.pluginId !== 'Camera' || !event?.success || !event?.data?.webPath) {
      localStorage.removeItem(PENDING_ROUTE_KEY);
      return;
    }
    localStorage.setItem(PENDING_PHOTO_KEY, event.data.webPath);
    window.dispatchEvent(new Event('pending-invoice-photo'));
    if (route && window.location.pathname !== route) window.location.replace(route);
  }).catch(() => {});
}

/** Devolve (e limpa) uma foto pendente de um reinício do app. */
export async function takePendingPhotoFile(): Promise<File | null> {
  const path = localStorage.getItem(PENDING_PHOTO_KEY);
  if (!path) return null;
  localStorage.removeItem(PENDING_PHOTO_KEY);
  localStorage.removeItem(PENDING_ROUTE_KEY);
  const blob = await (await fetch(path)).blob();
  return new File([blob], `fatura-${Date.now()}.jpg`, { type: blob.type || 'image/jpeg' });
}

export function isNativeApp(): boolean {
  return Capacitor.isNativePlatform();
}

/** Pede permissão de câmara (e galeria no Android) no APK. */
export async function requestCameraPermission(): Promise<boolean> {
  if (!isNativeApp()) return true;
  try {
    const status = await Camera.checkPermissions();
    if (status.camera === 'granted') {
      return true;
    }
    const requested = await Camera.requestPermissions({ permissions: ['camera', 'photos'] });
    return requested.camera === 'granted';
  } catch {
    return false;
  }
}

/** Abre a câmara nativa e devolve um File (JPEG), ou null se cancelado. */
export async function capturePhotoFile(): Promise<File | null> {
  const ok = await requestCameraPermission();
  if (!ok) return null;

  localStorage.setItem(PENDING_ROUTE_KEY, window.location.pathname);
  try {
    const photo = await Camera.getPhoto({
      quality: 70,
      width: 1600,
      saveToGallery: false,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      correctOrientation: true,
    });
    localStorage.removeItem(PENDING_ROUTE_KEY);
    const path = photo.webPath;
    if (!path) return null;
    const res = await fetch(path);
    const blob = await res.blob();
    return new File([blob], `fatura-${Date.now()}.jpg`, { type: blob.type || 'image/jpeg' });
  } catch (err) {
    localStorage.removeItem(PENDING_ROUTE_KEY);
    const msg = (err as Error)?.message ?? '';
    if (msg.includes('User cancelled') || msg.includes('canceled')) return null;
    throw err;
  }
}