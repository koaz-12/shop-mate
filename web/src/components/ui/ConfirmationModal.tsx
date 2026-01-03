'use client';

import { Button } from '@/components/ui/Button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmationModalProps {
    isOpen: boolean;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmationModal({
    isOpen,
    title,
    description,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    variant = 'danger',
    onConfirm,
    onCancel
}: ConfirmationModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 text-center space-y-4">
                    <div className={`mx-auto h-12 w-12 rounded-full flex items-center justify-center ${variant === 'danger' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                        <AlertTriangle size={24} />
                    </div>

                    <div className="space-y-2">
                        <h3 className="font-bold text-xl text-slate-800">{title}</h3>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            {description}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                        <Button
                            variant="secondary"
                            onClick={onCancel}
                            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700"
                        >
                            {cancelText}
                        </Button>
                        <Button
                            variant={variant === 'danger' ? 'danger' : 'primary'}
                            onClick={onConfirm}
                            className="w-full"
                        >
                            {confirmText}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
