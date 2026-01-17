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
    inviteAthlete: (invite: { email: string; name?: string; sport?: string; suggestedPlan?: string }) => Promise<{ data: any; error: any }>;
    deleteAccount: (userId: string) => Promise<void>;
    uploadAvatar: (file: File) => Promise<{ path: string; error: any }>;
    // MFA Actions
    enrollMFA: () => Promise<{ data: any; error: any }>;
    verifyMFA: (factorId: string, challengeId: string, code: string) => Promise<{ data: any; error: any }>;
    unenrollMFA: (factorId: string) => Promise<{ data: any; error: any }>;
    listMFAFactors: () => Promise<{ data: any; error: any }>;
    challengeMFA: (factorId: string) => Promise<{ data: any; error: any }>;
    getInvitation: (inviteId: string) => Promise<{ data: any; error: any }>;
}

export type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>((set, get) => ({
    currentUser: null,
    loading: true,
    initialized: false,

    init: async () => {
        if (get().initialized) return;

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

        set({ initialized: true });
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
        if (import.meta.env.MODE === 'development' && import.meta.env.VITE_DEMO_MODE === 'true') {
            if (email === 'test@moretraining.com' && password === 'Moov2026!') {
                set({
                    currentUser: {
                        id: 'demo-pro-id',
                        email: 'test@moretraining.com',
                        role: 'pro',
                        status: 'active',
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    },
                    loading: false
                });
                return true;
            }
        }

        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) {
                logger.error('Login error:', error.message);
                return false;
            }
            return true;
        } catch (err: any) {
            logger.error('Login exception:', err);
            return false;
        }
    },

    logout: async () => {
        await supabase.auth.signOut();
        set({ currentUser: null });
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
        console.log('authStore.updateProfile called with:', updates);

        if (!currentUser) {
            console.error('authStore.updateProfile: No currentUser found');
            return { error: 'No user', data: null };
        }

        try {
            // Check if we should use 'user_id' or 'id'
            // Usually 'id' is the serial and 'user_id' is the uuid
            // Profiles table in this app uses 'id' as serial and 'user_id' as uuid
            const targetId = currentUser.id;
            console.log('authStore.updateProfile targeting profile ID:', targetId);

            const { data, error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', targetId)
                .select()
                .single();

            if (error) {
                console.error('authStore.updateProfile database error:', error);
                return { data: null, error };
            }

            console.log('authStore.updateProfile success:', data);
            if (data) set({ currentUser: data as UserProfile });
            return { data, error: null };
        } catch (err: any) {
            console.error('authStore.updateProfile exception:', err);
            return { data: null, error: err };
        }
    },

    getAthletesForCoach: async (coachId: string): Promise<any[]> => {
        try {
            const { data, error } = await supabase
                .from('coach_athlete_relationships')
                .select(`
                    id,
                    status,
                    subscription_plan,
                    athlete:athlete_id (
                        id,
                        full_name,
                        first_name,
                        last_name,
                        pseudo,
                        email,
                        profile_data
                    )
                `)
                .eq('coach_id', coachId)
                .in('status', ['ACTIVE', 'PENDING']);

            if (error) {
                logger.error('Error fetching athletes:', error);
                return [];
            }

            return (data as any[])?.map(rel => {
                const athlete = rel.athlete;
                return {
                    id: athlete.id,
                    first_name: athlete.first_name,
                    last_name: athlete.last_name,
                    pseudo: athlete.pseudo,
                    full_name: athlete.full_name,
                    email: athlete.email,
                    name: athlete.first_name && athlete.last_name
                        ? `${athlete.first_name} ${athlete.last_name}`
                        : (athlete.full_name || athlete.pseudo || 'Athlete'),
                    avatar: (athlete.first_name?.[0] || athlete.full_name?.[0] || 'A'),
                    profile: athlete.profile_data || {},
                    relationshipStatus: rel.status,
                    plan: rel.subscription_plan
                };
            }) || [];
        } catch (err: any) {
            logger.error('Exception fetching athletes:', err);
            return [];
        }
    },

    getCoachesForAthlete: async (athleteId: string): Promise<any[]> => {
        try {
            const { data, error } = await supabase
                .from('coach_athlete_relationships')
                .select(`
                    id,
                    status,
                    subscription_plan,
                    coach:coach_id (
                        id,
                        full_name,
                        first_name,
                        last_name,
                        pseudo,
                        email,
                        profile_data
                    )
                `)
                .eq('athlete_id', athleteId)
                .in('status', ['ACTIVE', 'PENDING']);

            if (error) {
                logger.error('Error fetching coaches:', error);
                return [];
            }

            return (data as any[])?.map(rel => ({
                id: rel.coach.id,
                name: rel.coach.first_name && rel.coach.last_name
                    ? `${rel.coach.first_name} ${rel.coach.last_name}`
                    : (rel.coach.full_name || rel.coach.pseudo || 'Coach'),
                avatar: (rel.coach.first_name?.[0] || rel.coach.full_name?.[0] || 'C'),
                specialty: rel.coach.profile_data?.specialties?.[0] || 'Coach',
                relationshipStatus: rel.status,
                plan: rel.subscription_plan,
                booking_settings: {
                    modes: rel.coach.id === 'demo-pro-id' ? ['video', 'presencial'] : ['video'], // Demo config
                    duration: 45,
                    buffer: 15,
                    maxMonths: 3
                }
            })) || [];
        } catch (err: any) {
            logger.error('Exception fetching coaches:', err);
            return [];
        }
    },
    inviteAthlete: async (invite: { email: string; name?: string; sport?: string; suggestedPlan?: string }): Promise<{ data: any; error: any }> => {
        const { currentUser } = get();
        if (!currentUser) return { data: null, error: 'No user' };

        try {
            const { data, error } = await supabase
                .from('invitations')
                .insert([{
                    coach_id: currentUser.id,
                    email: invite.email,
                    name: invite.name,
                    sport: invite.sport,
                    suggested_plan: invite.suggestedPlan
                }])
                .select()
                .single();

            if (error) {
                logger.error('Error creating invitation:', error);
                return { data: null, error };
            }

            logger.info(`Invited athlete: ${invite.email}`);
            return { data, error: null };
        } catch (err: any) {
            logger.error('Exception inviting athlete:', err);
            return { data: null, error: err };
        }
    },
    deleteAccount: async (userId: string) => {
        try {
            // Check if demo user
            if (userId === 'demo-pro-id') {
                logger.info('Demo account deletion simulated');
                set({ currentUser: null });
                return;
            }

            // Real deletion
            const { error } = await supabase.auth.admin.deleteUser(userId);
            if (error) {
                // If admin call fails (likely due to RLS/Permissions), try rpc or simple signOut + logical delete
                logger.warn('Admin delete failed, trying soft delete logic or ignoring if client-side restriction', error);

                // Fallback: Just sign out for now in this context, or better, mark status as deleted
                await supabase.from('profiles').update({ status: 'deleted' }).eq('id', userId);
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

        try {
            // Upload to 'avatars' bucket
            const fileExt = file.name.split('.').pop();
            const fileName = `${currentUser.id}/${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) {
                // Fallback for mocked environment or missing storage bucket:
                // Use FileReader to create a persistent Data URL
                logger.warn('Supabase storage upload failed, falling back to base64.', uploadError);

                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = async () => {
                        const base64data = reader.result as string;
                        // Update profile safely: try profile_data first as it is schema-less
                        const currentProfile = get().currentUser?.profile_data || {};
                        const { error: updateError } = await get().updateProfile({
                            // Try standard column if exists, but also save to JSONB
                            // avatar: base64data, // Risk of invalid column
                            profile_data: { ...currentProfile, avatar: base64data }
                        });
                        resolve({ path: base64data, error: updateError });
                    };
                    reader.readAsDataURL(file);
                });
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            // Update profile robustly
            const currentProfile = get().currentUser?.profile_data || {};
            await get().updateProfile({
                avatar_url: publicUrl, // Standard Supabase
                profile_data: { ...currentProfile, avatar: publicUrl }
            });

            return { path: publicUrl, error: null };
        } catch (error: any) {
            logger.error('Avatar upload exception:', error);
            return { path: '', error };
        }
    },
    enrollMFA: async () => {
        try {
            const { data, error } = await supabase.auth.mfa.enroll({
                factorType: 'totp'
            });
            if (error) logger.error('MFA enrollment error:', error);
            return { data, error };
        } catch (err: any) {
            return { data: null, error: err };
        }
    },
    verifyMFA: async (factorId: string, challengeId: string, code: string) => {
        try {
            const { data, error } = await supabase.auth.mfa.verify({
                factorId,
                challengeId,
                code
            });
            if (error) logger.error('MFA verification error:', error);
            return { data, error };
        } catch (err: any) {
            return { data: null, error: err };
        }
    },
    unenrollMFA: async (factorId: string) => {
        try {
            const { data, error } = await supabase.auth.mfa.unenroll({
                factorId
            });
            if (error) logger.error('MFA unenrollment error:', error);
            return { data, error };
        } catch (err: any) {
            return { data: null, error: err };
        }
    },
    listMFAFactors: async () => {
        try {
            const { data, error } = await supabase.auth.mfa.listFactors();
            if (error) logger.error('MFA list factors error:', error);
            return { data, error };
        } catch (err: any) {
            return { data: null, error: err };
        }
    },
    challengeMFA: async (factorId: string) => {
        try {
            const { data, error } = await supabase.auth.mfa.challenge({ factorId });
            if (error) logger.error('MFA challenge error:', error);
            return { data, error };
        } catch (err: any) {
            return { data: null, error: err };
        }
    },
    getInvitation: async (inviteId: string) => {
        try {
            const { data, error } = await supabase
                .from('invitations')
                .select(`
                    *,
                    coach:coach_id (
                        full_name,
                        first_name,
                        last_name,
                        pseudo
                    )
                `)
                .eq('id', inviteId)
                .single();

            if (error) {
                logger.error('Error fetching invitation:', error);
                return { data: null, error };
            }

            return { data, error: null };
        } catch (err: any) {
            logger.error('Exception fetching invitation:', err);
            return { data: null, error: err };
        }
    }
}));
