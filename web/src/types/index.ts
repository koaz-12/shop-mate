export type Profile = {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    updated_at: string;
};

export type Household = {
    id: string;
    name: string;
    invite_code: string;
    created_at: string;
    budget?: number;
    currency?: string;
};

export interface LoyaltyCard {
    id: string;
    name: string;
    code: string;
    color?: string;
    household_id: string;
    created_at?: string;
}

export type HouseholdMember = {
    id: string;
    user_id: string;
    household_id: string;
    role: 'member' | 'admin';
    joined_at: string;
};

export type List = {
    id: string;
    name: string;
    icon: string | null;
    household_id: string;
    created_at: string;
};

export type Item = {
    id: string;
    name: string;
    is_completed: boolean; // Deprecated, kept for types safety until full removal
    in_pantry: boolean;
    quantity: string | null;
    price?: number | null;
    category: string;
    created_by: string | null;
    household_id: string;
    list_id?: string | null;
    created_at: string;
    deleted_at?: string | null;
};

export type Category = {
    id: string;
    name: string;
    icon: string | null;
    keywords: string[];
    household_id: string | null;
    is_system: boolean;
    barcode?: string | null;
};

export interface PendingAction {
    id: string; // unique process id
    type: 'ADD_ITEM' | 'UPDATE_ITEM' | 'DELETE_ITEM' | 'TOGGLE_ITEM';
    payload: any;
    timestamp: number;
    retryCount: number;
}

export type Database = {
    public: {
        Tables: {
            profiles: {
                Row: Profile;
                Insert: Partial<Profile> & { id: string };
                Update: Partial<Profile>;
                Relationships: [];
            };
            households: {
                Row: Household;
                Insert: Omit<Household, 'id' | 'created_at'>;
                Update: Partial<Household>;
                Relationships: [];
            };
            household_members: {
                Row: HouseholdMember;
                Insert: Omit<HouseholdMember, 'id' | 'joined_at'>;
                Update: Partial<HouseholdMember>;
                Relationships: [];
            };
            items: {
                Row: Item;
                Insert: Omit<Item, 'id' | 'created_at'> & { is_completed?: boolean, in_pantry?: boolean, quantity?: string | null, category?: string };
                Update: Partial<Item>;
                Relationships: [];
            };
            categories: {
                Row: Category;
                Insert: Omit<Category, 'id' | 'is_system'>;
                Update: Partial<Category>;
                Relationships: [];
            };
            lists: {
                Row: List;
                Insert: Omit<List, 'id' | 'created_at'>;
                Update: Partial<List>;
                Relationships: [];
            };
            household_products: {
                Row: HouseholdProduct;
                Insert: Omit<HouseholdProduct, 'id' | 'created_at'>; // created_at logic handling in DB
                Update: Partial<HouseholdProduct>;
                Relationships: [];
            };
        };
    };
};

export interface HouseholdProduct {
    id: string;
    household_id: string;
    name: string;
    last_price: number | null;
    category_name: string | null;
    last_bought_at: string | null;
    times_bought: number;
    recurrence_interval?: number | null;
    next_occurrence?: string | null;
}
