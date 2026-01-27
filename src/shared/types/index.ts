export interface UserProfile {
    id: string;
    email: string;
    role: 'athlete' | 'coach' | 'admin';
    status: 'active' | 'inactive' | 'pending';
    full_name?: string;
    name?: string; // Legacy support
    avatar?: string;
    avatar_url?: string;
    created_at: string;
    updated_at: string;
    profile_data?: {
        vacations?: Array<{ id: string; start: string; end: string; title: string }>;
        [key: string]: any;
    };
}

export interface Exercise {
    id?: string;
    name: string;
    description?: string;
    sets?: number;
    reps?: string | number;
    duration?: string | number;
    weight?: string;
    rpe?: number;
    intensity_target?: string; // e.g., "75% FC max" or "Z3"
    breathing_sensation?: string; // e.g., "Parler aisément"
    rest?: string;
    tempo?: string;
    notes?: string;
    sketch_url?: string;
}

export interface Workout {
    id: string;
    athleteId: string;
    coachId?: string;
    date: string; // ISO string
    title: string;
    description?: string;
    type: 'run' | 'strength' | 'swim' | 'bike' | 'other' | 'ENDURANCE'; // Added ENDURANCE for compatibility
    duration: number; // minutes
    plannedLoad?: number;
    actualLoad?: number;
    rpe?: number;
    status: 'planned' | 'completed' | 'skipped' | 'PENDING_ACCEPTANCE' | 'COMPLETED'; // Added PENDING_ACCEPTANCE and COMPLETED
    color?: string;
    warmup?: {
        duration: string;
        description: string;
        intensity?: string;
    };
    cooldown?: {
        duration: string;
        description: string;
    };
    exercises: Exercise[];
    created_at?: string;
    updated_at?: string;
    intensity_context?: string; // Global context for intensity
    intensity?: string; // Intensity target (e.g. "Zone 2")
    medal?: 'Or' | 'Argent' | 'Bronze';
    breathing_sensation?: string;
    visual?: string; // Visual cue/AI prompt
    details?: {
        warmup?: string;
        main?: string;
        cooldown?: string;
        tech_focus?: string;
    };
    resources?: {
        article?: string;
        video?: string;
    };
    coach_notes?: string;
    icon?: any;
}

export interface Plan {
    id: string;
    name: string;
    description?: string;
    price?: number;
    price_cents?: number;
    currency?: string;
    features?: string[]; // or JSON string
    duration_weeks?: number;
    level?: 'beginner' | 'intermediate' | 'advanced' | 'elite';
    status?: 'active' | 'draft' | 'archived';
    coachId?: string;
    billing_interval?: 'MONTH' | 'ONE_TIME' | 'YEAR';
    interval?: 'MONTH' | 'ONE_TIME' | 'YEAR'; // Alias for compatibility
    meta?: any;
    athleteIds?: string[];
    createdAt?: string; // For compatibility
    created_at?: string;
    updated_at?: string;
}

export interface CalendarEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
    allDay?: boolean;
    resource?: any;
    type: 'workout' | 'appointment' | 'reminder' | 'event';
}

export type PersonalEventType = 'rdv' | 'workout' | 'competition' | 'vacation' | 'other';

export interface PersonalEvent {
    id: string;
    athleteId: string;
    title: string;
    type: PersonalEventType;
    comment?: string;
    start: string; // ISO string
    end: string; // ISO string
    reminderBefore?: number; // minutes
    notificationTypes?: ('email' | 'push')[];
    isAllDay?: boolean;
    status?: 'pending' | 'accepted' | 'refused';
    coachId?: string;
    location?: 'physical' | 'virtual';
    allowWorkouts?: boolean;
    allowCompetitions?: boolean;
    allowRDV?: boolean;
}
