'use client';

import { createClient } from '@/lib/supabase';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/Button';
import { LogOut, Download } from 'lucide-react';
import Header from '@/components/dashboard/Header';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

import ProfileSettings from '@/components/settings/ProfileSettings';
import HouseholdSettings from '@/components/settings/HouseholdSettings';
import CustomizationSettings from '@/components/settings/CustomizationSettings';
import ThemeSettings from '@/components/settings/ThemeSettings';
import SecuritySettings from '@/components/settings/SecuritySettings';
import MembersList from '@/components/settings/MembersList';

export default function SettingsPage() {
    const { household } = useStore();
    const supabase = createClient();
    const router = useRouter();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        useStore.getState().reset();
        localStorage.removeItem('shopmate-storage'); // Limpia Zustand persist
        sessionStorage.clear(); // Limpia alertas de presupuesto, etc.
        router.push('/login');
    };

    const handleExportData = () => {
        const { items, catalog, loyaltyCards, household: hh } = useStore.getState();
        const exportData = {
            household: hh?.name,
            exportedAt: new Date().toISOString(),
            items: items.filter(i => !i.deleted_at),
            catalog,
            loyaltyCards,
        };
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `shopmate-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Datos exportados correctamente');
    };

    if (!household) return null;

    return (
        <div className="min-h-screen bg-slate-50 pb-24 px-6 pt-24">
            <Header title="Ajustes" subtitle="Administra tu familia" />

            <div className="space-y-6">
                <ProfileSettings />
                <HouseholdSettings />
                <CustomizationSettings />
                <ThemeSettings />
                <SecuritySettings />
                <MembersList />

                {/* Export Data */}
                <section>
                    <Button
                        variant="ghost"
                        onClick={handleExportData}
                        aria-label="Exportar mis datos como JSON"
                        className="w-full justify-start gap-3 h-14 rounded-2xl bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700 border-none"
                    >
                        <Download size={20} />
                        Exportar Mis Datos
                    </Button>
                </section>

                {/* Logout */}
                <section>
                    <Button
                        variant="destructive"
                        onClick={handleLogout}
                        aria-label="Cerrar sesión de la cuenta"
                        className="w-full justify-start gap-3 h-14 rounded-2xl bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border-none dark:bg-red-900/20 dark:text-red-400"
                    >
                        <LogOut size={20} />
                        Cerrar Sesión
                    </Button>
                </section>
            </div>
        </div>
    );
}
