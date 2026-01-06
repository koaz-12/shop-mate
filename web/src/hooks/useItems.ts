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

    const toggleItem = useCallback(async (itemId: string, currentStatus: boolean, forceMove: boolean = false) => {
        const movingToPantry = !currentStatus;

        // Smart Consumption: If in Pantry (currentStatus=true) and has quantity > 1
        // override with forceMove
        if (!movingToPantry && !forceMove) {
            const currentItem = items.find(i => i.id === itemId);
            if (currentItem?.quantity) {
                const qty = parseInt(currentItem.quantity);
                if (!isNaN(qty) && qty > 1) {
                    // Decrement logic via updateItemDetails
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

    const duplicateItem = useCallback(async (originalItem: Item, quantity: string = "1") => {
        await addNewItem({
            name: originalItem.name,
            category: originalItem.category,
            price: originalItem.price,
            household_id: originalItem.household_id,
            list_id: originalItem.list_id,
            in_pantry: false,
            is_completed: false,
            quantity: quantity,
            created_by: user?.id
        });
        toast.success(`Agregado a la lista: ${originalItem.name} (${quantity})`);
    }, [addNewItem, user]);

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
        softDeleteItem,
        duplicateItem
    };
}
