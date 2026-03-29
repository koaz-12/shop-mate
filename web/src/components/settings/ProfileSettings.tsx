'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { createClient } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { PenLine, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfileSettings() {
    const { profile, setProfile } = useStore();
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState('');
    const supabase = createClient();

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile || !editName.trim()) return;

        // Optimistic update
        setProfile({ ...profile, full_name: editName });
        setIsEditing(false);

        const { error } = await supabase
            .from('profiles')
            .update({ full_name: editName } as never)
            .eq('id', profile.id);

        if (error) {
            toast.error('Error actualizando perfil');
            setProfile(profile); // Revert
        }
    };

    return (
        <>
            <section className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-4">
                    <div className="h-16 w-16 overflow-hidden rounded-full bg-emerald-100 flex items-center justify-center text-2xl font-bold text-emerald-600">
                        {profile?.avatar_url ? (
                            <img src={profile.avatar_url} className="h-full w-full object-cover rounded-full" alt="Avatar" />
                        ) : (
                            profile?.full_name?.charAt(0)
                        )}
                    </div>
                    <div className="flex-1">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">{profile?.full_name}</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Administrador</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => {
                        setEditName(profile?.full_name || '');
                        setIsEditing(true);
                    }}>
                        <PenLine size={20} className="text-slate-400 hover:text-emerald-500" />
                    </Button>
                </div>
            </section>

            {/* Edit Profile Modal */}
            {isEditing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-sm shadow-2xl p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg dark:text-white">Editar Perfil</h3>
                            <button onClick={() => setIsEditing(false)}><X size={20} className="text-slate-400" /></button>
                        </div>
                        <form onSubmit={handleUpdateProfile} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Nombre</label>
                                <input
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 dark:text-white mt-1"
                                />
                            </div>
                            <Button type="submit" className="w-full">Guardar</Button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
