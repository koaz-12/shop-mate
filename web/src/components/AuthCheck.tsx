'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { useStore } from '@/store/useStore';

export default function AuthCheck({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const supabase = createClient();

    // Individual selectors to avoid "getServerSnapshot" infinite loop with object literals
    const setUser = useStore((state) => state.setUser);
    const setProfile = useStore((state) => state.setProfile);
    const setHousehold = useStore((state) => state.setHousehold);
    const setMembers = useStore((state) => state.setMembers);
    const setItems = useStore((state) => state.setItems);
    const setCategories = useStore((state) => state.setCategories);
    const setCatalog = useStore((state) => state.setCatalog);
    const setLists = useStore((state) => state.setLists);
    const setCurrentList = useStore((state) => state.setCurrentList);
    const setLoyaltyCards = useStore((state) => state.setLoyaltyCards);
    const household = useStore((state) => state.household);
    const user = useStore((state) => state.user);

    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();

                if (!session) {
                    if (pathname !== '/login' && pathname !== '/') {
                        router.push('/login');
                    }
                } else {
                    setUser(session.user);

                    // Fetch profile
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', session.user.id)
                        .single();

                    if (profile) setProfile(profile);

                    // Check household
                    const { data: members } = await supabase
                        .from('household_members')
                        .select('household_id, role, households(*)')
                        .eq('user_id', session.user.id)
                        .single();

                    if (members && (members as any).households) {
                        // @ts-ignore
                        const activeHousehold = (members as any).households;
                        setHousehold(activeHousehold);

                        // Fetch detailed profile for all members of this household
                        const { data: householdProfiles } = await supabase
                            .from('household_members')
                            .select('profiles(*)')
                            .eq('household_id', activeHousehold.id);

                        if (householdProfiles) {
                            // Extract profiles from the join result
                            // @ts-ignore
                            const cleanProfiles = householdProfiles.map(p => p.profiles).filter(Boolean);
                            setMembers(cleanProfiles);
                        }

                        // Fetch Categories (System + Household)
                        const { data: categories } = await supabase
                            .from('categories')
                            .select('*')
                            .order('name');

                        if (categories) {
                            setCategories(categories);

                            // Fetch Catalog (Price History)
                            const { data: catalog } = await supabase
                                .from('household_products')
                                .select('*')
                                // @ts-ignore
                                .eq('household_id', activeHousehold.id);

                            if (catalog) setCatalog(catalog);

                            // Fetch Loyalty Cards
                            const { data: cards } = await supabase
                                .from('loyalty_cards')
                                .select('*')
                                // @ts-ignore
                                .eq('household_id', activeHousehold.id);

                            if (cards) setLoyaltyCards(cards);

                            // Fetch Lists
                            const { data: lists } = await supabase
                                .from('lists')
                                .select('*')
                                .order('created_at');

                            if (lists && lists.length > 0) {
                                setLists(lists);
                                // Set initial list if none selected
                                const current = useStore.getState().currentList;
                                if (!current) {
                                    setCurrentList(lists[0]);
                                }
                            }
                        }

                        if (pathname === '/login' || pathname === '/onboarding' || pathname === '/') {
                            router.push('/home');
                        }
                    } else {
                        if (pathname !== '/onboarding' && pathname !== '/login') {
                            router.push('/onboarding');
                        }
                    }
                }
            } finally {
                setIsChecking(false);
            }
        };

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_OUT') {
                setUser(null);
                router.push('/login');
            } else if (session) {
                // If session changes (e.g. sign in), re-check logic 
                // but usually we rely on the initial check or specific redirects.
                // We'll keep it simple.
            }
        });


        const presenceChannel = supabase.channel('online-users');

        presenceChannel
            .on('presence', { event: 'sync' }, () => {
                const state = presenceChannel.presenceState();
                // We will store this in a new global store slice later, 
                // or just broadcast it. For now let's just log it or set it if we had a store.
                // ideally useStore.getState().setOnlineUsers(state);
                console.log('Online users:', state);
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    // Track self
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
    }, [supabase, router, pathname, setUser, setProfile, setHousehold]);

    if (isChecking) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    return <>{children}</>;
}
