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
}

export interface CoachStats {
    totalAthletes: number;
    activeAthletes: number;
    weeklyCompliance: number;
    pendingReviews: number;
    revenue: number;
}
