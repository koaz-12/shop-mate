'use client';

import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import {
    ShoppingBasket,
    Wallet,
    TrendingUp,
    Plus,
    ArrowRight,
    Clock,
    LayoutGrid
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import Header from '@/components/dashboard/Header';

export default function HomePage() {
    const { user, profile, household, items, loyaltyCards, catalog } = useStore();
    const router = useRouter();

    // Stats
    const pendingItems = items.filter(i => !i.is_completed).length;
    const completedItems = items.filter(i => i.is_completed).length;

    // Calculate Budget
    const monthlyBudget = household?.budget || 0;
    const currentSpend = items.reduce((sum, item) => {
        return sum + (item.price || 0) * (Number(item.quantity) || 1);
    }, 0);
    const spendPercentage = monthlyBudget > 0 ? (currentSpend / monthlyBudget) * 100 : 0;
    const currency = household?.currency || '$';

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            {/* Header / Greeting */}
            <Header title="Inicio" subtitle={`Hola, ${profile?.full_name?.split(' ')[0] || 'Usuario'}`} />

            <div className="pt-20 px-6 pb-6 space-y-6">
                {/* Budget Widget */}
                {monthlyBudget > 0 && (
                    <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-lg shadow-slate-200">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Presupuesto Mensual</span>
                            <TrendingUp size={16} className="text-emerald-400" />
                        </div>
                        <div className="flex items-end gap-2 mb-4">
                            <span className="text-3xl font-bold">{currency}{currentSpend.toFixed(0)}</span>
                            <span className="text-slate-400 mb-1">/ {currency}{monthlyBudget}</span>
                        </div>

                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className={cn(
                                    "h-full rounded-full transition-all duration-1000",
                                    spendPercentage > 90 ? "bg-rose-500" :
                                        spendPercentage > 75 ? "bg-amber-500" : "bg-emerald-500"
                                )}
                                style={{ width: `${Math.min(spendPercentage, 100)}%` }}
                            />
                        </div>
                        <div className="mt-2 text-xs text-slate-400 text-right">
                            {spendPercentage.toFixed(0)}% gastado
                        </div>
                    </div>
                )}

                <div className="grid gap-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <Link href="/dashboard" className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:border-emerald-200 transition-colors group">
                            <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mb-3 group-hover:scale-110 transition-transform">
                                <ShoppingBasket size={20} />
                            </div>
                            <p className="text-2xl font-bold text-slate-900">{pendingItems}</p>
                            <p className="text-xs text-slate-500 font-medium">Por comprar</p>
                        </Link>

                        <Link href="/loyalty" className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:border-blue-200 transition-colors group">
                            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-3 group-hover:scale-110 transition-transform">
                                <Wallet size={20} />
                            </div>
                            <p className="text-2xl font-bold text-slate-900">{loyaltyCards.length}</p>
                            <p className="text-xs text-slate-500 font-medium">Tarjetas</p>
                        </Link>
                    </div>

                    {/* Quick Actions */}
                    <div>
                        <h2 className="text-sm font-bold text-slate-900 mb-4">Acciones Rápidas</h2>
                        <div className="space-y-3">
                            <Link href="/dashboard" className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:bg-slate-50 transition-colors">
                                <div className="bg-emerald-100 p-2.5 rounded-lg text-emerald-700">
                                    <Plus size={20} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-slate-900">Añadir productos</h3>
                                    <p className="text-xs text-slate-500">Agrega ítems a tu lista de compra</p>
                                </div>
                                <ArrowRight size={16} className="text-slate-300" />
                            </Link>

                            <Link href="/history" className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:bg-slate-50 transition-colors">
                                <div className="bg-amber-100 p-2.5 rounded-lg text-amber-700">
                                    <Clock size={20} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-slate-900">Ver historial</h3>
                                    <p className="text-xs text-slate-500">Revisa tus compras anteriores</p>
                                </div>
                                <ArrowRight size={16} className="text-slate-300" />
                            </Link>
                        </div>
                    </div>

                    {/* Loyalty Preview (Horizontal Scroll) */}
                    {loyaltyCards.length > 0 && (
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-sm font-bold text-slate-900">Tus Tarjetas</h2>
                                <Link href="/loyalty" className="text-xs text-emerald-600 font-medium hover:underline">Ver todas</Link>
                            </div>
                            <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 scrollbar-hide">
                                {loyaltyCards.slice(0, 5).map(card => (
                                    <Link key={card.id} href="/loyalty" className="flex-shrink-0 relative w-48 h-28 rounded-xl p-4 flex flex-col justify-between shadow-md transition-transform hover:scale-105" style={{ backgroundColor: card.color }}>
                                        <span className="text-white font-bold text-lg shadow-black/10 drop-shadow-md truncate">{card.name}</span>
                                        <div className="flex justify-end">
                                            <Wallet className="text-white/50" />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
