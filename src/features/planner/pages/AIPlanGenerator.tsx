import React, { useState } from 'react';
import { Card, CardHeader } from '@/shared/components/ui/Card';
import {
    BrainCircuit, Activity, Calendar, History, Save, Sparkles,
    Users, ChevronRight, LayoutGrid, List, CheckCircle2,
    Dumbbell, Timer, Flame, Map, Box, HeartPulse, Stethoscope,
    Scale, Ruler, Trophy, BookOpen, Youtube, AlertTriangle, Play, Send, Trash2
} from 'lucide-react';
import { InfoTooltip } from '@/shared/components/ui/InfoTooltip';
import { useTraining } from '@/features/planner/contexts/TrainingContext';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { useMessages } from '@/shared/context/MessageContext';
import { useNavigate } from 'react-router-dom';
import { SessionDetailProps } from '../components/SessionDetailCard';
import { useLanguage } from '@/shared/context/LanguageContext';
import { addDays, startOfToday, getDay, format, parse } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { cn } from '@/shared/lib/utils';
import { ExerciseSketch } from '../components/ExerciseSketch';
import { CoachSynthesis } from '../components/CoachSynthesis';
import { PlanEditor } from '../components/PlanEditor';
import {
    PlanAnamnesis,
    Biometrics,
    SportObjectives,
    Availability,
    Periodization,
    Equipment,
    HealthRecovery,
    CoachPreferences
} from '../components/PlanAnamnesis';
import { EliteTrainingReport, mockReportData } from '../components/EliteTrainingReport';
import { ExerciseSketchService } from '@/shared/services/ExerciseSketchService';
import { translations } from '@/core/services/translations';

/* EXERCISE_LIBRARY moved inside component */



