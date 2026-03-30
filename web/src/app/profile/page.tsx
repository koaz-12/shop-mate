'use client';

import { useState, useRef, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import Header from '@/components/dashboard/Header';
import toast from 'react-hot-toast';
import {
    ArrowLeft, Camera, Check, X, PenLine,
    Phone, ShoppingCart, ShoppingBag,
    TrendingUp, Tag, Home, Users, ChevronRight,
    Wallet, Palette, Shield, Loader2,
} from 'lucide-react';

// ─── Preset Avatars ─────────────────────────────────────────────────────────
const PRESET_AVATARS = [
    { id: 'bear',       emoji: '🐻', bg: 'from-amber-300 to-orange-400' },
    { id: 'fox',        emoji: '🦊', bg: 'from-orange-300 to-red-400' },
    { id: 'panda',      emoji: '🐼', bg: 'from-slate-300 to-slate-500' },
    { id: 'lion',       emoji: '🦁', bg: 'from-yellow-300 to-amber-500' },
    { id: 'koala',      emoji: '🐨', bg: 'from-slate-300 to-blue-400' },
    { id: 'frog',       emoji: '🐸', bg: 'from-green-300 to-emerald-500' },
    { id: 'penguin',    emoji: '🐧', bg: 'from-blue-300 to-indigo-500' },
    { id: 'cat',        emoji: '🐱', bg: 'from-rose-200 to-pink-400' },
    { id: 'robot',      emoji: '🤖', bg: 'from-cyan-300 to-blue-500' },
    { id: 'alien',      emoji: '👽', bg: 'from-green-200 to-teal-400' },
    { id: 'rocket',     emoji: '🚀', bg: 'from-violet-300 to-purple-500' },
    { id: 'star',       emoji: '⭐', bg: 'from-yellow-200 to-amber-400' },
];

// ─── Avatar Renderer ────────────────────────────────────────────────────────
function AvatarDisplay({
    avatarUrl,
    initial,
    size = 'lg',
}: {
    avatarUrl: string | null | undefined;
    initial: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}) {
    const sizeClasses = {
        sm: 'h-10 w-10 text-lg',
        md: 'h-14 w-14 text-2xl',
        lg: 'h-24 w-24 text-4xl',
        xl: 'h-28 w-28 text-5xl',
    };

    const cls = `${sizeClasses[size]} rounded-full flex items-center justify-center overflow-hidden`;

    if (avatarUrl?.startsWith('preset:')) {
        const id = avatarUrl.replace('preset:', '');
        const preset = PRESET_AVATARS.find(p => p.id === id);
        if (preset) {
            return (
                <div className={`${cls} bg-gradient-to-br ${preset.bg}`}>
                    <span role="img" aria-label={preset.id}>{preset.emoji}</span>
                </div>
            );
        }
    }

    if (avatarUrl && !avatarUrl.startsWith('preset:')) {
        return (
            <div className={cls}>
                <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
            </div>
        );
    }

    return (
        <div className={`${cls} bg-gradient-to-br from-primary-400 to-primary-600`}>
            <span className="text-white font-extrabold">{initial}</span>
        </div>
    );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function ProfilePage() {
    const { user, profile, setProfile, items, household, members } = useStore();
    const router = useRouter();
    const supabase = createClient();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Edit states
    const [editingName, setEditingName] = useState(false);
    const [editName, setEditName] = useState('');
    const [editingPhone, setEditingPhone] = useState(false);
    const [editPhone, setEditPhone] = useState('');
    const [savingName, setSavingName] = useState(false);
    const [savingPhone, setSavingPhone] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [showAvatarPicker, setShowAvatarPicker] = useState(false);

    const initial = profile?.full_name ? profile.full_name[0].toUpperCase() : user?.email?.[0].toUpperCase() || '?';

    // ─── Stats (calculated from store) ────────────────────────────────────────
    const stats = useMemo(() => {
        const myAdded = items.filter(i => i.created_by === user?.id && !i.deleted_at);
        const myBought = items.filter(i => i.bought_by === user?.id && !i.deleted_at);

        const mySpend = myBought.reduce((acc, i) => {
            const qty = parseInt(i.quantity || '1') || 1;
            return acc + ((i.price || 0) * qty);
        }, 0);

        // Top category
        const catCount: Record<string, number> = {};
        myAdded.forEach(i => { if (i.category) catCount[i.category] = (catCount[i.category] || 0) + 1; });
        const topCat = Object.entries(catCount).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';

        return {
            added: myAdded.length,
            bought: myBought.length,
            spend: mySpend,
            topCategory: topCat,
        };
    }, [items, user?.id]);

    // ─── Handlers ────────────────────────────────────────────────────────────
    const handleSaveName = async () => {
        if (!profile || !editName.trim() || editName.trim().length < 2) {
            toast.error('El nombre debe tener al menos 2 caracteres');
            return;
        }
        setSavingName(true);
        const trimmed = editName.trim();
        setProfile({ ...profile, full_name: trimmed });
        setEditingName(false);

        const { error } = await supabase
            .from('profiles')
            .update({ full_name: trimmed } as never)
            .eq('id', profile.id);

        if (error) {
            toast.error('No se pudo guardar el nombre');
            setProfile(profile); // rollback
        } else {
            toast.success('Nombre actualizado');
        }
        setSavingName(false);
    };

    const handleSavePhone = async () => {
        if (!profile) return;
        setSavingPhone(true);
        const phone = editPhone.trim() || null;
        setProfile({ ...profile, phone });
        setEditingPhone(false);

        const { error } = await supabase
            .from('profiles')
            .update({ phone } as never)
            .eq('id', profile.id);

        if (error) {
            toast.error('No se pudo guardar el teléfono');
        } else {
            toast.success(phone ? 'Teléfono guardado' : 'Teléfono eliminado');
        }
        setSavingPhone(false);
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !profile || !user) return;

        if (file.size > 2 * 1024 * 1024) {
            toast.error('La imagen no puede ser mayor a 2MB');
            return;
        }

        setUploadingAvatar(true);
        setShowAvatarPicker(false);

        const ext = file.name.split('.').pop();
        const path = `${user.id}/avatar.${ext}`;

        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(path, file, { upsert: true });

        if (uploadError) {
            toast.error('Error al subir la imagen. Asegúrate de crear el bucket "avatars" en Supabase Storage.');
            setUploadingAvatar(false);
            return;
        }

        const { data } = supabase.storage.from('avatars').getPublicUrl(path);
        const publicUrl = `${data.publicUrl}?t=${Date.now()}`; // Cache bust

        setProfile({ ...profile, avatar_url: publicUrl });

        await supabase
            .from('profiles')
            .update({ avatar_url: publicUrl } as never)
            .eq('id', profile.id);

        toast.success('Foto de perfil actualizada ✨');
        setUploadingAvatar(false);
    };

    const handlePresetAvatar = async (presetId: string) => {
        if (!profile) return;
        const newUrl = `preset:${presetId}`;
        setProfile({ ...profile, avatar_url: newUrl });
        setShowAvatarPicker(false);

        await supabase
            .from('profiles')
            .update({ avatar_url: newUrl } as never)
            .eq('id', profile.id);

        toast.success('Avatar actualizado ✨');
    };

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gradient-to-b from-primary-50 via-slate-50 to-slate-50 pb-10">
            <Header />

            {/* Top bar */}
            <div className="fixed top-16 left-0 right-0 z-40 flex items-center gap-2 px-4 py-3 bg-primary-50/80 backdrop-blur-sm">
                <button
                    onClick={() => router.back()}
                    className="p-2 -ml-2 hover:bg-white/60 rounded-full transition-colors"
                    aria-label="Volver"
                >
                    <ArrowLeft size={22} className="text-slate-700" />
                </button>
                <h2 className="text-lg font-bold text-slate-800">Mi Perfil</h2>
            </div>

            <div className="pt-28 px-4 space-y-4">

                {/* ── HERO CARD ─────────────────────────────────────────── */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    {/* Colored top strip */}
                    <div className="h-20 bg-gradient-to-r from-primary-400 to-primary-600 relative">
                        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
                            <div className="relative">
                                {/* Avatar */}
                                {uploadingAvatar ? (
                                    <div className="h-24 w-24 rounded-full bg-slate-200 flex items-center justify-center border-4 border-white shadow-lg">
                                        <Loader2 size={28} className="text-primary-500 animate-spin" />
                                    </div>
                                ) : (
                                    <div className="border-4 border-white rounded-full shadow-lg">
                                        <AvatarDisplay avatarUrl={profile?.avatar_url} initial={initial} size="lg" />
                                    </div>
                                )}
                                {/* Edit button */}
                                <button
                                    onClick={() => setShowAvatarPicker(true)}
                                    className="absolute bottom-0 right-0 bg-primary-500 hover:bg-primary-600 text-white rounded-full p-2 shadow-md border-2 border-white transition-colors"
                                    aria-label="Cambiar avatar"
                                >
                                    <Camera size={14} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Info */}
                    <div className="pt-14 pb-6 px-6 text-center">
                        {/* Name */}
                        {editingName ? (
                            <div className="flex items-center justify-center gap-2 mb-1">
                                <input
                                    autoFocus
                                    value={editName}
                                    onChange={e => setEditName(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') setEditingName(false); }}
                                    maxLength={50}
                                    className="text-center text-xl font-bold text-slate-900 border-b-2 border-primary-400 bg-transparent outline-none w-48"
                                />
                                <button onClick={handleSaveName} aria-label="Guardar nombre" className="text-emerald-500 hover:text-emerald-600"><Check size={20} /></button>
                                <button onClick={() => setEditingName(false)} aria-label="Cancelar" className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center gap-2 mb-1">
                                <h3 className="text-xl font-extrabold text-slate-900">
                                    {profile?.full_name || 'Sin nombre'}
                                </h3>
                                <button
                                    onClick={() => { setEditName(profile?.full_name || ''); setEditingName(true); }}
                                    aria-label="Editar nombre"
                                    className="text-slate-400 hover:text-primary-500 transition-colors"
                                >
                                    <PenLine size={16} />
                                </button>
                            </div>
                        )}

                        <p className="text-sm text-slate-500">{user?.email}</p>

                        {/* Phone */}
                        <div className="mt-3">
                            {editingPhone ? (
                                <div className="flex items-center justify-center gap-2">
                                    <Phone size={14} className="text-slate-400" />
                                    <input
                                        autoFocus
                                        type="tel"
                                        value={editPhone}
                                        onChange={e => setEditPhone(e.target.value)}
                                        onKeyDown={e => { if (e.key === 'Enter') handleSavePhone(); if (e.key === 'Escape') setEditingPhone(false); }}
                                        placeholder="+1 (555) 000-0000"
                                        className="text-center text-sm text-slate-700 border-b-2 border-primary-400 bg-transparent outline-none w-44"
                                    />
                                    <button onClick={handleSavePhone} aria-label="Guardar teléfono" className="text-emerald-500"><Check size={16} /></button>
                                    <button onClick={() => setEditingPhone(false)} aria-label="Cancelar" className="text-slate-400"><X size={16} /></button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => { setEditPhone(profile?.phone || ''); setEditingPhone(true); }}
                                    className="flex items-center justify-center gap-1.5 mx-auto text-sm text-slate-400 hover:text-primary-500 transition-colors"
                                >
                                    <Phone size={13} />
                                    <span>{profile?.phone || 'Añadir teléfono (opcional)'}</span>
                                    <PenLine size={12} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── AVATAR PICKER ─────────────────────────────────────── */}
                {showAvatarPicker && (
                    <div
                        className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 backdrop-blur-sm"
                        onClick={e => { if (e.target === e.currentTarget) setShowAvatarPicker(false); }}
                    >
                        <div className="w-full max-w-lg bg-white rounded-t-3xl pb-8 pt-5 px-5 animate-in slide-in-from-bottom duration-300">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="font-bold text-slate-800 text-base">Elige tu avatar</h4>
                                <button onClick={() => setShowAvatarPicker(false)} aria-label="Cerrar">
                                    <X size={20} className="text-slate-400" />
                                </button>
                            </div>

                            {/* Photo upload option */}
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full flex items-center gap-3 p-4 rounded-2xl bg-primary-50 border-2 border-dashed border-primary-200 hover:border-primary-400 transition-colors mb-4"
                            >
                                <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                                    <Camera size={20} className="text-primary-600" />
                                </div>
                                <div className="text-left">
                                    <p className="font-semibold text-primary-700 text-sm">Subir foto</p>
                                    <p className="text-xs text-slate-500">JPG, PNG o WEBP · máx. 2MB</p>
                                </div>
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/gif"
                                className="hidden"
                                onChange={handlePhotoUpload}
                            />

                            {/* Preset grid */}
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Avatares predefinidos</p>
                            <div className="grid grid-cols-6 gap-3">
                                {PRESET_AVATARS.map(preset => {
                                    const isSelected = profile?.avatar_url === `preset:${preset.id}`;
                                    return (
                                        <button
                                            key={preset.id}
                                            onClick={() => handlePresetAvatar(preset.id)}
                                            aria-label={preset.id}
                                            className={`relative h-12 w-12 rounded-2xl bg-gradient-to-br ${preset.bg} flex items-center justify-center text-2xl transition-all active:scale-95 ${
                                                isSelected ? 'ring-3 ring-primary-500 ring-offset-2 scale-110' : 'hover:scale-105'
                                            }`}
                                        >
                                            {preset.emoji}
                                            {isSelected && (
                                                <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary-500 rounded-full flex items-center justify-center">
                                                    <Check size={10} className="text-white" strokeWidth={3} />
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── ESTADÍSTICAS ─────────────────────────────────────── */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5">
                    <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <TrendingUp size={18} className="text-primary-500" />
                        Mis Estadísticas
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                        <StatCard
                            icon={<ShoppingCart size={18} className="text-blue-500" />}
                            value={stats.added.toString()}
                            label="Items agregados"
                            color="bg-blue-50"
                        />
                        <StatCard
                            icon={<ShoppingBag size={18} className="text-emerald-500" />}
                            value={stats.bought.toString()}
                            label="Compras realizadas"
                            color="bg-emerald-50"
                        />
                        <StatCard
                            icon={<span className="text-base">{household?.currency || '$'}</span>}
                            value={stats.spend > 0 ? `${(household?.currency || '$')}${stats.spend.toLocaleString('es', { maximumFractionDigits: 0 })}` : '—'}
                            label="Gasto estimado"
                            color="bg-amber-50"
                        />
                        <StatCard
                            icon={<Tag size={18} className="text-violet-500" />}
                            value={stats.topCategory}
                            label="Categoría favorita"
                            color="bg-violet-50"
                        />
                    </div>
                </div>

                {/* ── MI HOGAR ─────────────────────────────────────────── */}
                {household && (
                    <button
                        onClick={() => router.push('/settings')}
                        className="w-full bg-white rounded-3xl shadow-sm border border-slate-100 p-5 flex items-center gap-4 hover:bg-slate-50 transition-colors text-left"
                    >
                        <div className="h-12 w-12 bg-emerald-50 rounded-2xl flex items-center justify-center shrink-0">
                            <Home size={22} className="text-emerald-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-900 truncate">{household.name}</p>
                            <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-0.5">
                                <Users size={12} /> {members.length} miembro{members.length !== 1 ? 's' : ''}
                                {household.budget ? ` · ${household.currency || '$'}${household.budget.toLocaleString()}/mes` : ''}
                            </p>
                        </div>
                        <ChevronRight size={18} className="text-slate-400 shrink-0" />
                    </button>
                )}

                {/* ── ACCESOS RÁPIDOS ───────────────────────────────────── */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-5 pt-4 pb-2">Accesos rápidos</p>
                    {[
                        { label: 'Mi Cartera',      icon: Wallet,  path: '/loyalty',    desc: 'Tarjetas de puntos y membresías', color: 'text-blue-500',   bg: 'bg-blue-50' },
                        { label: 'Personalización', icon: Palette, path: '/customize',  desc: 'Tema y colores de la app',        color: 'text-violet-500', bg: 'bg-violet-50' },
                        { label: 'Seguridad',       icon: Shield,  path: '/security',   desc: 'Contraseña y acceso',             color: 'text-rose-500',   bg: 'bg-rose-50' },
                    ].map(item => (
                        <button
                            key={item.path}
                            onClick={() => router.push(item.path)}
                            className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
                        >
                            <div className={`h-9 w-9 ${item.bg} rounded-xl flex items-center justify-center shrink-0`}>
                                <item.icon size={18} className={item.color} />
                            </div>
                            <div className="flex-1 text-left">
                                <p className="font-semibold text-slate-800 text-sm">{item.label}</p>
                                <p className="text-xs text-slate-400">{item.desc}</p>
                            </div>
                            <ChevronRight size={16} className="text-slate-300 shrink-0" />
                        </button>
                    ))}
                </div>

            </div>
        </div>
    );
}

// ─── Stat Card Subcomponent ──────────────────────────────────────────────────
function StatCard({ icon, value, label, color }: {
    icon: React.ReactNode;
    value: string;
    label: string;
    color: string;
}) {
    return (
        <div className={`${color} rounded-2xl p-4`}>
            <div className="mb-2">{icon}</div>
            <p className="text-xl font-extrabold text-slate-900 truncate">{value}</p>
            <p className="text-xs text-slate-500 mt-0.5 leading-tight">{label}</p>
        </div>
    );
}
