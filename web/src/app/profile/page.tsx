'use client';

import { useStore } from '@/store/useStore';
import Header from '@/components/dashboard/Header';
import ProfileSettings from '@/components/settings/ProfileSettings';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function ProfilePage() {
    const { household } = useStore();
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
                    <h2 className="text-2xl font-extrabold text-slate-900">Mi Perfil</h2>
                    <p className="text-sm text-slate-500">Tu nombre e información personal</p>
                </div>
            </div>

            <ProfileSettings />
        </div>
    );
}
