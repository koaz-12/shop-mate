'use client';

import { useState, useRef, useEffect } from 'react';
import { Check, Trash2, ShoppingCart, Package, Edit2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Item } from '@/types';
import { useStore } from '@/store/useStore';

interface SwipeableListItemProps {
    item: Item;
    activeView: 'shopping-list' | 'pantry';
    onToggle: (item: Item) => void;
    onDelete: (itemId: string) => void;
    onEdit: (item: Item) => void;
    onUpdate?: (itemId: string, updates: Partial<Item>) => void;
    isSelectionMode?: boolean;
    isSelected?: boolean;
    onSelect?: () => void;
}

export default function SwipeableListItem({
    item,
    activeView,
    onToggle,
    onDelete,
    onEdit,
    onUpdate,
    isSelectionMode,
    isSelected,
    onSelect
}: SwipeableListItemProps) {
    const [startX, setStartX] = useState<number | null>(null);
    const [offsetX, setOffsetX] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const { members, hapticFeedback } = useStore();
    const creator = members?.find(m => m.id === item.created_by);

    // Inline Edit State
    const [editMode, setEditMode] = useState<'none' | 'price' | 'quantity'>('none');
    const [tempValue, setTempValue] = useState('');

    const itemRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // thresholds
    const DELETE_THRESHOLD = -100;
    const TOGGLE_THRESHOLD = 100;

    useEffect(() => {
        if (editMode !== 'none' && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [editMode]);

    const handleStart = (clientX: number) => {
        if (editMode !== 'none' || isSelectionMode) return;
        setStartX(clientX);
        setIsDragging(false);
    };

    const handleMove = (clientX: number) => {
        if (startX === null || isSelectionMode) return;
        const diff = clientX - startX;

        // Threshold check for "dragging" vs "clicking"
        if (Math.abs(diff) > 5) setIsDragging(true);

        // Limit scroll
        if (diff < -150) setOffsetX(-150);
        else if (diff > 150) setOffsetX(150);
        else setOffsetX(diff);
    };

    const handleEnd = () => {
        if (isSelectionMode) return;
        if (offsetX < DELETE_THRESHOLD) {
            // Swiped Left (Delete)
            if (hapticFeedback && typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(10);
            setIsDeleting(true);
            setTimeout(() => onDelete(item.id), 300);
        } else if (offsetX > TOGGLE_THRESHOLD) {
            // Swiped Right (Toggle)
            if (hapticFeedback && typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(10);
            onToggle(item);
            setOffsetX(0);
        } else {
            setOffsetX(0);
        }
        setStartX(null);
    };

    // Touch Handlers
    const handleTouchStart = (e: React.TouchEvent) => handleStart(e.touches[0].clientX);
    const handleTouchMove = (e: React.TouchEvent) => handleMove(e.touches[0].clientX);

    // Mouse Handlers
    const handleMouseDown = (e: React.MouseEvent) => handleStart(e.clientX);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (startX !== null) {
            e.preventDefault();
            handleMove(e.clientX);
        }
    };

    const handleMouseUp = () => handleEnd();
    const handleMouseLeave = () => {
        if (startX !== null) handleEnd();
    };

    const handleClick = (e: React.MouseEvent) => {
        if (isSelectionMode && onSelect) {
            onSelect();
            return;
        }
        if (isDragging || editMode !== 'none') {
            e.preventDefault();
            e.stopPropagation();
            return;
        }
        onEdit(item);
    };

    const handleCommitEdit = () => {
        if (!onUpdate) {
            setEditMode('none');
            return;
        }

        if (editMode === 'price') {
            const val = parseFloat(tempValue);
            if (!isNaN(val)) {
                onUpdate(item.id, { price: val });
            }
        } else if (editMode === 'quantity') {
            const val = tempValue.trim();
            if (val) {
                onUpdate(item.id, { quantity: val });
            }
        }
        setEditMode('none');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleCommitEdit();
        if (e.key === 'Escape') setEditMode('none');
    };

    if (isDeleting) return null;

    return (
        <div className="relative overflow-hidden rounded-2xl mb-2 touch-pan-y select-none">
            {/* Background Actions */}
            <div className="absolute inset-0 flex items-center justify-between p-4">
                {/* Left Background (Toggle) */}
                <div
                    className={cn(
                        "flex items-center justify-start pl-4 h-full w-full absolute left-0 transition-opacity",
                        offsetX > 0 ? "opacity-100" : "opacity-0",
                        activeView === 'shopping-list' ? "bg-blue-100" : "bg-emerald-100"
                    )}
                >
                    {activeView === 'shopping-list'
                        ? <Package className="text-blue-600" />
                        : <ShoppingCart className="text-emerald-600" />
                    }
                </div>

                {/* Right Background (Delete) */}
                <div
                    className={cn(
                        "flex items-center justify-end pr-4 h-full w-full absolute right-0 bg-red-100 transition-opacity",
                        offsetX < 0 ? "opacity-100" : "opacity-0"
                    )}
                >
                    <Trash2 className="text-red-600" />
                </div>
            </div>

            {/* Foreground Item */}
            <div
                ref={itemRef}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleEnd}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
                style={{ transform: `translateX(${offsetX}px)` }}
                className={cn(
                    "relative bg-white p-4 shadow-sm border transition-all duration-200 ease-out flex items-center gap-4",
                    offsetX === 0 ? "translate-x-0" : "",
                    isSelected ? "bg-indigo-50 border-indigo-200" : "border-slate-100"
                )}
            >
                {/* Checkbox / Selector */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        if (isSelectionMode && onSelect) {
                            onSelect();
                        } else {
                            onToggle(item);
                        }
                    }}
                    disabled={isSelectionMode ? false : false} // Just clear
                    className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors shrink-0",
                        isSelectionMode
                            ? (isSelected
                                ? "bg-indigo-500 border-indigo-500 text-white"
                                : "bg-white border-slate-300")
                            : (activeView === 'shopping-list'
                                ? "border-slate-300 hover:border-emerald-500"
                                : "bg-blue-100 border-blue-200 text-blue-600")
                    )}
                >
                    {isSelectionMode
                        ? (isSelected && <Check size={16} strokeWidth={3} />)
                        : (activeView === 'pantry' && <Check size={14} strokeWidth={3} />)
                    }
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0" onClick={handleClick}>
                    <div className="flex items-center gap-2">
                        <p className={cn(
                            "font-bold truncate text-base cursor-pointer hover:text-primary-600 transition-colors flex-1",
                            activeView === 'pantry' && !isSelectionMode ? "text-slate-500 line-through" : "text-slate-900"
                        )}>
                            {item.name}
                        </p>

                        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                            {/* Price Badge */}
                            {!isSelectionMode && (editMode === 'price' ? (
                                <div className="relative">
                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">$</span>
                                    <input
                                        ref={inputRef}
                                        type="number"
                                        value={tempValue}
                                        onChange={(e) => setTempValue(e.target.value)}
                                        onBlur={handleCommitEdit}
                                        onKeyDown={handleKeyDown}
                                        className="w-20 pl-4 pr-1 py-1 rounded-lg border-2 border-emerald-500/20 focus:border-emerald-500 bg-white text-slate-900 text-xs font-bold outline-none shadow-sm transition-all text-right h-7"
                                        placeholder="0.00"
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                </div>
                            ) : (
                                (item.price || activeView === 'shopping-list') && (
                                    <span
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (onUpdate && !isSelectionMode) {
                                                setTempValue(item.price ? item.price.toString() : '');
                                                setEditMode('price');
                                            }
                                        }}
                                        className={cn(
                                            "ml-1 px-3 py-1 rounded-lg text-xs font-bold border transition-all cursor-text min-w-[3.5rem] text-center h-7 flex items-center justify-center",
                                            item.price
                                                ? "bg-slate-50 text-slate-700 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 hover:shadow-sm"
                                                : "bg-slate-50 text-slate-400 border-dashed border-slate-300 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600"
                                        )}
                                    >
                                        {item.price ? `$${item.price.toFixed(2)}` : '$ --'}
                                    </span>
                                )
                            ))}

                            {/* Quantity Badge */}
                            {!isSelectionMode && (editMode === 'quantity' ? (
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={tempValue}
                                    onChange={(e) => setTempValue(e.target.value)}
                                    onBlur={handleCommitEdit}
                                    onKeyDown={handleKeyDown}
                                    className="w-16 px-2 py-1 rounded-lg border-2 border-emerald-500/20 focus:border-emerald-500 bg-white text-emerald-700 text-xs font-bold outline-none shadow-sm transition-all text-center h-7"
                                    placeholder="Cant."
                                    onClick={(e) => e.stopPropagation()}
                                />
                            ) : (
                                (item.quantity || activeView === 'shopping-list') && (
                                    <span
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (onUpdate && !isSelectionMode) {
                                                setTempValue(item.quantity || '');
                                                setEditMode('quantity');
                                            }
                                        }}
                                        className={cn(
                                            "px-2 py-1 rounded-lg text-xs font-bold border flex items-center gap-1 transition-all cursor-text min-w-[2.5rem] justify-center h-7",
                                            item.quantity
                                                ? "bg-emerald-50 text-emerald-700 border-emerald-100 hover:border-emerald-300 hover:shadow-sm"
                                                : "bg-slate-50 text-slate-400 border-dashed border-slate-300 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600"
                                        )}
                                    >
                                        {item.quantity || <Edit2 size={12} />}
                                    </span>
                                )
                            ))}
                        </div>

                        {/* Creator Avatar - Enhanced */}
                        {creator && !isSelectionMode && (
                            <div className="ml-2 h-6 w-6 rounded-full bg-indigo-100 ring-2 ring-white shadow-sm flex items-center justify-center overflow-hidden shrink-0" title={`Añadido por ${creator.full_name || 'Alguien'}`}>
                                {creator.avatar_url ? (
                                    <img src={creator.avatar_url} alt="Creator" className="h-full w-full object-cover" />
                                ) : (
                                    <span className="text-[10px] font-extrabold text-indigo-600 select-none">
                                        {creator.full_name?.[0]?.toUpperCase() || '?'}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    {!isSelectionMode && (
                        <div className="flex gap-2 text-xs text-slate-400 items-center mt-1">
                            <span>
                                {activeView === 'shopping-list' ? 'Desliza para comprar →' : 'Desliza para lista →'}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
