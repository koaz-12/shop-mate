import { useStore } from '@/store/useStore';
import { createClient } from '@/lib/supabase';
import { Item } from '@/types';
import { useCallback } from 'react';
import { toast } from 'react-hot-toast';

export function useItems() {
    const { items, updateItem, removeItem, addItem, queueAction } = useStore();
    const supabase = createClient();

    const addNewItem = useCallback(async (newItem: Partial<Item>) => {
        const tempId = crypto.randomUUID();
        // Ensure minimal required fields for local state
        const itemWithId = {
            ...newItem,
            id: tempId,
            created_at: new Date().toISOString(),
            is_completed: false // Default
        } as Item;

        // Optimistic
        addItem(itemWithId);

        try {
            // @ts-ignore
            const { error } = await supabase.from('items').insert(itemWithId);
            if (error) throw error;
        } catch (e: any) {
            console.error('Offline / Error adding item:', e);
            toast('Guardado en cola (Sin conexión)', { icon: '📡' });
            // Queue for retry
            queueAction({
                id: crypto.randomUUID(),
                type: 'ADD_ITEM',
                payload: itemWithId,
                timestamp: Date.now(),
                retryCount: 0
            });
        }
    }, [addItem, queueAction, supabase]);

    const toggleItem = useCallback(async (itemId: string, currentStatus: boolean) => {
        // Optimistic
        updateItem(itemId, { in_pantry: !currentStatus });

        try {
            const { error } = await supabase
                .from('items' as any)
                .update({ in_pantry: !currentStatus })
                .eq('id', itemId);

            if (error) throw error;
        } catch (e) {
            console.error('Offline toggle:', e);
            queueAction({
                id: crypto.randomUUID(),
                type: 'TOGGLE_ITEM',
                payload: { itemId, status: !currentStatus },
                timestamp: Date.now(),
                retryCount: 0
            });
        }
    }, [updateItem, supabase, queueAction]);

    const updateItemDetails = useCallback(async (itemId: string, updates: Partial<Item>) => {
        // Optimistic
        updateItem(itemId, updates);

        try {
            const { error } = await supabase
                .from('items' as any)
                .update(updates)
                .eq('id', itemId);

            if (error) throw error;
        } catch (e) {
            queueAction({
                id: crypto.randomUUID(),
                type: 'UPDATE_ITEM',
                payload: { itemId, updates },
                timestamp: Date.now(),
                retryCount: 0
            });
        }
    }, [updateItem, supabase, queueAction]);

    const softDeleteItem = useCallback(async (itemId: string) => {
        // Optimistic
        removeItem(itemId);

        try {
            const { error } = await supabase
                .from('items' as any)
                .update({ deleted_at: new Date().toISOString() })
                .eq('id', itemId);
            if (error) throw error;
        } catch (e) {
            queueAction({
                id: crypto.randomUUID(),
                type: 'DELETE_ITEM',
                payload: { itemId },
                timestamp: Date.now(),
                retryCount: 0
            });
        }
    }, [removeItem, supabase, queueAction]);

    return {
        addNewItem,
        toggleItem,
        updateItemDetails,
        softDeleteItem
    };
}
