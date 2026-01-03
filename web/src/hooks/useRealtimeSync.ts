```typescript
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

        // Cleanup existing if ID changed or we are refreshing
        const topic = `realtime: sync - ${ householdId } `;
        const existingChannel = supabase.getChannels().find(c => c.topic === topic);

        if (existingChannel) {
             // If we have a channel, we generally reuse it.
             // But if this effect triggered due to 'refreshTrigger' change, we might want to kill it?
             // The previous cleanup should have killed it?
             // No, previous cleanup kills 'channelRef.current'.
             // If 'existingChannel' comes from global state, it might linger.
             
             // For robustness: Reuse if joined, but if we are here, we verify status.
             console.log('🔄 Checking existing channel:', topic, existingChannel.state);
             if (existingChannel.state === 'joined') {
                 setConnectionStatus('connected');
                 channelRef.current = existingChannel;
                 return;
             }
             // If closed or error, we might want to remove it and start fresh?
             if (existingChannel.state === 'closed' || existingChannel.state === 'errored') {
                 supabase.removeChannel(existingChannel);
             }
        }

        console.log('🔌 Initialize Realtime Connection:', householdId);
        setConnectionStatus('connecting');
        toast.loading('Connecting to household sync...', { id: 'realtime-sync' });

        const channel = supabase
            .channel(`sync - ${ householdId } `)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'items',
                    filter: `household_id = eq.${ householdId } `,
                },
                (payload) => {
                    console.log('📥 Realtime Payload:', payload);
                    setConnectionStatus('connected'); 

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
                console.log(`📶 Connection Status(${ householdId }): `, status);
                
                if (status === 'SUBSCRIBED') {
                    setConnectionStatus('connected');
                } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
                    console.error('❌ Connection Error:', status);
                    setConnectionStatus('disconnected');
                    // Optional: Trigger a retry after delay?
                } else if (status === 'CLOSED') {
                    setConnectionStatus('disconnected');
                }
            });

        channelRef.current = channel;

        return () => {
            // Cleanup: Only remove if we are truly unmounting or changing household
            console.log('🔌 Cleaning up channel...');
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current);
                channelRef.current = null;
            }
        };
    }, [householdId, supabase, addItem, updateItem, removeItem, setConnectionStatus, refreshTrigger]);
}
```
