'use client';

import { usePathname, useRouter } from 'next/navigation';
import { LayoutGrid, Clock, Settings, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function BottomNav() {
    const pathname = usePathname();
    const router = useRouter();

    if (pathname === '/' || pathname === '/login' || pathname === '/onboarding' || pathname === '/shopping') return null;

    const navItems = [
        { label: 'Inicio', path: '/home', icon: Home },
        { label: 'Lista', path: '/dashboard', icon: LayoutGrid },
        { label: 'Historial', path: '/history', icon: Clock },
        { label: 'Ajustes', path: '/settings', icon: Settings },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-2 pb-6 z-20 flex justify-between items-center">
            {navItems.map((item) => {
                const isActive = pathname === item.path;
                return (
                    <button
                        key={item.path}
                        onClick={() => router.push(item.path)}
                        className={cn(
                            "flex flex-col items-center gap-1 p-2 rounded-xl transition-colors",
                            isActive ? "text-primary-600" : "text-slate-400 hover:text-slate-600"
                        )}
                    >
                        <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                        <span className="text-[10px] font-medium">{item.label}</span>
                    </button>
                );
            })}
        </nav>
    );
}
