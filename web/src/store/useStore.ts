import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@supabase/supabase-js';
import { Item, Household, Profile, Category, HouseholdProduct, List, PendingAction } from '../types';
import { LoyaltyCard } from '@/types';

interface AppState {
    user: User | null;
    profile: Profile | null;
    household: Household | null;
    members: Profile[];
    items: Item[];
    categories: Category[];
    catalog: HouseholdProduct[];
    lists: List[];
    currentList: List | null;
    loyaltyCards: LoyaltyCard[];
    activeView: 'shopping-list' | 'pantry';
    isLoading: boolean;
    hapticFeedback: boolean;
    autoAddRecurring: boolean;
    themeColor: 'emerald' | 'blue' | 'violet' | 'rose' | 'orange';
    connectionStatus: 'connected' | 'disconnected' | 'connecting';
    pendingActions: PendingAction[];
    setUser: (user: User | null) => void;
    setProfile: (profile: Profile | null) => void;
    setHousehold: (household: Household | null) => void;
    setMembers: (members: Profile[]) => void;
    setItems: (items: Item[]) => void;
    setCategories: (categories: Category[]) => void;
    setCatalog: (catalog: HouseholdProduct[]) => void;
    setLists: (lists: List[]) => void;
    setCurrentList: (list: List | null) => void;
    setLoyaltyCards: (cards: LoyaltyCard[]) => void;
    setActiveView: (view: 'shopping-list' | 'pantry') => void;
    setIsLoading: (isLoading: boolean) => void;
    setHapticFeedback: (enabled: boolean) => void;
    setAutoAddRecurring: (enabled: boolean) => void;
    setThemeColor: (color: 'emerald' | 'blue' | 'violet' | 'rose' | 'orange') => void;
    setConnectionStatus: (status: 'connected' | 'disconnected' | 'connecting') => void;
    queueAction: (action: PendingAction) => void;
    removeAction: (actionId: string) => void;
    addItem: (item: Item) => void;
    updateItem: (itemId: string, updates: Partial<Item>) => void;
    removeItem: (itemId: string) => void;
    addLoyaltyCard: (card: LoyaltyCard) => void;
    removeLoyaltyCard: (cardId: string) => void;
    reset: () => void;
}

export const useStore = create<AppState>()(
    persist(
        (set) => ({
            user: null,
            profile: null,
            household: null,
            members: [],
            items: [],
            categories: [],
            catalog: [],
            lists: [],
            currentList: null,
            loyaltyCards: [],
            activeView: 'shopping-list',
            isLoading: true,
            hapticFeedback: true,
            autoAddRecurring: false,
            themeColor: 'emerald',
            connectionStatus: 'disconnected',
            pendingActions: [],
            setUser: (user) => set({ user }),
            setProfile: (profile) => set({ profile }),
            setHousehold: (household) => set({ household }),
            setMembers: (members) => set({ members }),
            setItems: (items) => set({ items }),
            setCategories: (categories) => set({ categories }),
            setCatalog: (catalog) => set({ catalog }),
            setLists: (lists) => set({ lists }),
            setCurrentList: (currentList) => set({ currentList }),
            setLoyaltyCards: (loyaltyCards) => set({ loyaltyCards }),
            setActiveView: (activeView) => set({ activeView }),
            setIsLoading: (isLoading) => set({ isLoading }),
            setHapticFeedback: (hapticFeedback) => set({ hapticFeedback }),
            setAutoAddRecurring: (autoAddRecurring) => set({ autoAddRecurring }),
            setThemeColor: (themeColor) => set({ themeColor }),
            setConnectionStatus: (status) => set({ connectionStatus: status }),
            queueAction: (action) => set((state) => ({ pendingActions: [...state.pendingActions, action] })),
            removeAction: (id) => set((state) => ({ pendingActions: state.pendingActions.filter(a => a.id !== id) })),
            addItem: (item) => set((state) => {
                const exists = state.items.some(i => i.id === item.id);
                if (exists) return state;
                return { items: [item, ...state.items] };
            }),
            updateItem: (itemId, updates) =>
                set((state) => ({
                    items: state.items.map((i) => (i.id === itemId ? { ...i, ...updates } : i)),
                })),
            removeItem: (itemId) =>
                set((state) => ({ items: state.items.filter((i) => i.id !== itemId) })),
            addLoyaltyCard: (card) => set((state) => ({ loyaltyCards: [card, ...state.loyaltyCards] })),
            removeLoyaltyCard: (cardId) =>
                set((state) => ({ loyaltyCards: state.loyaltyCards.filter((c) => c.id !== cardId) })),
            reset: () => set({
                user: null, profile: null, household: null, members: [], items: [], categories: [], catalog: [], lists: [], currentList: null, loyaltyCards: [], activeView: 'shopping-list', isLoading: false, hapticFeedback: true, pendingActions: []
            }),
        }),
        {
            name: 'shopmate-storage',
            partialize: (state) => ({
                household: state.household,
                items: state.items,
                profile: state.profile,
                activeView: state.activeView,
                members: state.members,
                categories: state.categories,
                catalog: state.catalog,
                lists: state.lists,
                currentList: state.currentList,
                hapticFeedback: state.hapticFeedback,
                autoAddRecurring: state.autoAddRecurring,
                themeColor: state.themeColor,
                pendingActions: state.pendingActions,
            }),
        }
    )
);
