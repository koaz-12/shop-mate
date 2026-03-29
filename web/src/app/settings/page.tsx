'use client';

import { createClient } from '@/lib/supabase';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/Button';
import { LogOut } from 'lucide-react';
import Header from '@/components/dashboard/Header';
import { useRouter } from 'next/navigation';

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
        router.push('/login');
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

                {/* Logout */}
                <section>
                    <Button variant="destructive" onClick={handleLogout} className="w-full justify-start gap-3 h-14 rounded-2xl bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border-none dark:bg-red-900/20 dark:text-red-400">
                        <LogOut size={20} />
                        Cerrar Sesión
                    </Button>
                </section>
            </div>
        </div>
    );
}
