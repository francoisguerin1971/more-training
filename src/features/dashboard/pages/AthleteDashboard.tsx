import React, { useState, useMemo, useEffect } from 'react';
import {
    Activity, Calendar, CheckCircle2, ChevronRight, Clock,
    Droplets, Flame, Heart, Info, Moon, RefreshCw,
    Target, Timer, Trophy, Users, Zap, Wind, PieChart,
    Battery, Watch, TrendingUp, Box, CalendarDays, ShieldCheck,
    BrainCircuit, Cloud, Award, MessageSquare, X, BookOpen
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format, isSameDay, startOfToday } from 'date-fns';
import { fr, es, ca, enUS, it, de } from 'date-fns/locale';
import { useLanguage } from '@/shared/context/LanguageContext';
import { useTraining } from '@/features/planner/contexts/TrainingContext';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { Workout } from '@/shared/types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardHeader } from '@/shared/components/ui/Card';
import { InfoTooltip } from '@/shared/components/ui/InfoTooltip';
import { supabase } from '@/core/services/supabase';
import { cn } from '@/core/utils/cn';
import { logger } from '@/core/utils/security';
import { PlanSelector } from '@/shared/components/common/PlanSelector';
import { FreeConsultationModal } from '@/shared/components/common/FreeConsultationModal';
import { SessionDetailModal } from '@/shared/components/common/SessionDetailModal';


