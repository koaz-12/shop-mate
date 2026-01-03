'use client';

import { createClient } from '@/lib/supabase';
import { useStore } from '@/store/useStore';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, Coffee, RefreshCcw, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming cn exists, else standard string concat

export default function ShoppingModePage() {
    const { items, updateItem } = useStore();
    const router = useRouter();
    const supabase = createClient();
    const [wakeLock, setWakeLock] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'todo' | 'done'>('todo');

    // Filters
    const todoList = items.filter(i => !i.in_pantry && !i.deleted_at);
    // For 'done', normally we show ALL pantry items? 
    // Or maybe we should only show items that were *recently* bought? 
    // The user's request "si me equivoco solo es ir a la otra pestaña" implies they want to find what they JUST checked.
    // If I show 500 pantry items, it's hard to find.
    // However, without a "session" concept, "Pantry" is the only definition of "Done".
    // I will sort by `updated_at` desc so the most recently checked is at top.
    const doneList = items
        .filter(i => i.in_pantry && !i.deleted_at)
        .sort((a, b) => new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime());

    useEffect(() => {
        const requestWakeLock = async () => {
            try {
                if ('wakeLock' in navigator) {
                    const lock = await (navigator as any).wakeLock.request('screen');
                    setWakeLock(lock);
                }
            } catch (err) {
                console.error('Wake Lock Error:', err);
            }
        };
        requestWakeLock();
        return () => wakeLock?.release();
    }, []);

    const toggleItem = async (itemId: string, currentStatus: boolean) => {
        if (navigator.vibrate) navigator.vibrate(50);

        const newStatus = !currentStatus;
        updateItem(itemId, { in_pantry: newStatus, is_completed: newStatus });

        await supabase
            .from('items')
            .update({ in_pantry: newStatus, is_completed: newStatus } as any)
            .eq('id', itemId);
    };

    // Grouping
    const currentList = activeTab === 'todo' ? todoList : doneList;
    const groupedItems: Record<string, typeof items> = {};
    currentList.forEach(item => {
        const cat = item.category || 'Otros';
        if (!groupedItems[cat]) groupedItems[cat] = [];
        groupedItems[cat].push(item);
    });

    const progress = items.length > 0
        ? Math.round((items.filter(i => i.in_pantry && !i.deleted_at).length / items.filter(i => !i.deleted_at).length) * 100)
        : 0;

    return (
        <div className="min-h-screen bg-slate-50 relative pb-20">
            {/* Header */}
            <div className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md z-20 pt-6 px-4 pb-2 border-b border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-4 px-2">
                    <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600">
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-xl font-bold text-slate-800">Modo Compra</h1>
                    <div className="w-10"></div>
                </div>

                {/* Progress */}
                <div className="px-2 mb-6">
                    <div className="flex justify-between text-xs font-medium mb-1 text-slate-500">
                        <span>Progreso</span>
                        <span>{progress}%</span>
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary-500 transition-all duration-500 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex p-1 bg-slate-100 rounded-xl">
                    <button
                        onClick={() => setActiveTab('todo')}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'todo'
                                ? 'bg-white text-primary-600 shadow-sm'
                                : 'text-slate-400 hover:text-slate-600'
                            }`}
                    >
                        <ShoppingBag size={18} />
                        Por Comprar ({todoList.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('done')}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'done'
                                ? 'bg-white text-emerald-600 shadow-sm'
                                : 'text-slate-400 hover:text-slate-600'
                            }`}
                    >
                        <Check size={18} />
                        Comprado ({doneList.length})
                    </button>
                </div>
            </div>

            <div className="pt-56 px-4 space-y-6">
                {currentList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center pt-20 text-slate-400">
                        {activeTab === 'todo' ? (
                            <>
                                <Coffee size={64} className="mb-4 text-slate-300" />
                                <p className="text-lg font-medium">¡Todo listo!</p>
                                <p className="text-sm">No tienes pendientes.</p>
                                <button onClick={() => router.back()} className="mt-8 text-primary-600 font-bold">Volver</button>
                            </>
                        ) : (
                            <>
                                <RefreshCcw size={64} className="mb-4 text-slate-300" />
                                <p className="text-lg font-medium">Nada por aquí</p>
                                <p className="text-sm">Aún no has comprado nada.</p>
                            </>
                        )}
                    </div>
                ) : (
                    Object.keys(groupedItems).sort().map(category => (
                        <div key={category}>
                            <h3 className="text-lg font-bold text-slate-600 mb-3 px-2 flex items-center gap-2">
                                {category}
                                <span className="text-xs font-normal bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full">
                                    {groupedItems[category].length}
                                </span>
                            </h3>
                            <div className="space-y-3">
                                {groupedItems[category].map(item => (
                                    <button
                                        key={item.id}
                                        onClick={() => toggleItem(item.id, item.in_pantry)}
                                        className={`w-full p-5 rounded-2xl shadow-sm border-2 flex items-center justify-between active:scale-95 transition-all text-left group ${activeTab === 'todo'
                                            ? 'bg-white border-slate-100 hover:border-primary-100'
                                            : 'bg-slate-50 border-slate-100 opacity-60 hover:opacity-100'
                                            }`}
                                    >
                                        <div>
                                            <p className={`text-xl font-bold transition-colors ${activeTab === 'todo' ? 'text-slate-800' : 'text-slate-500 line-through'
                                                }`}>
                                                {item.name}
                                            </p>
                                            {item.quantity && (
                                                <p className="text-base text-slate-500 font-medium">{item.quantity}</p>
                                            )}
                                        </div>
                                        <div className={`h-10 w-10 rounded-full border-2 flex items-center justify-center transition-all ${activeTab === 'todo'
                                            ? 'border-slate-200 text-transparent group-hover:border-primary-500 group-hover:text-primary-500'
                                            : 'bg-primary-100 border-primary-500 text-primary-600'
                                            }`}>
                                            {activeTab === 'todo' ? <Check size={24} strokeWidth={3} /> : <RefreshCcw size={20} />}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="fixed bottom-6 left-0 right-0 flex justify-center z-20 pointer-events-none">
                <div className="bg-slate-900/80 backdrop-blur text-white px-4 py-2 rounded-full text-xs font-medium shadow-xl pointer-events-auto">
                    Pantalla encendida 💡
                </div>
            </div>
        </div>
    );
}
