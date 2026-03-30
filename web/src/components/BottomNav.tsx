'use client';

import { usePathname, useRouter } from 'next/navigation';
import { LayoutGrid, Clock, Home, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function BottomNav() {
    const pathname = usePathname();
    const router = useRouter();

    if (pathname === '/' || pathname === '/login' || pathname === '/onboarding' || pathname === '/shopping') return null;

    const navItems = [
        { label: 'Inicio', path: '/home', icon: Home },
        { label: 'Lista', path: '/dashboard', icon: LayoutGrid },
        { label: 'Historial', path: '/history', icon: Clock },
        { label: 'Familia', path: '/settings', icon: Users },
    ];

    return (
        <nav
            className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200 px-6 py-2 pb-6 z-20 flex justify-between items-center"
            aria-label="Navegación principal"
        >
            {navItems.map((item) => {
                const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
                return (
                    <button
                        key={item.path}
                        onClick={() => router.push(item.path)}
                        aria-label={item.label}
                        aria-current={isActive ? 'page' : undefined}
                        className={cn(
                            "relative flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200",
                            isActive ? "text-primary-600" : "text-slate-400 hover:text-slate-600"
                        )}
                    >
                        {/* Active pill indicator */}
                        {isActive && (
                            <span className="absolute -top-1 left-1/2 -translate-x-1/2 h-1 w-6 bg-primary-500 rounded-full" />
                        )}
                        <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                        <span className="text-[10px] font-medium">{item.label}</span>
                    </button>
                );
            })}
        </nav>
    );
}
