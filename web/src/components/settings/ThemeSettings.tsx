'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';

export default function ThemeSettings() {
    const { setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const toggleTheme = () => {
        setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
    };

    if (!mounted) return null;

    return (
        <section className="bg-white dark:bg-slate-800 p-2 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="p-4 flex items-center gap-4 cursor-pointer" onClick={toggleTheme}>
                <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${resolvedTheme === 'dark' ? 'bg-slate-700 text-yellow-400' : 'bg-amber-100 text-amber-500'}`}>
                    {resolvedTheme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                </div>
                <div className="flex-1">
                    <h3 className="font-bold text-slate-900 dark:text-white">Tema</h3>
                    <p className="text-sm text-slate-500">
                        {resolvedTheme === 'dark' ? 'Oscuro' : 'Claro'}
                    </p>
                </div>
                <div className={`w-12 h-6 rounded-full p-1 transition-colors ${resolvedTheme === 'dark' ? 'bg-indigo-500' : 'bg-slate-300'}`}>
                    <div className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${resolvedTheme === 'dark' ? 'translate-x-6' : 'translate-x-0'}`} />
                </div>
            </div>
        </section>
    );
}
