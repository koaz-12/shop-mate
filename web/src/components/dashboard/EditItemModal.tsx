'use client';

import { useState } from 'react';
import { Item } from '@/types';
import { Button } from '@/components/ui/Button';
import { X } from 'lucide-react';

interface EditItemModalProps {
    item: Item;
    onClose: () => void;
    onSave: (itemId: string, name: string, category: string, quantity: string | null, price: number | null) => void;
}

const MEASURE_TYPES = ['Unidad', 'Peso'] as const;
const WEIGHT_UNITS = ['kg', 'g', 'lb', 'oz'];

const CATEGORIES = [
    'Lácteos', 'Panadería', 'Frutas y Verduras', 'Carnes', 'Hogar', 'Otros'
];

export default function EditItemModal({ item, onClose, onSave }: EditItemModalProps) {
    const [name, setName] = useState(item.name);
    const [measureType, setMeasureType] = useState<'Unidad' | 'Peso'>('Unidad');
    const [quantity, setQuantity] = useState(item.quantity || '');
    const [price, setPrice] = useState(item.price ? item.price.toString() : '');
    const [category, setCategory] = useState(item.category || 'Otros');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(item.id, name, category, quantity.trim() || null, price ? parseFloat(price) : null);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="font-bold text-lg text-slate-800">Editar Producto</h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nombre</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none text-lg font-medium"
                        />
                    </div>

                    <div className="space-y-3">
                        <div className="flex bg-slate-100 p-1 rounded-xl">
                            {MEASURE_TYPES.map(type => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setMeasureType(type)}
                                    className={`flex-1 py-1.5 text-sm font-semibold rounded-lg transition-all ${measureType === type
                                        ? 'bg-white text-emerald-600 shadow-sm'
                                        : 'text-slate-400 hover:text-slate-600'
                                        }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>

                        <div className="flex gap-4">
                            <div className="space-y-2 flex-1">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                    {measureType === 'Unidad' ? 'Cantidad' : 'Peso / Volumen'}
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                        placeholder={measureType === 'Unidad' ? "Ej: 2" : "Ej: 500g"}
                                        className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none font-bold text-slate-700"
                                    />
                                    {measureType === 'Peso' && !quantity.match(/[a-z]/i) && (
                                        <div className="absolute right-2 top-2 flex gap-1">
                                            {WEIGHT_UNITS.map(unit => (
                                                <button
                                                    key={unit}
                                                    type="button"
                                                    onClick={() => setQuantity(prev => prev + unit)}
                                                    className="px-2 py-1 bg-slate-200 rounded-md text-xs font-bold text-slate-600 hover:bg-slate-300"
                                                >
                                                    {unit}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-2 w-1/3">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Precio</label>
                                <input
                                    type="number"
                                    inputMode="decimal"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none text-right font-mono"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Categoría</label>
                        <div className="grid grid-cols-2 gap-2">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => setCategory(cat)}
                                    className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${category === cat
                                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                        : 'bg-slate-50 text-slate-500 border border-slate-100 hover:bg-slate-100'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-2 pb-6 sm:pb-0">
                        <Button type="submit" className="w-full h-12 text-base shadow-lg shadow-emerald-200">
                            Guardar Cambios
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
