'use client';

import { useStore } from '@/store/useStore';
import { ChevronDown, Plus, List } from 'lucide-react';
import { useState } from 'react';
import { createClient } from '@/lib/supabase';

export default function ListSelector() {
    const { lists, currentList, setCurrentList, setLists, household } = useStore();
    const [isOpen, setIsOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [newListName, setNewListName] = useState('');
    const supabase = createClient();

    const handleSelect = (list: any) => {
        setCurrentList(list);
        setIsOpen(false);
    };

    const handleCreateList = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newListName.trim() || !household) return;

        const newList = {
            name: newListName.trim(),
            household_id: household.id,
            icon: null
        };

        const { data, error } = await supabase
            .from('lists' as any)
            .insert(newList)
            .select()
            .single();

        if (data) {
            setLists([...lists, data]);
            setCurrentList(data);
            setIsCreating(false);
            setNewListName('');
            setIsOpen(false);
        } else {
            alert('Error creando lista');
        }
    };

    if (!currentList) return null;

    return (
        <div className="relative z-20">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors text-sm font-bold text-slate-700"
            >
                <List size={14} className="text-slate-500" />
                {currentList.name}
                <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 p-2">
                    <div className="space-y-1">
                        {lists.map((list) => (
                            <button
                                key={list.id}
                                onClick={() => handleSelect(list)}
                                className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors flex items-center justify-between ${currentList.id === list.id ? 'bg-primary-50 text-primary-700' : 'hover:bg-slate-50 text-slate-700'}`}
                            >
                                {list.name}
                                {currentList.id === list.id && <div className="h-2 w-2 rounded-full bg-primary-500" />}
                            </button>
                        ))}
                    </div>

                    <div className="border-t border-slate-100 my-2" />

                    {isCreating ? (
                        <form onSubmit={handleCreateList} className="px-2 pb-2">
                            <input
                                autoFocus
                                value={newListName}
                                onChange={(e) => setNewListName(e.target.value)}
                                className="w-full text-sm border border-slate-200 rounded-lg px-2 py-1 mb-2 outline-none focus:border-primary-500"
                                placeholder="Nombre de lista..."
                            />
                            <div className="flex gap-2">
                                <button type="submit" className="flex-1 bg-primary-500 text-white text-xs font-bold py-1 rounded-lg">Crear</button>
                                <button type="button" onClick={() => setIsCreating(false)} className="px-2 text-xs text-slate-400">Cancelar</button>
                            </div>
                        </form>
                    ) : (
                        <button
                            onClick={() => setIsCreating(true)}
                            className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-primary-600 transition-colors flex items-center gap-2"
                        >
                            <Plus size={14} />
                            Nueva Lista
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
