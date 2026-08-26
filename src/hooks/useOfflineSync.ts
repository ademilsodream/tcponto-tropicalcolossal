/**
 * Background sync for pending offline time registrations.
 * Mounted once at the App root. Fires on `online`, periodically while pending
 * entries exist, and exposes the current pending count for UI badges.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { listQueue, removeEntry, updateEntry, countPending } from '@/utils/offlineQueue';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

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

    const queue = await listQueue();
    const pending = queue.filter((q) => q.status === 'pending');
    if (pending.length === 0) {
      await refreshCount();
      return;
    }

    syncingRef.current = true;
    setSyncing(true);
    let synced = 0;

    try {
      for (const entry of pending) {
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

          const mergedLocations = {
            ...((existing?.locations as Record<string, any>) || {}),
            ...entry.locations,
          };

          if (existing?.id) {
            if (existing[entry.action]) {
              await removeEntry(entry.client_id);
              synced += 1;
              continue;
            }

            const updateData: any = {
              locations: mergedLocations,
              updated_at: new Date().toISOString(),
            };
            updateData[entry.action] = entry.action_time;
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
          const updated = {
            ...entry,
            attempts: entry.attempts + 1,
            last_error: e?.message || String(e),
            status: entry.attempts + 1 >= 5 ? ('failed' as const) : ('pending' as const),
          };
          await updateEntry(updated);
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
      // small delay so other auth/init code runs first
      const t = setTimeout(syncOnce, 1500);
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
