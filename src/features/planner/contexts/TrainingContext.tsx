import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { isSameDay, isBefore, startOfToday } from 'date-fns';
import { supabase } from '@/core/services/supabase';
import { logger } from '@/core/utils/security';
import { toast } from 'sonner';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { Workout, TrainingContextValue, Plan, PlanData, PersonalEvent } from '../types/training';

const TrainingContext = createContext<TrainingContextValue | undefined>(undefined);

export function TrainingProvider({ children }: { children: React.ReactNode }) {
    const [workouts, setWorkouts] = useState<Workout[]>([]);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [personalEvents, setPersonalEvents] = useState<PersonalEvent[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);
    const { updateProfile, currentUser } = useAuthStore();

    // Mock initial personal events if needed or just empty
    useEffect(() => {
        const stored = localStorage.getItem('personal_events');
        if (stored) {
            setPersonalEvents(JSON.parse(stored));
        }
    }, []);

    const savePersonalEvents = (events: PersonalEvent[]) => {
        localStorage.setItem('personal_events', JSON.stringify(events));
        setPersonalEvents(events);
    };

    const fetchWorkouts = useCallback(async (athleteId: string) => {
        if (!athleteId) {
            logger.warn('fetchWorkouts called without athleteId');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const { data, error: fetchError } = await supabase
                .from('workouts')
                .select('*')
                .eq('athlete_id', athleteId)
                .order('date', { ascending: true });

            if (fetchError) {
                throw fetchError;
            }

            // Transform snake_case to camelCase
            const transformedWorkouts: Workout[] = (data || []).map((w: any) => ({
                id: w.id,
                athleteId: w.athlete_id,
                coachId: w.coach_id,
                date: w.date,
                title: w.title,
                description: w.description,
                type: w.type,
                duration: w.duration,
                plannedLoad: w.planned_load,
                actualLoad: w.actual_load,
                rpe: w.rpe,
                status: w.status,
                color: w.color,
                exercises: w.exercises || [],
                warmup: w.warmup,
                cooldown: w.cooldown,
                intensity_context: w.intensity_context,
                created_at: w.created_at,
                updated_at: w.updated_at,
            }));

            setWorkouts(transformedWorkouts);
            logger.log(`Fetched ${transformedWorkouts.length} workouts for athlete ${athleteId}`);
        } catch (err) {
            const errorObj = err instanceof Error ? err : new Error('Failed to fetch workouts');
            setError(errorObj);
            logger.error('Error fetching workouts:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const addWorkout = useCallback(async (workout: Omit<Workout, 'id' | 'created_at' | 'updated_at'>): Promise<Workout> => {
        setLoading(true);
        setError(null);

        try {
            // Transform camelCase to snake_case for Supabase
            const dbWorkout = {
                athlete_id: workout.athleteId,
                coach_id: workout.coachId,
                date: workout.date,
                title: workout.title,
                description: workout.description,
                type: workout.type,
                duration: workout.duration,
                planned_load: workout.plannedLoad,
                actual_load: workout.actualLoad,
                rpe: workout.rpe,
                status: workout.status,
                color: workout.color,
                exercises: workout.exercises || [],
                warmup: workout.warmup,
                cooldown: workout.cooldown,
                intensity_context: workout.intensity_context,
            };

            const { data, error: insertError } = await supabase
                .from('workouts')
                .insert([dbWorkout])
                .select()
                .single();

            if (insertError) {
                throw insertError;
            }

            // Transform response back to camelCase
            const newWorkout: Workout = {
                id: data.id,
                athleteId: data.athlete_id,
                coachId: data.coach_id,
                date: data.date,
                title: data.title,
                description: data.description,
                type: data.type,
                duration: data.duration,
                plannedLoad: data.planned_load,
                actualLoad: data.actual_load,
                rpe: data.rpe,
                status: data.status,
                color: data.color,
                exercises: data.exercises || [],
                warmup: data.warmup,
                cooldown: data.cooldown,
                intensity_context: data.intensity_context,
                created_at: data.created_at,
                updated_at: data.updated_at,
            };

            setWorkouts(prev => [...prev, newWorkout].sort((a, b) =>
                new Date(a.date).getTime() - new Date(b.date).getTime()
            ));

            // Check if this workout was added during a personal event and notify
            const conflict = personalEvents.find(e =>
                isSameDay(new Date(e.start), new Date(workout.date)) &&
                e.allowWorkouts === false
            );

            if (conflict) {
                logger.warn(`Workout "${workout.title}" added during "${conflict.title}" (Type: ${conflict.type}). Permission allowWorkouts is false.`);
            }

            logger.log('Workout added successfully:', newWorkout.id);
            return newWorkout;
        } catch (err) {
            const errorObj = err instanceof Error ? err : new Error('Failed to add workout');
            setError(errorObj);
            logger.error('Error adding workout:', err);
            throw errorObj;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateWorkout = useCallback(async (id: string, updates: Partial<Workout>): Promise<void> => {
        setLoading(true);
        setError(null);

        try {
            // Transform camelCase to snake_case
            const dbUpdates: any = {};
            if (updates.athleteId !== undefined) dbUpdates.athlete_id = updates.athleteId;
            if (updates.coachId !== undefined) dbUpdates.coach_id = updates.coachId;
            if (updates.date !== undefined) dbUpdates.date = updates.date;
            if (updates.title !== undefined) dbUpdates.title = updates.title;
            if (updates.description !== undefined) dbUpdates.description = updates.description;
            if (updates.type !== undefined) dbUpdates.type = updates.type;
            if (updates.duration !== undefined) dbUpdates.duration = updates.duration;
            if (updates.plannedLoad !== undefined) dbUpdates.planned_load = updates.plannedLoad;
            if (updates.actualLoad !== undefined) dbUpdates.actual_load = updates.actualLoad;
            if (updates.rpe !== undefined) dbUpdates.rpe = updates.rpe;
            if (updates.status !== undefined) dbUpdates.status = updates.status;
            if (updates.color !== undefined) dbUpdates.color = updates.color;
            if (updates.exercises !== undefined) dbUpdates.exercises = updates.exercises;
            if (updates.warmup !== undefined) dbUpdates.warmup = updates.warmup;
            if (updates.cooldown !== undefined) dbUpdates.cooldown = updates.cooldown;
            if (updates.intensity_context !== undefined) dbUpdates.intensity_context = updates.intensity_context;

            const { error: updateError } = await supabase
                .from('workouts')
                .update(dbUpdates)
                .eq('id', id);

            if (updateError) {
                throw updateError;
            }

            setWorkouts(prev => prev.map(w =>
                w.id === id ? { ...w, ...updates } : w
            ));

            logger.log('Workout updated successfully:', id);
        } catch (err) {
            const errorObj = err instanceof Error ? err : new Error('Failed to update workout');
            setError(errorObj);
            logger.error('Error updating workout:', err);
            throw errorObj;
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteWorkout = useCallback(async (id: string): Promise<void> => {
        setLoading(true);
        setError(null);

        try {
            const { error: deleteError } = await supabase
                .from('workouts')
                .delete()
                .eq('id', id);

            if (deleteError) {
                throw deleteError;
            }

            setWorkouts(prev => prev.filter(w => w.id !== id));
            logger.log('Workout deleted successfully:', id);
        } catch (err) {
            const errorObj = err instanceof Error ? err : new Error('Failed to delete workout');
            setError(errorObj);
            logger.error('Error deleting workout:', err);
            throw errorObj;
        } finally {
            setLoading(false);
        }
    }, []);

    const acceptWorkout = useCallback(async (id: string): Promise<void> => {
        await updateWorkout(id, { status: 'planned' });
        logger.log('Workout accepted:', id);
    }, [updateWorkout]);

    const respondToWorkout = useCallback(async (id: string, response: 'accept' | 'refuse'): Promise<void> => {
        if (response === 'accept') {
            await updateWorkout(id, { status: 'planned' });
            toast.success('Entraînement accepté');
        } else {
            // If refused, we delete it (as requested: "le rdv disparait de mon calendier")
            // and we could send a notification to the coach here
            await deleteWorkout(id);
            toast.info('Entraînement refusé');
            logger.log('Workout refused and deleted:', id);
        }
    }, [updateWorkout, deleteWorkout]);

    const addPersonalEvent = useCallback(async (event: Omit<PersonalEvent, 'id'>): Promise<void> => {
        const newEvent = { ...event, id: Math.random().toString(36).substr(2, 9) };
        const updated = [...personalEvents, newEvent];
        savePersonalEvents(updated);

        // Sync with vacations if type is vacation
        if (event.type === 'vacation' && currentUser) {
            const currentVacations = currentUser.profile_data?.vacations || [];
            await updateProfile({
                profile_data: {
                    ...currentUser.profile_data,
                    vacations: [...currentVacations, {
                        id: newEvent.id,
                        start: newEvent.start,
                        end: newEvent.end,
                        title: newEvent.title
                    }]
                }
            });
        }

        // Check if this event conflicts with an existing event's permissions
        const existingConflict = personalEvents.find(e =>
            isSameDay(new Date(e.start), new Date(newEvent.start))
        );

        if (existingConflict) {
            let allowed = true;
            if (newEvent.type === 'workout' && existingConflict.allowWorkouts === false) allowed = false;
            if (newEvent.type === 'competition' && existingConflict.allowCompetitions === false) allowed = false;
            if (newEvent.type === 'rdv' && existingConflict.allowRDV === false) allowed = false;

            if (!allowed) {
                logger.warn(`Event "${newEvent.title}" added during "${existingConflict.title}" without permission.`);
            }
        }

        logger.log('Personal event added:', newEvent.id);
    }, [personalEvents, currentUser, updateProfile]);

    const updatePersonalEvent = useCallback(async (id: string, updates: Partial<PersonalEvent>): Promise<void> => {
        const updated = personalEvents.map(e => e.id === id ? { ...e, ...updates } : e);
        savePersonalEvents(updated);

        const event = updated.find(e => e.id === id);
        if (event?.type === 'vacation' && currentUser) {
            const currentVacations = currentUser.profile_data?.vacations || [];
            const updatedVacations = currentVacations.map((v: any) =>
                v.id === id ? { ...v, start: event.start, end: event.end, title: event.title } : v
            );
            await updateProfile({
                profile_data: {
                    ...currentUser.profile_data,
                    vacations: updatedVacations
                }
            });
        }
        logger.log('Personal event updated:', id);
    }, [personalEvents, currentUser, updateProfile]);

    const deletePersonalEvent = useCallback(async (id: string): Promise<void> => {
        const eventToDelete = personalEvents.find(e => e.id === id);
        const updated = personalEvents.filter(e => e.id !== id);
        savePersonalEvents(updated);

        if (eventToDelete?.type === 'vacation' && currentUser) {
            const currentVacations = currentUser.profile_data?.vacations || [];
            await updateProfile({
                profile_data: {
                    ...currentUser.profile_data,
                    vacations: currentVacations.filter((v: any) => v.id !== id)
                }
            });
        }
        logger.log('Personal event deleted:', id);
    }, [personalEvents, currentUser, updateProfile]);

    const respondToPersonalEvent = useCallback(async (id: string, response: 'accept' | 'refuse'): Promise<void> => {
        if (response === 'accept') {
            await updatePersonalEvent(id, { status: 'accepted' });
            toast.success('Rendez-vous accepté');
        } else {
            await deletePersonalEvent(id);
            toast.info('Rendez-vous refusé');
            logger.log('Personal event refused and deleted:', id);
        }
    }, [updatePersonalEvent, deletePersonalEvent]);

    const savePlan = useCallback(async (coachId: string, athleteIds: string[], planData: PlanData): Promise<void> => {
        setLoading(true);
        try {
            // 1. Prepare all workouts for insertion
            const workoutsToInsert: any[] = [];

            for (const athleteId of athleteIds) {
                for (const session of planData.sessions) {
                    workoutsToInsert.push({
                        athlete_id: athleteId,
                        coach_id: coachId,
                        date: session.date, // ensure this is a valid ISO string or Date
                        title: session.title,
                        description: session.details?.main || '', // Example mapping
                        type: 'run', // Defaulting to run, logic should be smarter based on session.title
                        duration: 60, // Default or parse from session
                        status: 'planned',
                        exercises: session.exercises || [],
                        // Add other fields mapped from session
                        // meta: { medal: session.medal, visual: session.visual } // potential extra field usually in JSONB
                    });
                }
            }

            if (workoutsToInsert.length === 0) return;

            // 2. Batch insert
            const { data, error } = await supabase
                .from('workouts')
                .insert(workoutsToInsert)
                .select();

            if (error) throw error;

            // 3. Update local state if needed (refetch or append)
            // Simplified: refetching for the first athlete would be safest
            if (athleteIds.length > 0) {
                await fetchWorkouts(athleteIds[0]);
            }

            logger.log(`Plan saved: ${workoutsToInsert.length} workouts created across ${athleteIds.length} athletes.`);

        } catch (err) {
            const errorObj = err instanceof Error ? err : new Error('Failed to save plan');
            setError(errorObj);
            logger.error('Error saving plan:', err);
            throw errorObj;
        } finally {
            setLoading(false);
        }
    }, [fetchWorkouts]);

    const deletePlan = useCallback(async (planId: string): Promise<void> => {
        // Stub implementation until Plans table schema is confirmed
        logger.info('deletePlan not fully implemented (no plans table yet)', planId);
        setPlans(prev => prev.filter(p => p.id !== planId));
    }, []);

    const getWorkoutsByDate = useCallback((date: Date): Workout[] => {
        return workouts.filter(w => isSameDay(new Date(w.date), date));
    }, [workouts]);

    const getUpcomingWorkouts = useCallback((limit: number = 4): Workout[] => {
        const today = startOfToday();
        return workouts
            .filter(w => !isBefore(new Date(w.date), today))
            .slice(0, limit);
    }, [workouts]);

    const value: TrainingContextValue = {
        workouts,
        loading,
        error,
        fetchWorkouts,
        addWorkout,
        updateWorkout,
        deleteWorkout,
        getWorkoutsByDate,
        getUpcomingWorkouts,
        plans,
        savePlan,
        deletePlan,
        acceptWorkout,
        personalEvents,
        addPersonalEvent,
        updatePersonalEvent,
        deletePersonalEvent,
        respondToWorkout,
        respondToPersonalEvent
    };

    return (
        <TrainingContext.Provider value={value}>
            {children}
        </TrainingContext.Provider>
    );
}

export function useTraining(): TrainingContextValue {
    const context = useContext(TrainingContext);
    if (context === undefined) {
        throw new Error('useTraining must be used within a TrainingProvider');
    }
    return context;
}
