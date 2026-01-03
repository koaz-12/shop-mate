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

    const handleScan = async (result: any) => {
        if (!result) return;

        // Use the raw value if it exists, handling different library version responses
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
                        onDetected(productName);
                        onClose();
                    } else {
                        setError('Producto encontrado pero sin nombre.');
                    }
                } else {
                    setError('Producto no encontrado.');
                }
            } catch (err) {
                setError('Error al conectar con la base de datos.');
            } finally {
                setIsLoading(false);
            }
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
                {!isLoading ? (
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
                ) : (
                    <div className="flex flex-col items-center gap-4 text-emerald-500">
                        <Loader2 size={48} className="animate-spin" />
                        <span className="text-white font-medium">Buscando producto...</span>
                    </div>
                )}

                {error && (
                    <div className="absolute bottom-24 bg-red-500 text-white px-4 py-2 rounded-xl shadow-lg animate-in fade-in slide-in-from-bottom-2">
                        {error}
                    </div>
                )}
            </div>

            <div className="p-6 bg-slate-900 text-center text-slate-400 text-sm">
                Apunta el código de barras del producto dentro del recuadro.
            </div>
        </div>
    );
}
