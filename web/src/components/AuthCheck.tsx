'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { useStore } from '@/store/useStore';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';
import { useOfflineSync } from '@/hooks/useOfflineSync';

export default function AuthCheck({ children }: { children: React.ReactNode }) {
    useRealtimeSync();
    useOfflineSync();
    const router = useRouter();
    const pathname = usePathname();
    // Re-create the client outside useEffect is fine since it's a singleton,
    // but typically safe to just define inside to avoid linter warnings
    const supabase = createClient();

    // Zustand actions
    const setUser = useStore((state) => state.setUser);
    const setProfile = useStore((state) => state.setProfile);
    const setHousehold = useStore((state) => state.setHousehold);
    const setMembers = useStore((state) => state.setMembers);
    const setCategories = useStore((state) => state.setCategories);
    const setCatalog = useStore((state) => state.setCatalog);
    const setLoyaltyCards = useStore((state) => state.setLoyaltyCards);
    const setLists = useStore((state) => state.setLists);
    const setCurrentList = useStore((state) => state.setCurrentList);

    // Stale-While-Revalidate: If we have cached data from a previous session,
    // render the app immediately and refresh in background.
    const hasCachedData = !!useStore.getState().household;
    const [isChecking, setIsChecking] = useState(!hasCachedData);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                // 1. Fetch Session
                const { data: { session } } = await supabase.auth.getSession();

                if (!session) {
                    if (pathname !== '/login' && pathname !== '/') {
                        router.push('/login');
                    }
                    return;
                }

                setUser(session.user);

                // 2. Fetch Profile & Active Household Membership in Parallel
                const [profileRes, memberRes] = (await Promise.all([
                    supabase.from('profiles').select('*').eq('id', session.user.id).single(),
                    supabase.from('household_members').select('household_id, role, households(*)').eq('user_id', session.user.id).single(),
                ])) as unknown as [any, any];

                if (profileRes.data) setProfile(profileRes.data);

                if (memberRes.data && (memberRes.data as any).households) {
                    const activeHousehold = (memberRes.data as any).households;
                    setHousehold(activeHousehold);

                    // 3. Fetch all household-dependent data in Parallel
                    const [
                        membersRes,
                        categoriesRes,
                        catalogRes,
                        cardsRes,
                        listsRes
                    ] = (await Promise.all([
                        supabase.from('household_members').select('profiles(*)').eq('household_id', activeHousehold.id),
                        supabase.from('categories').select('*').or(`is_system.eq.true,household_id.eq.${activeHousehold.id}`).order('name'),
                        supabase.from('household_products').select('*').eq('household_id', activeHousehold.id),
                        supabase.from('loyalty_cards').select('*').eq('household_id', activeHousehold.id),
                        supabase.from('lists').select('*').eq('household_id', activeHousehold.id).order('created_at'),
                    ])) as unknown as [any, any, any, any, any];

                    // Assign Members
                    if (membersRes.data) {
                        const cleanProfiles = membersRes.data.map((p: any) => p.profiles).filter(Boolean);
                        setMembers(cleanProfiles as any[]);
                    }

                    // Assign Categories
                    if (categoriesRes.data) setCategories(categoriesRes.data);

                    // Assign Catalog
                    if (catalogRes.data) setCatalog(catalogRes.data);

                    // Assign Loyalty Cards
                    if (cardsRes.data) setLoyaltyCards(cardsRes.data);

                    // Assign Lists
                    if (listsRes.data && listsRes.data.length > 0) {
                        setLists(listsRes.data);
                        const current = useStore.getState().currentList;
                        if (!current) {
                            setCurrentList(listsRes.data[0]);
                        }
                    } else {
                        setLists([]);
                    }

                    if (pathname === '/login' || pathname === '/onboarding' || pathname === '/') {
                        router.push('/home');
                    }
                } else {
                    if (pathname !== '/onboarding' && pathname !== '/login') {
                        router.push('/onboarding');
                    }
                }
            } catch (error) {
                console.error("Error checking auth:", error);
            } finally {
                setIsChecking(false);
            }
        };

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_OUT') {
                setUser(null);
                useStore.getState().reset();
                router.push('/login');
            }
        });

        const presenceChannel = supabase.channel('online-users');

        presenceChannel
            .on('presence', { event: 'sync' }, () => {
                const state = presenceChannel.presenceState();
                console.log('Online users:', state);
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (user) {
                        await presenceChannel.track({
                            user_id: user.id,
                            online_at: new Date().toISOString(),
                        });
                    }
                }
            });

        checkAuth();

        return () => {
            subscription.unsubscribe();
            presenceChannel.unsubscribe();
        };
    }, [supabase, router, pathname, setUser, setProfile, setHousehold, setMembers, setCategories, setCatalog, setLoyaltyCards, setLists, setCurrentList]);

    if (isChecking) {
        return (
            <div className="flex h-screen w-full flex-col bg-slate-50 relative overflow-hidden">
                {/* Header Skeleton */}
                <header className="flex h-16 w-full items-center justify-between px-4 sm:px-6 bg-white border-b border-slate-100">
                    <div className="h-8 w-8 rounded-full bg-slate-200 animate-pulse" />
                    <div className="h-6 w-32 rounded-lg bg-slate-200 animate-pulse" />
                    <div className="h-8 w-8 rounded-full bg-slate-200 animate-pulse" />
                </header>

                {/* Content Area Skeleton */}
                <main className="flex-1 overflow-auto p-4 sm:p-6 sm:px-8 max-w-2xl mx-auto w-full space-y-4">
                    <div className="h-24 w-full rounded-2xl bg-slate-200 animate-pulse mb-6" />
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-16 w-full rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center px-4 gap-4 animate-pulse">
                                <div className="h-8 w-8 rounded-full bg-slate-200" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-3 w-1/2 bg-slate-200 rounded-lg" />
                                    <div className="h-2 w-1/4 bg-slate-200 rounded-lg" />
                                </div>
                                <div className="h-6 w-12 bg-slate-200 rounded-lg" />
                            </div>
                        ))}
                    </div>
                </main>

                {/* Bottom Nav Skeleton */}
                <nav className="h-16 w-full bg-white border-t border-slate-100 flex items-center justify-around px-2 sm:px-6 z-10 sticky bottom-0">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex flex-col items-center gap-1">
                            <div className="h-6 w-6 rounded-md bg-slate-200 animate-pulse" />
                            <div className="h-1.5 w-8 rounded-full bg-slate-200 animate-pulse" />
                        </div>
                    ))}
                </nav>
            </div>
        );
    }

    return <>{children}</>;
}
