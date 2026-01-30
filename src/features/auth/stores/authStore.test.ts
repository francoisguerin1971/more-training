import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act } from '@testing-library/react';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { supabase } from '@/core/services/supabase';

describe('useAuthStore', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Reset Zustand store state
        useAuthStore.setState({
            currentUser: null,
            loading: true,
            initialized: false,
            showInviteModal: false,
            isDualRole: false
        });
    });

    describe('initial state', () => {
        it('should have correct initial state', () => {
            const state = useAuthStore.getState();

            expect(state.currentUser).toBeNull();
            expect(state.loading).toBe(true);
            expect(state.initialized).toBe(false);
            expect(state.showInviteModal).toBe(false);
            expect(state.isDualRole).toBe(false);
        });
    });

    describe('init', () => {
        it('should set initialized to true after init', async () => {
            vi.mocked(supabase.auth.getSession).mockResolvedValue({
                data: { session: null },
                error: null
            });

            await act(async () => {
                await useAuthStore.getState().init();
            });

            const state = useAuthStore.getState();
            expect(state.initialized).toBe(true);
            expect(state.loading).toBe(false);
        });

        it('should fetch profile if session exists', async () => {
            const mockSession = {
                user: { id: 'user-123', email: 'test@example.com' }
            };

            vi.mocked(supabase.auth.getSession).mockResolvedValue({
                data: { session: mockSession },
                error: null
            });

            vi.mocked(supabase.from).mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        single: vi.fn().mockResolvedValue({
                            data: {
                                id: 1,
                                user_id: 'user-123',
                                email: 'test@example.com',
                                role: 'athlete',
                                full_name: 'Test User'
                            },
                            error: null
                        })
                    })
                })
            } as any);

            await act(async () => {
                await useAuthStore.getState().init();
            });

            const state = useAuthStore.getState();
            expect(state.initialized).toBe(true);
            expect(supabase.from).toHaveBeenCalledWith('profiles');
        });
    });

    describe('login', () => {
        it('should return true on successful login', async () => {
            vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
                data: {
                    user: { id: 'user-123', email: 'test@example.com' },
                    session: { access_token: 'token' }
                },
                error: null
            } as any);

            vi.mocked(supabase.from).mockReturnValue({
                select: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        single: vi.fn().mockResolvedValue({
                            data: { id: 1, role: 'athlete' },
                            error: null
                        })
                    })
                })
            } as any);

            let result: boolean;
            await act(async () => {
                result = await useAuthStore.getState().login('test@example.com', 'password123');
            });

            expect(result!).toBe(true);
            expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
                email: 'test@example.com',
                password: 'password123'
            });
        });

        it('should return false on login failure', async () => {
            vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
                data: { user: null, session: null },
                error: { message: 'Invalid credentials' }
            } as any);

            let result: boolean;
            await act(async () => {
                result = await useAuthStore.getState().login('test@example.com', 'wrong');
            });

            expect(result!).toBe(false);
        });
    });

    describe('logout', () => {
        it('should clear currentUser on logout', async () => {
            // Set initial state with user
            useAuthStore.setState({
                currentUser: { id: 1, email: 'test@example.com' } as any
            });

            vi.mocked(supabase.auth.signOut).mockResolvedValue({ error: null });

            await act(async () => {
                await useAuthStore.getState().logout();
            });

            const state = useAuthStore.getState();
            expect(state.currentUser).toBeNull();
            expect(supabase.auth.signOut).toHaveBeenCalled();
        });
    });

    describe('setShowInviteModal', () => {
        it('should update showInviteModal state', () => {
            expect(useAuthStore.getState().showInviteModal).toBe(false);

            act(() => {
                useAuthStore.getState().setShowInviteModal(true);
            });

            expect(useAuthStore.getState().showInviteModal).toBe(true);

            act(() => {
                useAuthStore.getState().setShowInviteModal(false);
            });

            expect(useAuthStore.getState().showInviteModal).toBe(false);
        });
    });

    describe('updateProfile', () => {
        it('should update profile and return data', async () => {
            useAuthStore.setState({
                currentUser: {
                    id: 1,
                    user_id: 'user-123',
                    email: 'test@example.com',
                    full_name: 'Old Name'
                } as any
            });

            vi.mocked(supabase.from).mockReturnValue({
                update: vi.fn().mockReturnValue({
                    eq: vi.fn().mockReturnValue({
                        select: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({
                                data: { id: 1, full_name: 'New Name' },
                                error: null
                            })
                        })
                    })
                })
            } as any);

            let result: any;
            await act(async () => {
                result = await useAuthStore.getState().updateProfile({ full_name: 'New Name' });
            });

            expect(result.error).toBeNull();
            expect(supabase.from).toHaveBeenCalledWith('profiles');
        });
    });
});
