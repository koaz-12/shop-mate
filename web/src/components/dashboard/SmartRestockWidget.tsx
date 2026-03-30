import { useMemo } from 'react';
import { Sparkles, Plus } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useItems } from '@/hooks/useItems';
import toast from 'react-hot-toast';

export default function SmartRestockWidget() {
    const { items, catalog, household, user, currentList, activeView } = useStore();
    const { addNewItem } = useItems();

    const suggestedItems = useMemo(() => {
        if (!catalog || catalog.length === 0) return [];

        // Get currently active items (in shopping list or pantry)
        const activeNames = new Set(items.filter(i => !i.deleted_at).map(i => i.name.toLowerCase()));

        // We want to suggest items that are in catalog, NOT currently in active list,
        // ordered by purchase_count descending.
        const candidates = catalog
            .filter(cat => !activeNames.has(cat.name.toLowerCase()))
            .sort((a, b) => (b.times_bought || 0) - (a.times_bought || 0))
            .slice(0, 5); // top 5 suggestions

        return candidates;
    }, [catalog, items]);

    if (suggestedItems.length === 0) return null;

    const handleAddSuggestion = (catalogItem: any) => {
        if (!household || !user || !currentList) return;

        const newItem = {
            name: catalogItem.name,
            category: catalogItem.category_name || 'Otros',
            quantity: null,
            price: catalogItem.last_price || null,
            in_pantry: false, // Suggestions go to shopping list usually
            household_id: household.id,
            list_id: currentList.id,
            created_by: user.id,
            barcode: catalogItem.last_barcode || null
        };

        addNewItem(newItem);
        toast.success(`${catalogItem.name} agregado a la lista`);
    };

    return (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-5 border border-indigo-100 shadow-sm relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute -top-6 -right-6 text-indigo-500/10">
                <Sparkles size={80} />
            </div>

            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                    <Sparkles size={16} className="text-indigo-500" />
                    <h3 className="text-sm font-bold text-indigo-900">Sugerencias Inteligentes</h3>
                </div>
                <p className="text-xs text-indigo-600 mb-4 leading-snug">
                    Basado en tu historial, podrías necesitar estos productos pronto.
                </p>

                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-2 px-2">
                    {suggestedItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => handleAddSuggestion(item)}
                            className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl shadow-sm border border-indigo-100/50 flex-shrink-0 hover:bg-indigo-50 transition-colors group"
                        >
                            <span className="text-sm font-semibold text-slate-700 group-hover:text-indigo-700">{item.name}</span>
                            <div className="h-6 w-6 bg-indigo-100 rounded-full flex items-center justify-center">
                                <Plus size={14} className="text-indigo-600 group-hover:scale-110 transition-transform" />
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
