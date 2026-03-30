'use client';

import { useStore } from '@/store/useStore';
import Header from '@/components/dashboard/Header';
import HouseholdSettings from '@/components/settings/HouseholdSettings';
import MembersList from '@/components/settings/MembersList';
import BottomNav from '@/components/BottomNav';

export default function FamilyPage() {
    const { household } = useStore();

    if (!household) return null;

    return (
        <div className="min-h-screen bg-slate-50 pb-24 pt-20 px-4">
            <Header />

            {/* Page header */}
            <div className="mb-6">
                <h2 className="text-2xl font-extrabold text-slate-900">Mi Familia</h2>
                <p className="text-sm text-slate-500 mt-1">Gestiona tu hogar y los miembros del grupo</p>
            </div>

            <div className="space-y-4">
                <HouseholdSettings />
                <MembersList />
            </div>
        </div>
    );
}
