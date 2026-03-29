'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useStore } from '@/store/useStore';

export default function MembersList() {
    const { household } = useStore();
    const [members, setMembers] = useState<any[]>([]);
    const supabase = createClient();

    useEffect(() => {
        if (!household) return;

        const fetchMembers = async () => {
            const { data } = await supabase
                .from('household_members')
                .select('role, profiles(*)')
                .eq('household_id', household.id);

            if (data) setMembers(data);
        };

        fetchMembers();
    }, [household, supabase]);

    if (!household) return null;

    return (
        <section className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
            <h2 className="font-bold mb-4 text-slate-900 dark:text-white">Miembros</h2>
            <div className="space-y-4">
                {members.map((m, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden text-slate-500 dark:text-slate-300">
                            {m.profiles?.avatar_url ? (
                                <img src={m.profiles.avatar_url} className="h-full w-full object-cover" alt="Member Avatar" />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center text-xs font-bold">
                                    {m.profiles?.full_name?.charAt(0) || '?'}
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
    );
}
