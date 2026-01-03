'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/dashboard/Header';
import { createClient } from '@/lib/supabase';
import { useStore } from '@/store/useStore';
import { Item } from '@/types';
import { ArrowLeft, Trash2, RefreshCw, X, AlertOctagon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

export default function RecycleBinPage() {
    const supabase = createClient();
    const router = useRouter();
    const { household } = useStore();
    const [deletedItems, setDeletedItems] = useState<Item[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!household) return;

        const fetchDeleted = async () => {
            const { data } = await supabase
                .from('items')
                .select('*')
                .eq('household_id', household.id)
                .not('deleted_at', 'is', null)
                .order('deleted_at', { ascending: false });

            if (data) setDeletedItems(data);
            setIsLoading(false);
        };

        fetchDeleted();
    }, [household, supabase]);

    const handleRestore = async (id: string) => {
        // Optimistic
        setDeletedItems(prev => prev.filter(i => i.id !== id));

        const { error } = await supabase
            .from('items')
            .update({ deleted_at: null } as any)
            .eq('id', id);

        if (error) alert('Error al restaurar');
    };

    const handlePermanentDelete = async (id: string) => {
        if (!confirm('¿Eliminar permanentemente? No se puede deshacer.')) return;

        setDeletedItems(prev => prev.filter(i => i.id !== id));

        const { error } = await supabase
            .from('items')
            .delete()
            .eq('id', id);

        if (error) alert('Error al eliminar');
    };

    const handleEmptyTrash = async () => {
        if (!confirm('¿Vaciar TODA la papelera? Esta acción es irreversible.')) return;

        const ids = deletedItems.map(i => i.id);
        setDeletedItems([]);

        const { error } = await supabase
            .from('items')
            .delete()
            .in('id', ids);

        if (error) alert('Error al vaciar papelera');
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-24 pt-24 px-6">
            <div className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-30 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors">
                        <ArrowLeft size={20} className="text-slate-500" />
                    </button>
                    <h1 className="text-xl font-bold text-slate-900">Papelera</h1>
                </div>
                {deletedItems.length > 0 && (
                    <button
                        onClick={handleEmptyTrash}
                        className="text-xs font-bold text-red-500 hover:text-red-600 bg-red-50 px-3 py-1.5 rounded-full transition-colors"
                    >
                        Vaciar
                    </button>
                )}
            </div>

            <div className="space-y-4">
                {isLoading ? (
                    <div className="text-center py-10 text-slate-400">Cargando...</div>
                ) : deletedItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mb-4">
                            <Trash2 size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-700">Papelera Vacía</h3>
                        <p className="text-slate-400 text-sm">Los items eliminados aparecerán aquí.</p>
                    </div>
                ) : (
                    deletedItems.map(item => (
                        <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between animate-in fade-in duration-300">
                            <div>
                                <h4 className="font-bold text-slate-700 line-through decoration-slate-300 decoration-2">{item.name}</h4>
                                <p className="text-xs text-slate-400">
                                    {item.quantity ? item.quantity + ' • ' : ''}
                                    {item.category || 'Otros'}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleRestore(item.id)}
                                    className="p-2 bg-emerald-50 text-emerald-600 rounded-full hover:bg-emerald-100 transition-colors"
                                    title="Restaurar"
                                >
                                    <RefreshCw size={18} />
                                </button>
                                <button
                                    onClick={() => handlePermanentDelete(item.id)}
                                    className="p-2 bg-red-50 text-red-500 rounded-full hover:bg-red-100 transition-colors"
                                    title="Eliminar permanentemente"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>
                    ))
                )}

                {deletedItems.length > 0 && (
                    <div className="flex items-start gap-3 p-4 bg-orange-50 border border-orange-100 rounded-2xl mt-8">
                        <AlertOctagon className="text-orange-500 shrink-0 mt-0.5" size={20} />
                        <div>
                            <p className="text-sm font-bold text-orange-700">Información</p>
                            <p className="text-xs text-orange-600 mt-1">Los items en la papelera no se eliminan automáticamente (por ahora). Vacíala periódicamente para mantener orden.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
