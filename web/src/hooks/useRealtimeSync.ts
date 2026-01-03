import { useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase';
import { useStore } from '@/store/useStore';
import { RealtimeChannel } from '@supabase/supabase-js';
import { toast } from 'react-hot-toast';

export function useRealtimeSync() {
    const supabase = createClient();
    const { household, addItem, updateItem, removeItem, setConnectionStatus, refreshTrigger } = useStore();
    const householdId = household?.id;
    const channelRef = useRef<RealtimeChannel | null>(null);

    useEffect(() => {
        if (!householdId) return;

        // 1. Force cleanup of any existing channel for this household to guarantee fresh listeners
        const topic = `realtime:sync-${householdId}`;
        const existingChannel = supabase.getChannels().find(c => c.topic === topic);
        if (existingChannel) {
            console.log('🧹 Cleaning stale channel before mount:', topic);
            supabase.removeChannel(existingChannel);
        }

        console.log('🔌 Initialize Realtime Connection:', householdId);
        setConnectionStatus('connecting');
        toast.loading('Sincronizando...', { id: 'realtime-sync', duration: 2000 });

        const channel = supabase
            .channel(`sync-${householdId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'items',
                    // Removed filter string to rely on RLS and avoid syntax issues
                },
                (payload) => {
                    console.log('📥 Realtime Payload:', payload);
                    setConnectionStatus('connected');

                    // Note: RLS ensures we only receive our items.
                    // Redundant client-side check is unnecessary for security but harmless.

                    if (payload.eventType === 'INSERT') {
                        addItem(payload.new as any);
                    } else if (payload.eventType === 'UPDATE') {
                        if (payload.new.deleted_at) {
                            removeItem(payload.new.id);
                        } else {
                            updateItem(payload.new.id, payload.new as any);
                        }
                    } else if (payload.eventType === 'DELETE') {
                        removeItem(payload.old.id);
                    }
                }
            )
            .subscribe((status) => {
                console.log(`📶 Connection Status (${householdId}):`, status);

                if (status === 'SUBSCRIBED') {
                    setConnectionStatus('connected');
                } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
                    console.error('❌ Connection Error:', status);
                    setConnectionStatus('disconnected');
                } else if (status === 'CLOSED') {
                    setConnectionStatus('disconnected');
                }
            });

        channelRef.current = channel;

        return () => {
            console.log('🔌 Cleaning up channel...');
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current);
                channelRef.current = null;
            }
        };
    }, [householdId, supabase, addItem, updateItem, removeItem, setConnectionStatus, refreshTrigger]);
}
