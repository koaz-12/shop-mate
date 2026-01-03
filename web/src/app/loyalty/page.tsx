'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { ArrowLeft, Plus, Trash2, X, Wallet, ScanLine } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import Barcode from 'react-barcode';
import { createClient } from '@/lib/supabase';

export default function LoyaltyPage() {
    const { loyaltyCards, addLoyaltyCard, removeLoyaltyCard, household, user } = useStore();
    const router = useRouter();
    const supabase = createClient();
    const [isAdding, setIsAdding] = useState(false);
    const [viewCard, setViewCard] = useState<string | null>(null); // ID of card to view large

    // Form State
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [color, setColor] = useState('emerald');

    const colors = [
        { name: 'emerald', bg: 'bg-emerald-500', text: 'text-emerald-500' },
        { name: 'blue', bg: 'bg-blue-500', text: 'text-blue-500' },
        { name: 'purple', bg: 'bg-purple-500', text: 'text-purple-500' },
        { name: 'rose', bg: 'bg-rose-500', text: 'text-rose-500' },
        { name: 'amber', bg: 'bg-amber-500', text: 'text-amber-500' },
        { name: 'slate', bg: 'bg-slate-800', text: 'text-slate-800' },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !code.trim() || !household || !user) return;

        const newCard = {
            id: crypto.randomUUID(),
            name: name.trim(),
            code: code.trim(),
            color,
            household_id: household.id,
            created_at: new Date().toISOString()
        };

        // Optimistic
        addLoyaltyCard(newCard);
        setIsAdding(false);
        setName('');
        setCode('');

        // @ts-ignore
        const { error } = await supabase.from('loyalty_cards').insert({
            id: newCard.id,
            name: newCard.name,
            code: newCard.code,
            color: newCard.color,
            household_id: newCard.household_id,
            created_by: user.id
        });

        if (error) {
            console.error(error);
            alert('Error al guardar tarjeta');
            removeLoyaltyCard(newCard.id);
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('¿Borrar tarjeta?')) return;

        removeLoyaltyCard(id); // Optimistic
        const { error } = await supabase.from('loyalty_cards').delete().eq('id', id);
        if (error) console.error(error);
    };

    const activeCard = loyaltyCards.find(c => c.id === viewCard);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
            {/* Header */}
            <div className="bg-white dark:bg-slate-800 p-4 pt-12 sticky top-0 z-10 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between shadow-sm">
                <button onClick={() => router.back()} className="p-2 -ml-2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Wallet className="text-emerald-500" />
                    Mi Cartera
                </h1>
                <button onClick={() => setIsAdding(true)} className="p-2 -mr-2 bg-emerald-50 text-emerald-600 rounded-full hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400">
                    <Plus size={24} />
                </button>
            </div>

            {/* List */}
            <div className="p-4 space-y-4">
                {loyaltyCards.length === 0 ? (
                    <div className="text-center py-20 px-6">
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Wallet className="text-emerald-300 dark:text-emerald-700" size={40} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Cartera Vacía</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Escanea tus tarjetas de puntos y cupones para no llevar plásticos encima.</p>
                        <button onClick={() => setIsAdding(true)} className="mt-6 px-6 py-3 bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-200 dark:shadow-none hover:bg-emerald-600 transition-all">
                            Agregar Tarjeta
                        </button>
                    </div>
                ) : (
                    loyaltyCards.map(card => {
                        const cardColor = colors.find(c => c.name === card.color) || colors[0];
                        return (
                            <div
                                key={card.id}
                                onClick={() => setViewCard(card.id)}
                                className={cn(
                                    "relative overflow-hidden rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 h-48 flex flex-col justify-between p-6 transition-transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer",
                                    cardColor.bg
                                )}
                            >
                                <div className="absolute top-0 right-0 p-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />

                                <div className="relative z-10 flex justify-between items-start">
                                    <h3 className="text-2xl font-bold text-white tracking-tight">{card.name}</h3>
                                    <button onClick={(e) => handleDelete(card.id, e)} className="text-white/50 hover:text-white p-2 -mr-2 -mt-2">
                                        <Trash2 size={18} />
                                    </button>
                                </div>

                                <div className="relative z-10 bg-white/90 dark:bg-white/95 rounded-lg p-2 flex items-center justify-center h-20 shadow-inner">
                                    <div className="w-full h-full overflow-hidden flex items-center justify-center mix-blend-multiply dark:mix-blend-normal">
                                        <Barcode
                                            value={card.code}
                                            width={1.5}
                                            height={40}
                                            displayValue={false}
                                            margin={0}
                                            background="transparent"
                                        />
                                    </div>
                                </div>

                                <div className="relative z-10 flex justify-between items-center text-white/80 font-mono text-sm">
                                    <span>{card.code}</span>
                                    <ScanLine size={16} />
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Add Modal */}
            {isAdding && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-6 relative animate-in slide-in-from-bottom-10 sm:zoom-in-95">
                        <button onClick={() => setIsAdding(false)} className="absolute right-4 top-4 p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                            <X size={20} />
                        </button>

                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Nueva Tarjeta</h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nombre</label>
                                <input
                                    autoFocus
                                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                                    placeholder="Ej. Supermercado X"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Código / Número</label>
                                <div className="relative">
                                    <input
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                                        placeholder="Escanea o escribe"
                                        value={code}
                                        onChange={e => setCode(e.target.value)}
                                    />
                                    <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-emerald-500">
                                        <ScanLine size={20} />
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Color</label>
                                <div className="flex gap-2 justify-center">
                                    {colors.map(c => (
                                        <button
                                            key={c.name}
                                            type="button"
                                            onClick={() => setColor(c.name)}
                                            className={cn(
                                                "w-8 h-8 rounded-full border-2 transition-all",
                                                c.bg,
                                                color === c.name ? "border-slate-900 dark:border-white scale-110 shadow-md" : "border-transparent opacity-50 hover:opacity-100"
                                            )}
                                        />
                                    ))}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={!name || !code}
                                className="w-full bg-emerald-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-200 dark:shadow-none hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                            >
                                Guardar Tarjeta
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* View Modal */}
            {viewCard && activeCard && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6 backdrop-blur-md animate-in fade-in" onClick={() => setViewCard(null)}>
                    <div className="bg-white p-8 rounded-3xl w-full max-w-sm shadow-2xl relative animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setViewCard(null)} className="absolute right-4 top-4 p-2 text-slate-300 hover:text-slate-500">
                            <X size={24} />
                        </button>

                        <div className="text-center space-y-2 mb-8">
                            <h2 className="text-2xl font-bold text-slate-900">{activeCard.name}</h2>
                            <p className="font-mono text-slate-500 tracking-wider">{activeCard.code}</p>
                        </div>

                        <div className="flex justify-center py-4">
                            <Barcode
                                value={activeCard.code}
                                width={2}
                                height={100}
                                fontSize={18}
                            />
                        </div>

                        <p className="text-center text-xs text-slate-300 mt-8">Brillo al máximo recomendado</p>
                    </div>
                </div>
            )}
        </div>
    );
}
