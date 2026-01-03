'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
    const searchParams = useSearchParams();
    const supabase = createClient();
    const user = useStore((state) => state.user);
    const setHousehold = useStore((state) => state.setHousehold);

    useEffect(() => {
        const code = searchParams.get('code');
        if (code) {
            setMode('join');
            setInviteCode(code);
        }
    }, [searchParams]);

    const handleCreateFamily = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setLoading(true);

        try {
            const code = Math.random().toString(36).substring(2, 8).toUpperCase();

            const { data: household, error: hhError } = await supabase
                .from('households' as any)
                .insert({ name: familyName, invite_code: code })
                .select()
                .single();

            if (hhError) throw hhError;

            const { error: memberError } = await supabase
                .from('household_members' as any)
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
            // Call Secure RPC
            const { data, error } = await supabase.rpc('join_household', {
                invite_code_input: inviteCode.trim()
            });

            if (error) throw error;

            // RPC returns JSON: { success: boolean, message?: string, household_id?: uuid }
            // @ts-ignore
            if (data && data.success) {
                // Now retrieve full household details (allowed by RLS because we are now a member)
                const { data: fullHousehold, error: fetchError } = await supabase
                    .from('households' as any)
                    .select()
                    // @ts-ignore
                    .eq('id', data.household_id)
                    .single();

                if (fetchError) throw fetchError;

                setHousehold(fullHousehold);
                router.push('/dashboard');
            } else {
                // @ts-ignore
                alert(data?.message || 'Error al unirse a la familia');
            }

        } catch (error: any) {
            console.error(error);
            alert(error.message || 'Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-100 selection:text-emerald-900 overflow-hidden relative flex flex-col items-center justify-center p-6">

            {/* Background Blobs */}
            <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
            <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-emerald-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

            <div className="w-full max-w-md space-y-8 relative z-10">
                <div className="text-center flex flex-col items-center">
                    <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl p-3 text-white shadow-lg shadow-emerald-200 mb-4">
                        <Users size={32} strokeWidth={2.5} />
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                        Bienvenido a ShopMate
                    </h1>
                    <p className="mt-2 text-slate-600 font-medium">Vamos a configurar tu espacio familiar.</p>
                </div>

                {mode === null ? (
                    <div className="grid gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div
                            onClick={() => setMode('create')}
                            className="cursor-pointer group relative flex flex-col items-center gap-4 rounded-3xl border border-white/50 bg-white/60 backdrop-blur-xl p-8 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 hover:border-emerald-200"
                        >
                            <div className="rounded-2xl bg-emerald-100 p-4 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                                <Users size={32} />
                            </div>
                            <div className="text-center">
                                <h3 className="text-xl font-bold text-slate-900">Crear Nueva Familia</h3>
                                <p className="text-sm text-slate-500 mt-1">Comienza una lista desde cero para tu hogar.</p>
                            </div>
                        </div>

                        <div
                            onClick={() => setMode('join')}
                            className="cursor-pointer group relative flex flex-col items-center gap-4 rounded-3xl border border-white/50 bg-white/60 backdrop-blur-xl p-8 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 hover:border-blue-200"
                        >
                            <div className="rounded-2xl bg-blue-100 p-4 text-blue-600 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                <UserPlus size={32} />
                            </div>
                            <div className="text-center">
                                <h3 className="text-xl font-bold text-slate-900">Unirme a una Familia</h3>
                                <p className="text-sm text-slate-500 mt-1">Tengo un código de invitación.</p>
                            </div>
                        </div>
                    </div>
                ) : mode === 'create' ? (
                    <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/50 animate-in fade-in zoom-in-95 duration-300">
                        <div className="mb-6">
                            <Button variant="ghost" onClick={() => setMode(null)} className="-ml-2 text-slate-500 hover:text-slate-900 mb-2">
                                ← Volver
                            </Button>
                            <h2 className="text-2xl font-bold text-slate-900">Nombra tu familia</h2>
                            <p className="text-slate-500 text-sm">Esto aparecerá en el encabezado de tu lista.</p>
                        </div>
                        <form onSubmit={handleCreateFamily} className="space-y-4">
                            <Input
                                placeholder="ej. Familia Pérez"
                                value={familyName}
                                onChange={(e) => setFamilyName(e.target.value)}
                                required
                                className="text-lg bg-white/50 border-slate-200 focus:border-emerald-500 h-12"
                                autoFocus
                            />
                            <Button type="submit" className="w-full text-base h-12 bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-200" disabled={loading}>
                                {loading && <Loader2 className="mr-2 animate-spin" />}
                                Crear Familia
                            </Button>
                        </form>
                    </div>
                ) : (
                    <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/50 animate-in fade-in zoom-in-95 duration-300">
                        <div className="mb-6">
                            <Button variant="ghost" onClick={() => setMode(null)} className="-ml-2 text-slate-500 hover:text-slate-900 mb-2">
                                ← Volver
                            </Button>
                            <h2 className="text-2xl font-bold text-slate-900">Código de Invitación</h2>
                            <p className="text-slate-500 text-sm">Pídele el código al administrador del hogar.</p>
                        </div>
                        <form onSubmit={handleJoinFamily} className="space-y-4">
                            <Input
                                placeholder="ej. X9Y2Z1"
                                value={inviteCode}
                                onChange={(e) => setInviteCode(e.target.value)}
                                required
                                className="text-lg uppercase tracking-[0.2em] text-center font-bold bg-white/50 border-slate-200 focus:border-blue-500 h-12"
                                autoFocus
                            />
                            <Button type="submit" className="w-full text-base h-12 bg-blue-500 hover:bg-blue-600 shadow-lg shadow-blue-200" disabled={loading}>
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
