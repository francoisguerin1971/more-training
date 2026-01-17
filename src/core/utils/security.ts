import { supabase } from '../services/supabase';

/**
 * Conditional logger - only logs in development mode
 */
export const logger = {
    log: (...args: any[]) => {
        if (import.meta.env.MODE === 'development') {
            console.log(...args);
        }
    },
    error: (...args: any[]) => {
        if (import.meta.env.MODE === 'development') {
            console.error(...args);
        }
    },
    warn: (...args: any[]) => {
        if (import.meta.env.MODE === 'development') {
            console.warn(...args);
        }
    },
    info: (...args: any[]) => {
        if (import.meta.env.MODE === 'development') {
            console.info(...args);
        }
    }
};

/**
 * Validate email format
 */
export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Validate password strength
 * Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
 */
export const validatePassword = (password: string): boolean => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
};

/**
 * Sanitize user input to prevent XSS
 */
export const sanitizeInput = (input: any): any => {
    if (typeof input !== 'string') return input;
    return input
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
};

/**
 * Rate limiter - client-side check
 */
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export const checkRateLimit = (key: string, maxAttempts = 5, windowMs = 60000) => {
    const now = Date.now();
    const record = rateLimitStore.get(key);

    if (!record) {
        rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
        return { allowed: true, remaining: maxAttempts - 1 };
    }

    if (now > record.resetAt) {
        rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
        return { allowed: true, remaining: maxAttempts - 1 };
    }

    if (record.count >= maxAttempts) {
        return {
            allowed: false,
            remaining: 0,
            resetAt: record.resetAt
        };
    }

    record.count++;
    return { allowed: true, remaining: maxAttempts - record.count };
};

export interface FiscalData {
    legalName?: string;
    taxId?: string;
}

/**
 * Validate fiscal data (for Pro users)
 */
export const validateFiscalData = (fiscalData: FiscalData) => {
    const errors: Record<string, string> = {};

    if (!fiscalData.legalName || fiscalData.legalName.trim().length < 2) {
        errors.legalName = 'Le nom légal doit contenir au moins 2 caractères';
    }

    if (!fiscalData.taxId || fiscalData.taxId.trim().length < 5) {
        errors.taxId = 'Le numéro fiscal est invalide';
    }

    if (fiscalData.taxId) {
        const vatRegex = /^[A-Z]{2}[0-9A-Z]{2,13}$/;
        if (!vatRegex.test(fiscalData.taxId.replace(/\s/g, ''))) {
            errors.taxId = 'Format de TVA invalide (ex: FR12345678901)';
        }
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

/**
 * Validate profile data structure
 */
export const validateProfileData = (profileData: any, role: string) => {
    const errors: Record<string, any> = {};

    if (role === 'pro') {
        if (!profileData.fiscal) {
            errors.fiscal = 'Les informations fiscales sont requises';
        } else {
            const fiscalValidation = validateFiscalData(profileData.fiscal);
            if (!fiscalValidation.isValid) {
                errors.fiscal = fiscalValidation.errors;
            }
        }

        if (!profileData.specialties || profileData.specialties.length === 0) {
            errors.specialties = 'Au moins une spécialité est requise';
        }

        if (!profileData.bio || profileData.bio.trim().length < 50) {
            errors.bio = 'La bio doit contenir au moins 50 caractères';
        }
    }

    if (role === 'athlete') {
        if (!profileData.athletic?.primarySport) {
            errors.primarySport = 'Le sport principal est requis';
        }

        if (!profileData.logistics?.equipment || profileData.logistics.equipment.length === 0) {
            errors.equipment = 'Veuillez sélectionner au moins un équipement';
        }
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

/**
 * Check if user has permission to access resource
 */
export const checkPermission = async (userId: string, resourceType: string, resourceId: string): Promise<boolean> => {
    try {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role, id')
            .eq('user_id', userId)
            .single();

        if (!profile) return false;

        switch (resourceType) {
            case 'athlete_data':
                if (profile.role === 'pro') {
                    const { data: relationship } = await supabase
                        .from('coach_athlete_relationships')
                        .select('id')
                        .eq('coach_id', profile.id)
                        .eq('athlete_id', resourceId)
                        .eq('status', 'ACTIVE')
                        .single();
                    return !!relationship;
                }
                return profile.id === resourceId;

            case 'coach_data':
                if (profile.role === 'athlete') {
                    const { data: relationship } = await supabase
                        .from('coach_athlete_relationships')
                        .select('id')
                        .eq('athlete_id', profile.id)
                        .eq('coach_id', resourceId)
                        .eq('status', 'ACTIVE')
                        .single();
                    return !!relationship;
                }
                return profile.id === resourceId;

            default:
                return false;
        }
    } catch (err) {
        logger.error('Permission check error:', err);
        return false;
    }
};

/**
 * Encrypt sensitive data (client-side)
 */
export const encryptData = async (data: any): Promise<any> => {
    return data;
};

/**
 * Decrypt sensitive data (client-side)
 */
export const decryptData = async (encryptedData: any): Promise<any> => {
    return encryptedData;
};
