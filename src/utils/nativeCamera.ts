import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

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

  try {
    const photo = await Camera.getPhoto({
      quality: 85,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      correctOrientation: true,
    });
    const path = photo.webPath;
    if (!path) return null;
    const res = await fetch(path);
    const blob = await res.blob();
    return new File([blob], `fatura-${Date.now()}.jpg`, { type: blob.type || 'image/jpeg' });
  } catch (err) {
    const msg = (err as Error)?.message ?? '';
    if (msg.includes('User cancelled') || msg.includes('canceled')) return null;
    throw err;
  }
}