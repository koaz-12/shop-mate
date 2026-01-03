'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/Button';
import { Users, Copy, Moon, LogOut, Sun, PenLine, X, Share2, Tags, ChevronRight, DollarSign, Lock, Smartphone, Trash2, Plus, RefreshCw, Palette } from 'lucide-react';
import Header from '@/components/dashboard/Header';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';

export default function SettingsPage() {
    const { household, profile, setHousehold, setUser, setProfile, hapticFeedback, setHapticFeedback, categories, setCategories, autoAddRecurring, setAutoAddRecurring, themeColor, setThemeColor } = useStore();
    const [editHouseholdName, setEditHouseholdName] = useState('');
    const [isEditingHousehold, setIsEditingHousehold] = useState(false);
    const [members, setMembers] = useState<any[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordData, setPasswordData] = useState({ newPassword: '', confirmPassword: '' });
    const [editName, setEditName] = useState('');
    const [budgetInput, setBudgetInput] = useState('');
    const [isEditingCategories, setIsEditingCategories] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const { theme, setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
        if (!household) return;
        if (household.budget) setBudgetInput(household.budget.toString());
        if (household.name) setEditHouseholdName(household.name);

        // Fetch members detail
        const fetchMembers = async () => {
            const { data } = await supabase
                .from('household_members')
                .select('role, profiles(*)')
                .eq('household_id', household.id);

            if (data) setMembers(data);
        };

        fetchMembers();
    }, [household, supabase]);

    // ... (keep intermediate code unchanged until toggleTheme)

    const toggleTheme = () => {
        setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
    };

    // ... (keep intermediate code unchanged until Theme Section)

    {/* Theme Section - New Style */ }
    <section className="bg-white dark:bg-slate-800 p-2 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
        <div className="p-4 flex items-center gap-4 cursor-pointer" onClick={toggleTheme}>
            <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${mounted && resolvedTheme === 'dark' ? 'bg-slate-700 text-yellow-400' : 'bg-amber-100 text-amber-500'}`}>
                {mounted && resolvedTheme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
            </div>
            <div className="flex-1">
                <h3 className="font-bold text-slate-900 dark:text-white">Tema</h3>
                <p className="text-sm text-slate-500">
                    {!mounted ? 'Cargando...' : (resolvedTheme === 'dark' ? 'Oscuro' : 'Claro')}
                </p>
            </div>
            <div className={`w-12 h-6 rounded-full p-1 transition-colors ${mounted && resolvedTheme === 'dark' ? 'bg-indigo-500' : 'bg-slate-300'}`}>
                <div className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${mounted && resolvedTheme === 'dark' ? 'translate-x-6' : 'translate-x-0'}`} />
            </div>
        </div>
    </section>

    {/* Logout */ }
    <section>
        <Button variant="destructive" onClick={handleLogout} className="w-full justify-start gap-3 h-14 rounded-2xl bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border-none dark:bg-red-900/20 dark:text-red-400">
            <LogOut size={20} />
            Cerrar Sesión
        </Button>
    </section>
            </div >

        {/* Edit Profile Modal */ }
    {
        isEditing && (
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
        )
    }

    {/* Edit Household Name Modal */ }
    {
        isEditingHousehold && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-sm shadow-2xl p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-lg dark:text-white">Editar Familia</h3>
                        <button onClick={() => setIsEditingHousehold(false)}><X size={20} className="text-slate-400" /></button>
                    </div>
                    <form onSubmit={handleUpdateHouseholdName} className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Nombre de la Familia</label>
                            <input
                                value={editHouseholdName}
                                onChange={(e) => setEditHouseholdName(e.target.value)}
                                className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 dark:text-white mt-1"
                                placeholder="Ej. Familia Pérez"
                                autoFocus
                            />
                        </div>
                        <Button type="submit" className="w-full">Guardar Cambios</Button>
                    </form>
                </div>
            </div>
        )
    }

    {/* Change Password Modal */ }
    {
        isChangingPassword && (
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
        )
    }

    {/* Categories Modal */ }
    {
        isEditingCategories && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-sm max-h-[80vh] shadow-2xl p-6 flex flex-col">
                    <div className="flex justify-between items-center mb-4 shrink-0">
                        <h3 className="font-bold text-lg dark:text-white">Editar Categorías</h3>
                        <button onClick={() => setIsEditingCategories(false)}><X size={20} className="text-slate-400" /></button>
                    </div>

                    {/* New Category Input */}
                    <form onSubmit={handleAddCategory} className="mb-4 flex gap-2 shrink-0">
                        <input
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            className="flex-1 h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 dark:text-white text-sm"
                            placeholder="Nueva categoría..."
                        />
                        <Button type="submit" size="icon" className="shrink-0 bg-primary-500 hover:bg-primary-600 text-white rounded-lg h-10 w-10">
                            <Plus size={20} />
                        </Button>
                    </form>

                    <div className="space-y-2 overflow-y-auto pr-2">
                        {categories.map((cat) => (
                            <div key={cat.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl group">
                                <div className="flex items-center gap-3">
                                    <span className="text-lg">{cat.icon || '📦'}</span>
                                    <span className="font-medium text-slate-700 dark:text-slate-200">{cat.name}</span>
                                </div>
                                {!cat.is_system && (
                                    <button
                                        onClick={() => handleDeleteCategory(cat.id)}
                                        className="text-slate-400 hover:text-red-500 transition-colors p-1"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                                {cat.is_system && (
                                    <span className="text-[10px] text-slate-400 bg-slate-200 dark:bg-slate-600 px-1.5 py-0.5 rounded">System</span>
                                )}
                            </div>
                        ))}
                        {categories.length === 0 && (
                            <p className="text-center text-slate-400 text-sm py-4">No hay categorías</p>
                        )}
                    </div>
                </div>
            </div>
        )
    }

        </div >
    );
}
