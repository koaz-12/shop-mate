'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { createClient } from '@/lib/supabase';
import { useStore } from '@/store/useStore';
import { Plus, Sparkles, Mic, MicOff, ScanBarcode, Package, Check, ClipboardPaste, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import useVoiceInput from '@/hooks/useVoiceInput';
import { useItems } from '@/hooks/useItems'; // Added import
import BarcodeScanner from './BarcodeScanner';
import PasteListModal from './PasteListModal';
import ScanReceiptModal from './ScanReceiptModal';
import toast from 'react-hot-toast';
import { validateItemInput } from '@/lib/validators';

export default function AddItem() {
    const [name, setName] = useState('');
    const [quantity, setQuantity] = useState('');
    const [price, setPrice] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const [showScanner, setShowScanner] = useState(false);
    const [showPasteModal, setShowPasteModal] = useState(false);
    const [showOCRModal, setShowOCRModal] = useState(false);
    const [scannedBarcode, setScannedBarcode] = useState<string | null>(null); // New State
    const supabase = createClient();
    const { household, user, activeView, items, categories, catalog, currentList } = useStore();
    const { addNewItem } = useItems(); // Use the hook
    const { isListening, transcript, startListening, isSupported, setTranscript } = useVoiceInput();

    const existingItem = items.find(i => i.name.toLowerCase() === name.trim().toLowerCase());

    // Voice Effect
    useEffect(() => {
        if (transcript) {
            handleNameChange(transcript);
            setTranscript('');
        }
    }, [transcript, setTranscript]);

    // Enhanced Auto-categorize
    const detectCategory = (itemName: string) => {
        const lowerName = itemName.toLowerCase();

        // 1. Exact match in system categories or custom
        // 2. Keyword match
        for (const cat of categories) {
            if (cat.name.toLowerCase() === lowerName) return cat.name;
            if (cat.keywords && cat.keywords.some(k => lowerName.includes(k.toLowerCase()))) {
                return cat.name;
            }
        }
        return null;
    };

    const handleNameChange = (val: string) => {
        setName(val);
        // Only auto-categorize if we don't already have one selected, or if user is still typing fast
        const detected = detectCategory(val);
        if (detected) setSelectedCategory(detected);
    };

    // Autocomplete Logic
    const suggestions = useMemo(() => {
        const trimmed = name.trim();
        if (!trimmed || trimmed.length < 2) return [];

        const lowerName = trimmed.toLowerCase();
        const results = [];
        const seen = new Set<string>();

        // 1. Catalog
        for (const catItem of catalog) {
            if (catItem.name.toLowerCase().includes(lowerName)) {
                if (!seen.has(catItem.name.toLowerCase())) {
                    seen.add(catItem.name.toLowerCase());
                    results.push({
                        name: catItem.name,
                        category: catItem.category_name || 'Otros',
                        price: catItem.last_price
                    });
                }
            }
        }

        // 2. Active Items
        for (const actItem of items) {
             if (actItem.name.toLowerCase().includes(lowerName)) {
                 if (!seen.has(actItem.name.toLowerCase())) {
                    seen.add(actItem.name.toLowerCase());
                    results.push({
                        name: actItem.name,
                        category: actItem.category || 'Otros',
                        price: actItem.price
                    });
                 }
             }
        }

        // Don't show suggestion if the user has typed it exactly
        if (results.length === 1 && results[0].name.toLowerCase() === lowerName) {
            return []; 
        }

        return results.slice(0, 4);
    }, [name, catalog, items]);

    const handleSuggestionClick = (suggestion: any) => {
        setName(suggestion.name);
        setSelectedCategory(suggestion.category);
        if (suggestion.price) setPrice(suggestion.price.toString());
        
        // Ensure input stays expanded so user can edit quantity
        setIsExpanded(true);
    };

    const handleSmartComplete = (scannedName: string, barcode: string) => {
        handleNameChange(scannedName);
        setScannedBarcode(barcode);

        // Price Memory: Check history (Catalog) or Active Items
        const lowerScanned = scannedName.toLowerCase();

        // Priority 1: Catalog (Historical data)
        const historyItem = catalog.find(p => p.name.toLowerCase() === lowerScanned);

        // Priority 2: Active Items (In case not yet synced to catalog or locally changed)
        const activeItem = items.find(i => i.name.toLowerCase() === lowerScanned);

        if (historyItem && historyItem.last_price) {
            setPrice(historyItem.last_price.toString());
            // Also restore category if useful
            if (historyItem.category_name) setSelectedCategory(historyItem.category_name);
        } else if (activeItem && activeItem.price) {
            setPrice(activeItem.price.toString());
        }

        // Play success sound
        const audio = new Audio('/sounds/beep.mp3').play().catch(() => { });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedName = name.trim();
        if (!trimmedName || !household || !user || !currentList) return;

        // Validate inputs before submission
        const { isValid, errors } = validateItemInput(trimmedName, price, quantity);
        if (!isValid) {
            toast.error(errors[0]); // Show first error
            return;
        }

        // Smart Duplicate Check
        const existingItem = items.find(i => i.name.toLowerCase() === trimmedName.toLowerCase());

        if (existingItem) {
            // Case 1: Item exists but is in the "other" view.
            const isInCurrentView = (activeView === 'pantry' && existingItem.in_pantry) ||
                (activeView === 'shopping-list' && !existingItem.in_pantry);

            if (!isInCurrentView) {
                const shouldMove = window.confirm(
                    activeView === 'shopping-list'
                        ? `Tienes "${existingItem.name}" en la despensa. ¿Mover a lista de compra?`
                        : `"${existingItem.name}" ya está en la lista. ¿Mover a despensa?`
                );

                if (shouldMove) {
                    // @ts-ignore
                    await supabase.from('items' as any).update({
                        in_pantry: !existingItem.in_pantry
                    } as any).eq('id', existingItem.id);
                    clearForm();
                    return;
                }
                return;
            }
            toast.error(`"${existingItem.name}" ya está en tu lista.`);
            return;
        }

        const category = selectedCategory || 'Otros';

        const newItem = {
            name: trimmedName,
            category,
            quantity: quantity.trim() || null,
            price: price ? parseFloat(price) : null,
            in_pantry: activeView === 'pantry',
            household_id: household.id,
            list_id: currentList?.id,
            created_by: user.id,
            barcode: scannedBarcode
        };

        if (activeView === 'pantry') {
            newItem.in_pantry = true; // Pantry items start as "in pantry"
        }

        // Use the Offline-Resilient Hook
        await addNewItem(newItem);
        clearForm();
    };

    const handleProcessPaste = async (lines: string[]) => {
        if (!household || !user || !currentList) return;
        
        let successCount = 0;
        
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            
            // Simple validation per line
            const { isValid } = validateItemInput(trimmed, '', '');
            if (!isValid) continue;
            
            // Deduplication
            const exists = items.find(i => i.name.toLowerCase() === trimmed.toLowerCase());
            if (exists) continue; // Skip duplicates for paste
            
            const category = detectCategory(trimmed) || 'Otros';
            
            const newItem = {
                name: trimmed,
                category,
                quantity: null,
                price: null,
                in_pantry: activeView === 'pantry',
                household_id: household.id,
                list_id: currentList?.id,
                created_by: user.id,
            };
            
            // Use the hook for fire-and-forget background insertion
            addNewItem(newItem);
            successCount++;
        }
        
        if (successCount > 0) {
            toast.success(`${successCount} item(s) agregados mágicamente ✨`);
        } else {
            toast('No se encontraron items nuevos válidos', { icon: 'ℹ️' });
        }
    };

    const handleProcessOCR = (scannedItems: any[]) => {
        if (!household || !user || !currentList) return;
        
        let successCount = 0;
        
        for (const i of scannedItems) {
            const newItem = {
                name: i.name,
                category: detectCategory(i.name) || 'Otros',
                quantity: i.quantity || null,
                price: i.price !== null ? i.price : null,
                in_pantry: activeView === 'pantry',
                household_id: household.id,
                list_id: currentList?.id,
                created_by: user.id,
            };
            
            addNewItem(newItem);
            successCount++;
        }
        
        if (successCount > 0) {
            toast.success(`${successCount} items extraídos del ticket 🧾`);
        }
    };

    const clearForm = () => {
        setName('');
        setQuantity('');
        setPrice('');
        setSelectedCategory(null);
        setIsExpanded(false);
        setTranscript(''); // Clear voice
        setScannedBarcode(null);
    };

    return (
        <div className="fixed bottom-[84px] left-0 right-0 p-4 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent z-10">
            <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-2 max-w-md mx-auto transition-all"
            >
                {/* Context Indicator */}
                {name.length > 0 && (
                    <div className="text-xs text-slate-400 font-medium px-4">
                        Agregando a: <span className={activeView === 'pantry' ? "text-blue-500" : "text-emerald-500"}>
                            {activeView === 'pantry' ? 'Mi Despensa' : 'Lista de Compra'}
                        </span>
                    </div>
                )}

                {/* Context & Category Selection */}
                {(name.length > 0 || isExpanded) && (
                    <div className="px-1 py-2 flex overflow-x-auto gap-2 no-scrollbar">
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                type="button"
                                onClick={() => setSelectedCategory(cat.name)}
                                className={cn(
                                    "whitespace-nowrap px-3 py-1 rounded-full text-xs font-medium transition-colors border flex items-center gap-1",
                                    selectedCategory === cat.name
                                        ? "bg-emerald-600 text-white border-emerald-600"
                                        : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                                )}
                            >
                                <span>{cat.icon}</span>
                                {cat.name}
                            </button>
                        ))}
                    </div>
                )}

                <div className="flex gap-2 items-start">
                    <div className="relative flex-1 space-y-2">
                        {/* Autocomplete Popup */}
                        {isExpanded && suggestions.length > 0 && (
                            <div className="absolute bottom-full mb-2 left-0 right-0 bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 overflow-hidden z-50 animate-in slide-in-from-bottom-2 fade-in">
                                {suggestions.map((s, i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        onClick={() => handleSuggestionClick(s)}
                                        className="w-full text-left px-4 py-3 border-b border-slate-50 last:border-0 hover:bg-emerald-50 flex items-center justify-between transition-colors group"
                                    >
                                        <div>
                                            <p className="font-bold text-slate-800 text-sm group-hover:text-emerald-700">{s.name}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">{s.category}</span>
                                                {s.price && <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">${s.price}</span>}
                                            </div>
                                        </div>
                                        <Plus className="text-slate-300 group-hover:text-emerald-500 transition-colors" size={20} />
                                    </button>
                                ))}
                            </div>
                        )}

                        <input
                            type="text"
                            value={name}
                            onChange={(e) => handleNameChange(e.target.value)}
                            onFocus={() => setIsExpanded(true)}
                            placeholder={activeView === 'pantry' ? "Añadir a inventario..." : "Agregar a la lista..."}
                            className="w-full h-14 pl-5 pr-12 rounded-2xl border-0 shadow-lg ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-500 text-lg sm:text-base"
                            autoComplete="off"
                        />

                        {/* Collapsible Quantity and Price Input */}
                        <div className={`flex gap-2 overflow-hidden transition-all duration-300 ${isExpanded || name ? 'max-h-14 opacity-100' : 'max-h-0 opacity-0'}`}>
                            <input
                                type="text"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                placeholder='Cantidad...'
                                className="w-[60%] h-12 pl-5 pr-5 rounded-xl border-0 bg-white/80 shadow-md ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-500 text-sm"
                            />
                            <input
                                type="number"
                                inputMode="decimal"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                placeholder="Precio..."
                                className="w-[38%] h-12 pl-4 pr-4 rounded-xl border-0 bg-white/80 shadow-md ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-500 text-sm"
                            />
                        </div>

                        <div className={`absolute right-2 top-2 h-10 flex items-center gap-1 transition-all ${isExpanded || name ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                            {/* Receipt OCR */}
                            <button
                                type="button"
                                onClick={() => setShowOCRModal(true)}
                                className="h-8 w-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-emerald-600 transition-all"
                                title="Escanear Ticket"
                            >
                                <Receipt size={18} />
                            </button>

                            {/* Magic Paste */}
                            <button
                                type="button"
                                onClick={() => setShowPasteModal(true)}
                                className="h-8 w-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-emerald-600 transition-all"
                                title="Pegar lista"
                            >
                                <ClipboardPaste size={18} />
                            </button>

                            {/* Scanner Trigger */}
                            <button
                                type="button"
                                onClick={() => setShowScanner(true)}
                                className="h-8 w-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-emerald-600 transition-all"
                                title="Escanear código"
                            >
                                <ScanBarcode size={18} />
                            </button>

                            {isSupported && (
                                <button
                                    type="button"
                                    onClick={startListening}
                                    className={cn(
                                        "h-8 w-8 flex items-center justify-center rounded-full transition-all",
                                        isListening
                                            ? "bg-red-100 text-red-600 animate-pulse ring-2 ring-red-400"
                                            : "text-slate-400 hover:bg-slate-100 hover:text-emerald-600"
                                    )}
                                >
                                    {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                                </button>
                            )}
                        </div>
                    </div>

                    <Button
                        type="submit"
                        size="icon"
                        className={cn(
                            "h-14 w-14 rounded-full shadow-lg shrink-0 transition-all",
                            existingItem
                                ? (existingItem.in_pantry ? 'bg-blue-500 hover:bg-blue-600' : 'bg-orange-500 hover:bg-orange-600')
                                : (activeView === 'pantry' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-emerald-600 hover:bg-emerald-700')
                        )}
                        disabled={!name.trim()}
                    >
                        {existingItem ? (
                            existingItem.in_pantry ? <Package size={24} /> : <Check size={24} />
                        ) : (
                            <Plus size={24} />
                        )}
                    </Button>
                </div>
            </form>

            {/* Scanner Modal */}
            {showScanner && (
                <BarcodeScanner
                    onClose={() => setShowScanner(false)}
                    onDetected={handleSmartComplete}
                    catalog={catalog}
                />
            )}

            {/* Paste Modal */}
            <PasteListModal
                isOpen={showPasteModal}
                onClose={() => setShowPasteModal(false)}
                onProcess={handleProcessPaste}
            />

            {/* OCR Receipt Modal */}
            <ScanReceiptModal
                isOpen={showOCRModal}
                onClose={() => setShowOCRModal(false)}
                onProcess={handleProcessOCR}
            />
        </div>
    );
}
