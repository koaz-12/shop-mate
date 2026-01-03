'use client';

import { useStore } from '@/store/useStore';
import { User, Wallet } from 'lucide-react';
import { useRouter } from 'next/navigation';

import ListSelector from './ListSelector';

interface HeaderProps {

export default function Header() {
    const { profile, connectionStatus } = useStore();

    const getStatusColor = () => {
        if (connectionStatus === 'connected') return 'bg-emerald-400';
        if (connectionStatus === 'connecting') return 'bg-amber-400 animate-pulse';
        return 'bg-rose-500';
    };

    return (
        <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-slate-100 z-50 px-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-slate-900 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-slate-100">
                    {initial}
                </div>
            </div>
        </header>
    );
}
