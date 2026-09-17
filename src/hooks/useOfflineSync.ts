/**
 * Background sync for pending offline time registrations.
 * Mounted once at the App root. Fires on `online`, periodically while pending
 * entries exist, and exposes the current pending count for UI badges.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  listDueEntries,
  removeEntry,
  updateEntry,
  countPending,
  requeueFailed,
  backoffDelayMs,
  OfflineEntry,
} from '@/utils/offlineQueue';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

const MAX_ATTEMPTS = 5;

/** "08:05" e "08:05:00" são o mesmo horário. */
const toMinutes = (time: string): number | null => {
  const m = /^(\d{1,2}):(\d{2})/.exec(time);
  if (!m) return null;
  return Number(m[1]) * 60 + Number(m[2]);
};

export function useOfflineSync() {
  const online = useOnlineStatus();
  const [pendingCount, setPendingCount] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const syncingRef = useRef(false);
  const { toast } = useToast();

  const refreshCount = useCallback(async () => {
    setPendingCount(await countPending());
  }, []);

  const syncOnce = useCallback(async () => {
    if (syncingRef.current) return;
    if (!navigator.onLine) return;

    // Sem sessão o servidor recusaria tudo por RLS: não gasta tentativas.
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return;
    const sessionUserId = session.user.id;

    const due = await listDueEntries();
    const pending = due.filter((q) => q.status === 'pending');
    if (pending.length === 0) {
      await refreshCount();
      return;
    }

    syncingRef.current = true;
    setSyncing(true);
    let synced = 0;

    const reschedule = async (entry: OfflineEntry, message: string) => {
      const attempts = entry.attempts + 1;
      await updateEntry({
        ...entry,
        attempts,
        last_error: message,
        next_attempt_at: new Date(Date.now() + backoffDelayMs(attempts)).toISOString(),
        status: attempts >= MAX_ATTEMPTS ? 'failed' : 'pending',
      });
    };

    try {
      for (const entry of pending) {
        // A fila vive no IndexedDB e não é fonte confiável de identidade;
        // o servidor também valida por RLS.
        if (entry.user_id !== sessionUserId) {
          await removeEntry(entry.client_id);
          continue;
        }

        try {
          // Try to load existing record for that user+date
          const { data: existing, error: selErr } = await supabase
            .from('time_records')
            .select('*')
            .eq('user_id', entry.user_id)
            .eq('date', entry.date)
            .in('status', ['active', 'approved'])
            .maybeSingle();

          if (selErr) throw selErr;

          const mergedLocations: Record<string, any> = {
            ...((existing?.locations as Record<string, any>) || {}),
            ...entry.locations,
          };

          if (existing?.id) {
            const serverTime: string | null = existing[entry.action];
            const serverMinutes = serverTime ? toMinutes(serverTime) : null;
            const localMinutes = toMinutes(entry.action_time);

            if (serverTime && serverMinutes === localMinutes) {
              await removeEntry(entry.client_id);
              synced += 1;
              continue;
            }

            const updateData: any = {
              locations: mergedLocations,
              updated_at: new Date().toISOString(),
            };

            if (serverTime) {
              // Conflito real: preserva o horário mais antigo (o que o funcionário
              // bateu primeiro) e deixa o descartado no registro para auditoria do RH.
              const keepLocal = localMinutes !== null && (serverMinutes === null || localMinutes < serverMinutes);
              updateData[entry.action] = keepLocal ? entry.action_time : serverTime;
              mergedLocations[`${entry.action}_conflict`] = {
                server_time: serverTime,
                offline_time: entry.action_time,
                resolved_to: updateData[entry.action],
                resolved_at: new Date().toISOString(),
              };
            } else {
              updateData[entry.action] = entry.action_time;
            }

            const { error } = await supabase
              .from('time_records')
              .update(updateData)
              .eq('id', existing.id);
            if (error) throw error;
          } else {
            const insertData: any = {
              user_id: entry.user_id,
              date: entry.date,
              status: 'active',
              locations: mergedLocations,
            };
            insertData[entry.action] = entry.action_time;
            const { error } = await supabase.from('time_records').insert(insertData);
            if (error) throw error;
          }

          await removeEntry(entry.client_id);
          synced += 1;
        } catch (e: any) {
          await reschedule(entry, e?.message || String(e));
        }
      }
    } finally {
      syncingRef.current = false;
      setSyncing(false);
      await refreshCount();
      if (synced > 0) {
        toast({
          title: 'Pontos sincronizados',
          description: `${synced} registro(s) enviado(s) com sucesso.`,
        });
      }
    }
  }, [toast, refreshCount]);

  // Sync on online + on mount
  useEffect(() => {
    refreshCount();
    if (online) {
      // A conexão voltou: pontos que esgotaram as tentativas merecem nova chance.
      const t = setTimeout(async () => {
        await requeueFailed();
        await syncOnce();
      }, 1500);
      return () => clearTimeout(t);
    }
  }, [online, syncOnce, refreshCount]);

  // Periodic retry while there are pending items
  useEffect(() => {
    if (!online || pendingCount === 0) return;
    const interval = setInterval(syncOnce, 60_000);
    return () => clearInterval(interval);
  }, [online, pendingCount, syncOnce]);

  return { online, pendingCount, syncing, syncNow: syncOnce, refreshCount };
}
