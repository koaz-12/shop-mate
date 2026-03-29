'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { createClient } from '@/lib/supabase';
import { Tags, ChevronRight, Palette, DollarSign, Smartphone, RefreshCw, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import CategoriesModal from './CategoriesModal';
import toast from 'react-hot-toast';

export default function CustomizationSettings() {
    const {
        household, setHousehold,
        hapticFeedback, setHapticFeedback,
        autoAddRecurring, setAutoAddRecurring,
        themeColor, setThemeColor
    } = useStore();

    const [budgetInput, setBudgetInput] = useState('');
    const [isEditingCategories, setIsEditingCategories] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        if (household?.budget !== undefined) {
            setBudgetInput(household.budget.toString());
        }
    }, [household?.budget]);

    if (!household) return null;

    const handleSaveBudget = async () => {
        const val = parseFloat(budgetInput);
        const newBudget = isNaN(val) ? 0 : val;

        setHousehold({ ...household, budget: newBudget }); // Optimistic

        const { error } = await supabase
            .from('households')
            .update({ budget: newBudget } as never)
            .eq('id', household.id);

        if (error) {
            console.error(error);
            toast.error('Error al guardar presupuesto');
        }
    };

    return (
        <>
            <section className="bg-white dark:bg-slate-800 p-2 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
                <button onClick={() => setIsEditingCategories(true)} className="flex items-center gap-4 w-full p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-2xl transition-colors text-left border-b border-slate-50 dark:border-slate-700 last:border-0">
                    <div className="h-10 w-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                        <Tags size={20} />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-slate-900 dark:text-white">Categorías</h3>
                        <p className="text-sm text-slate-500">Editar iconos y nombres</p>
                    </div>
                    <ChevronRight size={20} className="text-slate-300" />
                </button>

                {/* Theme Color */}
                <div className="p-4 flex items-center gap-4 border-t border-slate-50 dark:border-slate-700">
                    <div className="h-10 w-10 rounded-full bg-pink-100 text-pink-500 flex items-center justify-center shrink-0">
                        <Palette size={20} />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-slate-900 dark:text-white">Color Principal</h3>
                        <div className="flex gap-3 mt-2">
                            {[
                                { id: 'emerald', bg: 'bg-emerald-500' },
                                { id: 'blue', bg: 'bg-blue-500' },
                                { id: 'violet', bg: 'bg-violet-500' },
                                { id: 'rose', bg: 'bg-rose-500' },
                                { id: 'orange', bg: 'bg-orange-500' }
                            ].map((c) => (
                                <button
                                    key={c.id}
                                    onClick={() => setThemeColor(c.id as any)}
                                    className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${c.bg} ${themeColor === c.id ? 'ring-2 ring-offset-2 ring-slate-400 dark:ring-slate-500 scale-110' : ''
                                        }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Budget Input */}
                <div className="p-4 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                        <DollarSign size={20} />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-slate-900 dark:text-white">Presupuesto</h3>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-slate-400 font-bold">$</span>
                            <input
                                type="number"
                                inputMode="decimal"
                                placeholder="Sin límite"
                                className="w-24 h-8 px-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 dark:text-white font-bold text-sm focus:w-32 transition-all"
                                value={budgetInput}
                                onChange={(e) => setBudgetInput(e.target.value)}
                                onBlur={handleSaveBudget}
                            />
                        </div>
                    </div>
                </div>

                {/* Haptic Toggle */}
                <div className="p-4 flex items-center gap-4 border-t border-slate-50 dark:border-slate-700 cursor-pointer" onClick={() => {
                    if (navigator.vibrate) navigator.vibrate(50);
                    setHapticFeedback(!hapticFeedback);
                }}>
                    <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                        <Smartphone size={20} />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-slate-900 dark:text-white">Vibración</h3>
                        <p className="text-sm text-slate-500">Al interactuar</p>
                    </div>
                    <div className={`w-12 h-6 rounded-full p-1 transition-colors ${hapticFeedback ? 'bg-primary-500' : 'bg-slate-200 dark:bg-slate-600'}`}>
                        <div className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${hapticFeedback ? 'translate-x-6' : 'translate-x-0'}`} />
                    </div>
                </div>

                {/* Recurring Automation */}
                <div className="p-4 flex items-center gap-4 border-t border-slate-50 dark:border-slate-700 cursor-pointer" onClick={() => {
                    if (navigator.vibrate) navigator.vibrate(10);
                    setAutoAddRecurring(!autoAddRecurring);
                }}>
                    <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-500 flex items-center justify-center shrink-0">
                        <RefreshCw size={20} />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-slate-900 dark:text-white">Auto-Recurrentes</h3>
                        <p className="text-sm text-slate-500">Añadir items programados</p>
                    </div>
                    <div className={`w-12 h-6 rounded-full p-1 transition-colors ${autoAddRecurring ? 'bg-primary-500' : 'bg-slate-200 dark:bg-slate-600'}`}>
                        <div className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${autoAddRecurring ? 'translate-x-6' : 'translate-x-0'}`} />
                    </div>
                </div>

                {/* Trash Link */}
                <button onClick={() => router.push('/recycle-bin')} className="flex items-center gap-4 w-full p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-2xl transition-colors text-left border-t border-slate-50 dark:border-slate-700">
                    <div className="h-10 w-10 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center shrink-0">
                        <Trash2 size={20} />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-slate-900 dark:text-white">Papelera</h3>
                        <p className="text-sm text-slate-500">Items eliminados</p>
                    </div>
                    <ChevronRight size={20} className="text-slate-300" />
                </button>
            </section>

            {isEditingCategories && (
                <CategoriesModal onClose={() => setIsEditingCategories(false)} />
            )}
        </>
    );
}
