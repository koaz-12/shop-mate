'use client';

import { useEffect } from 'react';
import Header from '@/components/dashboard/Header';
import ShoppingList from '@/components/dashboard/ShoppingList';
import AddItem from '@/components/dashboard/AddItem';
import BottomNav from '@/components/BottomNav';
import { useStore } from '@/store/useStore';
import { createClient } from '@/lib/supabase';

export default function DashboardPage() {
    const { household, autoAddRecurring, user } = useStore();

    useEffect(() => {
        if (!household || !autoAddRecurring || !user) return;

        const checkRecurrence = async () => {
            const supabase = createClient();
            const now = new Date().toISOString();

            const { data: dueProducts } = await supabase
                .from('household_products')
                .select('*')
                .eq('household_id', household.id)
                .not('recurrence_interval', 'is', null)
                .lte('next_occurrence', now);

            if (dueProducts && dueProducts.length > 0) {
                for (const p of (dueProducts as any[])) {
                    await supabase.from('items').insert({
                        household_id: household.id,
                        name: p.name,
                        category: p.category_name || 'Otros',
                        created_by: user.id,
                        in_pantry: false,
                        quantity: '1'
                    } as any);

                    const nextDate = new Date();
                    nextDate.setDate(nextDate.getDate() + (p.recurrence_interval || 7));
                    await (supabase.from('household_products') as any).update({
                        next_occurrence: nextDate.toISOString()
                    }).eq('id', p.id);
                }
            }
        };

        checkRecurrence();
    }, [household, autoAddRecurring, user]);

    return (
        <div className="min-h-screen bg-slate-50 relative">
            <Header />
            <main className="max-w-2xl mx-auto pb-24">
                <ShoppingList />
            </main>
            <AddItem />
        </div>
    );
}
