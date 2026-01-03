'use client';

import { Trash2, Check, X, Package, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface BulkActionsBarProps {
    selectedCount: number;
    activeView: 'shopping-list' | 'pantry';
    onClearSelection: () => void;
    onDelete: () => void;
    onMove: () => void;
    onComplete?: () => void;
}

export default function BulkActionsBar({
    selectedCount,
    activeView,
    onClearSelection,
    onDelete,
    onMove,
    onComplete
}: BulkActionsBarProps) {
    if (selectedCount === 0) return null;

    return (
        <div className="fixed bottom-24 left-4 right-4 z-40 animate-in slide-in-from-bottom-10 fade-in duration-300">
            <div className="bg-slate-900 text-white rounded-2xl shadow-2xl p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onClearSelection}
                        className="h-8 w-8 flex items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400"
                    >
                        <X size={18} />
                    </button>
                    <span className="font-bold text-sm">{selectedCount} seleccionados</span>
                </div>

                <div className="flex items-center gap-2">
                    {/* Move Action */}
                    <Button
                        onClick={onMove}
                        variant="secondary"
                        size="sm"
                        className="h-10 px-3 flex items-center gap-2 bg-slate-800 text-slate-200 border-none hover:bg-slate-700 hover:text-white"
                    >
                        {activeView === 'shopping-list' ? <Package size={18} /> : <ShoppingCart size={18} />}
                        <span className="text-xs font-bold hidden sm:inline">
                            {activeView === 'shopping-list' ? 'A Despensa' : 'A Lista'}
                        </span>
                    </Button>

                    {/* Delete Action */}
                    <Button
                        onClick={onDelete}
                        variant="danger"
                        size="sm"
                        className="h-10 w-10 p-0 rounded-xl"
                    >
                        <Trash2 size={18} />
                    </Button>
                </div>
            </div>
        </div>
    );
}
