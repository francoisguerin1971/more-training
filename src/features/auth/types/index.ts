export type UserRole = 'pro' | 'athlete';

export interface UserProfile {
    id: string;
    email: string;
    role: UserRole;
    pseudo?: string;
    first_name?: string;
    last_name?: string;
    full_name?: string;
    name?: string; // Added for backward compatibility/display logic
    avatar?: string;
    avatar_url?: string;
    status: 'active' | 'inactive' | 'pending';
    onboarded?: boolean;
    profile_data?: any;
    created_at: string;
    updated_at: string;
}

export interface AuthState {
    currentUser: UserProfile | null;
    loading: boolean;
    initialized: boolean;
}
