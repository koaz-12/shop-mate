'use client';

import { useState, useMemo, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { useStore } from '@/store/useStore';
import { Item } from '@/types';
import SwipeableListItem from './SwipeableListItem';
import { Coffee, Package, ShoppingCart, RefreshCcw, Trash2, ArrowRight, MoreVertical, Check, Share2 } from 'lucide-react';
import { useItems } from '@/hooks/useItems';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import EditItemModal from './EditItemModal';
import EmptyState from './EmptyState';

export default function ShoppingList() {
    const { items, household, currentList } = useStore();
    const { toggleItem, updateItemDetails, softDeleteItem } = useItems();
    const router = useRouter();

    const [activeView, setActiveView] = useState<'shopping-list' | 'pantry'>('shopping-list');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'category' | 'name' | 'price-desc'>('category');

    // UI State
    const [editingItem, setEditingItem] = useState<Item | null>(null);
    const [lastDeletedItem, setLastDeletedItem] = useState<Item | null>(null);
    const [showUndoToast, setShowUndoToast] = useState(false);

    // Subscription only (CRUD via hooks)
    const supabase = createClient();

    // Filter Items
    const { filteredItems, totalCost, totalCount } = useMemo(() => {
        let result = items.filter(item => !item.deleted_at);

        if (currentList) {
            result = result.filter(item => item.list_id === currentList.id);
        }

        const viewItems = activeView === 'shopping-list'
            ? result.filter(item => !item.in_pantry)
            : result.filter(item => item.in_pantry);

        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            result = viewItems.filter(item => item.name.toLowerCase().includes(lower));
        } else {
            result = viewItems;
        }

        // Stats
        let cost = 0;
        result.forEach(i => cost += (i.price || 0));

        // Sort
        result.sort((a, b) => {
            if (sortBy === 'name') return a.name.localeCompare(b.name);
            if (sortBy === 'price-desc') return (b.price || 0) - (a.price || 0);
            return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        });

        return { filteredItems: result, totalCost: cost, totalCount: result.length };
    }, [items, currentList, activeView, searchTerm, sortBy]);


    // Grouping
    const groupedItems = useMemo(() => {
        const groups: Record<string, Item[]> = {};
        filteredItems.forEach(item => {
            let cat = item.category || 'Otros';
            if (sortBy !== 'category') cat = 'Listado'; // Flat list if explicitly sorting by other means? Or keep categories? 
            // User usually prefers categories. Let's keep categories unless name/price sort overrides it visually?
            // Actually usually sort is WITHIN categories or Global.
            // Let's do Global sort if sort != category.

            if (!groups[cat]) groups[cat] = [];
            groups[cat].push(item);
        });
        return groups;
    }, [filteredItems, sortBy]);

    const sortedCategories = Object.keys(groupedItems).sort();

    // Undo Logic (Simple Revert)
    const handleUndoDelete = async () => {
        if (!lastDeletedItem) return;
        // Re-inject
        // Implementation note: softDeleteItem sets deleted_at. We just unset it.
        if (navigator.vibrate) navigator.vibrate(5);

        updateItemDetails(lastDeletedItem.id, { deleted_at: null });
        setShowUndoToast(false);
        setLastDeletedItem(null);
    };

    if (!household || !currentList) return null;

    return (
        <div className="pb-32 pt-20 px-4 space-y-6">

            {/* View Switcher */}
            <div className="flex gap-2 mb-4 sticky top-[72px] z-10">
                <div className="flex-1 flex p-1 bg-slate-100 rounded-2xl shadow-sm">
                    <button
                        onClick={() => setActiveView('shopping-list')}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all",
                            activeView === 'shopping-list'
                                ? "bg-white text-primary-600 shadow-sm"
                                : "text-slate-400 hover:text-slate-600"
                        )}
                    >
                        <ShoppingCart size={18} />
                        <span className="hidden sm:inline">Compra</span>
                    </button>
                    <button
                        onClick={() => setActiveView('pantry')}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all",
                            activeView === 'pantry'
                                ? "bg-white text-primary-600 shadow-sm"
                                : "text-slate-400 hover:text-slate-600"
                        )}
                    >
                        <Package size={18} />
                        <span className="hidden sm:inline">Despensa</span>
                    </button>
                </div>
            </div>

            {/* Shopping Button Banner */}
            {activeView === 'shopping-list' && filteredItems.length > 0 && (
                <div className="mb-2">
                    <button
                        onClick={() => router.push('/shopping')}
                        className="w-full bg-gradient-to-r from-primary-600 to-primary-500 text-white p-4 rounded-2xl shadow-lg shadow-primary-200 flex items-center justify-between group active:scale-[0.98] transition-all"
                    >
                        <div className="flex flex-col items-start">
                            <span className="text-lg font-bold">Iniciar Modo Compra 🚀</span>
                            <span className="text-primary-100 text-xs font-medium">{filteredItems.length} artículos pendientes</span>
                        </div>
                        <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                            <ArrowRight size={20} />
                        </div>
                    </button>
                </div>
            )}

            {/* List Content */}
            <div className="space-y-6">
                {filteredItems.length === 0 ? (
                    <EmptyState
                        type={activeView === 'shopping-list' ? "empty-list" : "empty-pantry"}
                        message={activeView === 'shopping-list' ? "Tu lista está vacía" : "Despensa vacía"}
                        subMessage="Agrega productos usando el botón + abajo."
                    />
                ) : (
                    sortedCategories.map(category => (
                        <div key={category}>
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-2 sticky top-[130px] z-10 bg-slate-50/90 backdrop-blur-sm py-1 w-fit pr-4 rounded-r-lg">
                                {category}
                            </h3>
                            <div>
                                {groupedItems[category].map(item => (
                                    <SwipeableListItem
                                        key={item.id}
                                        item={item}
                                        activeView={activeView}
                                        onToggle={(i) => toggleItem(i.id, i.in_pantry)}
                                        onDelete={(id) => {
                                            setLastDeletedItem(item);
                                            setShowUndoToast(true);
                                            setTimeout(() => setShowUndoToast(false), 4000);
                                            softDeleteItem(id);
                                        }}
                                        onEdit={setEditingItem}
                                        onUpdate={updateItemDetails}
                                    />
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Edit Modal */}
            {editingItem && (
                <EditItemModal
                    item={editingItem}
                    onClose={() => setEditingItem(null)}
                    onSave={(id, name, cat, qty, price) => {
                        updateItemDetails(id, { name, category: cat, quantity: qty, price });
                    }}
                />
            )}

            {/* Undo Toast */}
            {showUndoToast && lastDeletedItem && (
                <div className="fixed bottom-24 left-4 right-4 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300 pointer-events-auto">
                    <div className="bg-slate-900/90 backdrop-blur-md text-white px-4 py-3 rounded-xl shadow-2xl flex items-center justify-between gap-4">
                        <div className="flex flex-col">
                            <span className="font-medium text-sm">Eliminado: {lastDeletedItem.name}</span>
                            <span className="text-xs text-slate-400">¿Fue un error?</span>
                        </div>
                        <button
                            onClick={handleUndoDelete}
                            className="text-primary-400 font-bold text-sm px-3 py-1.5 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            DESHACER
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
