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

    // Track if we are visibly mounting or waking up
    const isWakingUpRef = useRef(false);

    useEffect(() => {
        if (!householdId) return;

        let connectTimer: NodeJS.Timeout;

        const connect = async () => {
            // 1. Force cleanup of any existing channel for this household to guarantee fresh listeners
            const topic = `realtime:sync-${householdId}`;
            const existingChannel = supabase.getChannels().find(c => c.topic === topic);
            if (existingChannel) {
                console.log('🧹 Cleaning stale channel before mount:', topic);
                await supabase.removeChannel(existingChannel);
            }

            console.log('🔌 Initialize Realtime Connection:', householdId);
            setConnectionStatus('connecting');

            // Only show toast if triggered manually (refreshTrigger > 0 means it's not initial load)
            // Actually refreshTrigger starts at 0. If user clicks, it becomes 1, 2...
            // But checking connectionStatus might be better? No, refreshTrigger is explicit user intent.
            if (refreshTrigger > 0) {
                toast.loading('Sincronizando...', { id: 'realtime-sync', duration: 2000 });
            }

            const channel = supabase
                .channel(`sync-${householdId}`)
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'items',
                        filter: `household_id=eq.${householdId}`, // Only receive items for THIS household
                    },
                    (payload) => {
                        console.log('📥 Realtime Payload:', payload);
                        setConnectionStatus('connected');

                        // Note: RLS ensures we only receive our items.
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
        };

        // Debounce connection to prevent race conditions in Strict Mode
        connectTimer = setTimeout(() => {
            connect();
        }, 500);

        // Listeners para forzar reconexiones instántaneas desde PWA Background o modo Off-Line
        const forceReconnect = () => {
            if (!householdId) return;
            // Evitar spam de eventos: solo forzamos limpieza si la app cree que está conectada 
            // pero el socket está dormido, o si simplemente estamos despertando.
            isWakingUpRef.current = true;
            console.log('⚡ Fuerza de Reconexión Activada (Online/Wake-up)');
            setConnectionStatus('connecting');
            
            // Destruir cualquier canal zombie inmediatamente para que el connect cree uno limpio
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current);
                channelRef.current = null;
            }
            
            // Limpiar cualquier intento previo que estuviera encolado
            clearTimeout(connectTimer);
            connect();
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                forceReconnect();
            }
        };

        const handleOnline = () => {
            forceReconnect();
        };

        window.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('online', handleOnline);

        return () => {
            window.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('online', handleOnline);
            clearTimeout(connectTimer); // Cancel pending connection
            if (channelRef.current) {
                console.log('🔌 Cleaning up channel...');
                supabase.removeChannel(channelRef.current);
                channelRef.current = null;
            }
        };
    }, [householdId, supabase, addItem, updateItem, removeItem, setConnectionStatus, refreshTrigger]);
}
