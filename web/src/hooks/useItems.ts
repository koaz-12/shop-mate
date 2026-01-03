import { useStore } from '@/store/useStore';
import { createClient } from '@/lib/supabase';
import { Item } from '@/types';
import { useCallback } from 'react';

export function useItems() {
    const { items, updateItem, deleteItem, lists } = useStore();
    const supabase = createClient();

    const toggleItem = useCallback(async (itemId: string, currentStatus: boolean) => {
        // Optimistic
        updateItem(itemId, { in_pantry: !currentStatus });

        // Database
        await supabase
            .from('items' as any)
            .update({ in_pantry: !currentStatus })
            .eq('id', itemId);
    }, [updateItem, supabase]);

    const updateItemDetails = useCallback(async (itemId: string, updates: Partial<Item>) => {
        // Optimistic
        updateItem(itemId, updates);

        // Database
        const { error } = await supabase
            .from('items' as any)
            .update(updates)
            .eq('id', itemId);

        if (error) console.error('Error updating item:', error);
    }, [updateItem, supabase]);

    const softDeleteItem = useCallback(async (itemId: string) => {
        // Optimistic
        deleteItem(itemId); // remove from store

        // Database (Soft Delete)
        await supabase
            .from('items' as any)
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', itemId);
    }, [deleteItem, supabase]);

    return {
        toggleItem,
        updateItemDetails,
        softDeleteItem
    };
}
