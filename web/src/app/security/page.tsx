'use client';

import Header from '@/components/dashboard/Header';
import SecuritySettings from '@/components/settings/SecuritySettings';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function SecurityPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-slate-50 pb-24 pt-20 px-4">
            <Header />

            <div className="flex items-center gap-3 mb-6">
                <button
                    onClick={() => router.back()}
                    className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors"
                    aria-label="Volver"
                >
                    <ArrowLeft size={22} className="text-slate-600" />
                </button>
                <div>
                    <h2 className="text-2xl font-extrabold text-slate-900">Seguridad</h2>
                    <p className="text-sm text-slate-500">Contraseña y acceso a tu cuenta</p>
                </div>
            </div>

            <SecuritySettings />
        </div>
    );
}
