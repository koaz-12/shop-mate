import { useStore } from '@/store/useStore';
import { createClient } from '@/lib/supabase';
import { Item } from '@/types';
import { useCallback } from 'react';
import { toast } from 'react-hot-toast';

export function useItems() {
    const { items, updateItem, removeItem, addItem, queueAction, user } = useStore();
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
        const movingToPantry = !currentStatus;

        // Smart Consumption: If in Pantry (currentStatus=true) and has quantity > 1
        if (!movingToPantry) {
            const currentItem = items.find(i => i.id === itemId);
            if (currentItem?.quantity) {
                const qty = parseInt(currentItem.quantity);
                if (!isNaN(qty) && qty > 1) {
                    // Decrement logic via updateItemDetails
                    // We need to define updateItemDetails before toggleItem or hoist it? 
                    // They are in the same hook. Typescript handles hoisting for functions but these are consts.
                    // I will inline the update logic here to avoid dependency cycle or definition order issues,
                    // OR rely on updateItemDetails being available if I move this definition after it?
                    // They are callbacks. JS handles circular refs in callbacks fine as long as they exist when called.
                    // But `updateItemDetails` is defined AFTER `toggleItem` in the file.
                    // I should call `updateItem` (store) and `supabase` directly here for simplicity.

                    const newQty = (qty - 1).toString();
                    updateItem(itemId, { quantity: newQty });
                    toast.success(`1 consumido. Quedan ${newQty}`);

                    try {
                        const { error } = await supabase
                            .from('items' as any)
                            .update({ quantity: newQty })
                            .eq('id', itemId);
                        if (error) throw error;
                    } catch (e) {
                        // queue update
                        queueAction({
                            id: crypto.randomUUID(),
                            type: 'UPDATE_ITEM',
                            payload: { itemId, updates: { quantity: newQty } },
                            timestamp: Date.now(),
                            retryCount: 0
                        });
                    }
                    return;
                }
            }
        }

        const updates = {
            in_pantry: movingToPantry,
            bought_by: movingToPantry ? user?.id : null
        };

        // Optimistic
        updateItem(itemId, updates);

        try {
            const { error } = await supabase
                .from('items' as any)
                .update(updates)
                .eq('id', itemId);

            if (error) throw error;
        } catch (e) {
            console.error('Offline toggle:', e);
            queueAction({
                id: crypto.randomUUID(),
                type: 'TOGGLE_ITEM',
                payload: { itemId, status: movingToPantry, bought_by: updates.bought_by },
                timestamp: Date.now(),
                retryCount: 0
            });
        }
    }, [updateItem, supabase, queueAction, user, items]); // Added items dependency

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
