'use client';

import { useStore } from '@/store/useStore';
import Header from '@/components/dashboard/Header';
import CustomizationSettings from '@/components/settings/CustomizationSettings';
import ThemeSettings from '@/components/settings/ThemeSettings';
import SecuritySettings from '@/components/settings/SecuritySettings';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Download, Shield, Palette } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PreferencesPage() {
    const router = useRouter();
    const { items, catalog, loyaltyCards, household } = useStore();

    const handleExportData = () => {
        const exportData = {
            household: household?.name,
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

    return (
        <div className="min-h-screen bg-slate-50 pb-24 pt-20 px-4">
            <Header />

            <div className="flex items-center gap-3 mb-6">
                <button
                    onClick={() => router.back()}
                    className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors"
                    aria-label="Volver"
                >
                    <ArrowLeft size={22} className="text-slate-600" />
                </button>
                <div>
                    <h2 className="text-2xl font-extrabold text-slate-900">Ajustes</h2>
                    <p className="text-sm text-slate-500">Personaliza tu experiencia de la App</p>
                </div>
            </div>

            <div className="space-y-6">
                {/* ── CUSTOMIZATION ── */}
                <section>
                    <div className="flex items-center gap-2 mb-3 px-1 text-slate-800">
                        <Palette size={18} className="text-violet-500" />
                        <h3 className="font-bold">Apariencia</h3>
                    </div>
                    <div className="space-y-4">
                        <CustomizationSettings />
                        <ThemeSettings />
                    </div>
                </section>

                <hr className="border-slate-200" />

                {/* ── SECURITY ── */}
                <section>
                    <div className="flex items-center gap-2 mb-3 px-1 text-slate-800">
                        <Shield size={18} className="text-rose-500" />
                        <h3 className="font-bold">Seguridad</h3>
                    </div>
                    <SecuritySettings />
                </section>

                <hr className="border-slate-200" />

                {/* ── DATA EXPORT ── */}
                <section>
                    <div className="flex items-center gap-2 mb-3 px-1 text-slate-800">
                        <Download size={18} className="text-blue-500" />
                        <h3 className="font-bold">Mis Datos</h3>
                    </div>
                    
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
                        <p className="text-sm text-slate-500 mb-4 leading-relaxed">
                            Descarga una copia local de tus listas, historial, catálogo de productos e información de tarjetas de fidelidad en formato JSON.
                        </p>
                        <button
                            onClick={handleExportData}
                            className="w-full h-12 rounded-xl flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold transition-colors"
                        >
                            <Download size={18} />
                            <span>Exportar mis datos ahora</span>
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
}
