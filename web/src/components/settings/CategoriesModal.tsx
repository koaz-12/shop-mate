'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { createClient } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { X, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CategoriesModal({ onClose }: { onClose: () => void }) {
    const { household, categories, setCategories } = useStore();
    const [newCategoryName, setNewCategoryName] = useState('');
    const supabase = createClient();

    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategoryName.trim() || !household) return;

        const newCat = {
            name: newCategoryName.trim(),
            household_id: household.id,
            keywords: [],
            is_system: false,
            icon: null // Default no icon for now
        };

        // Optimistic
        // @ts-ignore
        setCategories([...categories, { ...newCat, id: 'temp-' + Date.now() }]);
        setNewCategoryName('');

        const insertData: any = newCat;
        const { data, error } = await supabase
            .from('categories')
            .insert(insertData)
            .select()
            .single();

        if (data) {
            // Replace temp
            setCategories([...categories.filter((c: any) => !c.id.startsWith('temp-')), data as any]);
        } else if (error) {
            toast.error('Error al crear categoría');
        }
    };

    const handleDeleteCategory = async (id: string) => {
        if (!confirm('¿Eliminar esta categoría?')) return;

        // Optimistic
        setCategories(categories.filter((c: any) => c.id !== id));

        const { error } = await supabase
            .from('categories')
            .delete()
            .eq('id', id);

        if (error) {
            toast.error('Error al eliminar');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-sm max-h-[80vh] shadow-2xl p-6 flex flex-col">
                <div className="flex justify-between items-center mb-4 shrink-0">
                    <h3 className="font-bold text-lg dark:text-white">Editar Categorías</h3>
                    <button onClick={onClose}><X size={20} className="text-slate-400" /></button>
                </div>

                {/* New Category Input */}
                <form onSubmit={handleAddCategory} className="mb-4 flex gap-2 shrink-0">
                    <input
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        className="flex-1 h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 dark:text-white text-sm"
                        placeholder="Nueva categoría..."
                    />
                    <Button type="submit" size="icon" className="shrink-0 bg-primary-500 hover:bg-primary-600 text-white rounded-lg h-10 w-10">
                        <Plus size={20} />
                    </Button>
                </form>

                <div className="space-y-2 overflow-y-auto pr-2">
                    {categories.map((cat: any) => (
                        <div key={cat.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl group">
                            <div className="flex items-center gap-3">
                                <span className="text-lg">{cat.icon || '📦'}</span>
                                <span className="font-medium text-slate-700 dark:text-slate-200">{cat.name}</span>
                            </div>
                            {!cat.is_system && (
                                <button
                                    onClick={() => handleDeleteCategory(cat.id)}
                                    className="text-slate-400 hover:text-red-500 transition-colors p-1"
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                            {cat.is_system && (
                                <span className="text-[10px] text-slate-400 bg-slate-200 dark:bg-slate-600 px-1.5 py-0.5 rounded">System</span>
                            )}
                        </div>
                    ))}
                    {categories.length === 0 && (
                        <p className="text-center text-slate-400 text-sm py-4">No hay categorías</p>
                    )}
                </div>
            </div>
        </div>
    );
}
