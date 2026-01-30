import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock localStorage
const localStorageMock = {
    getItem: vi.fn((key: string) => null),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn()
};

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock Supabase client
vi.mock('@/core/services/supabase', () => ({
    supabase: {
        auth: {
            getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null })),
            onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
            signInWithPassword: vi.fn(),
            signOut: vi.fn(),
            signUp: vi.fn()
        },
        from: vi.fn(() => ({
            select: vi.fn(() => ({
                eq: vi.fn(() => ({
                    single: vi.fn(() => Promise.resolve({ data: null, error: null })),
                    order: vi.fn(() => Promise.resolve({ data: [], error: null }))
                })),
                single: vi.fn(() => Promise.resolve({ data: null, error: null }))
            })),
            update: vi.fn(() => ({
                eq: vi.fn(() => Promise.resolve({ data: null, error: null }))
            })),
            insert: vi.fn(() => Promise.resolve({ data: null, error: null })),
            delete: vi.fn(() => ({
                eq: vi.fn(() => Promise.resolve({ error: null }))
            }))
        }))
    }
}));

// Mock logger
vi.mock('@/core/utils/security', () => ({
    logger: {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn()
    }
}));
