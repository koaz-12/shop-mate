'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import { ArrowLeft, PieChart, TrendingUp, DollarSign } from 'lucide-react';
import { HouseholdProduct } from '@/types';

export default function AnalyticsPage() {
    const { household } = useStore();
    const router = useRouter();
    const supabase = createClient();
    const [products, setProducts] = useState<HouseholdProduct[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!household) return;

        const fetchData = async () => {
            const { data } = await supabase
                .from('household_products')
                .select('*')
                .eq('household_id', household.id);

            if (data) {
                setProducts(data as HouseholdProduct[]);
            }
            setLoading(false);
        };

        fetchData();
    }, [household, supabase]);

    if (!household) return null;

    // Calculations
    const totalSpent = products.reduce((acc, p) => acc + (p.last_price || 0) * (p.times_bought || 0), 0);

    // Category Data
    const categorySpend: Record<string, number> = {};
    products.forEach(p => {
        const cat = p.category_name || 'Otros';
        const spend = (p.last_price || 0) * (p.times_bought || 0);
        categorySpend[cat] = (categorySpend[cat] || 0) + spend;
    });

    // Convert to sorted array
    const sortedCategories = Object.entries(categorySpend)
        .sort(([, a], [, b]) => b - a)
        .filter(([, val]) => val > 0);

    const maxCatSpend = sortedCategories.length > 0 ? sortedCategories[0][1] : 1;

    // Top Products
    const topProducts = [...products]
        .sort((a, b) => b.times_bought - a.times_bought)
        .slice(0, 5);

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header */}
            <div className="bg-white pt-12 pb-6 px-6 sticky top-0 z-10 border-b border-slate-100">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors">
                        <ArrowLeft size={24} className="text-slate-600" />
                    </button>
                    <h1 className="text-xl font-bold text-slate-900">Estadísticas</h1>
                </div>
            </div>

            <div className="p-6 space-y-8">
                {/* Total Estimate */}
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-3xl p-6 text-white shadow-lg shadow-emerald-200">
                    <div className="flex items-center gap-3 mb-2 opacity-90">
                        <div className="p-2 bg-white/20 rounded-full">
                            <DollarSign size={20} />
                        </div>
                        <span className="font-semibold text-sm tracking-widest uppercase">Gasto Estimado Histórico</span>
                    </div>
                    <p className="text-4xl font-bold tracking-tight">
                        ${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </p>
                    <p className="text-emerald-100 text-sm mt-2">Basado en frecuencia x último precio.</p>
                </div>

                {/* Category Breakdown (Bar Chart style) */}
                <div>
                    <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
                        <PieChart size={20} className="text-blue-500" />
                        Gasto por Categoría
                    </h3>
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-5">
                        {sortedCategories.length === 0 ? (
                            <p className="text-center text-slate-400 py-4">Sin datos suficientes aún.</p>
                        ) : (
                            sortedCategories.map(([cat, val], idx) => {
                                const percent = (val / totalSpent) * 100;
                                return (
                                    <div key={cat}>
                                        <div className="flex justify-between items-end mb-1">
                                            <span className="font-semibold text-slate-700">{cat}</span>
                                            <div className="text-right">
                                                <span className="font-bold text-slate-900">${val.toLocaleString()}</span>
                                                <span className="text-xs text-slate-400 ml-2">({Math.round(percent)}%)</span>
                                            </div>
                                        </div>
                                        {/* Bar */}
                                        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${['bg-blue-500', 'bg-violet-500', 'bg-rose-500', 'bg-amber-500', 'bg-emerald-500'][idx % 5]}`}
                                                style={{ width: `${(val / maxCatSpend) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Top Products */}
                <div>
                    <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
                        <TrendingUp size={20} className="text-rose-500" />
                        Más Comprados
                    </h3>
                    <div className="bg-white rounded-3xl p-2 shadow-sm border border-slate-100">
                        {topProducts.map((p, i) => (
                            <div key={p.id} className="flex items-center justify-between p-4 border-b border-slate-50 last:border-0">
                                <div className="flex items-center gap-4">
                                    <div className="h-8 w-8 flex items-center justify-center bg-slate-100 rounded-full font-bold text-slate-500 text-xs">
                                        #{i + 1}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800">{p.name}</p>
                                        <p className="text-xs text-slate-400 capitalize">{p.category_name}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="block font-bold text-slate-900">{p.times_bought}</span>
                                    <span className="text-[10px] text-slate-400 uppercase font-bold">Veces</span>
                                </div>
                            </div>
                        ))}
                        {topProducts.length === 0 && (
                            <p className="text-center text-slate-400 py-6">Sin datos aún.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
