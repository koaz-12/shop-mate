import { useState } from 'react';
import { X, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useStore } from '@/store/useStore';
import { Item } from '@/types';

interface ItemDetailModalProps {
    isOpen: boolean;
    item: Item | null;
    onClose: () => void;
    onSave: (itemId: string, updates: Partial<Item>) => void;
}

export default function ItemDetailModal({ isOpen, item, onClose, onSave }: ItemDetailModalProps) {
    const { members } = useStore();
    const [notes, setNotes] = useState(item?.notes || '');
    const [assignedTo, setAssignedTo] = useState<string | null>(item?.assigned_to || null);

    // Reset when item changes
    if (!isOpen || !item) return null;

    const handleSave = () => {
        onSave(item.id, {
            notes: notes.trim() || null,
            assigned_to: assignedTo,
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden flex flex-col">
                <div className="flex justify-between items-center p-5 border-b border-slate-100">
                    <h3 className="font-bold text-lg text-slate-800">{item.name}</h3>
                    <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full transition-colors">
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>

                <div className="p-5 flex-1 overflow-y-auto space-y-4">
                    {/* Responsable */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Responsable de comprar</label>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setAssignedTo(null)}
                                className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${!assignedTo ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-500 border-slate-200'}`}
                            >
                                Cualquiera
                            </button>
                            {members.map(member => (
                                <button
                                    key={member.id}
                                    onClick={() => setAssignedTo(member.id)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-1.5 ${assignedTo === member.id ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-slate-50 text-slate-500 border-slate-200'}`}
                                >
                                    <div className="h-4 w-4 rounded-full bg-slate-200 border border-slate-300 overflow-hidden shadow-sm flex items-center justify-center">
                                        {member.avatar_url ? (
                                            <img src={member.avatar_url} className="h-full w-full object-cover" />
                                        ) : (
                                          <span className="text-[8px] font-bold text-slate-500">{member.full_name?.[0]?.toUpperCase()}</span>
                                        )}
                                    </div>
                                    {member.full_name?.split(' ')[0]}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Notas */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Notas (Opcional)</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Ej. Marca específica, tamaño, etc."
                            className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 bg-slate-50 text-sm h-24 resize-none"
                        />
                    </div>
                </div>

                <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex gap-3 justify-end">
                    <Button variant="outline" onClick={onClose} className="rounded-xl">Cancelar</Button>
                    <Button onClick={handleSave} className="rounded-xl gap-2 bg-emerald-600 hover:bg-emerald-700">
                        <Check size={18} /> Guardar
                    </Button>
                </div>
            </div>
        </div>
    );
}
