'use client';

import { useState } from 'react';
import { X, Calendar, Check, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface RecurrenceModalProps {
    itemName: string;
    currentInterval: number | null;
    onClose: () => void;
    onSave: (interval: number | null) => void;
}

export default function RecurrenceModal({ itemName, currentInterval, onClose, onSave }: RecurrenceModalProps) {
    const [days, setDays] = useState<string>(currentInterval ? currentInterval.toString() : '');
    const [isValid, setIsValid] = useState(true);

    const handleSave = () => {
        if (!days.trim()) {
            onSave(null);
            onClose();
            return;
        }

        const num = parseInt(days);
        if (isNaN(num) || num < 1) {
            setIsValid(false);
            return;
        }

        onSave(num);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300">
                <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                                <Clock size={20} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Programar Compra</h3>
                                <p className="text-xs text-slate-500 font-medium">{itemName}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 -mr-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Repetir cada:</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    min="1"
                                    value={days}
                                    onChange={(e) => {
                                        setDays(e.target.value);
                                        setIsValid(true);
                                    }}
                                    placeholder="Ej: 7"
                                    className={`w-full h-12 pl-4 pr-16 rounded-xl border ${isValid ? 'border-slate-200 focus:border-blue-500' : 'border-red-300 focus:border-red-500'} focus:ring-2 focus:ring-blue-500/20 bg-slate-50 text-lg`}
                                    autoFocus
                                />
                                <span className="absolute right-4 top-3 text-slate-400 font-medium">días</span>
                            </div>
                            {!isValid && <p className="text-xs text-red-500 font-bold">Ingresa un número válido (mínimo 1 día).</p>}
                        </div>

                        <div className="bg-blue-50 p-4 rounded-xl flex gap-3 items-start">
                            <Calendar size={18} className="text-blue-500 shrink-0 mt-0.5" />
                            <p className="text-xs text-blue-700 leading-relaxed">
                                Si activas esto, <strong>{itemName}</strong> se añadirá automáticamente a tu lista cada <strong>{days || '...'} días</strong>.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                        <Button
                            onClick={() => {
                                onSave(null);
                                onClose();
                            }}
                            variant="ghost"
                            className="flex-1 text-slate-500 hover:text-slate-700"
                        >
                            Desactivar
                        </Button>
                        <Button
                            onClick={handleSave}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200"
                        >
                            <Check size={18} className="mr-2" /> Guardar
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
