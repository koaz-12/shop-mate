import { useState } from 'react';
import { X, ClipboardPaste, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface PasteListModalProps {
    isOpen: boolean;
    onClose: () => void;
    onProcess: (lines: string[]) => void;
}

export default function PasteListModal({ isOpen, onClose, onProcess }: PasteListModalProps) {
    const [text, setText] = useState('');

    if (!isOpen) return null;

    const handleProcess = () => {
        if (!text.trim()) return;
        
        // Split by newline or comma
        const lines = text
            .split(/\n|,/)
            .map(line => line.trim())
            .filter(line => line.length > 1 && !line.startsWith('☐') && !line.startsWith('✅')); // basic cleanup of copied lists

        if (lines.length > 0) {
            onProcess(lines);
        }
        
        setText('');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
                <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-2 text-primary-600">
                        <ClipboardPaste size={20} />
                        <h3 className="font-bold text-lg text-slate-800">Pegado Mágico</h3>
                    </div>
                    <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="p-5 flex-1 overflow-y-auto">
                    <p className="text-sm text-slate-500 mb-4 leading-relaxed">
                        Pega una lista de productos aquí (separados por renglón o coma). Analizaremos el texto y agregaremos los productos de golpe.
                    </p>
                    
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Ejemplo:&#10;Leche&#10;Pan integral&#10;Huevos (2 docenas)"
                        className="w-full h-48 p-4 rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none placeholder:text-slate-400 font-medium"
                        autoFocus
                    />
                </div>
                
                <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex gap-3">
                    <Button variant="outline" className="flex-1 rounded-xl" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button 
                        className="flex-1 rounded-xl gap-2 shadow-md shadow-primary-200" 
                        onClick={handleProcess}
                        disabled={!text.trim()}
                    >
                        <Check size={18} />
                        Procesar Lista
                    </Button>
                </div>
            </div>
        </div>
    );
}