export function AthleteDashboard() {
    const navigate = useNavigate();
    const { language, t } = useLanguage();

    // Map language to date-fns locale
    const currentLocale = useMemo(() => {
        switch (language) {
            case 'fr': return fr;
            case 'es': return es;
            case 'ca': return ca;
            case 'it': return it;
            case 'de': return de;
            default: return enUS;
        }
    }, [language]);
    const { workouts, updateWorkout, fetchWorkouts, loading: workoutsLoading } = useTraining();
    const { currentUser, getCoachesForAthlete, loading } = useAuthStore();

    // State with proper types
    const [logDuration, setLogDuration] = useState<string>('');
    const [logRpe, setLogRpe] = useState<string>('5');
    const [sensations, setSensations] = useState({
        fatigue: 3,
        motivation: 8,
        soreness: 2,
        stress: 4
    });
    const [isLogging, setIsLogging] = useState<boolean>(false);
    const [recoveryData, setRecoveryData] = useState<any>(null);
    const [selectedSession, setSelectedSession] = useState<any>(null);
    const [showFreeConsultation, setShowFreeConsultation] = useState<boolean>(false);
    const [coachesList, setCoachesList] = useState<any[]>([]);
    const [showPlanSelector, setShowPlanSelector] = useState<boolean>(false);
    const [showPaymentSuccess, setShowPaymentSuccess] = useState<boolean>(false);
    const [activePlan, setActivePlan] = useState<any>(currentUser?.profile_data?.activePlan || null);

    // Safe Derived Data (Top Level)
    const userId = currentUser?.id;
    const userSport = currentUser?.profile_data?.primarySport || 'Running';
    const profileGoal = currentUser?.profile_data?.mainGoal || {
        title: `Marathon Sub 3:30`,
        targetDate: format(new Date(2025, 3, 15), 'MMMM dd, yyyy', { locale: currentLocale }),
        progress: 67,
        currentPace: '4:55 /km',
        targetPace: '4:58 /km',
        daysRemaining: 107
    };
    const mainGoal = profileGoal;

    // --- HOOKS SECTION (Must run on every render) ---

    // 1. Fetch Health Data
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

                if (error) {
                    if (error.code !== 'PGRST116') { // PGRST116 is 'no rows'
                        logger.warn('Health data fetch error:', error.message);
                    }
                    return;
                }

                if (data) {
                    setRecoveryData(data);
                }
            } catch (err) {
                logger.error('Unexpected error fetching health data:', err);
            }
        };
        fetchHealthData();
    }, [userId]);

    // 2. Fetch Workouts
    useEffect(() => {
        if (userId) {
            fetchWorkouts(userId);
        }
    }, [userId, fetchWorkouts]);

    // 3. Load Coaches
    useEffect(() => {
        const loadCoaches = async () => {
            if (userId) {
                const coachesData = await getCoachesForAthlete(userId);
                setCoachesList(coachesData || []);
            }
        };
        loadCoaches();
    }, [userId, getCoachesForAthlete]);

    // 4. Calculate Personal Records (Memoized)
    const personalRecords = useMemo(() => {
        if (userSport === 'Cycling' || userSport === 'Triathlon') {
            return [
                { label: t('record_cycling_ftp'), current: '285 W', best: '305 W', progress: 60, help: t('ftp_desc') },
                { label: t('record_cycling_20min'), current: '298 W', best: '320 W', progress: 55 },
                { label: t('record_cycling_5min'), current: '350 W', best: '380 W', progress: 40 }
            ];
        } else if (userSport === 'Football' || userSport === 'Fútbol' || userSport === 'Tennis') {
            return [
                { label: t('record_vma'), current: '16.5 km/h', best: '18.0 km/h', progress: 75, help: t('vma_desc') },
                { label: t('record_sprint'), current: '31.2 km/h', best: '33.5 km/h', progress: 65, help: t('sprint_desc') },
                { label: t('distance'), current: '10.2 km', best: '12.5 km', progress: 80 }
            ];
        } else {
            return [
                { label: t('record_run_5k'), current: '19:45', best: '18:52', progress: 85 },
                { label: t('record_run_10k'), current: '41:20', best: '39:58', progress: 70 },
                { label: t('record_vma'), current: '17.2 km/h', best: '18.5 km/h', progress: 60, help: t('vma_desc') }
            ];
        }
    }, [userSport, t]);

    // --- DATA TRANSFORMATION SECTION ---

    // Filter workouts for this athlete 
    const today = startOfToday();
    const safeWorkouts = Array.isArray(workouts) ? workouts : [];
    // Safe access to sessions, defaults to empty array if no user
    const sessions = userId ? safeWorkouts.filter((w: any) => w.athleteId === userId) : [];

    // Mock Load Curve Data: Macro-cycle position logic (Load vs Forecast vs RPE)
    const macroCycleData = useMemo(() => {
        const baseDate = new Date();
        return Array.from({ length: 5 }).map((_, i) => {
            const d = new Date(baseDate.getFullYear(), baseDate.getMonth() - 2 + i, 1);
            return {
                name: format(d, 'MMM', { locale: currentLocale }),
                planning: 300 + (i * 100),
                actual: i <= 2 ? 280 + (i * 100) : null,
                rpe: i <= 2 ? 250 + (i * 110) : null
            };
        });
    }, [currentLocale]);

    const last7Days = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const daySession = sessions.find(s => s.date && isSameDay(new Date(s.date), d));
        return {
            name: format(d, 'EEE', { locale: currentLocale }),
            load: daySession ? (daySession.actualLoad || daySession.plannedLoad || 20) : 20,
            rpe: daySession && daySession.status === 'COMPLETED' ? (daySession.rpe || 0) * 10 : 0
        };
    });

    // Derived recovery metrics from fetched health data or fallback
    const recoveryMetrics = {
        hrv: { value: recoveryData?.hrv || 68, status: 'good', change: '+5%' }, // Heart Rate Variability
        rhr: { value: recoveryData?.rhr || 52, status: 'excellent', change: '-2 bpm' }, // Resting Heart Rate
        sleep: { value: recoveryData?.sleep || 7.5, status: 'good', change: '+0.5h' },
        fatigue: { value: recoveryData?.fatigue || 3, status: 'low', max: 10 }, // 1-10 scale
        recoveryScore: recoveryData?.recoveryScore || 82 // 0-100
    };

    // Dynamic upcoming workouts from context
    const futureSessions = sessions.filter(s => s.date && new Date(s.date) > today).slice(0, 4);
    const upcomingWorkouts = futureSessions.length > 0 ? futureSessions.map(s => ({
        date: format(new Date(s.date), 'EEE, MMM dd', { locale: currentLocale }),
        title: s.title,
        type: s.type || 'Activity',
        load: s.plannedLoad || 0,
        duration: `${s.duration} min`,
        icon: s.type === 'ENDURANCE' ? Activity : Zap,
        color: s.type === 'ENDURANCE' ? 'emerald' : 'amber'
    })) : [
        { date: t('tomorrow'), title: t('sport_running'), type: 'Running', load: 420, duration: `60 ${t('minutes_suffix') || 'min'}`, icon: Activity, color: 'emerald' },
        { date: format(new Date(2025, 0, 3), 'EEE, MMM dd', { locale: currentLocale }), title: t('sport_gym'), type: 'Gym', load: 280, duration: `45 ${t('minutes_suffix') || 'min'}`, icon: Zap, color: 'amber' },
        { date: format(new Date(2025, 0, 4), 'EEE, MMM dd', { locale: currentLocale }), title: t('sport_swimming'), type: 'Swimming', load: 180, duration: `30 ${t('minutes_suffix') || 'min'}`, icon: Droplets, color: 'blue' },
        { date: format(new Date(2025, 0, 5), 'EEE, MMM dd', { locale: currentLocale }), title: t('sport_running'), type: 'Running', load: 550, duration: `75 ${t('minutes_suffix') || 'min'}`, icon: Flame, color: 'rose' },
    ];

    // Mock training zones distribution (percentage of time in each zone)
    const trainingZones = [
        { zone: 'Z1', percentage: 35, color: '#10b981', label: t('zone_recovery') },
        { zone: 'Z2', percentage: 40, color: '#3b82f6', label: t('zone_endurance') },
        { zone: 'Z3', percentage: 15, color: '#f59e0b', label: t('zone_tempo') },
        { zone: 'Z4', percentage: 7, color: '#f97316', label: t('zone_threshold') },
        { zone: 'Z5', percentage: 3, color: '#ef4444', label: t('zone_vo2max') },
    ];

    // Real weekly stats from sessions
    const weeklyStats = {
        distance: '42.5 km',
        duration: 245, // minutes
        sessions: { completed: 4, planned: 5 },
        calories: 2850
    };

    const dummyNotes = t('coach_demo_note');

    // Merge real session with mock notes if missing
    const rawSession = sessions.find(s => {
        const d = new Date(s.date);
        return s.date && !isNaN(d.getTime()) && isSameDay(d, today);
    });

    const demoExercises = [
        {
            name: t('mobility_dynamic'),
            sets: 1,
            reps: "10 min",
            intensity_target: "Z1",
            sketch_url: "/images/sketches/mobility.png",
            notes: t('mobility_notes')
        },
        {
            name: t('sprints_specific'),
            sets: 6,
            reps: "3 x 20m",
            rest: "90s",
            tempo: "100%",
            rpe: 9,
            sketch_url: "/images/sketches/sprint.png",
            notes: t('sprint_notes')
        },
        {
            name: t('squat_activation'),
            sets: 3,
            reps: "12",
            rest: "60s",
            tempo: "3-1-3",
            weight: "12kg",
            rpe: 6,
            sketch_url: "/images/sketches/squat.png",
            notes: t('squat_notes')
        }
    ];

    const todaysSession: Workout | null = rawSession ? {
        ...rawSession,
        coach_notes: rawSession.coach_notes || dummyNotes,
        intensity_context: rawSession.intensity_context || rawSession.intensity || t('tactical_performance'),
        // Ensure icon is a component or fallback to Activity to prevent rendering crashes
        icon: (typeof rawSession.icon === 'function' || typeof rawSession.icon === 'object') ? rawSession.icon : Activity,
        color: rawSession.color || 'emerald',
        exercises: rawSession.exercises && rawSession.exercises.length > 0 ? rawSession.exercises : demoExercises,
        details: rawSession.details || {
            warmup: t('warmup_desc'),
            main: t('main_desc'),
            cooldown: t('cooldown_desc'),
            tech_focus: t('tech_focus_desc')
        }
    } : (userId ? {
        id: 'mock-1',
        athleteId: userId || '1',
        title: userSport === 'Football' ? t('elite_session_title') : t('elite_session_title'),
        description: t('elite_session_desc'),
        type: 'run',
        duration: 45,
        status: 'planned',
        date: today.toISOString(),
        coach_notes: dummyNotes,
        intensity_context: t('high_intensity'),
        icon: Activity,
        color: 'emerald',
        exercises: demoExercises,
        details: {
            warmup: t('warmup_desc'),
            main: t('main_desc'),
            cooldown: t('cooldown_desc'),
            tech_focus: t('tech_focus_desc')
        }
    } : null);

    // Force mock connected state for demo
    const hasConnectedDevice = true;

    // --- EARLY RETURNS FOR LOADING/AUTH (Must happen AFTER hooks) ---
    if (loading) {
        return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">{t('loading')}...</div>;
    }

    if (!currentUser) {
        return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">{t('please_log_in')}</div>;
    }

    // Real weekly stats from sessions
    const handleLogSession = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!todaysSession) return;

        setIsLogging(true);
        // Update workout with actual data
        setTimeout(() => {
            if (updateWorkout) {
                const duration = parseInt(logDuration) || todaysSession.duration;
                const rpeValue = parseInt(logRpe) || 5;
                updateWorkout(todaysSession.id, {
                    status: 'COMPLETED',
                    duration: duration,
                    actualLoad: duration * rpeValue,
                    rpe: rpeValue
                });
            }
            setIsLogging(false);
            setLogDuration('');
        }, 1500);
    };

    const handleSaveSensations = () => {
        setIsLogging(true);
        setTimeout(() => {
            setIsLogging(false);
            // In a real app, this would hit a Supabase endpoint
            logger.info('Sensations saved:', sensations);
        }, 1000);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-700">

            {/* Top Identity Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-[2.5rem] bg-gradient-to-br from-emerald-400 via-indigo-500 to-indigo-600 flex items-center justify-center text-3xl font-black text-white shadow-2xl border-4 border-slate-950 relative group">
                        <div className="absolute inset-0 bg-white/20 rounded-[2.3rem] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        {currentUser?.avatar || (currentUser?.pseudo?.[0] || currentUser?.name?.[0] || currentUser?.full_name?.[0] || 'A')}
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">
                            {t('welcome_back')}, <span className="text-emerald-400">{currentUser?.first_name || (currentUser?.pseudo || currentUser?.name || currentUser?.full_name || t('default_athlete_name')).split(' ')[0]}</span>
                        </h1>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            {activePlan ? `${activePlan.name} ${t('active')}` : t('ai_personalized_plan_active')}
                        </p>
                    </div>
                </div>

                {!activePlan && (
                    <button
                        onClick={() => setShowFreeConsultation(true)}
                        className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20 flex items-center gap-2 group border border-indigo-400/30"
                    >
                        <Users size={16} className="group-hover:scale-110 transition-transform" /> {t('consult_coach_free')}
                    </button>
                )}
            </div>

            {/* LEVEL 1: THE ACTION (Today's Session & Fused Feedback) - MOVED TO TOP */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8">
                    <Card className="relative border-emerald-500/20 shadow-2xl group min-h-[500px] flex flex-col">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] rounded-full -mr-20 -mt-20"></div>

                        <CardHeader
                            title={t('today_session_title')}
                            subtitle={`${format(today, 'EEEE, dd MMMM')} • ${todaysSession?.duration || 0} min`}
                            icon={<Timer className="text-emerald-400" size={24} />}
                            action={<InfoTooltip text={t('info_today_session')} action={t('action_today_session')} />}
                        />

                        {todaysSession ? (
                            <div className="p-8 flex-1 flex flex-col">
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 h-full">
                                    {/* Left: Technical Guidance */}
                                    <div className="space-y-6">
                                        {/* Coach's Insight Highlight */}
                                        {todaysSession.coach_notes && (
                                            <div className="bg-gradient-to-br from-indigo-500/10 to-indigo-500/5 border border-indigo-500/20 rounded-3xl p-6 relative overflow-hidden group/insight">
                                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover/insight:opacity-10 transition-opacity">
                                                    <BrainCircuit size={80} className="text-indigo-400" />
                                                </div>
                                                <div className="flex items-start gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 shrink-0">
                                                        <MessageSquare size={24} />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">{t('insight_coach_title')}</p>
                                                        <p className="text-white font-bold leading-relaxed text-lg italic">
                                                            "{todaysSession.coach_notes}"
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <h2 className="text-3xl font-black text-white uppercase tracking-tight">{todaysSession.title}</h2>
                                                {todaysSession.intensity_context && (
                                                    <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase rounded-full">
                                                        {todaysSession.intensity_context}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-slate-400 leading-relaxed text-sm italic border-l-2 border-emerald-500/30 pl-4">
                                                {todaysSession.description}
                                            </p>
                                        </div>

                                        <div className="space-y-4">
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('session_structure')}</p>
                                            <div className="space-y-3">
                                                {todaysSession.warmup && (
                                                    <div className="p-4 bg-slate-900/40 border border-slate-800/60 rounded-2xl flex items-center justify-between group/item hover:border-emerald-500/20 transition-all">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center text-emerald-400 border border-slate-800">
                                                                <Activity size={18} />
                                                            </div>
                                                            <div>
                                                                <p className="text-[11px] font-black text-white uppercase">{t('warmup')}</p>
                                                                <p className="text-[9px] text-slate-500 uppercase font-black">{todaysSession.warmup.duration}</p>
                                                            </div>
                                                        </div>
                                                        <ChevronRight size={14} className="text-slate-700 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                                                    </div>
                                                )}
                                                {todaysSession.exercises && todaysSession.exercises.slice(0, 2).map((ex: any, idx: number) => (
                                                    <div key={idx} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center gap-4 hover:border-emerald-500/20 transition-all cursor-pointer group/ex" onClick={() => setSelectedSession(todaysSession)}>
                                                        <div className="w-12 h-12 bg-white rounded-xl overflow-hidden flex items-center justify-center border border-slate-800 group-hover/ex:scale-105 transition-transform">
                                                            {ex.sketch_url ? <img src={ex.sketch_url} className="w-full h-full object-contain" alt="" /> : <Box size={20} className="text-emerald-500" />}
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-[11px] font-black text-white uppercase truncate">{ex.name}</p>
                                                            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">
                                                                {ex.sets || 1}x{ex.reps || '-'} • R:{ex.rest || '--'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                                {todaysSession.exercises && (
                                                    <button
                                                        onClick={() => setSelectedSession(todaysSession)}
                                                        className="w-full py-4 bg-slate-950 border border-slate-800 hover:border-emerald-500/50 rounded-2xl flex items-center justify-center gap-3 transition-all group/btn"
                                                    >
                                                        <BookOpen size={16} className="text-emerald-500 group-hover/btn:scale-110 transition-transform" />
                                                        <span className="text-[10px] font-black text-white uppercase tracking-[0.15em]">
                                                            {t('view_all_exercises')} ({todaysSession.exercises.length})
                                                        </span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Actions & Feedback */}
                                    <div className="bg-slate-950/50 rounded-[2.5rem] border border-slate-800/50 p-8 flex flex-col justify-between relative overflow-hidden">
                                        <div className="absolute inset-0 bg-emerald-500/[0.02] pointer-events-none"></div>

                                        {todaysSession.status === 'COMPLETED' ? (
                                            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 animate-in zoom-in duration-500">
                                                <div className="w-24 h-24 bg-emerald-500 rounded-[2rem] flex items-center justify-center text-slate-950 shadow-2xl shadow-emerald-500/40">
                                                    <Award size={40} />
                                                </div>
                                                <div>
                                                    <h3 className="text-2xl font-black text-white uppercase">{t('session_logged')}</h3>
                                                    <div className="flex items-center justify-center gap-4 mt-4">
                                                        <div className="px-4 py-2 bg-slate-900 rounded-xl border border-slate-800">
                                                            <p className="text-[8px] text-slate-500 font-black uppercase mb-1">RPE</p>
                                                            <p className="text-xl font-black text-emerald-400">{todaysSession.rpe}</p>
                                                        </div>
                                                        <div className="px-4 py-2 bg-slate-900 rounded-xl border border-slate-800">
                                                            <p className="text-[8px] text-slate-500 font-black uppercase mb-1">{t('kpi_load')}</p>
                                                            <p className="text-xl font-black text-white">{todaysSession.actualLoad}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                                                    {t('cycle_complete_msg')}
                                                </p>
                                            </div>
                                        ) : (
                                            <form onSubmit={handleLogSession} className="space-y-8">
                                                <div className="space-y-6">
                                                    <div>
                                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                                            {t('foster_rpe')}
                                                        </label>
                                                        <div className="grid grid-cols-5 gap-2">
                                                            {[2, 4, 6, 8, 10].map(val => (
                                                                <button
                                                                    key={val} type="button"
                                                                    onClick={() => setLogRpe(val.toString())}
                                                                    className={cn(
                                                                        "h-12 rounded-2xl text-[11px] font-black transition-all border",
                                                                        logRpe === val.toString()
                                                                            ? "bg-emerald-500 border-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 scale-105"
                                                                            : "bg-slate-900 border-slate-800 text-slate-500 hover:text-white"
                                                                    )}
                                                                >
                                                                    {val}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div className="space-y-4">
                                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                                                            {t('sensations_fatigue')} & {t('sensations_motivation')}
                                                        </label>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
                                                                <input
                                                                    type="range" min="1" max="10" value={sensations.fatigue}
                                                                    onChange={(e) => setSensations({ ...sensations, fatigue: parseInt(e.target.value) })}
                                                                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                                                />
                                                            </div>
                                                            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
                                                                <input
                                                                    type="range" min="1" max="10" value={sensations.motivation}
                                                                    onChange={(e) => setSensations({ ...sensations, motivation: parseInt(e.target.value) })}
                                                                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <button
                                                    type="submit" disabled={isLogging}
                                                    className="w-full py-5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-3xl shadow-2xl shadow-emerald-500/20 transition-all uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-3 group"
                                                >
                                                    {isLogging ? (
                                                        <RefreshCw className="animate-spin" size={20} />
                                                    ) : (
                                                        <>
                                                            {t('save_log_btn')} <CheckCircle2 size={18} className="group-hover:scale-110 transition-transform" />
                                                        </>
                                                    )}
                                                </button>
                                            </form>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center p-20 text-center opacity-50 grayscale">
                                <Calendar size={48} className="mb-4 text-slate-700" />
                                <h3 className="text-xl font-black text-slate-600 uppercase">{t('no_sessions_today')}</h3>
                                <p className="text-[10px] text-slate-700 mt-2 uppercase font-black">{t('rest_day_subtitle')}</p>
                            </div>
                        )}
                    </Card>
                </div>

                <div className="lg:col-span-4 space-y-8">
                    {/* Upcoming Anticipation */}
                    <Card className="bg-slate-950 border-slate-800 shadow-xl flex flex-col h-full">
                        <CardHeader
                            title={t('upcoming_sessions')}
                            subtitle={t('next_workouts_planned')}
                            icon={<CalendarDays className="text-cyan-400" size={20} />}
                        />
                        <div className="p-6 space-y-4 overflow-y-auto max-h-[500px] scrollbar-hide">
                            {upcomingWorkouts.map((workout: any, i: number) => (
                                <div
                                    key={i}
                                    onClick={() => setSelectedSession(workout)}
                                    className="p-4 bg-slate-900/50 border border-slate-800 rounded-3xl hover:border-cyan-500/30 transition-all group cursor-pointer flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg border border-white/5",
                                            workout.color === 'emerald' && "bg-emerald-500/10 text-emerald-400",
                                            workout.color === 'amber' && "bg-amber-500/10 text-amber-400",
                                            workout.color === 'blue' && "bg-blue-500/10 text-blue-400",
                                            workout.color === 'rose' && "bg-rose-500/10 text-rose-400"
                                        )}>
                                            <workout.icon size={20} />
                                        </div>
                                        <div>
                                            <p className="text-white font-black uppercase text-[10px] tracking-tight truncate max-w-[120px]">{workout.title}</p>
                                            <p className="text-[9px] text-slate-500 font-bold uppercase mt-0.5">{workout.date}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-white font-black text-xs">{workout.load}</p>
                                        <p className="text-[8px] text-slate-600 font-bold uppercase">{t('kpi_load')}</p>
                                    </div>
                                </div>
                            ))}

                            <div className="pt-4 border-t border-slate-800/50">
                                <button
                                    onClick={() => navigate('/planner')}
                                    className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-slate-400 rounded-2xl border border-slate-800 transition-all text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 group"
                                >
                                    {t('view_full_calendar')} <ChevronRight size={14} className="group-hover:translate-x-1 transition-all" />
                                </button>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* LEVEL 2: THE HORIZON (Macro-Cycle & Goal) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Macro Cycle Analytics */}
                <Card className="lg:col-span-8 bg-slate-900 border-slate-800 shadow-2xl overflow-visible group">
                    <div className="p-1 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent absolute top-0 left-0 right-0 h-[1px]"></div>
                    <CardHeader
                        title={t('macro_cycle_location')}
                        subtitle={t('annual_periodization_progress')}
                        icon={<Target className="text-indigo-400" size={20} />}
                        action={
                            <div className="flex items-center gap-4">
                                <div className="hidden sm:flex items-center gap-4 mr-6">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-1 rounded-full bg-slate-500 opacity-50"></div>
                                        <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider">{t('forecast')}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
                                        <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider">{t('actual_curve')}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]"></div>
                                        <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider">{t('effort')}</span>
                                    </div>
                                </div>
                                <InfoTooltip text={t('info_macro_cycle')} action={t('action_macro_cycle')} />
                            </div>
                        }
                    />

                    <div className="h-[240px] w-full mt-4 px-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={macroCycleData}>
                                <defs>
                                    <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorRPE" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis dataKey="name" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                                <YAxis hide domain={[0, 'auto']} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)' }}
                                    itemStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}
                                />
                                <Area
                                    type="monotone" dataKey="planning"
                                    stroke="#475569" strokeWidth={2} strokeDasharray="6 4"
                                    fill="transparent"
                                />
                                <Area
                                    type="monotone" dataKey="rpe"
                                    stroke="#f59e0b" strokeWidth={3}
                                    fill="url(#colorRPE)"
                                />
                                <Area
                                    type="monotone" dataKey="actual"
                                    stroke="#10b981" strokeWidth={4}
                                    fill="url(#colorActual)"
                                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4, stroke: '#0f172a' }}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-2 gap-8 border-t border-slate-800 p-6 bg-slate-900/50">
                        <div>
                            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{t('current_position')}</p>
                            <p className="text-xl font-black text-white mt-1 uppercase flex items-center gap-2">
                                {t('phase_pre_comp')}
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{t('status_vs_plan')}</p>
                            <div className="flex items-center justify-end gap-2 mt-1">
                                <TrendingUp size={16} className="text-emerald-400" />
                                <p className="text-xl font-black text-emerald-400 uppercase">+12% {t('ahead')}</p>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Main Goal Progress */}
                <Card className="lg:col-span-4 bg-gradient-to-br from-amber-950/20 to-slate-950 border-amber-500/20 shadow-2xl flex flex-col">
                    <CardHeader
                        title={t('main_goal')}
                        subtitle={mainGoal.targetDate}
                        icon={<Trophy className="text-amber-400" size={20} />}
                    />

                    <div className="p-6 flex-1 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-2xl font-black text-white uppercase tracking-tight leading-tight">{mainGoal.title}</h3>
                                <div className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                                    <p className="text-[9px] text-amber-400 font-black uppercase">{mainGoal.daysRemaining} {t('days')}</p>
                                </div>
                            </div>

                            {/* Progress Semi-Circle or Bar */}
                            <div className="mt-6 space-y-3">
                                <div className="flex items-center justify-between">
                                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{t('progress')}</p>
                                    <p className="text-sm font-black text-amber-400">{mainGoal.progress}%</p>
                                </div>
                                <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden border border-white/5">
                                    <div
                                        className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                                        style={{ width: `${mainGoal.progress}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mt-8">
                            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-col justify-center">
                                <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest mb-1">{t('current_pace')}</p>
                                <p className="text-lg font-black text-white">{mainGoal.currentPace}</p>
                            </div>
                            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-col justify-center">
                                <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest mb-1">{t('target_pace')}</p>
                                <p className="text-lg font-black text-amber-400">{mainGoal.targetPace}</p>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* LEVEL 2: THE PERFORMANCE (Compliance & Distribution) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="bg-slate-900 border-slate-800 shadow-xl p-1">
                    <CardHeader
                        title={t('weekly_compliance')}
                        subtitle={t('weekly_compliance_desc')}
                        icon={<Activity className="text-emerald-400" size={20} />}
                        action={<InfoTooltip text={t('info_weekly_compliance')} action={t('action_weekly_compliance')} />}
                    />
                    <div className="p-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-2xl">
                            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{t('distance')}</p>
                            <p className="text-xl font-black text-white mt-1">{weeklyStats.distance}</p>
                        </div>
                        <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-2xl">
                            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{t('duration')}</p>
                            <p className="text-xl font-black text-white mt-1">{Math.floor(weeklyStats.duration / 60)}h {weeklyStats.duration % 60}m</p>
                        </div>
                        <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-2xl">
                            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{t('sessions')}</p>
                            <p className="text-xl font-black text-white mt-1">{weeklyStats.sessions.completed}/{weeklyStats.sessions.planned}</p>
                        </div>
                        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                            <p className="text-[9px] text-emerald-500 font-black uppercase tracking-widest">{t('compliance')}</p>
                            <p className="text-xl font-black text-emerald-400 mt-1">94%</p>
                        </div>
                    </div>
                </Card>

                <Card className="bg-slate-900 border-slate-800 shadow-xl p-1">
                    <CardHeader
                        title={t('time_distribution')}
                        subtitle={t('time_distribution_desc')}
                        icon={<PieChart className="text-pink-400" size={20} />}
                        action={<InfoTooltip text={t('info_time_distribution')} action={t('action_time_distribution')} />}
                    />
                    <div className="p-6">
                        <div className="grid grid-cols-5 gap-2 mb-4">
                            {trainingZones.map((zone, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="h-12 w-full bg-slate-950 rounded-xl flex flex-col items-center justify-center border border-white/5 relative group/zone">
                                        <div className="absolute inset-x-0 bottom-0 h-1 rounded-full transition-all" style={{ backgroundColor: zone.color, width: `${zone.percentage}%`, margin: '0 auto' }}></div>
                                        <span className="text-[10px] font-black text-white">{zone.zone}</span>
                                        <span className="text-[8px] text-slate-500 font-bold">{zone.percentage}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-3 bg-slate-950/50 border border-slate-800 rounded-xl flex items-center justify-between">
                            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{t('polarized_training_index')}</p>
                            <span className="text-[10px] font-black text-emerald-400">78% {t('optimal')}</span>
                        </div>
                    </div>
                </Card>
            </div>

            {/* LEVEL 2.5: PROGRESSION ANALYTICS */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative">
                {/* Evolution Chart */}
                <Card className={cn(
                    "lg:col-span-8 bg-slate-900 border-slate-800 shadow-xl group transition-all"
                )}>
                    <CardHeader
                        title={t('progress_chart_title')}
                        subtitle={t('progress_evolution_desc')}
                        icon={<TrendingUp className="text-cyan-400" size={20} />}
                        action={<InfoTooltip text={t('info_performance_metrics')} action={t('action_performance_metrics')} />}
                    />

                    {!hasConnectedDevice ? (
                        <div className="h-[300px] flex flex-col items-center justify-center p-12 text-center space-y-4">
                            <Watch size={48} className="text-slate-700 animate-pulse" />
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">
                                {t('no_data_connected')}
                            </p>
                            <button
                                onClick={() => navigate('/integrations')}
                                className="px-6 py-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[9px] font-black uppercase rounded-xl hover:bg-indigo-500/20 transition-all"
                            >
                                {t('connect_device_btn')}
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="h-[300px] w-full mt-4 px-2">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={macroCycleData}>
                                        <defs>
                                            <linearGradient id="colorFitness" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2} />
                                                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                        <XAxis dataKey="name" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                                        <YAxis hide />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '16px' }}
                                            itemStyle={{ fontSize: '10px', fontWeight: 'bold' }}
                                        />
                                        <Area
                                            type="monotone" dataKey="actual"
                                            stroke="#06b6d4" strokeWidth={4}
                                            fill="url(#colorFitness)"
                                            dot={{ fill: '#06b6d4', strokeWidth: 2, r: 4, stroke: '#0f172a' }}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="grid grid-cols-4 gap-1 p-6 border-t border-slate-800 bg-slate-950/30">
                                {[
                                    { label: t('kpi_fitness'), value: '64', color: 'text-cyan-400', icon: TrendingUp },
                                    { label: t('kpi_fatigue'), value: '42', color: 'text-rose-400', icon: Cloud },
                                    { label: t('kpi_form'), value: '+22', color: 'text-emerald-400', icon: Zap },
                                    { label: t('kpi_vo2max'), value: '54.2', color: 'text-white', icon: Wind }
                                ].map((stat, i) => (
                                    <div key={i} className="text-center">
                                        <p className="text-[8px] text-slate-500 font-black uppercase tracking-tighter mb-1">{stat.label}</p>
                                        <p className={cn("text-lg font-black", stat.color)}>{stat.value}</p>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </Card>

                {/* Personal Records Benchmarks */}
                <Card className="lg:col-span-4 bg-slate-900 border-slate-800 shadow-xl overflow-visible">
                    <CardHeader
                        title={t('personal_records')}
                        subtitle={t('current_vs_best')}
                        icon={<Award className="text-amber-400" size={20} />}
                    />
                    <div className="p-6 space-y-6">
                        {personalRecords.map((record, i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex justify-between items-end">
                                    <div className="flex items-center gap-1">
                                        <p className="text-[10px] font-black text-white uppercase tracking-tight">{record.label}</p>
                                        {record.help && <InfoTooltip text={record.help} />}
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[8px] text-slate-500 font-bold uppercase mr-2">{t('best')}: {record.best}</span>
                                        <span className="text-xs font-black text-amber-400">{record.current}</span>
                                    </div>
                                </div>
                                <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-white/5">
                                    <div
                                        className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full"
                                        style={{ width: `${record.progress}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                        <div className="mt-8 pt-6 border-t border-slate-800/50">
                            <div className="flex items-start gap-3 bg-indigo-500/5 p-4 rounded-2xl border border-indigo-500/10">
                                <BrainCircuit className="text-indigo-400 shrink-0" size={18} />
                                <p className="text-[9px] text-slate-400 font-medium leading-relaxed uppercase">
                                    {t('fitness_level_desc')}
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* LEVEL 3 ACTION CONTENT REMOVED (Moved to Top) */}

            {/* LEVEL 4: THE ECOSYSTEM (Bottom Priority) */}
            <div className="pt-6 border-t border-slate-800/50">
                <div className="flex items-center gap-3 mb-8">
                    <Box size={20} className="text-slate-700" />
                    <h3 className="text-xs font-black text-slate-600 uppercase tracking-[0.3em]">{t('connected_ecosystem')}</h3>
                    <div className="flex-1 h-[1px] bg-slate-800/50"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Recovery Diagnostic */}
                    <Card className="bg-slate-900/40 border-slate-800 p-8 flex flex-col items-center justify-center text-center group hover:bg-slate-900/60 transition-all">
                        <Heart className="text-rose-500/40 group-hover:text-rose-500 mb-6 transition-colors" size={48} />
                        <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-2">{t('physiological_readiness')}</h4>
                        <p className="text-[10px] text-slate-600 font-bold uppercase leading-relaxed max-w-[200px]">
                            {hasConnectedDevice
                                ? t('pulse_monitoring_active')
                                : t('no_biometric_data')}
                        </p>
                    </Card>

                    {/* Device Management */}
                    <Card className="bg-slate-900/40 border-slate-800 p-8 flex flex-col items-center justify-center text-center group hover:bg-slate-900/60 transition-all">
                        <Watch className="text-indigo-500/40 group-hover:text-indigo-500 mb-6 transition-colors" size={48} />
                        <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-2">{t('devices_active')}</h4>
                        <button className="mt-4 px-6 py-2 bg-slate-800 hover:bg-slate-700 text-[10px] font-black uppercase tracking-widest text-white rounded-xl transition-all border border-white/5">
                            {t('manage_sync')}
                        </button>
                    </Card>

                    {/* Insights & Achievements */}
                    <Card className="bg-slate-900/40 border-slate-800 p-8 flex flex-col items-center justify-center text-center group hover:bg-slate-900/60 transition-all">
                        <Award className="text-amber-500/40 group-hover:text-amber-500 mb-6 transition-colors" size={48} />
                        <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-2">{t('achievements')}</h4>
                        <div className="flex gap-2">
                            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-600 group-hover:text-amber-500 transition-colors">
                                <Zap size={16} />
                            </div>
                            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-600 group-hover:text-rose-500 transition-colors">
                                <Flame size={16} />
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
            {/* Plan Selection Overlay */}
            {showPlanSelector && (
                <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
                    <Card className="max-w-4xl w-full bg-slate-900 p-8 md:p-12 rounded-[3rem] shadow-2xl relative">
                        <PlanSelector
                            coach={coachesList[0]} // Using Oscar Moreno as demo
                            onSelect={(plan: any) => {
                                setShowPlanSelector(false);
                                // Simulate Payment
                                setTimeout(() => {
                                    setShowPaymentSuccess(true);
                                    setActivePlan(plan);
                                }, 500);
                            }}
                            onCancel={() => setShowPlanSelector(false)}
                        />
                    </Card>
                </div>
            )}

            {/* Payment Success Modal */}
            {showPaymentSuccess && (
                <div className="fixed inset-0 z-[110] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4">
                    <Card className="max-w-md w-full bg-slate-900 p-12 rounded-[3rem] shadow-2xl text-center animate-in zoom-in duration-500">
                        <div className="w-20 h-20 bg-emerald-500 rounded-3xl flex items-center justify-center text-slate-950 mx-auto mb-8 shadow-2xl shadow-emerald-500/20">
                            <ShieldCheck size={40} />
                        </div>
                        <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">{t('payment_success')}</h2>
                        <p className="text-slate-400 mb-8 text-sm font-bold uppercase tracking-widest leading-relaxed">
                            {t('plan_active_with').replace('{name}', coachesList[0]?.name || 'Coach')}
                        </p>
                        <button
                            onClick={() => setShowPaymentSuccess(false)}
                            className="w-full py-4 bg-emerald-500 text-slate-950 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/10"
                        >
                            {t('start_training')}
                        </button>
                    </Card>
                </div>
            )}
            {/* Plan Selector Modal handled below */}

            {/* Modals are handled above */}

            {/* Free Consultation Modal */}
            {showFreeConsultation && (
                <FreeConsultationModal
                    onClose={() => setShowFreeConsultation(false)}
                    onSuccess={() => {
                        setShowFreeConsultation(false);
                        alert(t('request_sent_title') || 'Request Sent!');
                    }}
                />
            )}

            {/* Session Detail Modal */}
            {selectedSession && (
                <SessionDetailModal
                    session={selectedSession}
                    onClose={() => setSelectedSession(null)}
                />
            )}
        </div>
    );
}
