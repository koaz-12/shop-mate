import { useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase';
import { useStore } from '@/store/useStore';

export function useRealtimeSync() {
    const supabase = useMemo(() => createClient(), []);
    const { household, addItem, updateItem, removeItem, setConnectionStatus } = useStore();
    const householdId = household?.id;

    useEffect(() => {
        if (!householdId) return;

        console.log('🔌 Connecting to Realtime for Household:', householdId);
        setConnectionStatus('connecting');

        const channel = supabase
            .channel(`sync-${householdId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'items',
                    filter: `household_id=eq.${householdId}`,
                },
                (payload) => {
                    console.log('Realtime change (items):', payload);

                    if (payload.eventType === 'INSERT') {
                        addItem(payload.new as any);
                    } else if (payload.eventType === 'UPDATE') {
                        // Check if it was soft deleted
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
                if (status === 'SUBSCRIBED') {
                    console.log('✅ Subscribed to Realtime changes');
                    setConnectionStatus('connected');
                } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
                    console.error('❌ Realtime Error:', status);
                    setConnectionStatus('disconnected');
                }
            });

        return () => {
            console.log('🔌 Disconnecting Realtime...');
            supabase.removeChannel(channel);
            setConnectionStatus('disconnected');
        };
    }, [householdId, supabase, addItem, updateItem, removeItem, setConnectionStatus]);
}
