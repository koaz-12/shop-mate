'use client';

import { useRef } from 'react';
import { Settings, User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import { useStore } from '@/store/useStore';

export default function Header() {
    const { user, profile, connectionStatus } = useStore();

    const initial = profile?.full_name ? profile.full_name[0].toUpperCase() : user?.email?.[0].toUpperCase() || '?';

    const getStatusColor = () => {
        if (connectionStatus === 'connected') return 'bg-emerald-400';
        if (connectionStatus === 'connecting') return 'bg-amber-400 animate-pulse';
        return 'bg-rose-500';
    };

    return (
        <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-slate-100 z-50 px-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary-200">
                    S
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                    ShopMate
                </h1>
            </div>

            <div className="flex items-center gap-3">
                {/* Connection Status Indicator */}
                <div
                    className={`w-2 h-2 rounded-full ${getStatusColor()} shadow-sm transition-colors duration-500`}
                    title={connectionStatus === 'connected' ? 'En línea' : 'Sin conexión'}
                />

                <Link href="/settings" className="relative group">
                    <div className="h-9 w-9 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 transition-colors overflow-hidden border border-slate-200">
                        {profile?.avatar_url ? (
                            <img src={profile.avatar_url} alt="Profile" className="h-full w-full object-cover" />
                        ) : (
                            <span className="text-slate-500 font-bold">{initial}</span>
                        )}
                    </div>
                </Link>
            </div>
        </header>
    );
}
