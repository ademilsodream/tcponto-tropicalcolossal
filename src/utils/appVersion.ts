import { App } from '@capacitor/app';

const FALLBACK_VERSION = import.meta.env.VITE_APP_VERSION ?? '5.1';

export async function getAppVersion(): Promise<string> {
  try {
    const info = await App.getInfo();
    return info.version || FALLBACK_VERSION;
  } catch {
    return FALLBACK_VERSION;
  }
}
