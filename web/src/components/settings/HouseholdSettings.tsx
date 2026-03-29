'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { createClient } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Users, PenLine, X, Share2, Copy } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function HouseholdSettings() {
    const { household, setHousehold } = useStore();
    const [isEditingHousehold, setIsEditingHousehold] = useState(false);
    const [editHouseholdName, setEditHouseholdName] = useState('');
    const supabase = createClient();
    const router = useRouter();

    if (!household) return null;

    const handleUpdateHouseholdName = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editHouseholdName.trim()) return;

        // Optimistic
        setHousehold({ ...household, name: editHouseholdName });
        setIsEditingHousehold(false);

        const { error } = await supabase
            .from('households')
            .update({ name: editHouseholdName } as never)
            .eq('id', household.id);

        if (error) {
            toast.error('Error al actualizar nombre de familia');
        }
    };

    const handleLeaveHousehold = async () => {
        if (!confirm('¿Estás seguro de que quieres salir de esta familia? Tendrás que ser invitado de nuevo o crear una nueva.')) return;

        try {
            // @ts-ignore
            const { data, error } = await supabase.rpc('leave_household', { target_household_id: household.id });
            const responseData = data as any;

            if (error) throw error;
            if (responseData && !responseData.success) throw new Error(responseData.message);

            setHousehold(null);
            router.push('/onboarding');
        } catch (error: any) {
            toast.error('Error: ' + error.message);
        }
    };

    const handleShare = async () => {
        if (!household.invite_code) return;

        const shareData = {
            title: 'Únete a mi ShopMate',
            text: `¡Hola! Únete a mi lista de compras en ShopMate con este código: ${household.invite_code}`,
            url: window.location.origin + '/onboarding?code=' + household.invite_code
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {}
        } else {
            copyInvite();
        }
    };

    const copyInvite = () => {
        if (household.invite_code) {
            navigator.clipboard.writeText(household.invite_code);
            toast.success('¡Código copiado!');
        }
    };

    return (
        <div className="space-y-6">
            {/* Household Section */}
            <section className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-600">
                        <Users size={28} />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">{household.name}</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Familia / Hogar</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => {
                        setEditHouseholdName(household.name);
                        setIsEditingHousehold(true);
                    }}>
                        <PenLine size={20} className="text-slate-400 hover:text-emerald-500" />
                    </Button>
                </div>
                <div className="mt-2 text-center">
                    <button
                        onClick={handleLeaveHousehold}
                        className="text-xs text-red-400 hover:text-red-500 hover:underline transition-colors"
                    >
                        Salir de la familia
                    </button>
                </div>
            </section>

            {/* Invite Section */}
            <section className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
                <h2 className="font-bold flex items-center gap-2 mb-4 text-slate-900 dark:text-white">
                    <Users size={20} className="text-blue-500" />
                    Invitar Familia
                </h2>
                <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 border-dashed">
                    <span className="flex-1 font-mono text-xl tracking-widest text-center text-slate-700 dark:text-slate-300">
                        {household.invite_code}
                    </span>
                    <Button size="icon" variant="ghost" onClick={handleShare}>
                        <Share2 size={20} className="text-emerald-600" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={copyInvite}>
                        <Copy size={20} />
                    </Button>
                </div>
            </section>

            {/* Edit Household Name Modal */}
            {isEditingHousehold && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-sm shadow-2xl p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg dark:text-white">Editar Familia</h3>
                            <button onClick={() => setIsEditingHousehold(false)}><X size={20} className="text-slate-400" /></button>
                        </div>
                        <form onSubmit={handleUpdateHouseholdName} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Nombre de la Familia</label>
                                <input
                                    value={editHouseholdName}
                                    onChange={(e) => setEditHouseholdName(e.target.value)}
                                    className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 dark:text-white mt-1"
                                    placeholder="Ej. Familia Pérez"
                                    autoFocus
                                />
                            </div>
                            <Button type="submit" className="w-full">Guardar Cambios</Button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
