import { useState, useRef, useEffect } from 'react';
import { Camera, X, Check, Loader2, Sparkles, Receipt, Trash2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

interface ScannedItem {
    id: string; // generated locally for UI
    name: string;
    price: number | null;
    quantity: string;
}

interface ScanReceiptModalProps {
    isOpen: boolean;
    onClose: () => void;
    onProcess: (items: any[]) => void;
}

export default function ScanReceiptModal({ isOpen, onClose, onProcess }: ScanReceiptModalProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
    const [mode, setMode] = useState<'upload' | 'scanning' | 'review'>('upload');

    // Reset when closed
    useEffect(() => {
        if (!isOpen) {
            setImagePreview(null);
            setIsScanning(false);
            setScannedItems([]);
            setMode('upload');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 4 * 1024 * 1024) {
             toast.error('La imagen no debe superar los 4MB');
             return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64Data = reader.result as string;
            setImagePreview(base64Data);
            processReceipt(base64Data);
        };
        reader.readAsDataURL(file);
    };

    const processReceipt = async (base64String: string) => {
        setMode('scanning');
        setIsScanning(true);

        try {
            // Strip the Data URL prefix (e.g., "data:image/jpeg;base64,") before sending to Gemini
            const base64Image = base64String.split(',')[1];

            const response = await fetch('/api/ocr', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageBase64: base64Image }),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Error de procesamiento');
            }

            const data = await response.json();
            
            if (!data.items || data.items.length === 0) {
                 toast('No se detectaron productos legibles.', { icon: 'ℹ️' });
                 setMode('upload');
                 setImagePreview(null);
                 return;
            }

            // Ensure schema is clean and assign local IDs
            const cleaned = data.items.map((item: any, i: number) => ({
                id: `scanned-${i}`,
                name: item.name || 'Producto',
                price: typeof item.price === 'number' ? item.price : null,
                quantity: item.quantity?.toString() || '1'
            }));

            setScannedItems(cleaned);
            setMode('review');

        } catch (error: any) {
            console.error('OCR Error:', error);
            toast.error(error.message || 'Error al escanear el ticket. Verifica tu API key si es necesario.');
            setMode('upload');
            setImagePreview(null);
        } finally {
            setIsScanning(false);
        }
    };

    const handleConfirm = () => {
       if (scannedItems.length > 0) {
           onProcess(scannedItems);
       }
       onClose();
    };

    const deleteItem = (id: string) => {
        setScannedItems(prev => prev.filter(i => i.id !== id));
        if (scannedItems.length === 1) {
            setMode('upload');
            setImagePreview(null);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                
                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-emerald-50 text-emerald-900">
                    <div className="flex items-center gap-2">
                        <Sparkles size={20} className="text-emerald-500" />
                        <h3 className="font-bold text-lg">Escáner de Recibos IA</h3>
                    </div>
                    <button onClick={onClose} disabled={isScanning} className="p-1 hover:bg-emerald-100 rounded-full transition-colors opacity-70 hover:opacity-100">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 overflow-y-auto">
                    {mode === 'upload' && (
                        <div className="text-center py-6">
                            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                                Toma una foto a tu ticket de supermercado y nuestra IA extraerá los productos y precios automáticamente.
                            </p>
                            
                            <input 
                                type="file" 
                                accept="image/*" 
                                capture="environment" 
                                ref={fileInputRef} 
                                className="hidden" 
                                onChange={handleFileChange} 
                            />
                            
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="mx-auto h-24 w-full max-w-xs border-2 border-dashed border-emerald-300 bg-emerald-50 hover:bg-emerald-100 rounded-2xl flex flex-col items-center justify-center gap-2 text-emerald-600 font-semibold transition-colors"
                            >
                                <Camera size={28} />
                                Subir Foto o Tomar Captura
                            </button>
                        </div>
                    )}

                    {mode === 'scanning' && (
                        <div className="text-center py-10 flex flex-col items-center">
                           <div className="relative mb-6">
                               <div className="h-20 w-20 bg-emerald-100 rounded-full flex items-center justify-center animate-pulse">
                                   <Receipt size={32} className="text-emerald-500" />
                               </div>
                               <div className="absolute inset-0 border-t-2 border-emerald-500 rounded-full animate-spin"></div>
                           </div>
                           <h4 className="font-bold text-slate-800 text-lg mb-1">Analizando Recibo...</h4>
                           <p className="text-sm text-slate-500">Gemini está leyendo los productos, por favor espera.</p>
                        </div>
                    )}

                    {mode === 'review' && (
                        <div>
                             <p className="text-sm font-semibold text-slate-700 mb-3 ml-1">Revisa lo detectado ({scannedItems.length})</p>
                             <div className="space-y-2">
                                 {scannedItems.map(item => (
                                     <div key={item.id} className="bg-slate-50 border border-slate-100 p-3 rounded-xl flex items-center justify-between">
                                          <div className="flex-1 min-w-0 pr-3">
                                              <p className="font-semibold text-slate-800 text-sm truncate">{item.name}</p>
                                              <div className="flex gap-2 text-xs font-medium mt-0.5">
                                                  {item.quantity && <span className="text-slate-500">Cant: {item.quantity}</span>}
                                                  {item.price !== null && <span className="text-emerald-600">${item.price}</span>}
                                              </div>
                                          </div>
                                          <button 
                                            onClick={() => deleteItem(item.id)}
                                            className="h-8 w-8 bg-white shadow-sm border border-slate-200 text-slate-400 hover:text-rose-500 rounded-lg flex items-center justify-center transition-colors shrink-0"
                                          >
                                              <Trash2 size={14} />
                                          </button>
                                     </div>
                                 ))}
                             </div>
                        </div>
                    )}
                </div>

                {/* Footer Controls */}
                <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex gap-3">
                    {mode === 'review' ? (
                       <>
                         <Button variant="outline" className="flex-1 rounded-xl" onClick={() => { setMode('upload'); setImagePreview(null); }}>
                            Reescanear
                         </Button>
                         <Button className="flex-1 rounded-xl gap-2 shadow-md bg-emerald-600 hover:bg-emerald-700" onClick={handleConfirm}>
                            <Check size={18} />
                            Agregar {scannedItems.length}
                         </Button>
                       </>
                    ) : (
                         <Button variant="outline" className="w-full rounded-xl" onClick={onClose} disabled={isScanning}>
                            Cancelar
                         </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
