'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Users, UserPlus, ArrowRight, Loader2 } from 'lucide-react';
import { useStore } from '@/store/useStore';

export default function OnboardingPage() {
    const [mode, setMode] = useState<'create' | 'join' | null>(null);
    const [familyName, setFamilyName] = useState('');
    const [inviteCode, setInviteCode] = useState('');
    const [loading, setLoading] = useState(false);

    const router = useRouter();
    const supabase = createClient();
    const user = useStore((state) => state.user);
    const setHousehold = useStore((state) => state.setHousehold);

    const handleCreateFamily = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setLoading(true);

        try {
            const code = Math.random().toString(36).substring(2, 8).toUpperCase();

            const { data: household, error: hhError } = await supabase
                .from('households')
                .insert({ name: familyName, invite_code: code })
                .select()
                .single();

            if (hhError) throw hhError;

            const { error: memberError } = await supabase
                .from('household_members')
                .insert({
                    user_id: user.id,
                    household_id: household.id,
                    role: 'admin'
                });

            if (memberError) throw memberError;

            setHousehold(household);
            router.push('/dashboard');
        } catch (error: any) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleJoinFamily = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setLoading(true);

        try {
            // Find household by code
            const { data: household, error: hhError } = await supabase
                .from('households')
                .select()
                .eq('invite_code', inviteCode.trim().toUpperCase())
                .single();

            if (hhError || !household) throw new Error('Invalid invite code');

            const { error: memberError } = await supabase
                .from('household_members')
                .insert({
                    user_id: user.id,
                    household_id: household.id,
                    role: 'member'
                });

            if (memberError) throw memberError;

            setHousehold(household);
            router.push('/dashboard');
        } catch (error: any) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center justify-center">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-slate-900">¡Bienvenido!</h1>
                    <p className="mt-2 text-slate-500">Vamos a configurar tu familia en ShopMate.</p>
                </div>

                {mode === null ? (
                    <div className="grid gap-4">
                        <div
                            onClick={() => setMode('create')}
                            className="cursor-pointer group relative flex flex-col items-center gap-4 rounded-3xl border-2 border-slate-200 bg-white p-8 transition-all hover:border-emerald-600 hover:shadow-lg"
                        >
                            <div className="rounded-full bg-emerald-100 p-4 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                <Users size={32} />
                            </div>
                            <div className="text-center">
                                <h3 className="text-xl font-bold text-slate-900">Crear Familia</h3>
                                <p className="text-sm text-slate-500">Comienza una nueva lista para tu hogar</p>
                            </div>
                        </div>

                        <div
                            onClick={() => setMode('join')}
                            className="cursor-pointer group relative flex flex-col items-center gap-4 rounded-3xl border-2 border-slate-200 bg-white p-8 transition-all hover:border-blue-600 hover:shadow-lg"
                        >
                            <div className="rounded-full bg-blue-100 p-4 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <UserPlus size={32} />
                            </div>
                            <div className="text-center">
                                <h3 className="text-xl font-bold text-slate-900">Unirse a Familia</h3>
                                <p className="text-sm text-slate-500">Ingresa un código de invitación</p>
                            </div>
                        </div>
                    </div>
                ) : mode === 'create' ? (
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                        <div className="mb-6">
                            <Button variant="ghost" onClick={() => setMode(null)} className="mb-2 -ml-2 text-slate-500">
                                ← Volver
                            </Button>
                            <h2 className="text-2xl font-bold">Nombra tu familia</h2>
                        </div>
                        <form onSubmit={handleCreateFamily} className="space-y-4">
                            <Input
                                placeholder="ej. Familia Pérez"
                                value={familyName}
                                onChange={(e) => setFamilyName(e.target.value)}
                                required
                                className="text-lg"
                            />
                            <Button type="submit" className="w-full text-base" disabled={loading}>
                                {loading && <Loader2 className="mr-2 animate-spin" />}
                                Crear Familia
                            </Button>
                        </form>
                    </div>
                ) : (
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                        <div className="mb-6">
                            <Button variant="ghost" onClick={() => setMode(null)} className="mb-2 -ml-2 text-slate-500">
                                ← Volver
                            </Button>
                            <h2 className="text-2xl font-bold">Ingresa Código de Invitación</h2>
                        </div>
                        <form onSubmit={handleJoinFamily} className="space-y-4">
                            <Input
                                placeholder="ej. X9Y2Z1"
                                value={inviteCode}
                                onChange={(e) => setInviteCode(e.target.value)}
                                required
                                className="text-lg uppercase tracking-widest text-center"
                            />
                            <Button type="submit" className="w-full text-base bg-blue-600 hover:bg-blue-700" disabled={loading}>
                                {loading && <Loader2 className="mr-2 animate-spin" />}
                                Unirse a Familia
                            </Button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
