import { UserProfile, Workout as SharedWorkout, Exercise as SharedExercise, Plan as SharedPlan, PersonalEvent as SharedPersonalEvent } from '@/shared/types';

export type Exercise = SharedExercise;
export type Workout = SharedWorkout;
export type Plan = SharedPlan;
export type PersonalEvent = SharedPersonalEvent;

export interface PlanData {
    chartData: any[];
    sessions: any[]; // intermediate session type before saving
    meta: any;
    coachStyle?: string;
    reportType?: string;
    status?: string;
}

export interface TrainingContextValue {
    workouts: Workout[];
    plans: Plan[];
    loading: boolean;
    error: Error | null;

    // Actions
    fetchWorkouts: (athleteId: string) => Promise<void>;
    addWorkout: (workout: Omit<Workout, 'id' | 'created_at' | 'updated_at'>) => Promise<Workout>;
    updateWorkout: (id: string, updates: Partial<Workout>) => Promise<void>;
    deleteWorkout: (id: string) => Promise<void>;
    acceptWorkout: (id: string) => Promise<void>;
    respondToWorkout: (id: string, response: 'accept' | 'refuse') => Promise<void>;

    // Personal Events
    personalEvents: PersonalEvent[];
    addPersonalEvent: (event: Omit<PersonalEvent, 'id'>) => Promise<void>;
    updatePersonalEvent: (id: string, updates: Partial<PersonalEvent>) => Promise<void>;
    deletePersonalEvent: (id: string) => Promise<void>;
    respondToPersonalEvent: (id: string, response: 'accept' | 'refuse') => Promise<void>;

    // Plan Actions
    savePlan: (coachId: string, athleteIds: string[], planData: PlanData) => Promise<void>;
    deletePlan: (planId: string) => Promise<void>;

    // Helpers
    getWorkoutsByDate: (date: Date) => Workout[];
    getUpcomingWorkouts: (limit?: number) => Workout[];
}
