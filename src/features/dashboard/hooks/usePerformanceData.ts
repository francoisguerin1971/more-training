import { useState, useMemo, useEffect } from 'react';
import { TrainingScienceService, DailyLoad, ReadinessInputs } from '../../planner/services/TrainingScienceService';
import { useTraining } from '../../planner/contexts/TrainingContext';
import { useAuthStore } from '../../auth/stores/authStore';
import { supabase } from '@/core/services/supabase';
import { logger } from '@/core/utils/security';
import { startOfToday, subDays, isWithinInterval } from 'date-fns';
import { useLanguage } from '@/shared/context/LanguageContext';

export function usePerformanceData() {
    const { workouts, fetchWorkouts } = useTraining();
    const { currentUser } = useAuthStore();
    const [recoveryData, setRecoveryData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const userId = currentUser?.id;

    // Fetch Health Data (VFC, Sleep, etc.)
    useEffect(() => {
        const fetchHealthData = async () => {
            if (!userId) return;
            try {
                const { data, error } = await supabase
                    .from('health_data')
                    .select('*')
                    .eq('athlete_id', userId)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single();

                if (error && error.code !== 'PGRST116') {
                    logger.warn('Health data fetch error:', error.message);
                }
                if (data) setRecoveryData(data);
            } catch (err) {
                logger.error('Unexpected error fetching health data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchHealthData();
    }, [userId]);

    // Ensure workouts are loaded
    useEffect(() => {
        if (userId) fetchWorkouts(userId);
    }, [userId, fetchWorkouts]);

    // Format history for TrainingScienceService (Last 28 days)
    const history: DailyLoad[] = useMemo(() => {
        if (!workouts || !Array.isArray(workouts)) return [];

        const today = startOfToday();
        const past28Days = { start: subDays(today, 27), end: today };

        // Group by day and sum load
        const loadMap = new Map<string, number>();

        workouts.forEach(w => {
            if (w.athleteId !== userId || w.status !== 'COMPLETED' || !w.date) return;
            const d = new Date(w.date);
            if (isWithinInterval(d, past28Days)) {
                const key = d.toISOString().split('T')[0];
                const load = w.actualLoad || (w.duration * (w.rpe || 5));
                loadMap.set(key, (loadMap.get(key) || 0) + load);
            }
        });

        // Convert to DailyLoad array
        return Array.from(loadMap.entries()).map(([date, load]) => ({
            date: new Date(date),
            load
        })).sort((a, b) => b.date.getTime() - a.date.getTime());
    }, [workouts, userId]);

    // Calculate ACWR
    const acwrData = useMemo(() => {
        return TrainingScienceService.calculateACWR(history);
    }, [history]);

    // Calculate Monotony & Strain
    const stressData = useMemo(() => {
        return TrainingScienceService.calculateMonotonyAndStrain(history);
    }, [history]);

    // Calculate Readiness
    const readiness = useMemo(() => {
        const hrvBaseline = currentUser?.profile_data?.baselines?.hrv || 65;
        const inputs: ReadinessInputs = {
            sleepScore: recoveryData?.sleep_score || 70,
            hrv: recoveryData?.hrv || 68,
            hrvBaseline,
            soreness: recoveryData?.soreness || 3,
            stress: recoveryData?.stress || 4
        };
        return TrainingScienceService.calculateDailyReadiness(inputs);
    }, [recoveryData, currentUser]);

    // Adaptive Recommendation
    const { t } = useLanguage();
    const adaptiveAdjustment = useMemo(() => {
        if (readiness.zone === 'red') {
            return {
                type: 'RECOVERY',
                label: t('readiness_recovery_label'),
                description: t('readiness_recovery_desc'),
                intensityFactor: 0.5
            };
        }
        if (readiness.zone === 'amber') {
            return {
                type: 'ADAPTED',
                label: t('readiness_adapted_label'),
                description: t('readiness_adapted_desc'),
                intensityFactor: 0.8
            };
        }
        return {
            type: 'OPTIMAL',
            label: t('readiness_optimal_label'),
            description: t('readiness_optimal_desc'),
            intensityFactor: 1.0
        };
    }, [readiness, t]);

    return {
        acwrData,
        stressData,
        readiness,
        adaptiveAdjustment,
        history,
        loading,
        metrics: {
            hrv: recoveryData?.hrv || 0,
            sleep: recoveryData?.sleep_hours || 0,
            recoveryScore: readiness.score
        }
    };
}