export function AIPlanGenerator() {
    const { plans, savePlan, deletePlan } = useTraining();
    const { currentUser, getAthletesForCoach, getAthleteTrainingHistory, getAthleteStats } = useAuthStore();
    const { sendMessage } = useMessages();
    const { t, language } = useLanguage();

    // Localized Exercise Library
    const getExerciseLibrary = () => ({
        running: [
            { name: "Sprint VMA", cues: [], tips: "" }, // Placeholder, use keys actually
            { name: t('exercise_sprint_vma'), cues: ['Attaque médio-pied'], tips: 'Visez une cadence élevée' },
            { name: t('exercise_endurance_fondamentale') || "Endurance Fondamentale", cues: [], tips: '' },
            { name: t('exercise_threshold'), cues: [], tips: '' }
        ],
        strength: [
            { name: t('exercise_squat'), cues: [], tips: '' },
            { name: t('exercise_lunge'), cues: [], tips: '' },
            { name: t('exercise_plank'), cues: [], tips: '' }
        ],
        recovery: [
            { name: t('active_recovery_yoga'), cues: [], tips: '' },
            { name: t('exercise_stretching'), cues: [], tips: '' }
        ]
    });

    // Step State: 1: Athletes, 2-8: Enhanced Anamnesis, 9: Generation
    const [step, setStep] = useState(1);
    const [subStep, setSubStep] = useState(1); // 7 sub-steps for enhanced questionnaire

    // Form State - Elite Inputs
    const [selectedAthletes, setSelectedAthletes] = useState<string[]>([]);
    const [athleteData, setAthleteData] = useState<any>(null); // Pre-filled data

    // Enhanced Anamnesis Data (7 steps)
    const [biometrics, setBiometrics] = useState<Biometrics>({ age: '', weight: '', height: '', gender: 'male' });
    const [sportObjectives, setSportObjectives] = useState<SportObjectives>({
        primarySport: 'Running',
        crossTraining: [],
        objective: 'Competition',
        level: 'Intermédiaire',
        targetEvent: '',
        otherSport: '',
        otherCrossTraining: ''
    });
    const [availability, setAvailability] = useState<Availability>({
        days: [],
        timePerDay: {}, // { 'Lun': 60, 'Mer': 90, ... }
        preferredTime: 'morning' // morning, noon, evening, flexible
    });
    const [periodization, setPeriodization] = useState<Periodization>({
        deadlineType: 'months', // date, days, weeks, months, years
        deadlineValue: '4',
        deadlineDate: null,
        intensity: 'progressive', // progressive, moderate, intensive
        loadPreference: 'balanced' // aggressive, balanced, conservative
    });
    const [equipment, setEquipment] = useState<Equipment>({
        available: [],
        gymAccess: false,
        poolAccess: false,
        trackAccess: false,
        environment: 'mixed',
        otherEquipment: ''
    });
    const [healthRecovery, setHealthRecovery] = useState<HealthRecovery>({
        injuries: '',
        sleepQuality: 'good',
        hrvStatus: 'stable',
        recoveryPreferences: [],
        nutritionConstraints: '',
        otherRecovery: ''
    });
    const [coachPreferences, setCoachPreferences] = useState<CoachPreferences>({
        coachStyle: '',
        reportType: 'pure-ai', // coach-style, ai-enhanced, pure-ai
        customFormulas: ''
    });

    // Loading & Result State
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedPlan, setGeneratedPlan] = useState<any>(null);
    const [editableSessions, setEditableSessions] = useState<any[]>([]);
    const [messageToAthlete, setMessageToAthlete] = useState('');
    const [synthesis, setSynthesis] = useState<any>(null);
    const [recommendations, setRecommendations] = useState<any[]>([]);
    const [rationale, setRationale] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [useEliteView, setUseEliteView] = useState(true); // Default to Elite View

    // Get real athletes for this coach (async fetch)
    const [athletes, setAthletes] = useState<any[]>([]);
    const [loadingAthletes, setLoadingAthletes] = useState(true);

    React.useEffect(() => {
        if (currentUser?.id) {
            setLoadingAthletes(true);
            getAthletesForCoach(currentUser.id).then(data => {
                if (Array.isArray(data)) setAthletes(data);
                setLoadingAthletes(false);
            });
        }
    }, [currentUser?.id, getAthletesForCoach]);

    // Pre-fill data when athlete is selected
    React.useEffect(() => {
        if (selectedAthletes.length === 1 && athletes.length > 0) {
            const athlete = athletes.find((a: any) => a.id === selectedAthletes[0]);
            if (athlete?.profile) {
                // Pre-fill biometrics
                setBiometrics({
                    age: athlete.profile.age || '',
                    weight: athlete.profile.weight || '',
                    height: athlete.profile.height || '',
                    gender: athlete.profile.gender || 'male'
                });

                // Pre-fill sport objectives
                setSportObjectives(prev => ({
                    ...prev,
                    primarySport: athlete.profile.coaching || 'Running',
                    objective: athlete.profile.goal || 'Competition'
                }));

                // Get historical data
                const history = getAthleteTrainingHistory(athlete.id);
                const stats = getAthleteStats(athlete.id);
                setAthleteData({ athlete, history, stats });
            }
        }
    }, [selectedAthletes, athletes]);

    // Convert generated plan to EliteTrainingReport format
    const buildEliteReportData = () => {
        if (!generatedPlan) return null;

        const selectedAthlete = athletes.find(a => selectedAthletes.includes(a.id));
        const totalWeeks = generatedPlan.meta?.total_weeks || parseInt(periodization.deadlineValue) || 12;

        // Build macrocycle phases from chartData
        const phases = [];
        let baseWeeks = 0, buildWeeks = 0, peakWeeks = 0, raceWeeks = 0;

        // Estimate phase distribution (typical periodization)
        if (totalWeeks <= 8) {
            baseWeeks = 2; buildWeeks = 3; peakWeeks = 2; raceWeeks = 1;
        } else if (totalWeeks <= 12) {
            baseWeeks = 3; buildWeeks = 5; peakWeeks = 3; raceWeeks = 1;
        } else {
            baseWeeks = 4; buildWeeks = 6; peakWeeks = 4; raceWeeks = 2;
        }

        phases.push({ name: t('phase_base') || 'Base', duration: baseWeeks, color: 'bg-sky-500', description: t('phase_base_desc') || 'Construction aérobie' });
        phases.push({ name: t('phase_build') || 'Build', duration: buildWeeks, color: 'bg-amber-500', description: t('phase_build_desc') || 'Montée en charge' });
        phases.push({ name: t('phase_peak') || 'Peak', duration: peakWeeks, color: 'bg-rose-500', description: t('phase_peak_desc') || 'Affûtage' });
        phases.push({ name: t('phase_race') || 'Race', duration: raceWeeks, color: 'bg-emerald-500', description: t('phase_race_desc') || 'Compétition' });

        // Build weeks from chartData
        const weekData = (generatedPlan.chartData || []).map((d: { week: string; load: number; isDeload?: boolean }, idx: number) => {
            let currentPhase: 'base' | 'build' | 'peak' | 'race' | 'recovery' = 'base';
            if (idx < baseWeeks) currentPhase = 'base';
            else if (idx < baseWeeks + buildWeeks) currentPhase = 'build';
            else if (idx < baseWeeks + buildWeeks + peakWeeks) currentPhase = 'peak';
            else currentPhase = 'race';

            return {
                weekNumber: idx + 1,
                phase: currentPhase,
                weekType: (d.isDeload ? 'recovery' : (d.load > 75 ? 'overload' : 'normal')) as 'normal' | 'overload' | 'recovery',
                volumeHours: Math.round((d.load / 100) * (availability.timePerDay[availability.days[0]] || 60) * availability.days.length / 60 * 10) / 10 || 6,
                intensity: d.load > 80 ? 'very-high' : d.load > 60 ? 'high' : d.load > 40 ? 'moderate' : 'low' as 'low' | 'moderate' | 'high' | 'very-high',
                focusSession: d.isDeload ? t('recovery_session') || 'Récupération' : (idx % 3 === 0 ? t('tempo_run') || 'Tempo' : t('long_run') || 'Sortie longue'),
                tssTarget: Math.round(d.load * 5 + 100)
            };
        });

        // Build nutri recommendations based on health/sport objectives
        const nutriRecs = [
            { type: 'pre' as const, timing: t('timing_pre_training') || '3h avant', recommendation: t('nutri_pre_rec') || 'Glucides complexes + protéines légères', products: ['Flocons avoine', 'Banane', 'Œufs'], priority: 'essential' as const },
            { type: 'during' as const, timing: t('timing_during') || 'Pendant > 90min', recommendation: t('nutri_during_rec') || 'Apport glucidique 60-90g/h', products: ['Gel', 'Boisson isotonique'], priority: 'essential' as const },
            { type: 'post' as const, timing: t('timing_post') || '30min après', recommendation: t('nutri_post_rec') || 'Ratio 3:1 glucides/protéines', products: ['Shake protéiné', 'Fruits'], priority: 'recommended' as const },
            { type: 'daily' as const, timing: t('timing_daily') || 'Quotidien', recommendation: t('nutri_daily_rec') || 'Hydratation 40ml/kg', priority: 'essential' as const }
        ];

        // Build medical alerts based on healthRecovery data
        const medAlerts = [];
        if (healthRecovery.injuries) {
            medAlerts.push({
                severity: 'critical' as const,
                category: t('alert_category_injury') || 'Blessure',
                message: healthRecovery.injuries,
                action: t('alert_action_monitor') || 'Surveiller et adapter la charge',
                triageLevel: 'red' as const,
                source: 'system' as const
            });
        }
        if (healthRecovery.sleepQuality === 'poor' || healthRecovery.sleepQuality === 'average') {
            medAlerts.push({
                severity: 'warning' as const,
                category: t('alert_category_sleep') || 'Sommeil',
                message: t('alert_sleep_message') || 'Qualité de sommeil sous-optimale détectée',
                action: t('alert_sleep_action') || 'Privilégier 8h minimum',
                triageLevel: 'orange' as const,
                source: 'system' as const
            });
        }
        medAlerts.push({
            severity: 'info' as const,
            category: t('alert_category_overtraining') || 'Prévention',
            message: t('alert_overtraining_message') || 'Surveiller les signes de surentraînement lors des semaines de surcharge',
            action: t('alert_overtraining_action') || 'Réduire de 20% si fatigue > 3 jours',
            triageLevel: 'green' as const,
            source: 'system' as const
        });

        // Build recovery protocols based on healthRecovery data (Phase A)
        const recoveryProtocols = [];

        // Sleep protocol (always added)
        const targetSleepHours = healthRecovery.sleepQuality === 'poor' ? 9 : healthRecovery.sleepQuality === 'average' ? 8.5 : 8;
        recoveryProtocols.push({
            type: 'sleep' as const,
            timing: t('sleep_timing') || 'Coucher: 22h30 - Réveil: 6h30',
            duration: targetSleepHours * 60,
            priority: 'essential' as const,
            phase: 'daily' as const,
            description: t('sleep_description') || 'Maintenir un rythme circadien régulier. Chambre à 18°C, pas d\'écran 1h avant.',
            targetHours: targetSleepHours
        });

        // Post-intensity recovery protocols
        recoveryProtocols.push({
            type: 'stretching' as const,
            timing: t('stretching_timing') || '2h après la séance',
            duration: 15,
            priority: 'essential' as const,
            phase: 'post-intensity' as const,
            description: t('stretching_description') || 'Étirements statiques des membres inférieurs (30s par groupe musculaire).'
        });

        if (sportObjectives.primarySport === 'Running' || sportObjectives.primarySport === 'Trail') {
            recoveryProtocols.push({
                type: 'ice_bath' as const,
                timing: t('ice_bath_timing') || 'Dans les 30min post-entraînement intensif',
                duration: 10,
                priority: 'recommended' as const,
                phase: 'post-intensity' as const,
                description: t('ice_bath_description') || 'Immersion eau froide (10-15°C) pour réduire l\'inflammation musculaire.'
            });
        }

        recoveryProtocols.push({
            type: 'compression' as const,
            timing: t('compression_timing') || 'Soir après séance longue',
            duration: 30,
            priority: 'recommended' as const,
            phase: 'post-intensity' as const,
            description: t('compression_description') || 'Port de manchons de compression pour favoriser le retour veineux.'
        });

        // Rest day protocols
        recoveryProtocols.push({
            type: 'massage' as const,
            timing: t('massage_timing') || 'Jour de repos',
            duration: 45,
            priority: 'recommended' as const,
            phase: 'rest-day' as const,
            description: t('massage_description') || 'Massage sportif pour dénouer les tensions et améliorer la récupération.'
        });

        // Pre-competition
        if (sportObjectives.objective === 'Competition' || sportObjectives.targetEvent) {
            recoveryProtocols.push({
                type: 'hydration' as const,
                timing: t('hydration_timing') || 'J-2 à J-1',
                duration: 0,
                priority: 'essential' as const,
                phase: 'pre-competition' as const,
                description: t('hydration_description') || 'Hyperhydratation progressive (3L/jour) avec électrolytes.'
            });
        }

        // Build weekly schedule from availability
        const weeklySchedule: Record<string, { activity: string; duration: number }> = {};
        const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
        const slugToName: Record<string, string> = { mon: 'Lun', tue: 'Mar', wed: 'Mer', thu: 'Jeu', fri: 'Fri', sat: 'Sam', sun: 'Dim' };

        dayNames.forEach(day => {
            const slug = Object.entries(slugToName).find(([, v]) => v === day)?.[0] || '';
            if (availability.days.includes(slug)) {
                weeklySchedule[day] = {
                    activity: day === 'Sam' ? 'Sortie Longue' : 'Entraînement',
                    duration: availability.timePerDay[slug] || 60
                };
            } else {
                weeklySchedule[day] = { activity: 'Repos', duration: 0 };
            }

        });

        // Phase C: Generate Detailed Sessions
        const detailedSessions: SessionDetailProps[] = [];
        Object.entries(weeklySchedule).forEach(([day, session], index) => {
            if (session.activity !== 'Repos' && session.duration > 0) {
                const isLongRun = session.activity === 'Sortie Longue';
                const isInterval = session.activity.includes('Intensité') || session.activity.includes('VMA');

                let details: SessionDetailProps = {
                    title: session.activity,
                    type: isLongRun ? 'Endurance' : isInterval ? 'Intervalle' : 'Aérobie',
                    duration: session.duration,
                    tss: Math.round(session.duration * (isInterval ? 1 : 0.7)),
                    intensity: isInterval ? 'high' : isLongRun ? 'moderate' : 'low',
                    warmup: {
                        type: 'warmup',
                        duration: isInterval ? 20 : 15,
                        description: isInterval
                            ? 'Protocole Élite : Activation Cardiovasculaire & Neuromusculaire'
                            : 'Activation Progressive & Mobilisation Articulaire',
                        exercises: isInterval ? [
                            { name: 'Jogging progressif (Zone 1 → 2)', duration: '10 min', notes: 'RPE 2-3/10', sketchUrl: ExerciseSketchService.getSketchForExercise('run_base', 'running') },
                            { name: 'Mobilité dynamique', duration: '5 min', notes: 'Hanches, chevilles, bassin', sketchUrl: ExerciseSketchService.getSketchForExercise('mobility_base', 'warmup') },
                            { name: 'Gammes: Montées de genoux', duration: '2x 30m', sketchUrl: ExerciseSketchService.getSketchForExercise('run_drills_knees', 'running') },
                            { name: 'Gammes: Talons fesses', duration: '2x 30m', sketchUrl: ExerciseSketchService.getSketchForExercise('run_drills_knees', 'running') },
                            { name: 'Accélérations (Strides)', duration: '3x 80m', notes: 'Progressif jusqu\'à 90% VMA', sketchUrl: ExerciseSketchService.getSketchForExercise('run_vma_short', 'running') }
                        ] : [
                            { name: 'Mobilisation articulaire', duration: '5 min', notes: 'Routine complète tête aux pieds', sketchUrl: ExerciseSketchService.getSketchForExercise('mobility_base', 'warmup') },
                            { name: 'Footing d\'activation', duration: '10 min', notes: 'Zone 1 (60-70% FCM) / RPE 2', sketchUrl: ExerciseSketchService.getSketchForExercise('run_base', 'running') }
                        ]
                    },
                    mainSet: [],
                    cooldown: {
                        type: 'cooldown',
                        duration: 10,
                        description: 'Retour au calme & Parasympathique',
                        exercises: [
                            { name: 'Footing très lent', duration: '5 min', notes: 'Zone 1 bas / RPE 1', sketchUrl: ExerciseSketchService.getSketchForExercise('run_base', 'running') },
                            { name: 'Étirements passifs', duration: '5 min', notes: 'Pas de douleur, relâchement total', sketchUrl: ExerciseSketchService.getSketchForExercise('mobility_base', 'recovery') }
                        ]
                    },
                    coachNotes: isLongRun
                        ? 'Objectif Macrocycle : Développement de l\'endurance lipidique. Maintenez une aisance respiratoire totale (Zone 2). Ne dépassez pas 75% FCM. La régularité prévaut sur la vitesse.'
                        : isInterval
                            ? 'Objectif Macrocycle : Développement de la PMA/VMA. Concentration maximale sur la technique malgré la fatigue. La dernière répétition doit être courue à la même allure que la première.'
                            : 'Objectif : Assimilation & Récupération active. Restez strictement en Zone 1 (<70% FCM) pour favoriser le flux sanguin sans créer de fatigue additionnelle.'
                };

                // Helper to calculate date
                const getNextDateForDay = (dayName: string): Date => {
                    const today = startOfToday();
                    const currentDayIndex = getDay(today); // 0 = Sun, 1 = Mon...

                    const dayMap: Record<string, number> = {
                        'dimanche': 0, 'lundi': 1, 'mardi': 2, 'mercredi': 3,
                        'jeudi': 4, 'vendredi': 5, 'samedi': 6,
                        'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3,
                        'thursday': 4, 'friday': 5, 'saturday': 6
                    };

                    const targetDayIndex = dayMap[dayName.toLowerCase()];
                    if (targetDayIndex === undefined) return today;

                    let daysToAdd = targetDayIndex - currentDayIndex;
                    if (daysToAdd < 0) daysToAdd += 7; // If day passed, move to next week

                    return addDays(today, daysToAdd);
                };

                const sessionDate = getNextDateForDay(day);
                details.id = crypto.randomUUID();
                details.date = format(sessionDate, 'EEEE d MMMM', { locale: fr });
                // @ts-ignore
                details.rawDate = sessionDate; // For sorting

                // Generate specific main set based on type
                if (isInterval) {
                    details.mainSet = [
                        {
                            type: 'main',
                            duration: session.duration - 30, // minus warmup/cooldown
                            description: 'Blocs VMA à haute intensité (Zone 5 / RPE 9-10)',
                            intensity: 'high',
                            exercises: [
                                { name: 'Série 1: 10x 30/30', duration: '10 min', notes: '30s VMA (100-105%) / 30s Trot', sketchUrl: ExerciseSketchService.getSketchForExercise('run_vma_short', 'running') },
                                { name: 'Récupération Inter-série', duration: '3 min', notes: 'Trot lent + Hydratation' },
                                { name: 'Série 2: 10x 30/30', duration: '10 min', notes: 'Maintien de l\'allure cible', sketchUrl: ExerciseSketchService.getSketchForExercise('run_vma_short', 'running') }
                            ]
                        }
                    ];
                } else if (isLongRun) {
                    details.mainSet = [
                        {
                            type: 'main',
                            duration: session.duration - 25,
                            description: 'Volume Aérobie & Variations d\'allure (Zone 2-3)',
                            intensity: 'moderate',
                            exercises: [
                                { name: 'Endurance de base', duration: '45 min', notes: 'Zone 2 (65-75% FCM) / RPE 3-4', sketchUrl: ExerciseSketchService.getSketchForExercise('run_base', 'running') },
                                { name: 'Variation d\'allure (Optionnel)', duration: '20 min', notes: 'Passages en Zone 3 (Marathon Pace) si sensation bonne', sketchUrl: ExerciseSketchService.getSketchForExercise('run_tempo', 'running') },
                                { name: 'Retour au calme actif', duration: 'End of run', notes: 'Retour Zone 1' }
                            ]
                        }
                    ];
                } else {
                    details.mainSet = [
                        {
                            type: 'main',
                            duration: session.duration - 20,
                            description: 'Endurance Fondamentale & Oxygénation',
                            intensity: 'low',
                            exercises: [
                                { name: 'Footing continu', duration: `${session.duration - 20} min`, notes: 'Zone 1-2 (<75% FCM) / RPE 2-3. Aisance respiratoire totale.', sketchUrl: ExerciseSketchService.getSketchForExercise('run_base', 'running') }
                            ]
                        }
                    ];
                }

                detailedSessions.push(details);
            }
        });

        // Sort sessions by date (nearest first)
        detailedSessions.sort((a, b) => {
            // @ts-ignore
            return (a.rawDate as Date).getTime() - (b.rawDate as Date).getTime();
        });

        return {
            athleteName: selectedAthlete?.name || t('default_athlete_name') || 'Athlète',
            athletePhoto: selectedAthlete?.photoUrl,
            eventName: sportObjectives.targetEvent || t('general_training') || 'Préparation Générale',
            eventDate: periodization.deadlineDate ? new Date(periodization.deadlineDate).toLocaleDateString() : t('to_define') || 'À définir',
            generatedDate: new Date().toISOString(),
            coachStyle: coachPreferences.coachStyle || 'Directif',
            planSummary: {
                totalWeeks,
                hoursPerWeek: Math.round(Object.values(availability.timePerDay).reduce((a, b) => a + b, 0) / 60 * 10) / 10 || 6,
                sessionsPerWeek: availability.days.length,
                keyWorkouts: recommendations.slice(0, 5).map((r: any) => (typeof r === 'string' ? r : r.title) || r) || [
                    t('key_workout_long') || 'Sortie longue progressive',
                    t('key_workout_tempo') || 'Tempo Run Zone 3',
                    t('key_workout_intervals') || 'Intervalles',
                    t('key_workout_recovery') || 'Récupération active'
                ]
            },
            macrocycle: {
                totalWeeks,
                phases,
                weeks: weekData.length > 0 ? weekData : mockReportData.macrocycle.weeks.slice(0, totalWeeks)
            },
            nutriRecommendations: nutriRecs,
            medicalAlerts: medAlerts,

            recoveryProtocols,
            detailedSessions,
            weeklySchedule
        };
    };

    const toggleAthlete = (id: string) => {
        setSelectedAthletes(prev =>
            prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
        );
    };

    // Helper functions moved to PlanAnamnesis component


    const handleAnamnesisComplete = (data: {
        biometrics: Biometrics;
        sportObjectives: SportObjectives;
        availability: Availability;
        periodization: Periodization;
        equipment: Equipment;
        healthRecovery: HealthRecovery;
        coachPreferences: CoachPreferences;
    }) => {
        // Update state for display purposes
        setBiometrics(data.biometrics);
        setSportObjectives(data.sportObjectives);
        setAvailability(data.availability);
        setPeriodization(data.periodization);
        setEquipment(data.equipment);
        setHealthRecovery(data.healthRecovery);
        setCoachPreferences(data.coachPreferences);

        // Logic split based on mode
        if (data.coachPreferences.reportType === 'manual') {
            // Manual Mode: Skip AI generation, go straight to Editor with empty/template session structure
            const totalWeeks = parseInt(data.periodization.deadlineValue) || 12;
            setGeneratedPlan({
                chartData: [],
                sessions: [],
                meta: {
                    objective: data.sportObjectives.objective,
                    level: data.sportObjectives.level,
                    total_weeks: totalWeeks,
                    synthesis: null,
                    recommendations: [],
                    rationale: "Plan créé manuellement en Studio Expert."
                }
            });
            setEditableSessions([]);
            setStep(3);
        } else {
            // AI Mode - Pass data directly to avoid async state issues
            generateAIPlan(data);
        }
    };

    const generateAIPlan = (data: {
        biometrics: Biometrics;
        sportObjectives: SportObjectives;
        availability: Availability;
        periodization: Periodization;
        equipment: Equipment;
        healthRecovery: HealthRecovery;
        coachPreferences: CoachPreferences;
    }) => {
        setIsGenerating(true);
        const EXERCISE_LIBRARY = getExerciseLibrary();

        setTimeout(() => {
            // Use data from parameter, not state (to avoid async issues)
            const { biometrics: bio, sportObjectives: sport, availability: avail, periodization: period, equipment: equip, healthRecovery: health, coachPreferences: prefs } = data;

            // Generate Rationale FIRST
            const rationaleText = `Ce plan est construit sur une approche de périodisation ${period.intensity === 'intensive' ? 'bloc par bloc' : 'linéaire progressive'}. 
                L'objectif est d'optimiser le volume en ${sport.primarySport} tout en intégrant du renforcement spécifique pour prévenir les blessures liées à l'augmentation de la charge. 
                Nous favorisons ${period.loadPreference === 'aggressive' ? 'une montée rapide en charge' : 'une adaptation physiologique durable'} avec des fenêtres de récupération toutes les 4 semaines (cycles de Deload).`;
            setRationale(rationaleText);

            // Generate Synthesis
            const synthesisData = {
                athlete: athleteData ?
                    `${athleteData.athlete.name}, ${bio.age} ${t('years_suffix') || 'ans'}, ${bio.gender === 'male' ? t('gender_male') : t('gender_female')}, ${bio.weight}kg, ${bio.height}cm` :
                    `${t('default_athlete_name')} ${bio.age} ${t('years_suffix') || 'ans'}, ${bio.weight}kg`,
                objectives: `${sport.objective} ${t('in_sport')} ${sport.primarySport}${sport.targetEvent ? ` - ${sport.targetEvent}` : ''} (${t('anamnesis_level')}: ${sport.level})`,
                availability: `${avail.days.length} ${t('days_per_week') || 'jours/semaine'} (${avail.days.join(', ')})${Object.keys(avail.timePerDay).length > 0 ? `, ${t('variable_time_per_day') || 'temps variable par jour'}` : ''}`,
                constraints: health.injuries || t('no_injuries_reported'),
                rationale: rationaleText
            };
            setSynthesis(synthesisData);

            // Generate Recommendations
            const recs = [];

            // Check athlete stats if available
            if (athleteData?.stats) {
                if (athleteData.stats.fatigueLevel > 35) {
                    recs.push({
                        type: 'warning',
                        priority: 'high',
                        title: 'Niveau de Fatigue Élevé',
                        message: `Fatigue détectée à ${athleteData.stats.fatigueLevel}%. Privilégier la récupération en début de plan.`,
                        action: 'Intégrer une semaine de deload en semaine 1'
                    });
                }
                if (athleteData.stats.injuryRisk > 25) {
                    recs.push({
                        type: 'health',
                        priority: 'medium',
                        title: 'Risque de Blessure Modéré',
                        message: 'Renforcement musculaire et prévention recommandés.',
                        action: 'Ajouter 2 séances de renforcement/semaine'
                    });
                }
            }

            // Check cross-training
            if (sport.crossTraining.length > 0) {
                recs.push({
                    type: 'training',
                    priority: 'low',
                    title: 'Sports Croisés Intégrés',
                    message: `${sport.crossTraining.join(', ')} seront intégrés pour optimiser la performance globale.`,
                    action: "Varier les stimuli d'entraînement"
                });
            }

            // Check recovery preferences
            if (health.recoveryPreferences.length > 0) {
                recs.push({
                    type: 'info',
                    priority: 'low',
                    title: t('recovery_protocols_title'),
                    message: `${t('preferences_prefix')}: ${health.recoveryPreferences.join(', ')}`,
                    action: t('plan_after_intensive')
                });
            }

            setRecommendations(recs);

            // Calculate total weeks based on deadline
            let totalWeeks = 4;
            if (period.deadlineType === 'months') {
                totalWeeks = parseInt(period.deadlineValue) * 4;
            } else if (period.deadlineType === 'weeks') {
                totalWeeks = parseInt(period.deadlineValue);
            } else if (period.deadlineType === 'days') {
                totalWeeks = Math.ceil(parseInt(period.deadlineValue) / 7);
            } else if (period.deadlineType === 'years') {
                totalWeeks = parseInt(period.deadlineValue) * 52;
            }

            const startDate = startOfToday();
            const chartData = [];
            const dailySessions = [];

            let currentMesocycle = 1;

            const visualPrompts = [
                "Homme athlétique, squat bulgare, posture parfaite",
                "Femme, posture guerrier II yoga, stabilité",
                "Homme, fractionné sur piste, attaque medio-pied",
                "Femme, gainage dynamique, mountain climbers",
                "Athlète, étirements chaînes postérieures"
            ];

            for (let w = 0; w < totalWeeks; w++) {
                const isDeload = (w + 1) % 4 === 0;
                const phase = isDeload ? t('active_recovery_deload') : `${t('development_phase')} ${currentMesocycle}`;
                if (isDeload) currentMesocycle++;

                const baseLoad = isDeload ? 40 : 60 + (w * 5);

                chartData.push({
                    week: `S${w + 1}`,
                    load: baseLoad,
                    phase: phase,
                    isDeload
                });

                const weeklyMedal = isDeload ? 'Bronze' : (w % 2 === 0 ? 'Argent' : 'Or');
                const daysMap = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

                for (let d = 0; d < 7; d++) {
                    const date = addDays(startDate, (w * 7) + d);
                    const dayName = daysMap[date.getDay()];

                    if (avail.days.includes(dayName) || avail.days.length === 0) {
                        let type = t('exercise_endurance_fondamentale') || 'Endurance Fondamentale';
                        let visual = visualPrompts[2];
                        let details = {};
                        let exercises = [];

                        if (isDeload) {
                            type = t('active_recovery_yoga');
                            visual = visualPrompts[1];
                            details = {
                                warmup: t('warmup_mobility_soft'),
                                main: t('yoga_flow_warrior'),
                                cooldown: t('guided_meditation'),
                                tech_focus: t('nasal_breathing_only')
                            };
                            exercises = [
                                { ...EXERCISE_LIBRARY.recovery[0], sets: 1, duration: `45 ${t('minutes_suffix') || 'min'}` },
                                { ...EXERCISE_LIBRARY.recovery[1], sets: 1, duration: `15 ${t('minutes_suffix') || 'min'}` }
                            ];
                        } else {
                            if (d % 3 === 0) {
                                type = t('short_vma_power');
                                visual = visualPrompts[2];
                                details = {
                                    warmup: t('warmup_run_drills'),
                                    main: t('intermittent_vma'),
                                    cooldown: t('cooldown_breathing'),
                                    tech_focus: t('tech_focus_sprint')
                                };
                                exercises = [
                                    { ...EXERCISE_LIBRARY.running[0], sets: 10, reps: 1, duration: '30s' },
                                    { ...EXERCISE_LIBRARY.running[0], sets: 10, reps: 1, duration: '30s', notes: t('second_set') }
                                ];
                            }
                            else if (d % 3 === 1) {
                                type = t('seuil_tempo');
                                visual = visualPrompts[0];
                                details = {
                                    warmup: t('warmup_threshold'),
                                    main: t('main_threshold'),
                                    cooldown: t('cooldown_easy'),
                                    tech_focus: t('tech_focus_cadence')
                                };
                                exercises = [
                                    { ...EXERCISE_LIBRARY.running[2], sets: 3, duration: '10 min' }
                                ];
                            } else {
                                type = t('endurance_fondamentale');
                                visual = visualPrompts[4];
                                details = {
                                    warmup: t('warmup_very_slow'),
                                    main: t('main_endurance'),
                                    cooldown: t('no_cooldown_required'),
                                    tech_focus: t('tech_focus_economy')
                                };
                                exercises = [
                                    { ...EXERCISE_LIBRARY.running[1], sets: 1, duration: '90 min' }
                                ];
                            }
                        }

                        // Add reinforcement exercises if recommended
                        if (recs.some(r => r.type === 'health') && !isDeload) {
                            exercises.push({ ...EXERCISE_LIBRARY.strength[0], sets: 3, reps: 15, duration: '15 min', cues: [], tips: '' });
                            exercises.push({ ...EXERCISE_LIBRARY.strength[2], sets: 3, duration: '45s', cues: [], tips: '', reps: 0 });
                        }

                        // Check equipment availability for specific targets
                        const hasWatch = equip.available.includes('Montre GPS');
                        const intensity = hasWatch
                            ? `${t('target_pace')}: ${type.includes('VMA') ? 'Pace < 3:45/km' : 'FC < 145bpm'}`
                            : `${t('sensation_vma')}: ${type.includes('VMA') ? t('sensation_vma') : t('sensation_easy')}`;

                        dailySessions.push({
                            id: Math.random().toString(36).substr(2, 9),
                            date: date,
                            title: type,
                            medal: weeklyMedal,
                            details: details,
                            intensity: intensity,
                            visual: visual,
                            resources: {
                                article: t('understanding_anaerobic'),
                                video: t('running_tech_video')
                            },
                            exercises: exercises
                        });
                    }
                }
            }

            setGeneratedPlan({
                chartData,
                sessions: dailySessions,
                meta: {
                    objective: sport.objective,
                    level: sport.level,
                    total_weeks: totalWeeks,
                    synthesis: synthesisData,
                    recommendations: recs,
                    rationale: rationaleText
                }
            });
            setEditableSessions(dailySessions);
            setIsGenerating(false);
            setStep(3);
        }, 2500);
    };

    const handleApplyPlan = () => {
        if (!currentUser) return;

        const planData = {
            ...generatedPlan,
            sessions: editableSessions,
            synthesis: synthesis,
            recommendations: recommendations,
            coachStyle: coachPreferences.coachStyle,
            reportType: coachPreferences.reportType,
            status: 'draft'
        };

        savePlan(currentUser.id, selectedAthletes, planData);

        // Notify athletes
        if (messageToAthlete) {
            selectedAthletes.forEach(athleteId => {
                sendMessage(athleteId, messageToAthlete);
            });
        }

        setShowSuccess(true);
        setStep(1);
        setSelectedAthletes([]);
        setGeneratedPlan(null);
        setMessageToAthlete('');

        // Hide success message after 5 seconds
        setTimeout(() => setShowSuccess(false), 5000);
    };



    if (!currentUser) return null;

    if (loadingAthletes && step === 1) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in duration-500">
                <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest animate-pulse">
                    Synchronisation des rosters...
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex items-center gap-6 border-b border-slate-800 pb-8">
                <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/20 text-slate-950 shrink-0">
                    <BrainCircuit size={32} strokeWidth={2.5} />
                </div>
                <div>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-1">Elite Performance <span className="text-emerald-500">Architect</span></h1>
                    <p className="text-slate-400 font-medium text-sm">Algorithme de coaching de haut niveau • v3.0 Pro</p>
                </div>
            </div>

            {step === 1 && (
                <div className="space-y-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-black text-white uppercase tracking-tight">{t('planner_step1_title') || '1. Sélection des Athlètes'}</h2>
                            <p className="text-slate-400 text-sm font-medium mt-1">{t('planner_step1_subtitle') || 'Sélectionnez un ou plusieurs athlètes pour créer leur plan personnalisé'}</p>
                        </div>
                        <div className="text-sm font-bold text-emerald-500">
                            {selectedAthletes.length > 0 && `${selectedAthletes.length} ${t('selected') || 'sélectionné(s)'}`}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {athletes.map(athlete => {
                            const isSelected = selectedAthletes.includes(athlete.id);
                            const daysToGoal = athlete.nextRaceDate
                                ? Math.ceil((new Date(athlete.nextRaceDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                                : null;

                            // Generate sparkline path for load chart
                            const graphWidth = 100;
                            const graphHeight = 24;
                            const actualLoad = athlete.actualLoad || Array.from({ length: 10 }, (_, i) => ({ x: i, y: 50 + Math.random() * 50 }));
                            const maxY = Math.max(...actualLoad.map((d: any) => d.y), 1);
                            const loadPath = actualLoad.map((d: any, i: number) =>
                                `${i === 0 ? 'M' : 'L'} ${(d.x / 9) * graphWidth} ${graphHeight - (d.y / maxY) * graphHeight}`
                            ).join(' ');

                            return (
                                <Card
                                    key={athlete.id}
                                    onClick={() => toggleAthlete(athlete.id)}
                                    className={cn(
                                        "cursor-pointer transition-all border-2 active:scale-[0.98] group relative overflow-hidden",
                                        isSelected
                                            ? "border-emerald-500 bg-gradient-to-br from-emerald-500/5 to-emerald-500/0 shadow-2xl shadow-emerald-500/20"
                                            : "border-slate-800 hover:border-slate-700 bg-slate-900/50"
                                    )}
                                >
                                    {/* Selection Indicator */}
                                    <div className={cn(
                                        "absolute top-3 right-3 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all z-10",
                                        isSelected
                                            ? "border-emerald-500 bg-emerald-500 text-slate-950"
                                            : "border-slate-700 bg-slate-900/50 group-hover:border-emerald-500/50"
                                    )}>
                                        <CheckCircle2 size={14} strokeWidth={3} className={isSelected ? "opacity-100" : "opacity-0"} />
                                    </div>

                                    {/* Header with Photo */}
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="relative">
                                            <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center font-black text-xl text-white shadow-lg border border-slate-700 overflow-hidden">
                                                {athlete.avatar_url ? (
                                                    <img src={athlete.avatar_url} alt={athlete.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span>{athlete.avatar || athlete.name?.[0]?.toUpperCase()}</span>
                                                )}
                                            </div>
                                            {/* Health Status Indicator */}
                                            <div className={cn(
                                                "absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-slate-950 flex items-center justify-center",
                                                athlete.healthStatus === 'injured' ? "bg-rose-500" :
                                                    athlete.healthStatus === 'tired' ? "bg-amber-500" : "bg-emerald-500"
                                            )} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-black text-lg text-white uppercase tracking-tight truncate group-hover:text-emerald-400 transition-colors">
                                                {athlete.name}
                                            </h4>
                                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                {/* Sport/Goal Badge */}
                                                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest bg-slate-800/50 px-2 py-0.5 rounded truncate max-w-[120px]">
                                                    {athlete.profile?.coaching || athlete.planType || 'Running'}
                                                </span>
                                                {/* Days to Goal Badge */}
                                                {daysToGoal !== null && daysToGoal > 0 && (
                                                    <div className="flex items-center gap-1 bg-slate-800 px-1.5 py-0.5 rounded text-[9px] font-black text-emerald-400 uppercase tracking-wider">
                                                        <Timer size={10} />
                                                        J-{daysToGoal}
                                                    </div>
                                                )}
                                            </div>
                                            {/* Next Event */}
                                            {athlete.nextRaceName && (
                                                <p className="text-[10px] text-slate-500 font-medium mt-1 truncate">
                                                    🎯 {athlete.nextRaceName}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Load Sparkline Chart */}
                                    <div className="mb-4 opacity-70 group-hover:opacity-100 transition-opacity">
                                        <div className="h-6 w-full relative border-b border-l border-slate-800/50 bg-slate-900/20 rounded-bl-sm overflow-hidden">
                                            <svg viewBox={`0 0 ${graphWidth} ${graphHeight}`} className="w-full h-full">
                                                <path
                                                    d={loadPath}
                                                    fill="none"
                                                    stroke="#10b981"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        </div>
                                        <p className="text-[8px] text-slate-600 font-bold uppercase tracking-wider mt-1 text-center">
                                            {t('training_load_trend') || 'Tendance charge'}
                                        </p>
                                    </div>

                                    {/* Performance Metrics Grid */}
                                    <div className="grid grid-cols-3 gap-2 py-3 border-t border-slate-800/50 bg-slate-900/30 rounded-b-xl -mx-6 -mb-6 px-4">
                                        <div className="text-center">
                                            <div className="flex items-center justify-center gap-1 mb-1 text-slate-500">
                                                <Activity size={10} />
                                                <span className="text-[8px] font-bold uppercase">{t('compliance') || 'Adhé.'}</span>
                                            </div>
                                            <span className={cn(
                                                "text-sm font-black",
                                                (athlete.compliance || 0) > 80 ? "text-white" : "text-amber-500"
                                            )}>{athlete.compliance || 75}%</span>
                                        </div>
                                        <div className="text-center border-l border-r border-slate-800/50">
                                            <div className="flex items-center justify-center gap-1 mb-1 text-slate-500">
                                                <Trophy size={10} />
                                                <span className="text-[8px] font-bold uppercase">{t('fit_score') || 'FitScore'}</span>
                                            </div>
                                            <span className="text-sm font-black text-emerald-400">{athlete.fitScore || 78}</span>
                                        </div>
                                        <div className="text-center">
                                            <div className="flex items-center justify-center gap-1 mb-1 text-slate-500">
                                                <HeartPulse size={10} />
                                                <span className="text-[8px] font-bold uppercase">{t('status') || 'État'}</span>
                                            </div>
                                            <span className={cn(
                                                "text-[10px] font-black uppercase",
                                                athlete.healthStatus === 'injured' ? "text-rose-400" :
                                                    athlete.healthStatus === 'tired' ? "text-amber-400" : "text-emerald-400"
                                            )}>
                                                {athlete.healthStatus === 'injured' ? (t('status_injured') || '🩹 Blessé') :
                                                    athlete.healthStatus === 'tired' ? (t('status_tired') || '😴 Fatigué') : (t('status_ok') || '✅ OK')}
                                            </span>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>

                    {/* Empty State */}
                    {athletes.length === 0 && (
                        <div className="text-center py-16 bg-slate-900/30 border-2 border-dashed border-slate-800 rounded-[32px]">
                            <Users className="mx-auto mb-4 text-slate-700" size={48} />
                            <h4 className="text-xl font-black text-slate-500 uppercase">{t('no_athletes_found') || 'Aucun athlète trouvé'}</h4>
                            <p className="text-slate-600 font-medium mt-2">{t('invite_athletes_first') || 'Invitez des athlètes depuis le tableau de bord'}</p>
                        </div>
                    )}

                    {/* Action Button */}
                    <div className="flex justify-end pt-4">
                        <button
                            onClick={() => setStep(2)}
                            disabled={selectedAthletes.length === 0}
                            className="group px-10 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-slate-950 font-black rounded-2xl uppercase tracking-widest hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-3"
                        >
                            <Sparkles size={20} className="group-hover:animate-pulse" />
                            {t('start_evaluation') || '🎯 Lancer l\'Évaluation'}
                            <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>

                    {/* Active Plans Section */}
                    {plans.filter(p => p.status === 'active').length > 0 && (
                        <div className="pt-12 space-y-6">
                            <div className="flex items-center gap-3">
                                <History className="text-emerald-500" size={24} />
                                <h2 className="text-2xl font-black text-white uppercase tracking-tight">Plans Actifs</h2>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                {plans.filter(p => p.status === 'active').map(plan => (
                                    <div key={plan.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-slate-700 transition-all">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-3">
                                                <h3 className="font-bold text-white uppercase">{plan.meta.objective}</h3>
                                                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-black rounded-full uppercase border border-emerald-500/20">
                                                    {plan.meta.level}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-500 font-medium">
                                                Assigné à: {plan.athleteIds?.map(id => athletes.find(a => a.id === id)?.name).join(', ') || 'Aucun'} • {plan.meta.total_weeks} Semaines
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right hidden md:block">
                                                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Créé le</p>
                                                <p className="text-xs text-slate-400 font-bold">{format(new Date(plan.createdAt || new Date()), 'dd MMMM yyyy')}</p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    if (confirm('Voulez-vous vraiment annuler ce plan ? Toutes les sessions associées seront supprimées.')) {
                                                        deletePlan(plan.id);
                                                    }
                                                }}
                                                className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all border border-red-500/20"
                                                title="Annuler le Plan"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {step === 2 && (
                <PlanAnamnesis
                    onBack={() => setStep(1)}
                    onComplete={handleAnamnesisComplete}
                    initialData={{
                        biometrics,
                        sportObjectives,
                        availability,
                        periodization,
                        equipment,
                        healthRecovery,
                        coachPreferences
                    }}
                />
            )}

            {step === 3 && generatedPlan && (
                <div className="space-y-6 animate-in zoom-in-95 duration-700">
                    {/* View Toggle */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                                {t('generated_plan_title') || 'Plan Généré'}
                            </h2>
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/30">
                                {coachPreferences.reportType === 'manual' ? 'STUDIO' : 'I.A.'}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 bg-slate-900/50 p-1 rounded-xl border border-slate-800/50">
                            <button
                                onClick={() => setUseEliteView(true)}
                                className={cn(
                                    "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all",
                                    useEliteView ? "bg-indigo-500 text-white" : "text-slate-500 hover:text-white"
                                )}
                            >
                                {t('elite_view') || 'Vue Élite'}
                            </button>
                            <button
                                onClick={() => setUseEliteView(false)}
                                className={cn(
                                    "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all",
                                    !useEliteView ? "bg-slate-700 text-white" : "text-slate-500 hover:text-white"
                                )}
                            >
                                {t('classic_view') || 'Vue Classique'}
                            </button>
                        </div>
                    </div>

                    {/* Elite Report View */}
                    {useEliteView && buildEliteReportData() && (
                        <EliteTrainingReport
                            data={buildEliteReportData()!}
                            onBack={() => setStep(2)}
                            onExport={() => console.log('Export PDF')}
                            onApplyPlan={handleApplyPlan}
                        />
                    )}

                    {/* Classic View */}
                    {!useEliteView && (
                        <>
                            {/* Synthesis & Recommendations */}
                            <CoachSynthesis
                                synthesis={synthesis}
                                recommendations={recommendations}
                                coachStyle={coachPreferences.coachStyle}
                                reportType={coachPreferences.reportType}
                            />

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <Card className="lg:col-span-2 bg-slate-900 border-slate-800">
                                    <CardHeader title="Structure du Macrocycle" subtitle={`${generatedPlan.meta.total_weeks} Semaines • ${generatedPlan.meta.objective}`} icon={<Activity className="text-emerald-400" />} />
                                    <div className="h-[300px] mt-6 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={generatedPlan.chartData}>
                                                <defs>
                                                    <linearGradient id="loadGrad" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                                <XAxis dataKey="week" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                                                <YAxis hide />
                                                <Tooltip
                                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                                                    itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                                                />
                                                <Area type="monotone" dataKey="load" stroke="#10b981" strokeWidth={3} fill="url(#loadGrad)" />
                                                {generatedPlan.chartData.filter((d: { isDeload?: boolean }) => d.isDeload).map((d: { week: string }, i: number) => (
                                                    <ReferenceLine key={i} x={d.week} stroke="#6366f1" strokeDasharray="3 3" label={{ position: 'top', value: 'DELOAD', fill: '#6366f1', fontSize: 10, fontWeight: 'bold' }} />
                                                ))}
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </Card>

                                <Card className="bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800">
                                    <div className="p-8 flex flex-col items-center justify-center text-center h-full space-y-6">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-emerald-500 blur-[60px] opacity-20 rounded-full"></div>
                                            <Trophy size={64} className="text-yellow-400 relative z-10 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Objectif {sportObjectives.level === 'Élite' ? 'Platine' : 'Or'}</h3>
                                            <p className="text-slate-400 text-xs font-medium mt-2 leading-relaxed">
                                                Ce plan est conçu pour atteindre le niveau "{sportObjectives.level === 'Élite' ? 'Platine' : 'Or'}" sur l'échelle de l'Elite.
                                                Complétion requise: 95%.
                                            </p>
                                        </div>
                                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                                            <div className="w-[0%] h-full bg-yellow-400 animate-[width_1s_ease-out_forwards]" style={{ width: '95%' }}></div>
                                        </div>
                                    </div>
                                </Card>
                            </div>

                            {/* Plan Editor Integration */}
                            <div className="space-y-6">
                                <PlanEditor
                                    sessions={editableSessions}
                                    onUpdate={(id, updates) => setEditableSessions(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s))}
                                    onDelete={(id) => setEditableSessions(prev => prev.filter(s => s.id !== id))}
                                    onInsert={() => {
                                        const newSession = {
                                            id: Math.random().toString(36).substr(2, 9),
                                            date: new Date(),
                                            title: "Nouvelle Séance",
                                            details: { warmup: "", main: "", cooldown: "" },
                                            intensity: "À définir",
                                            exercises: []
                                        };
                                        setEditableSessions(prev => [...prev, newSession]);
                                    }}
                                />
                            </div>

                            <div className="flex justify-end pt-12">
                                <button
                                    onClick={handleApplyPlan}
                                    disabled={selectedAthletes.length === 0}
                                    className="px-12 py-6 bg-white text-slate-950 font-black rounded-2xl uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-2xl flex items-center gap-4 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Save size={24} />
                                    Valider et Assigner le Plan
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}
            {showSuccess && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-10 fade-in duration-500">
                    <div className="bg-emerald-600 text-slate-950 px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-emerald-400/20">
                        <div className="bg-white/20 p-2 rounded-xl">
                            <CheckCircle2 size={24} />
                        </div>
                        <div>
                            <p className="font-black uppercase tracking-tight">Plan Assigné avec Succès</p>
                            <p className="text-[10px] font-bold uppercase opacity-80">Les athlètes ont été notifiés de leur nouveau programme.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
