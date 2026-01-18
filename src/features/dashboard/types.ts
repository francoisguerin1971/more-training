import { UserProfile } from '@/features/auth/types';

export interface TechnicalAssessmentData {
    formStatus: string;
    fatigue: number;
    motivation: number;
    focus: string;
}

export interface AthleteWithStats extends UserProfile {
    compliance?: number;
    lastWorkout?: string;
    nextWorkout?: string;
    formStatus?: string;
    // CRM Fields
    billingStatus?: 'paid' | 'pending' | 'overdue';
    planType?: 'AI_ELITE' | 'MANUAL_PRO' | 'HYBRID';
    healthStatus?: 'ok' | 'injured' | 'tired';
    fitScore?: number;
    ltv?: number;
    // New Fields for Enhanced CRM
    nextRaceDate?: string;
    nextRaceName?: string;
    plannedLoad?: number[];
    actualLoad?: number[];

    rpeLoad?: number[];
    // Invite Status
    auth_status?: 'active' | 'invited' | 'archived';
}

export interface CoachStats {
    totalAthletes: number;
    activeAthletes: number;
    weeklyCompliance: number;
    pendingReviews: number;
    revenue: number;
}
