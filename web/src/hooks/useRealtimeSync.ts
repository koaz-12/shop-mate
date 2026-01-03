import { useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { useStore } from '@/store/useStore';

export function useRealtimeSync() {
    const supabase = createClient();
    const { household, addItem, updateItem, removeItem, setItems } = useStore();
    const householdId = household?.id;

    useEffect(() => {
        if (!householdId) return;

        const channel = supabase
            .channel('db-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'items',
                    filter: `household_id=eq.${householdId}`,
                },
                (payload) => {
                    console.log('Realtime change:', payload);

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
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [householdId, supabase, addItem, updateItem, removeItem]);
}
