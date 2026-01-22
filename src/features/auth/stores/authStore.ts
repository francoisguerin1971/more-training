import { create } from 'zustand';
import { supabase } from '@/core/services/supabase';
import { logger } from '@/core/utils/security';
import { AuthState, UserProfile } from '../types';

interface AuthActions {
    init: () => Promise<void>;
    fetchProfile: (userId: string) => Promise<void>;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
    register: (email: string, password: string, metadata?: any) => Promise<{ data: any; error: any }>;
    updateProfile: (updates: Partial<UserProfile>) => Promise<{ data: any; error: any }>;
    getAthletesForCoach: (coachId: string) => Promise<any[]>;
    getCoachesForAthlete: (athleteId: string) => Promise<any[]>;
    inviteAthlete: (invite: { email: string; first_name?: string; last_name?: string; sport?: string; role?: string; suggestedPlan?: string }) => Promise<{ data: any; error: any }>;
    deleteAccount: () => Promise<void>;
    uploadAvatar: (file: File) => Promise<{ path: string; error: any }>;
    setShowInviteModal: (show: boolean) => void;
    // MFA Actions
    enrollMFA: () => Promise<{ data: any; error: any }>;
    verifyMFA: (factorId: string, challengeId: string, code: string) => Promise<{ data: any; error: any }>;
    unenrollMFA: (factorId: string) => Promise<{ data: any; error: any }>;
    listMFAFactors: () => Promise<{ data: any; error: any }>;
    challengeMFA: (factorId: string) => Promise<{ data: any; error: any }>;
    getInvitation: (inviteId: string) => Promise<{ data: any; error: any }>;
    getCoachOfferings: (coachId: string) => Promise<any[]>;
    saveCoachOffering: (offering: any) => Promise<{ data: any; error: any }>;
    deleteCoachOffering: (offeringId: string) => Promise<{ error: any }>;
    getCoachResources: (coachId: string) => Promise<any[]>;
    getSharedResources: () => Promise<any[]>;
    saveCoachResource: (resource: any) => Promise<{ data: any; error: any }>;
    deleteCoachResource: (resourceId: string) => Promise<{ error: any }>;
}

