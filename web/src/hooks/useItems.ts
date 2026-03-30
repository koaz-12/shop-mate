import { useStore } from '@/store/useStore';
import { createClient } from '@/lib/supabase';
import { Item } from '@/types';
import { useCallback } from 'react';
import { toast } from 'react-hot-toast';

export function useItems() {
    const { items, updateItem, removeItem, addItem, queueAction, user } = useStore();
    const supabase = createClient();

    const addNewItem = useCallback(async (newItem: Partial<Item>) => {
        const tempId = `temp_${crypto.randomUUID()}`;
        const { items: currentItems, addItem: storeAddItem, removeItem: storeRemoveItem, updateItem: storeUpdateItem } = useStore.getState();

        // Build the optimistic item for local display only — uses tempId
        const optimisticItem = {
            ...newItem,
            id: tempId,
            created_at: new Date().toISOString(),
        } as Item;

        // Optimistic: show immediately in the UI
        addItem(optimisticItem);

        // Build the payload WITHOUT the id field so Supabase generates a real UUID
        const { id: _unused, ...payloadWithoutId } = optimisticItem;

        try {
            const { data, error } = await (supabase.from('items') as any)
                .insert(payloadWithoutId)
                .select()
                .single();

            if (error) throw error;

            if (data) {
                // Replace the optimistic temp item with the real item from DB
                // This ensures the item in our store has the correct UUID that other
                // family members will also see via Realtime.
                useStore.getState().removeItem(tempId);       // Remove temp
                useStore.getState().addItem(data as Item);    // Add real
            }
        } catch (e: any) {
            console.error('Offline / Error adding item:', e);
            toast('Guardado en cola (Sin conexión)', { icon: '📡' });
            // Queue for retry — use payload without the temp ID as well
            queueAction({
                id: crypto.randomUUID(),
                type: 'ADD_ITEM',
                payload: payloadWithoutId,
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
                        const { error } = await (supabase.from('items') as any)
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
            const { error } = await (supabase.from('items') as any)
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
            const { error } = await (supabase.from('items') as any)
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

    const duplicateItem = useCallback(async (originalItem: Item, quantity: string = "1") => {
        const existingListItem = items.find(i =>
            i.name.toLowerCase() === originalItem.name.toLowerCase() &&
            !i.in_pantry &&
            !i.deleted_at
        );

        if (existingListItem) {
            const currentQty = parseInt(existingListItem.quantity || "1");
            const additionalQty = parseInt(quantity || "1");

            if (!isNaN(currentQty) && !isNaN(additionalQty)) {
                const newQty = (currentQty + additionalQty).toString();
                updateItemDetails(existingListItem.id, { quantity: newQty });
                toast.success(`Cantidad actualizada: ${originalItem.name} (${newQty})`);
                return;
            }
        }

        // Create new — no is_completed field
        await addNewItem({
            name: originalItem.name,
            category: originalItem.category,
            price: originalItem.price,
            household_id: originalItem.household_id,
            list_id: originalItem.list_id,
            in_pantry: false,
            quantity: quantity,
            created_by: user?.id
        });
        toast.success(`Agregado a la lista: ${originalItem.name} (${quantity})`);
    }, [addNewItem, user, items, updateItemDetails]);

    const softDeleteItem = useCallback(async (itemId: string) => {
        // Optimistic
        removeItem(itemId);

        try {
            const { error } = await (supabase.from('items') as any)
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
