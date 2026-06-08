import { useEffect, useRef } from 'react';
import { App } from '@capacitor/app';
import { Device } from '@capacitor/device';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';
import { debugLog } from '@/utils/debugLogger';

export async function trackAppDevice(employeeId: string): Promise<void> {
  try {
    const platform = Capacitor.getPlatform();
    const [appInfo, deviceId, deviceInfo] = await Promise.all([
      App.getInfo(),
      Device.getId(),
      Device.getInfo(),
    ]);

    const now = new Date().toISOString();
    const { error } = await supabase.from('employee_app_devices').upsert(
      {
        employee_id: employeeId,
        device_key: deviceId.identifier,
        platform,
        app_version: appInfo.version,
        app_build: appInfo.build,
        device_model: deviceInfo.model || null,
        os_version: deviceInfo.osVersion || null,
        last_seen_at: now,
      },
      { onConflict: 'employee_id,device_key' }
    );

    if (error) {
      debugLog('ERROR', 'Erro ao registrar dispositivo do app', { error: error.message });
      return;
    }

    debugLog('INFO', 'Dispositivo do app registrado', {
      employeeId,
      platform,
      version: appInfo.version,
      build: appInfo.build,
    });
  } catch (error) {
    debugLog('ERROR', 'Erro inesperado ao registrar dispositivo do app', { error });
  }
}

export function useAppDeviceTracking(employeeId: string | undefined): void {
  const lastTrackedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!employeeId || lastTrackedRef.current === employeeId) return;
    lastTrackedRef.current = employeeId;
    trackAppDevice(employeeId);
  }, [employeeId]);
}