export type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>((set, get) => ({
    currentUser: null,
    loading: true,
    initialized: false,
    showInviteModal: false,
    isDualRole: false,

    init: async () => {
        if (get().initialized) return;
        set({ initialized: true }); // Set synchronously to prevent race condition

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                await get().fetchProfile(session.user.id);
            } else {
                set({ loading: false });
            }
        } catch (err) {
            logger.error("Supabase Session error:", err);
            set({ loading: false });
        }

        supabase.auth.onAuthStateChange(async (_event: any, session: any) => {
            try {
                if (session) {
                    await get().fetchProfile(session.user.id);
                } else {
                    set({ currentUser: null, loading: false });
                }
            } catch (err) {
                logger.error("Auth State change error:", err);
                set({ loading: false });
            }
        });
    },

    fetchProfile: async (userId: string) => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (data) {
            set({ currentUser: data as UserProfile });
        }
        set({ loading: false });
    },

    login: async (email: string, password: string) => {
        set({ loading: true });
        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) {
                logger.error('Login error:', error.message);
                set({ loading: false });
                return false;
            }
            return true;
        } catch (err: any) {
            logger.error('Login exception:', err);
            set({ loading: false });
            return false;
        }
    },

    logout: async () => {
        await supabase.auth.signOut();
        set({ currentUser: null, isDualRole: false });
    },

    register: async (email: string, password: string, metadata: any = {}) => {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: metadata?.full_name || '',
                        role: metadata?.role || 'athlete'
                    }
                }
            });

            if (error) {
                logger.error('Registration error:', error.message);
            }

            return { data, error };
        } catch (err: any) {
            logger.error('Registration exception:', err);
            return { data: null, error: err };
        }
    },

    updateProfile: async (updates: Partial<UserProfile>): Promise<{ data: any; error: any }> => {
        const { currentUser } = get();
        if (!currentUser) return { error: 'No user', data: null };

        try {
            const { data, error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', currentUser.id)
                .select()
                .single();

            if (error) return { data: null, error };
            if (data) set({ currentUser: data as UserProfile });
            return { data, error: null };
        } catch (err: any) {
            return { data: null, error: err };
        }
    },

    getAthletesForCoach: async (coachId: string): Promise<any[]> => {
        try {
            const { data, error } = await supabase
                .from('coach_athlete_relationships')
                .select(`
                    id, status, subscription_plan,
                    athlete:athlete_id (id, full_name, first_name, last_name, pseudo, email, profile_data)
                `)
                .eq('coach_id', coachId)
                .in('status', ['ACTIVE', 'PENDING']);

            if (error) return [];
            return (data as any[])?.map(rel => {
                const athlete = rel.athlete;
                return {
                    id: athlete.id,
                    name: athlete.first_name && athlete.last_name ? `${athlete.first_name} ${athlete.last_name}` : (athlete.full_name || athlete.pseudo || 'Athlete'),
                    email: athlete.email,
                    avatar: (athlete.first_name?.[0] || athlete.full_name?.[0] || 'A'),
                    profile: athlete.profile_data || {},
                    relationshipStatus: rel.status,
                    plan: rel.subscription_plan
                };
            }) || [];
        } catch (err: any) {
            return [];
        }
    },

    getCoachesForAthlete: async (athleteId: string): Promise<any[]> => {
        try {
            const { data, error } = await supabase
                .from('coach_athlete_relationships')
                .select(`
                    id, status, subscription_plan,
                    coach:coach_id (id, full_name, first_name, last_name, pseudo, email, profile_data)
                `)
                .eq('athlete_id', athleteId)
                .in('status', ['ACTIVE', 'PENDING']);

            if (error) return [];
            return (data as any[])?.map(rel => ({
                id: rel.coach.id,
                name: rel.coach.first_name && rel.coach.last_name ? `${rel.coach.first_name} ${rel.coach.last_name}` : (rel.coach.full_name || rel.coach.pseudo || 'Coach'),
                avatar: (rel.coach.first_name?.[0] || rel.coach.full_name?.[0] || 'C'),
                specialty: rel.coach.profile_data?.specialties?.[0] || 'Coach',
                relationshipStatus: rel.status,
                plan: rel.subscription_plan,
                booking_settings: { modes: ['video'], duration: 45, buffer: 15, maxMonths: 3 }
            })) || [];
        } catch (err: any) {
            return [];
        }
    },

    inviteAthlete: async (invite) => {
        const { currentUser } = get();
        if (!currentUser) return { data: null, error: 'No user' };

        try {
            // Sanitize inputs to prevent XSS
            const sanitize = (s?: string) => s?.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

            const { data, error } = await supabase
                .from('invitations')
                .insert([{
                    coach_id: currentUser.id,
                    email: invite.email?.toLowerCase().trim(),
                    first_name: sanitize(invite.first_name),
                    last_name: sanitize(invite.last_name),
                    sport: sanitize(invite.sport),
                    role: invite.role === 'coach' ? 'coach' : 'athlete', // Whitelist roles
                    suggested_plan: invite.suggestedPlan
                }])
                .select().single();
            if (error) logger.error('inviteAthlete error:', error);
            return { data, error };
        } catch (err: any) {
            logger.error('inviteAthlete exception:', err);
            return { data: null, error: err };
        }
    },

    deleteAccount: async () => {
        const { currentUser } = get();
        if (!currentUser) {
            logger.error('deleteAccount: No authenticated user');
            return;
        }

        try {
            // Soft delete via profile update - admin API not available client-side
            const { error } = await supabase
                .from('profiles')
                .update({ status: 'deleted', deleted_at: new Date().toISOString() })
                .eq('id', currentUser.id);

            if (error) {
                logger.error('deleteAccount: Failed to mark profile as deleted:', error);
            }

            await supabase.auth.signOut();
            set({ currentUser: null });
        } catch (err: any) {
            logger.error('Exception deleting account:', err);
        }
    },

    uploadAvatar: async (file: File) => {
        const { currentUser } = get();
        if (!currentUser) return { path: '', error: 'No user' };

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            return { path: '', error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' };
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            return { path: '', error: 'File too large. Maximum size is 5MB.' };
        }

        try {
            const fileExt = file.type.split('/')[1]; // Use MIME type, not filename
            const filePath = `${currentUser.id}/${Date.now()}.${fileExt}`;
            const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);

            if (uploadError) {
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = async () => {
                        const base64 = reader.result as string;
                        const { error } = await get().updateProfile({ profile_data: { ...currentUser.profile_data, avatar: base64 } });
                        resolve({ path: base64, error });
                    };
                    reader.readAsDataURL(file);
                });
            }

            const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
            await get().updateProfile({ avatar_url: publicUrl, profile_data: { ...currentUser.profile_data, avatar: publicUrl } });
            return { path: publicUrl, error: null };
        } catch (error: any) {
            logger.error('uploadAvatar error:', error);
            return { path: '', error };
        }
    },

    enrollMFA: async () => {
        try {
            const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
            return { data, error };
        } catch (err: any) {
            return { data: null, error: err };
        }
    },

    verifyMFA: async (factorId, challengeId, code) => {
        try {
            const { data, error } = await supabase.auth.mfa.verify({ factorId, challengeId, code });
            return { data, error };
        } catch (err: any) {
            return { data: null, error: err };
        }
    },

    unenrollMFA: async (factorId) => {
        try {
            const { data, error } = await supabase.auth.mfa.unenroll({ factorId });
            return { data, error };
        } catch (err: any) {
            return { data: null, error: err };
        }
    },

    listMFAFactors: async () => {
        try {
            const { data, error } = await supabase.auth.mfa.listFactors();
            return { data, error };
        } catch (err: any) {
            return { data: null, error: err };
        }
    },

    challengeMFA: async (factorId) => {
        try {
            const { data, error } = await supabase.auth.mfa.challenge({ factorId });
            return { data, error };
        } catch (err: any) {
            return { data: null, error: err };
        }
    },

    getInvitation: async (inviteId) => {
        try {
            const { data, error } = await supabase.from('invitations').select('*, coach:coach_id (full_name, first_name, last_name, pseudo)').eq('id', inviteId).single();
            return { data, error };
        } catch (err: any) {
            return { data: null, error: err };
        }
    },

    getCoachOfferings: async (coachId) => {
        try {
            const { data, error } = await supabase.from('coach_offerings').select('*').eq('coach_id', coachId).order('created_at', { ascending: true });
            if (error) logger.error('getCoachOfferings error:', error);
            return data || [];
        } catch (err) {
            logger.error('getCoachOfferings exception:', err);
            return [];
        }
    },

    saveCoachOffering: async (offering) => {
        const { currentUser } = get();
        if (!currentUser || currentUser.role !== 'pro') {
            return { data: null, error: 'Unauthorized: Only coaches can manage offerings' };
        }

        try {
            // Force coach_id to current user to prevent IDOR
            const safeOffering = { ...offering, coach_id: currentUser.id };
            const { data, error } = await supabase.from('coach_offerings').upsert([safeOffering]).select().single();
            if (error) logger.error('saveCoachOffering error:', error);
            return { data, error };
        } catch (err: any) {
            logger.error('saveCoachOffering exception:', err);
            return { data: null, error: err };
        }
    },

    deleteCoachOffering: async (offeringId) => {
        const { currentUser } = get();
        if (!currentUser || currentUser.role !== 'pro') {
            return { error: 'Unauthorized: Only coaches can delete offerings' };
        }

        try {
            // Only delete if owned by current user
            const { error } = await supabase
                .from('coach_offerings')
                .delete()
                .eq('id', offeringId)
                .eq('coach_id', currentUser.id);
            if (error) logger.error('deleteCoachOffering error:', error);
            return { error };
        } catch (err: any) {
            logger.error('deleteCoachOffering exception:', err);
            return { error: err };
        }
    },

    getCoachResources: async (coachId) => {
        try {
            const { data, error } = await supabase.from('coach_resources').select('*').eq('coach_id', coachId).order('created_at', { ascending: false });
            if (error) logger.error('getCoachResources error:', error);
            return data || [];
        } catch (err) {
            logger.error('getCoachResources exception:', err);
            return [];
        }
    },

    getSharedResources: async () => {
        try {
            const { data, error } = await supabase.from('coach_resources').select('*').eq('is_public', true).order('created_at', { ascending: false });
            if (error) logger.error('getSharedResources error:', error);
            return data || [];
        } catch (err) {
            logger.error('getSharedResources exception:', err);
            return [];
        }
    },

    saveCoachResource: async (resource) => {
        const { currentUser } = get();
        if (!currentUser || currentUser.role !== 'pro') {
            return { data: null, error: 'Unauthorized: Only coaches can manage resources' };
        }

        try {
            // Force coach_id to current user to prevent IDOR
            const safeResource = { ...resource, coach_id: currentUser.id };
            const { data, error } = await supabase.from('coach_resources').upsert([safeResource]).select().single();
            if (error) logger.error('saveCoachResource error:', error);
            return { data, error };
        } catch (err: any) {
            logger.error('saveCoachResource exception:', err);
            return { data: null, error: err };
        }
    },

    deleteCoachResource: async (resourceId) => {
        const { currentUser } = get();
        if (!currentUser || currentUser.role !== 'pro') {
            return { error: 'Unauthorized: Only coaches can delete resources' };
        }

        try {
            // Only delete if owned by current user
            const { error } = await supabase
                .from('coach_resources')
                .delete()
                .eq('id', resourceId)
                .eq('coach_id', currentUser.id);
            if (error) logger.error('deleteCoachResource error:', error);
            return { error };
        } catch (err: any) {
            logger.error('deleteCoachResource exception:', err);
            return { error: err };
        }
    },

    setShowInviteModal: (show: boolean) => set({ showInviteModal: show })
}));
