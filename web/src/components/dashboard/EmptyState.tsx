// Basic customizable illustration component using Lucide icons or simple SVG paths
// To keep it lightweight and consistent.

import { ShoppingBag, Coffee, Sparkles, ArrowDown } from 'lucide-react';

interface EmptyStateProps {
    type: 'empty-list' | 'all-completed' | 'empty-pantry' | 'no-results';
    message: string;
    subMessage?: string;
    actionLabel?: string;
    onAction?: () => void;
}

export default function EmptyState({ type, message, subMessage, actionLabel, onAction }: EmptyStateProps) {

    const renderIcon = () => {
        switch (type) {
            case 'empty-list':
                return (
                    <div className="relative">
                        <div className="h-32 w-32 bg-slate-100 rounded-full flex items-center justify-center mb-6 animate-in zoom-in-50 duration-500">
                            <ShoppingBag className="text-slate-300 h-16 w-16" strokeWidth={1.5} />
                        </div>
                        <div className="absolute -right-2 top-2 bg-white p-2 rounded-full shadow-sm animate-bounce duration-1000 delay-1000">
                            <Sparkles className="text-yellow-400 h-6 w-6" />
                        </div>
                    </div>
                );
            case 'all-completed':
                return (
                    <div className="relative">
                        <div className="h-32 w-32 bg-emerald-50 rounded-full flex items-center justify-center mb-6 animate-in zoom-in-50 duration-500">
                            <Coffee className="text-emerald-300 h-16 w-16" strokeWidth={1.5} />
                        </div>
                        <div className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-sm">
                            <span className="text-2xl">🎉</span>
                        </div>
                    </div>
                );
            case 'empty-pantry':
                return (
                    <div className="relative">
                        <div className="h-32 w-32 bg-blue-50 rounded-full flex items-center justify-center mb-6 animate-in zoom-in-50 duration-500">
                            <div className="text-4xl opacity-50">🍱</div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    }

    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            {renderIcon()}
            <h3 className="text-lg font-bold text-slate-700 mb-2">{message}</h3>
            {subMessage && <p className="text-slate-400 max-w-xs leading-relaxed">{subMessage}</p>}

            {actionLabel && onAction && (
                <button
                    onClick={onAction}
                    className="mt-6 text-emerald-600 font-semibold hover:text-emerald-700 hover:underline flex items-center gap-2"
                >
                    {actionLabel} <ArrowDown size={16} />
                </button>
            )}
        </div>
    );
}
