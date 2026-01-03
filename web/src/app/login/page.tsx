'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Mail, Loader2, ShoppingCart } from 'lucide-react';
import { useStore } from '@/store/useStore';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const supabase = createClient();
    const setUser = useStore((state) => state.setUser);

    useEffect(() => {
        if (searchParams.get('mode') === 'signup') {
            setIsSignUp(true);
        }

        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                router.push('/dashboard');
            }
        };
        checkUser();
    }, [router, supabase.auth, searchParams]);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                alert('Account created! You can now sign in.');
                setIsSignUp(false);
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                // Session listener in AuthCheck or effect above handles redirect
                router.push('/dashboard');
            }
        } catch (error: any) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-50">
            <div className="mb-8 flex flex-col items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg">
                    <ShoppingCart size={32} />
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">ShopMate</h1>
                <p className="text-center text-slate-500">Lista de compras familiar colaborativa.</p>
            </div>

            <div className="w-full max-w-sm space-y-4">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <form onSubmit={handleAuth} className="space-y-4">
                        <h2 className="text-xl font-bold text-center mb-4">
                            {isSignUp ? 'Crear Cuenta' : 'Bienvenido'}
                        </h2>
                        <Input
                            type="email"
                            placeholder="Correo electrónico"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="h-12"
                        />
                        <Input
                            type="password"
                            placeholder="Contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="h-12"
                            minLength={6}
                        />
                        <Button
                            className="w-full h-12 text-base bg-slate-900 hover:bg-slate-800"
                            disabled={loading}
                            type="submit"
                        >
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
                            {isSignUp ? 'Registrarse' : 'Iniciar Sesión'}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            type="button"
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="text-sm text-slate-500 hover:text-emerald-600 underline"
                        >
                            {isSignUp ? '¿Ya tienes cuenta? Inicia Sesión' : "¿No tienes cuenta? Regístrate"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
