'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface ActionSheetProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title?: string;
}

export default function ActionSheet({ isOpen, onClose, children, title }: ActionSheetProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            document.body.style.overflow = 'hidden';
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300); // Wait for animation
            document.body.style.overflow = '';
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isVisible && !isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
            {/* Backdrop */}
            <div
                className={cn(
                    "fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300",
                    isOpen ? "opacity-100" : "opacity-0"
                )}
                onClick={onClose}
            />

            {/* Sheet Content */}
            <div
                className={cn(
                    "relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden transition-transform duration-300 ease-out transform",
                    isOpen ? "translate-y-0 sm:scale-100" : "translate-y-full sm:translate-y-10 sm:scale-95"
                )}
            >
                {/* Drag Handle (Visual only for now) */}
                <div className="w-full flex justify-center pt-3 pb-1 sm:hidden">
                    <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
                </div>

                {title && (
                    <div className="px-6 py-4 border-b border-slate-100">
                        <h3 className="font-bold text-lg text-slate-800">{title}</h3>
                    </div>
                )}

                <div className="max-h-[85vh] overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
}
