import { create } from 'zustand';
import { supabase } from '@/core/services/supabase';
import { logger } from '@/core/utils/security';
import { UserProfile } from '@/features/auth/types';

export interface CoachOffering {
    id: string;
    coach_id: string;
    name: string;
    description?: string;
    price_cents: number;
    billing_interval: 'MONTH' | 'YEAR' | 'WEEK' | 'SESSION';
    type: 'PACKAGE' | 'HOURLY';
    features: string[];
    is_active: boolean;
    is_recommended: boolean;
    created_at: string;
}

export interface CoachProfile extends UserProfile {
    offerings?: CoachOffering[];
    // Extended fields that might be in profile_data
    bio?: string;
    specialties?: string[];
    years_experience?: string;
    gallery_urls?: string[];
    video_url?: string;
    rating?: number;
    tags?: string[];
}

interface MarketplaceState {
    coaches: CoachProfile[];
    loading: boolean;
    error: string | null;
    fetchCoaches: () => Promise<void>;
}

export const useMarketplaceStore = create<MarketplaceState>((set, get) => ({
    coaches: [],
    loading: false,
    error: null,

    fetchCoaches: async () => {
        set({ loading: true, error: null });
        try {
            // Fetch active pros
            // We optimize by fetching offerings in the same query if relationship exists
            // Otherwise we might need to fetch separately. 
            // Let's try simple join first.
            // Note: 'coach_offerings' might refer to foreign key.
            const { data: profiles, error: profileError } = await supabase
                .from('profiles')
                .select(`
                    *,
                    coach_offerings (*)
                `)
                .eq('role', 'pro')
                .eq('status', 'active');

            if (profileError) throw profileError;

            // Transform data to match CoachProfile structure
            const formattedCoaches: CoachProfile[] = (profiles || []).map((p: any) => {
                const metadata = p.profile_data || {};

                return {
                    ...p,
                    offerings: p.coach_offerings || [],
                    bio: metadata.bio || '',
                    specialties: metadata.specialties || [],
                    years_experience: metadata.years_experience || '1+',
                    gallery_urls: metadata.gallery_urls || [],
                    video_url: metadata.video_url || '',
                    rating: metadata.rating || 5.0,
                    tags: metadata.tags || []
                };
            });

            // If no coaches found and we are in dev/demo mode, inject mocks?
            // User requested 'Connect Real Data', so we should rely on real data mostly.
            // But if table is empty, he won't see anything. 
            // We will respect real data.

            set({ coaches: formattedCoaches, loading: false });
        } catch (err: any) {
            logger.error('Marketplace fetch error:', err);
            set({ error: err.message, loading: false });
        }
    }
}));
