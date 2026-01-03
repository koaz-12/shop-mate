import { Wallet, Settings, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useStore } from '@/store/useStore';
import { useRouter, usePathname } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function Header() {
    const { user, profile, connectionStatus, triggerRefresh } = useStore();
    const router = useRouter();

    const initial = profile?.full_name ? profile.full_name[0].toUpperCase() : user?.email?.[0].toUpperCase() || '?';

    const getStatusColor = () => {
        if (connectionStatus === 'connected') return 'bg-emerald-400';
        if (connectionStatus === 'connecting') return 'bg-amber-400 animate-pulse';
        return 'bg-rose-500';
    };

    const handleReconnect = () => {
        toast.loading('Reconectando...', { duration: 2000 });
        triggerRefresh();
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
                <button
                    onClick={() => router.push('/loyalty')}
                    className="w-9 h-9 bg-primary-50 rounded-full flex items-center justify-center text-primary-600 hover:bg-primary-100 transition-all border border-primary-100 shadow-sm"
                    title="Cartera"
                >
                    <Wallet size={18} />
                </button>

                {/* Connection Status Indicator */}
                <button
                    onClick={handleReconnect}
                    className={`w-3 h-3 rounded-full ${getStatusColor()} shadow-sm transition-colors duration-500 cursor-pointer hover:ring-2 ring-offset-1 ring-slate-200`}
                    title={connectionStatus === 'connected' ? 'En línea (Click para reconectar)' : 'Sin conexión (Click para reconectar)'}
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
