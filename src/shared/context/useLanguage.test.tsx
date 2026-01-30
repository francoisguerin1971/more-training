import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { LanguageProvider, useLanguage } from '@/shared/context/LanguageContext';

// Mock translations
vi.mock('@/core/services/translations', () => ({
    translations: {
        en: {
            hello: 'Hello',
            greeting: 'Hello, {name}!',
            welcome: 'Welcome'
        },
        fr: {
            hello: 'Bonjour',
            greeting: 'Bonjour, {name}!',
            welcome: 'Bienvenue'
        },
        es: {
            hello: 'Hola',
            greeting: 'Hola, {name}!',
            welcome: 'Bienvenido'
        }
    }
}));

// Create wrapper for context
const wrapper = ({ children }: { children: React.ReactNode }) => (
    <LanguageProvider>{children}</LanguageProvider>
);

describe('useLanguage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    describe('initialization', () => {
        it('should initialize with default language (en) when no localStorage value', () => {
            vi.mocked(localStorage.getItem).mockReturnValue(null);

            const { result } = renderHook(() => useLanguage(), { wrapper });

            expect(result.current.language).toBe('en');
        });

        it('should initialize with language from localStorage', () => {
            vi.mocked(localStorage.getItem).mockReturnValue('fr');

            const { result } = renderHook(() => useLanguage(), { wrapper });

            expect(result.current.language).toBe('fr');
        });
    });

    describe('setLanguage', () => {
        it('should change language and persist to localStorage', () => {
            const { result } = renderHook(() => useLanguage(), { wrapper });

            act(() => {
                result.current.setLanguage('es');
            });

            expect(result.current.language).toBe('es');
            expect(localStorage.setItem).toHaveBeenCalledWith('language', 'es');
        });
    });

    describe('t() translation function', () => {
        it('should return translated text for valid key', () => {
            vi.mocked(localStorage.getItem).mockReturnValue('en');

            const { result } = renderHook(() => useLanguage(), { wrapper });

            expect(result.current.t('hello')).toBe('Hello');
        });

        it('should return key if translation not found', () => {
            const { result } = renderHook(() => useLanguage(), { wrapper });

            expect(result.current.t('unknown_key')).toBe('unknown_key');
        });

        it('should interpolate parameters in translation', () => {
            vi.mocked(localStorage.getItem).mockReturnValue('en');

            const { result } = renderHook(() => useLanguage(), { wrapper });

            expect(result.current.t('greeting', { name: 'John' })).toBe('Hello, John!');
        });

        it('should use correct language translations after language change', () => {
            vi.mocked(localStorage.getItem).mockReturnValue('en');

            const { result } = renderHook(() => useLanguage(), { wrapper });

            expect(result.current.t('welcome')).toBe('Welcome');

            act(() => {
                result.current.setLanguage('fr');
            });

            expect(result.current.t('welcome')).toBe('Bienvenue');
        });
    });

    describe('error handling', () => {
        it('should throw error when used outside LanguageProvider', () => {
            // Suppress console.error for this test
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

            expect(() => {
                renderHook(() => useLanguage());
            }).toThrow('useLanguage must be used within LanguageProvider');

            consoleSpy.mockRestore();
        });
    });
});
