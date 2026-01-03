'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useStore } from '@/store/useStore';
import { useItems } from '@/hooks/useItems';
import { Button } from '@/components/ui/Button';
import { Plus, RotateCcw, BarChart2, Trash2, X } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import Header from '@/components/dashboard/Header';
import RecurrenceModal from '@/components/dashboard/RecurrenceModal';
import { Clock } from 'lucide-react';

import { HouseholdProduct } from '@/types';

type HistoryItem = {
    name: string;
    category: string;
    quantity: string | null;
};

export default function HistoryPage() {
    const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
    const [products, setProducts] = useState<Record<string, HouseholdProduct>>({});
    const [recurrenceItem, setRecurrenceItem] = useState<HistoryItem | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const supabase = createClient();
    const { household, user, items: activeItems, addItem, currentList } = useStore(); // Get active items
    const { softDeleteItem } = useItems();

    useEffect(() => {
        if (!household) return;

        const fetchHistory = async () => {
            // Get unique items from history
            const { data } = await supabase
                .from('items')
                .select('name, category, quantity')
                .eq('household_id', household.id)
                .is('deleted_at', null)
                .order('created_at', { ascending: false });

            if (data) {
                const seen = new Set<string>();
                const distinct = (data as unknown as HistoryItem[]).filter(item => {
                    const key = item.name.toLowerCase();
                    if (seen.has(key)) return false;
                    seen.add(key);
                    return true;
                });
                setHistoryItems(distinct.sort((a, b) => a.name.localeCompare(b.name)));
            }

            // Fetch products for recurrence info
            const { data: prodData } = await supabase
                .from('household_products')
                .select('*')
                .eq('household_id', household.id);

            if (prodData) {
                const map: Record<string, HouseholdProduct> = {};
                prodData.forEach((p: HouseholdProduct) => map[p.name.toLowerCase()] = p);
                setProducts(map);
            }
        };

        fetchHistory();
    }, [household, supabase]);

    const handleSaveRecurrence = async (interval: number | null) => {
        if (!recurrenceItem || !household) return;
        const name = recurrenceItem.name;
        const lowerName = name.toLowerCase();
        const existing = products[lowerName];

        const payload: Partial<HouseholdProduct> = {
            household_id: household.id,
            name: name,
            category_name: recurrenceItem.category || existing?.category_name,
            recurrence_interval: interval,
            next_occurrence: interval ? new Date(Date.now() + interval * 86400000).toISOString() : null,
        };

        if (existing?.id) {
            payload.id = existing.id;
        }

        const { data } = await supabase
            .from('household_products' as any)
            .upsert(payload as any) // Supabase strict typing might complain about partial upsert
            .select()
            .single();

        if (data) {
            setProducts(prev => ({ ...prev, [lowerName]: data }));
        }
        setRecurrenceItem(null);
    };

    const handleDeleteFromHistory = async (name: string) => {
        if (!confirm(`¿Eliminar "${name}" del historial?`)) return;

        // Optimistic
        setHistoryItems(prev => prev.filter(i => i.name !== name));

        // Soft delete all items with this name
        await supabase
            .from('items' as any)
            .update({ deleted_at: new Date().toISOString() })
            .eq('household_id', household.id)
            .eq('name', name);
    };

    const handleRemoveFromList = async (name: string) => {
        const active = activeItems.find(i => i.name.toLowerCase() === name.toLowerCase() && !i.in_pantry);
        if (active) {
            if (confirm(`¿Quitar "${name}" de la lista?`)) {
                await softDeleteItem(active.id);
            }
        }
    };

    const addToShoppingList = async (item: HistoryItem) => {
        if (!household || !user) return;

        const newItem = {
            name: item.name,
            category: item.category,
            quantity: item.quantity,
            in_pantry: false, // Default to to-buy
            household_id: household.id,
            list_id: currentList?.id,
            created_by: user.id,
            is_completed: false
        };

        // Optimistic via store handling ideally, but simple insert works
        const { data, error } = await supabase.from('items' as any).insert(newItem as any).select().single();
        if (data) addItem(data);
    };

    // Filter logic
    const filteredItems = historyItems.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Grouping
    const groupedItems: Record<string, any[]> = {};
    filteredItems.forEach(item => {
        const cat = item.category || 'Otros';
        if (!groupedItems[cat]) groupedItems[cat] = [];
        groupedItems[cat].push(item);
    });

    // Helper to check status
    const getItemStatus = (name: string) => {
        const active = activeItems.find(i => i.name.toLowerCase() === name.toLowerCase());
        if (!active) return null;
        return active.in_pantry ? 'pantry' : 'shopping';
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            <Header />
            <div className="pt-20 px-4 space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-800">Catálogo</h2>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => window.location.href = '/analytics'}
                            className="bg-white p-2 text-indigo-600 rounded-xl shadow-sm border border-slate-100 hover:bg-indigo-50"
                        >
                            <BarChart2 size={20} />
                        </button>
                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-bold">
                            {historyItems.length} ítems
                        </span>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Buscar en historial..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-12 pl-10 pr-4 rounded-xl border-none shadow-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-500 bg-white"
                    />
                    <div className="absolute left-3 top-3.5 text-slate-400">
                        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                <div className="space-y-6">
                    {Object.keys(groupedItems).sort().map(category => (
                        <div key={category}>
                            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2 pl-2">
                                {category}
                            </h3>
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden divide-y divide-slate-50">
                                {groupedItems[category].map((item, idx) => {
                                    const status = getItemStatus(item.name);
                                    return (
                                        <div key={idx} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group">
                                            <div>
                                                <p className="font-medium text-slate-900">{item.name}</p>
                                                {item.quantity && <p className="text-xs text-slate-400">{item.quantity}</p>}
                                            </div>

                                            {status === 'pantry' && (
                                                <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold border border-blue-100 flex items-center gap-1">
                                                    En Despensa
                                                </span>
                                            )}

                                            {status === 'shopping' && (
                                                <div className="flex items-center gap-2">
                                                    <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold border border-emerald-100 flex items-center gap-1">
                                                        En Lista
                                                    </span>
                                                    <button
                                                        onClick={() => handleRemoveFromList(item.name)}
                                                        className="h-8 w-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-red-500 transition-all font-bold"
                                                        title="Quitar de la lista"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            )}

                                            {!status && (
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleDeleteFromHistory(item.name)}
                                                        className="h-8 w-8 flex items-center justify-center rounded-full text-slate-300 hover:bg-red-50 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                                                        title="Borrar del historial"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => setRecurrenceItem(item)}
                                                        className={`h-8 w-8 flex items-center justify-center rounded-full transition-all shadow-sm ${products[item.name.toLowerCase()]?.recurrence_interval
                                                            ? 'bg-blue-100 text-blue-600 ring-2 ring-blue-200'
                                                            : 'bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-500'}`}
                                                    >
                                                        <Clock size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => addToShoppingList(item)}
                                                        className="h-8 w-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                                                    >
                                                        <Plus size={16} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {recurrenceItem && (
                <RecurrenceModal
                    itemName={recurrenceItem.name}
                    currentInterval={products[recurrenceItem.name.toLowerCase()]?.recurrence_interval || null}
                    onClose={() => setRecurrenceItem(null)}
                    onSave={handleSaveRecurrence}
                />
            )}
        </div>
    );
}
