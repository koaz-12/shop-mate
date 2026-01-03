'use client';

import { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { X, Calculator, Loader2, ScanBarcode } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface BarcodeScannerProps {
    onClose: () => void;
    onDetected: (name: string) => void;
}

export default function BarcodeScanner({ onClose, onDetected }: BarcodeScannerProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [manualName, setManualName] = useState('');
    const [showManualInput, setShowManualInput] = useState(false);

    const handleScan = async (result: any) => {
        if (!result || showManualInput || isLoading) return;

        const code = result[0]?.rawValue || result?.rawValue;

        if (code) {
            setIsLoading(true);
            try {
                // Query OpenFoodFacts
                const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${code}.json`);
                const data = await response.json();

                if (data.status === 1) {
                    const productName = data.product.product_name_es || data.product.product_name;
                    if (productName) {
                        if (navigator.vibrate) navigator.vibrate(50); // Short success vibration
                        onDetected(productName);
                        onClose();
                    } else {
                        setError('Producto sin nombre.');
                        setShowManualInput(true);
                        if (navigator.vibrate) navigator.vibrate([100, 50, 100]); // Error vibration
                    }
                } else {
                    setError('Producto no encontrado.');
                    setShowManualInput(true);
                    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
                }
            } catch (err) {
                setError('Error de conexión.');
                setShowManualInput(true);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (manualName.trim()) {
            onDetected(manualName.trim());
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
            <div className="flex justify-between items-center p-4 text-white bg-black/50 absolute top-0 left-0 right-0 z-10">
                <div className="flex items-center gap-2">
                    <ScanBarcode />
                    <span className="font-bold">Escáner</span>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20">
                    <X size={24} />
                </Button>
            </div>

            <div className="flex-1 relative flex items-center justify-center bg-black">
                {/* Scanner Component */}
                {!isLoading && !showManualInput && (
                    <div className="w-full h-full">
                        <Scanner
                            onScan={handleScan}
                            allowMultiple={true}
                            components={{
                                onOff: true,
                                torch: true,
                            }}
                            styles={{
                                container: { height: '100%', width: '100%' },
                                video: { objectFit: 'cover' }
                            }}
                        />
                        {/* Overlay Guide */}
                        <div className="absolute inset-0 border-2 border-white/30 pointer-events-none">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-40 border-2 border-emerald-500 rounded-2xl shadow-[0_0_0_1000px_rgba(0,0,0,0.5)]"></div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-1 bg-red-500/50 animate-pulse"></div>
                        </div>
                    </div>
                )}

                {isLoading && (
                    <div className="flex flex-col items-center gap-4 text-emerald-500">
                        <Loader2 size={48} className="animate-spin" />
                        <span className="text-white font-medium">Buscando producto...</span>
                    </div>
                )}

                {showManualInput && (
                    <div className="absolute inset-0 z-20 bg-black/80 flex items-center justify-center p-6">
                        <form onSubmit={handleManualSubmit} className="bg-white rounded-3xl p-6 w-full max-w-sm space-y-4 animate-in zoom-in-95 shadow-2xl">
                            <div className="text-center space-y-2">
                                <div className="mx-auto bg-amber-100 text-amber-600 w-12 h-12 rounded-full flex items-center justify-center">
                                    <ScanBarcode size={24} />
                                </div>
                                <h3 className="font-bold text-lg text-slate-800">¿Qué producto es?</h3>
                                <p className="text-sm text-slate-500 flex flex-col">
                                    <span>No encontramos este código.</span>
                                    <span>Ingresa el nombre para agregarlo.</span>
                                </p>
                            </div>

                            <input
                                autoFocus
                                type="text"
                                value={manualName}
                                onChange={e => setManualName(e.target.value)}
                                placeholder="Ej: Pan de Molde"
                                className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none font-medium text-slate-800"
                            />

                            <Button type="submit" className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 font-bold shadow-lg shadow-emerald-200" disabled={!manualName.trim()}>
                                Guardar y Agregar
                            </Button>

                            <button
                                type="button"
                                onClick={() => { setShowManualInput(false); setError(null); setManualName(''); }}
                                className="w-full text-sm text-slate-400 py-2 hover:text-white transition-colors"
                            >
                                Escanear otro
                            </button>
                        </form>
                    </div>
                )}

                {error && !showManualInput && (
                    <div className="absolute bottom-24 bg-red-500 text-white px-4 py-2 rounded-xl shadow-lg animate-in fade-in slide-in-from-bottom-2">
                        {error}
                    </div>
                )}
            </div>

            <div className="p-6 bg-slate-900 text-center text-slate-400 text-sm">
                {!showManualInput ? "Apunta el código de barras dentro del recuadro." : "Ingresa el nombre manualmente."}
            </div>
        </div>
    );
}
