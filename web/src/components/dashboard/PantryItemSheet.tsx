'use client';

import { useState } from 'react';
import { Item } from '@/types';
import ActionSheet from '@/components/ui/ActionSheet';
import { Button } from '@/components/ui/Button';
import { ShoppingCart, Utensils, Minus, Plus, Edit2, ChevronDown, ChevronUp } from 'lucide-react';
import { useStore } from '@/store/useStore';

interface PantryItemSheetProps {
    item: Item;
    isOpen: boolean;
    onClose: () => void;
    onConsume: (amount: number) => void;
    onRestock: () => void;
    onUpdate: (updates: Partial<Item>) => void;
}

export default function PantryItemSheet({ item, isOpen, onClose, onConsume, onRestock, onUpdate }: PantryItemSheetProps) {
    const { members, categories } = useStore();
    const [editMode, setEditMode] = useState(false);

    // Edit State
    const [name, setName] = useState(item.name);
    const [price, setPrice] = useState(item.price?.toString() || '');
    const [category, setCategory] = useState(item.category || 'Otros');
    const [localQuantity, setLocalQuantity] = useState(parseInt(item.quantity || "1") || 1);

    const creator = members.find(m => m.id === item.created_by);
    const buyer = members.find(m => m.id === item.bought_by);

    const handleSave = () => {
        onUpdate({
            name,
            price: price ? parseFloat(price) : null,
            category,
            quantity: localQuantity.toString() // Sync quantity if manually edited
        });
        setEditMode(false);
    };

    const toggleEdit = () => {
        // Reset state on open if needed
        if (!editMode) {
            setName(item.name);
            setPrice(item.price?.toString() || '');
            setCategory(item.category || 'Otros');
        }
        setEditMode(!editMode);
    };

    return (
        <ActionSheet isOpen={isOpen} onClose={onClose}>
            <div className="p-6 space-y-6">

                {/* Header Section */}
                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 leading-tight">{item.name}</h2>

                        {!editMode && (
                            <div className="flex items-center gap-2 mt-2 text-xs text-slate-500 font-medium">
                                <span className="px-2 py-1 bg-slate-100 rounded-md uppercase tracking-wider">
                                    {item.category}
                                </span>
                                •
                                {item.price ? `$${item.price}` : 'Sin precio'}
                                {buyer && (
                                    <span className="flex items-center gap-1">
                                        • Comprado por {buyer.full_name?.split(' ')[0]}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Actions (Consumption) */}
                {!editMode ? (
                    <div className="space-y-4">
                        <div className="bg-slate-50 rounded-2xl p-4 flex flex-col gap-4 border border-slate-100">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-bold text-slate-400 uppercase">Cantidad en despensa</span>
                                <div className="flex items-center gap-3 bg-white px-2 py-1 rounded-xl shadow-sm border border-slate-200">
                                    <button
                                        onClick={() => setLocalQuantity(Math.max(1, localQuantity - 1))}
                                        className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-600"
                                    >
                                        <Minus size={16} />
                                    </button>
                                    <span className="text-xl font-bold w-6 text-center">{localQuantity}</span>
                                    <button
                                        onClick={() => setLocalQuantity(localQuantity + 1)}
                                        className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-emerald-600"
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <Button
                                    onClick={() => {
                                        onConsume(1);
                                        // Update local quantity visually immediately? 
                                        // Parent will re-render, but for snappiness we could
                                        setLocalQuantity(Math.max(0, localQuantity - 1));
                                    }}
                                    variant="secondary"
                                    className="h-14 bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-200"
                                >
                                    <Utensils className="mr-2" size={20} />
                                    Consumir 1
                                </Button>

                                <Button
                                    onClick={onRestock}
                                    className="h-14 bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200 font-bold shadow-none"
                                >
                                    <ShoppingCart className="mr-2" size={20} />
                                    Reponer Todo
                                </Button>
                            </div>
                        </div>

                        {/* Expand Edit Button */}
                        <button
                            onClick={toggleEdit}
                            className="w-full py-3 flex items-center justify-center gap-2 text-slate-400 font-semibold text-sm hover:bg-slate-50 rounded-xl transition-colors"
                        >
                            <Edit2 size={14} />
                            Modificar detalles del producto
                        </button>
                    </div>
                ) : (
                    /* Edit Form Mode */
                    <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase">Nombre</label>
                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
                            />
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-1 space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase">Precio</label>
                                <input
                                    type="number"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
                                />
                            </div>
                            <div className="flex-1 space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase">Categoría</label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none font-medium appearance-none"
                                >
                                    {categories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                                    <option value="Otros">Otros</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button variant="secondary" onClick={toggleEdit} className="flex-1">Cancelar</Button>
                            <Button onClick={handleSave} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200">
                                Guardar Cambios
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </ActionSheet>
    );
}
