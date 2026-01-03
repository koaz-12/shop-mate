'use client';

import { useStore } from '@/store/useStore';
import { User, Wallet } from 'lucide-react';
import { useRouter } from 'next/navigation';

import ListSelector from './ListSelector';

interface HeaderProps {
    title?: string;
    subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
    const { user, profile, household } = useStore();
    const router = useRouter();

    const initial = profile?.full_name ? profile.full_name[0].toUpperCase() : user?.email?.[0].toUpperCase() || '?';

    return (
        <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-30 px-6 py-4 border-b border-slate-100 flex justify-between items-center transition-all">
            <div>
                {title ? (
                    <>
                        <h1 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h1>
                        {subtitle && <p className="text-xs font-semibold text-slate-400">{subtitle}</p>}
                    </>
                ) : (
                    <div className="flex flex-col items-start gap-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Tus Listas</span>
                        <ListSelector />
                    </div>
                )}
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={() => router.push('/loyalty')}
                    className="w-9 h-9 bg-primary-50 rounded-full flex items-center justify-center text-primary-600 hover:bg-primary-100 transition-all border border-primary-100 shadow-sm"
                    title="Cartera"
                >
                    <Wallet size={18} />
                </button>

                <div className="w-9 h-9 bg-slate-900 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-slate-100">
                    {initial}
                </div>
            </div>
        </header>
    );
}
