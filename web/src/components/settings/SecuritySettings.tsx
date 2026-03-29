'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Lock, ChevronRight, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SecuritySettings() {
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordData, setPasswordData] = useState({ newPassword: '', confirmPassword: '' });
    const supabase = createClient();

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('Las contraseñas no coinciden');
            return;
        }
        if (passwordData.newPassword.length < 6) {
            toast.error('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        const { error } = await supabase.auth.updateUser({ password: passwordData.newPassword });
        if (error) {
            toast.error('Error al actualizar contraseña: ' + error.message);
        } else {
            toast.success('Contraseña actualizada correctamente');
            setIsChangingPassword(false);
            setPasswordData({ newPassword: '', confirmPassword: '' });
        }
    };

    return (
        <>
            <section className="bg-white dark:bg-slate-800 p-2 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
                <button onClick={() => setIsChangingPassword(true)} className="flex items-center gap-4 w-full p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-2xl transition-colors text-left">
                    <div className="h-10 w-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center">
                        <Lock size={20} />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-slate-900 dark:text-white">Seguridad</h3>
                        <p className="text-sm text-slate-500">Cambiar contraseña</p>
                    </div>
                    <ChevronRight size={20} className="text-slate-300" />
                </button>
            </section>

            {/* Change Password Modal */}
            {isChangingPassword && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-sm shadow-2xl p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg dark:text-white">Cambiar Contraseña</h3>
                            <button onClick={() => setIsChangingPassword(false)}><X size={20} className="text-slate-400" /></button>
                        </div>
                        <form onSubmit={handleChangePassword} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Nueva Contraseña</label>
                                <input
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 dark:text-white mt-1"
                                    placeholder="Min. 6 caracteres"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Confirmar Contraseña</label>
                                <input
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 dark:text-white mt-1"
                                    placeholder="Confirmar contraseña"
                                />
                            </div>
                            <Button type="submit" className="w-full">Actualizar</Button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
