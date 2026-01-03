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

    const handleShare = async () => {
        if (!household?.invite_code) return;

        const shareData = {
            title: 'Únete a mi ShopMate',
            text: `¡Hola! Únete a mi lista de compras en ShopMate con este código: ${household.invite_code}`,
            url: window.location.origin + '/onboarding?code=' + household.invite_code
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                // user cancelled or failed
            }
        } else {
            copyInvite();
        }
    };

    const copyInvite = () => {
        if (household?.invite_code) {
            navigator.clipboard.writeText(household.invite_code);
            alert('¡Código copiado!');
        }
    };

    const handleLeaveHousehold = async () => {
        if (!household || !confirm('¿Estás seguro de que quieres salir de esta familia? Tendrás que ser invitado de nuevo o crear una nueva.')) return;

        try {
            // @ts-ignore
            const { data, error } = await supabase.rpc('leave_household', { target_household_id: household.id });

            if (error) throw error;
            if (data && !data.success) throw new Error(data.message);

            setHousehold(null);
            router.push('/onboarding');
        } catch (error: any) {
            alert('Error: ' + error.message);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setHousehold(null);
        router.push('/login');
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile || !editName.trim()) return;

        // Optimistic update
        setProfile({ ...profile, full_name: editName });
        setIsEditing(false);

        const { error } = await supabase
            .from('profiles')
            .update({ full_name: editName } as any)
            .eq('id', profile.id);

        if (error) {
            alert('Error actualizando perfil');
            setProfile(profile); // Revert
        }
    };

    const handleSaveBudget = async () => {
        if (!household) return;
        const val = parseFloat(budgetInput);
        const newBudget = isNaN(val) ? 0 : val;

        setHousehold({ ...household, budget: newBudget }); // Optimistic

        const { error } = await supabase
            .from('households')
            .update({ budget: newBudget } as any)
            .eq('id', household.id);

        if (error) {
            console.error(error);
            alert('Error al guardar presupuesto');
        }
    };

    const handleUpdateHouseholdName = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!household || !editHouseholdName.trim()) return;

        // Optimistic
        setHousehold({ ...household, name: editHouseholdName });
        setIsEditingHousehold(false);

        const { error } = await supabase
            .from('households')
            .update({ name: editHouseholdName } as any)
            .eq('id', household.id);

        if (error) {
            alert('Error al actualizar nombre de familia');
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert('Las contraseñas no coinciden');
            return;
        }
        if (passwordData.newPassword.length < 6) {
            alert('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        const { error } = await supabase.auth.updateUser({ password: passwordData.newPassword });
        if (error) {
            alert('Error al actualizar contraseña: ' + error.message);
        } else {
            alert('Contraseña actualizada correctamente');
            setIsChangingPassword(false);
            setPasswordData({ newPassword: '', confirmPassword: '' });
        }
    };

    const toggleTheme = () => {
        setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
    };

    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategoryName.trim() || !household) return;

        const newCat = {
            name: newCategoryName.trim(),
            household_id: household.id,
            keywords: [],
            is_system: false,
            icon: null // Default no icon for now
        };

        // Optimistic
        // @ts-ignore
        setCategories([...categories, { ...newCat, id: 'temp-' + Date.now() }]);
        setNewCategoryName('');

        const { data, error } = await supabase
            .from('categories')
            .insert(newCat as any)
            .select()
            .single();

        if (data) {
            // Replace temp
            setCategories([...categories.filter(c => !c.id.startsWith('temp-')), data as any]);
        } else if (error) {
            alert('Error al crear categoría');
            // Revert logic would be needed here strictly speaking
        }
    };

    const handleDeleteCategory = async (id: string) => {
        if (!confirm('¿Eliminar esta categoría?')) return;

        // Optimistic
        setCategories(categories.filter(c => c.id !== id));

        const { error } = await supabase
            .from('categories')
            .delete()
            .eq('id', id);

        if (error) {
            alert('Error al eliminar');
            // Revert would be nice
        }
    };

    if (!household) return null;

    return (
        <div className="min-h-screen bg-slate-50 pb-24 px-6 pt-24">
            <Header title="Ajustes" subtitle="Administra tu familia" />


            <div className="space-y-6">
                {/* Profile Section */}
                <section className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center text-2xl font-bold text-emerald-600">
                            {profile?.avatar_url ? (
                                <img src={profile.avatar_url} className="h-full w-full object-cover rounded-full" />
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

                {/* Household Section */}
                <section className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-600">
                            <Users size={28} />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{household.name}</h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Familia / Hogar</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => {
                            setEditHouseholdName(household.name);
                            setIsEditingHousehold(true);
                        }}>
                            <PenLine size={20} className="text-slate-400 hover:text-emerald-500" />
                        </Button>
                    </div>
                    <div className="mt-2 text-center">
                        <button
                            onClick={handleLeaveHousehold}
                            className="text-xs text-red-400 hover:text-red-500 hover:underline transition-colors"
                        >
                            Salir de la familia
                        </button>
                    </div>
                </section>

                {/* Customization Section */}
                <section className="bg-white dark:bg-slate-800 p-2 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <button onClick={() => setIsEditingCategories(true)} className="flex items-center gap-4 w-full p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-2xl transition-colors text-left border-b border-slate-50 dark:border-slate-700 last:border-0">
                        <div className="h-10 w-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                            <Tags size={20} />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-slate-900 dark:text-white">Categorías</h3>
                            <p className="text-sm text-slate-500">Editar iconos y nombres</p>
                        </div>
                        <ChevronRight size={20} className="text-slate-300" />
                    </button>

                    {/* Theme Color */}
                    <div className="p-4 flex items-center gap-4 border-t border-slate-50 dark:border-slate-700">
                        <div className="h-10 w-10 rounded-full bg-pink-100 text-pink-500 flex items-center justify-center shrink-0">
                            <Palette size={20} />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-slate-900 dark:text-white">Color Principal</h3>
                            <div className="flex gap-3 mt-2">
                                {[
                                    { id: 'emerald', bg: 'bg-emerald-500' },
                                    { id: 'blue', bg: 'bg-blue-500' },
                                    { id: 'violet', bg: 'bg-violet-500' },
                                    { id: 'rose', bg: 'bg-rose-500' },
                                    { id: 'orange', bg: 'bg-orange-500' }
                                ].map((c) => (
                                    <button
                                        key={c.id}
                                        onClick={() => setThemeColor(c.id as any)}
                                        className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${c.bg} ${themeColor === c.id ? 'ring-2 ring-offset-2 ring-slate-400 dark:ring-slate-500 scale-110' : ''
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Budget Input */}
                    <div className="p-4 flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                            <DollarSign size={20} />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-slate-900 dark:text-white">Presupuesto</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-slate-400 font-bold">$</span>
                                <input
                                    type="number"
                                    inputMode="decimal"
                                    placeholder="Sin límite"
                                    className="w-24 h-8 px-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 dark:text-white font-bold text-sm focus:w-32 transition-all"
                                    value={budgetInput}
                                    onChange={(e) => setBudgetInput(e.target.value)}
                                    onBlur={handleSaveBudget}
                                />
                            </div>
                        </div>
                    </div>
                    {/* Haptic Toggle */}
                    <div className="p-4 flex items-center gap-4 border-t border-slate-50 dark:border-slate-700 cursor-pointer" onClick={() => {
                        if (navigator.vibrate) navigator.vibrate(50);
                        setHapticFeedback(!hapticFeedback);
                    }}>
                        <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                            <Smartphone size={20} />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-slate-900 dark:text-white">Vibración</h3>
                            <p className="text-sm text-slate-500">Al interactuar</p>
                        </div>
                        <div className={`w-12 h-6 rounded-full p-1 transition-colors ${hapticFeedback ? 'bg-primary-500' : 'bg-slate-200 dark:bg-slate-600'}`}>
                            <div className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${hapticFeedback ? 'translate-x-6' : 'translate-x-0'}`} />
                        </div>
                    </div>

                    {/* Recurring Automation */}
                    <div className="p-4 flex items-center gap-4 border-t border-slate-50 dark:border-slate-700 cursor-pointer" onClick={() => {
                        if (navigator.vibrate) navigator.vibrate(10);
                        setAutoAddRecurring(!autoAddRecurring);
                    }}>
                        <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-500 flex items-center justify-center shrink-0">
                            <RefreshCw size={20} />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-slate-900 dark:text-white">Auto-Recurrentes</h3>
                            <p className="text-sm text-slate-500">Añadir items programados</p>
                        </div>
                        <div className={`w-12 h-6 rounded-full p-1 transition-colors ${autoAddRecurring ? 'bg-primary-500' : 'bg-slate-200 dark:bg-slate-600'}`}>
                            <div className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${autoAddRecurring ? 'translate-x-6' : 'translate-x-0'}`} />
                        </div>
                    </div>

                    {/* Trash Link */}
                    <button onClick={() => router.push('/recycle-bin')} className="flex items-center gap-4 w-full p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-2xl transition-colors text-left border-t border-slate-50 dark:border-slate-700">
                        <div className="h-10 w-10 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center shrink-0">
                            <Trash2 size={20} />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-slate-900 dark:text-white">Papelera</h3>
                            <p className="text-sm text-slate-500">Items eliminados</p>
                        </div>
                        <ChevronRight size={20} className="text-slate-300" />
                    </button>
                </section>

                {/* Theme Section - New Style */}
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

                {/* Security Section */}
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

                {/* Invite Section */}
                <section className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <h2 className="font-bold flex items-center gap-2 mb-4 text-slate-900 dark:text-white">
                        <Users size={20} className="text-blue-500" />
                        Invitar Familia
                    </h2>
                    <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 border-dashed">
                        <span className="flex-1 font-mono text-xl tracking-widest text-center text-slate-700 dark:text-slate-300">
                            {household.invite_code}
                        </span>
                        <Button size="icon" variant="ghost" onClick={handleShare}>
                            <Share2 size={20} className="text-emerald-600" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={copyInvite}>
                            <Copy size={20} />
                        </Button>
                    </div>
                </section>

                {/* Members Section */}
                <section className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <h2 className="font-bold mb-4 text-slate-900 dark:text-white">Miembros</h2>
                    <div className="space-y-4">
                        {members.map((m, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden text-slate-500 dark:text-slate-300">
                                    {m.profiles?.avatar_url ? (
                                        <img src={m.profiles.avatar_url} className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center text-xs font-bold">
                                            {m.profiles?.full_name?.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-slate-900 dark:text-white">{m.profiles?.full_name}</p>
                                    <p className="text-xs text-slate-400 capitalize">{m.role}</p>
                                </div>
                                <div className="flex items-center gap-1 text-[10px] text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-full">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                    En línea
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Logout */}
                <section>
                    <Button variant="destructive" onClick={handleLogout} className="w-full justify-start gap-3 h-14 rounded-2xl bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border-none dark:bg-red-900/20 dark:text-red-400">
                        <LogOut size={20} />
                        Cerrar Sesión
                    </Button>
                </section>
            </div>

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

            {/* Edit Household Name Modal */}
            {isEditingHousehold && (
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
            )}

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

            {/* Categories Modal */}
            {isEditingCategories && (
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
            )}

        </div>
    );
}
