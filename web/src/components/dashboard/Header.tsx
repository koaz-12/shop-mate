'use client';

import { useState, useRef, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import {
    User,
    Wallet,
    Palette,
    Shield,
    Download,
    LogOut,
    ChevronDown,
    RefreshCw,
} from 'lucide-react';

export default function Header({ title, subtitle }: { title?: string; subtitle?: string }) {
    const { user, profile, connectionStatus, triggerRefresh } = useStore();
    const router = useRouter();
    const supabase = createClient();

    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const initial = profile?.full_name
        ? profile.full_name[0].toUpperCase()
        : user?.email?.[0].toUpperCase() || '?';

    const getStatusColor = () => {
        if (connectionStatus === 'connected') return 'bg-emerald-400';
        if (connectionStatus === 'connecting') return 'bg-amber-400 animate-pulse';
        return 'bg-rose-500';
    };

    const handleReconnect = () => {
        toast.loading('Reconectando...', { duration: 2000 });
        triggerRefresh();
    };

    const handleExportData = () => {
        const { items, catalog, loyaltyCards, household } = useStore.getState();
        const exportData = {
            household: household?.name,
            exportedAt: new Date().toISOString(),
            items: items.filter(i => !i.deleted_at),
            catalog,
            loyaltyCards,
        };
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `shopmate-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Datos exportados');
        setMenuOpen(false);
    };

    const handleLogout = async () => {
        setMenuOpen(false);
        await supabase.auth.signOut();
        useStore.getState().reset();
        localStorage.removeItem('shopmate-storage');
        sessionStorage.clear();
        router.push('/login');
    };

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpen(false);
            }
        };
        if (menuOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [menuOpen]);

    const menuItems = [
        {
            label: 'Mi Perfil',
            icon: User,
            onClick: () => { router.push('/profile'); setMenuOpen(false); },
        },
        {
            label: 'Mi Cartera',
            icon: Wallet,
            onClick: () => { router.push('/loyalty'); setMenuOpen(false); },
        },
        {
            label: 'Personalización',
            icon: Palette,
            onClick: () => { router.push('/customize'); setMenuOpen(false); },
        },
        {
            label: 'Seguridad',
            icon: Shield,
            onClick: () => { router.push('/security'); setMenuOpen(false); },
        },
        {
            label: 'Exportar Datos',
            icon: Download,
            onClick: handleExportData,
        },
    ];

    return (
        <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-slate-100 z-50 px-4 flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary-200">
                    S
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                    ShopMate
                </h1>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
                {/* Connection Status */}
                <button
                    onClick={handleReconnect}
                    className={`w-3 h-3 rounded-full ${getStatusColor()} shadow-sm transition-colors duration-500 cursor-pointer hover:ring-2 ring-offset-1 ring-slate-200`}
                    title={connectionStatus === 'connected' ? 'En línea' : 'Sin conexión (Click para reconectar)'}
                    aria-label="Estado de conexión"
                />

                {/* Avatar + Dropdown */}
                <div className="relative" ref={menuRef}>
                    <button
                        onClick={() => setMenuOpen(prev => !prev)}
                        aria-label="Menú de perfil"
                        className="flex items-center gap-1.5 group"
                    >
                        <div className="h-9 w-9 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 transition-colors overflow-hidden border-2 border-slate-200 group-hover:border-primary-300 transition-all shadow-sm">
                            {profile?.avatar_url && profile.avatar_url.startsWith('preset:') ? (
                                // Preset avatar: render emoji with gradient
                                <span className="text-lg" role="img">
                                    {{
                                        bear: '🐻', fox: '🦊', panda: '🐼', lion: '🦁',
                                        koala: '🐨', frog: '🐸', penguin: '🐧', cat: '🐱',
                                        robot: '🤖', alien: '👽', rocket: '🚀', star: '⭐',
                                    }[profile.avatar_url.replace('preset:', '')] || initial}
                                </span>
                            ) : profile?.avatar_url ? (
                                <img src={profile.avatar_url} alt="Profile" className="h-full w-full object-cover" />
                            ) : (
                                <span className="text-slate-600 font-bold text-sm">{initial}</span>
                            )}
                        </div>
                        <ChevronDown
                            size={14}
                            className={`text-slate-400 transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`}
                        />
                    </button>

                    {/* Dropdown Menu */}
                    {menuOpen && (
                        <div className="absolute right-0 top-12 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                            {/* User info header */}
                            <div className="px-4 py-3 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-100">
                                <p className="font-bold text-slate-900 text-sm truncate">
                                    {profile?.full_name || 'Mi cuenta'}
                                </p>
                                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                            </div>

                            {/* Menu items */}
                            <div className="py-1">
                                {menuItems.map((item) => (
                                    <button
                                        key={item.label}
                                        onClick={item.onClick}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors text-left"
                                    >
                                        <item.icon size={16} className="text-slate-400 shrink-0" />
                                        {item.label}
                                    </button>
                                ))}
                            </div>

                            {/* Logout */}
                            <div className="border-t border-slate-100 py-1">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                                >
                                    <LogOut size={16} className="shrink-0" />
                                    Cerrar Sesión
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
