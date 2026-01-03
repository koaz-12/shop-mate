import { useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { createClient } from '@/lib/supabase';
import { toast } from 'react-hot-toast';

export function useOfflineSync() {
    const { connectionStatus, pendingActions, removeAction } = useStore();
    const supabase = createClient();

    useEffect(() => {
        if (connectionStatus === 'connected' && pendingActions.length > 0) {
            processQueue();
        }
    }, [connectionStatus, pendingActions.length]);

    const processQueue = async () => {
        console.log(`📡 Syncing ${pendingActions.length} pending actions...`);
        let successCount = 0;

        // Process sequentially to maintain order
        for (const action of pendingActions) {
            try {
                let error = null;

                if (action.type === 'ADD_ITEM') {
                    const { error: e } = await supabase.from('items' as any).insert(action.payload);
                    error = e;
                } else if (action.type === 'UPDATE_ITEM') {
                    const { error: e } = await supabase.from('items' as any).update(action.payload.updates).eq('id', action.payload.itemId);
                    error = e;
                } else if (action.type === 'TOGGLE_ITEM') {
                    const { error: e } = await supabase.from('items' as any).update({ in_pantry: action.payload.status }).eq('id', action.payload.itemId);
                    error = e;
                } else if (action.type === 'DELETE_ITEM') {
                    const { error: e } = await supabase.from('items' as any).update({ deleted_at: new Date().toISOString() }).eq('id', action.payload.itemId);
                    error = e;
                }

                if (!error) {
                    removeAction(action.id);
                    successCount++;
                } else {
                    console.error('Failed to sync action:', action, error);
                    // Leave in queue? Or remove if fatal? For now leave it.
                }

            } catch (err) {
                console.error('Critical sync error:', err);
            }
        }

        if (successCount > 0) {
            toast.success(`Sincronizados ${successCount} cambios pendientes`);
        }
    };
}
