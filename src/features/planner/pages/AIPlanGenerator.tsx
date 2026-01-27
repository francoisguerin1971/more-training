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
import { useLanguage } from '@/shared/context/LanguageContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { addDays, format, startOfToday } from 'date-fns';
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
    const [generatedPlan, setGeneratedPlan] = useState(null);
    const [editableSessions, setEditableSessions] = useState([]);
    const [messageToAthlete, setMessageToAthlete] = useState('');
    const [synthesis, setSynthesis] = useState(null);
    const [recommendations, setRecommendations] = useState(null);
    const [rationale, setRationale] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);

    // Get real athletes for this coach
    const athletes = React.useMemo(() => getAthletesForCoach(currentUser.id), [currentUser.id, getAthletesForCoach]);

    // Pre-fill data when athlete is selected
    React.useEffect(() => {
        if (selectedAthletes.length === 1) {
            const athlete = athletes.find(a => a.id === selectedAthletes[0]);
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
            const totalWeeks = parseInt(data.periodization.deadlineValue) || 12; // Simplified logic for manual
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
            setEditableSessions([]); // Start clean
            setStep(3);
        } else {
            // AI Mode
            generateAIPlan();
        }
    };

    const generateAIPlan = () => {
        setIsGenerating(true);
        const EXERCISE_LIBRARY = getExerciseLibrary(); // Use localized library with t()

        setTimeout(() => {
            // Generate Rationale FIRST (must be declared before use in synthesisData)
            const rationaleText = `Ce plan est construit sur une approche de périodisation ${periodization.intensity === 'intensive' ? 'bloc par bloc' : 'linéaire progressive'}. 
                L'objectif est d'optimiser le volume en ${sportObjectives.primarySport} tout en intégrant du renforcement spécifique pour prévenir les blessures liées à l'augmentation de la charge. 
                Nous favorisons ${periodization.loadPreference === 'aggressive' ? 'une montée rapide en charge' : 'une adaptation physiologique durable'} avec des fenêtres de récupération toutes les 4 semaines (cycles de Deload).`;
            setRationale(rationaleText);

            // Generate Synthesis (now rationaleText is available)
            const synthesisData = {
                athlete: athleteData ?
                    `${athleteData.athlete.name}, ${biometrics.age} ${t('years_suffix') || 'ans'}, ${biometrics.gender === 'male' ? t('gender_male') : t('gender_female')}, ${biometrics.weight}kg, ${biometrics.height}cm` :
                    `${t('default_athlete_name')} ${biometrics.age} ${t('years_suffix') || 'ans'}, ${biometrics.weight}kg`,
                objectives: `${sportObjectives.objective} ${t('in_sport')} ${sportObjectives.primarySport}${sportObjectives.targetEvent ? ` - ${sportObjectives.targetEvent}` : ''} (${t('anamnesis_level')}: ${sportObjectives.level})`,
                availability: `${availability.days.length} ${t('days_per_week') || 'jours/semaine'} (${availability.days.join(', ')})${Object.keys(availability.timePerDay).length > 0 ? `, ${t('variable_time_per_day') || 'temps variable par jour'}` : ''}`,
                constraints: healthRecovery.injuries || t('no_injuries_reported'),
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
            if (sportObjectives.crossTraining.length > 0) {
                recs.push({
                    type: 'training',
                    priority: 'low',
                    title: 'Sports Croisés Intégrés',
                    message: `${sportObjectives.crossTraining.join(', ')} seront intégrés pour optimiser la performance globale.`,
                    action: "Varier les stimuli d'entraînement"
                });
            }

            // Check recovery preferences
            if (healthRecovery.recoveryPreferences.length > 0) {
                recs.push({
                    type: 'info',
                    priority: 'low',
                    title: t('recovery_protocols_title'),
                    message: `${t('preferences_prefix')}: ${healthRecovery.recoveryPreferences.join(', ')}`,
                    action: t('plan_after_intensive')
                });
            }

            setRecommendations(recs);

            // Calculate total weeks based on deadline
            let totalWeeks = 4;
            if (periodization.deadlineType === 'months') {
                totalWeeks = parseInt(periodization.deadlineValue) * 4;
            } else if (periodization.deadlineType === 'weeks') {
                totalWeeks = parseInt(periodization.deadlineValue);
            } else if (periodization.deadlineType === 'days') {
                totalWeeks = Math.ceil(parseInt(periodization.deadlineValue) / 7);
            } else if (periodization.deadlineType === 'years') {
                totalWeeks = parseInt(periodization.deadlineValue) * 52;
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

                    if (availability.days.includes(dayName) || availability.days.length === 0) {
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
                            exercises.push({ ...EXERCISE_LIBRARY.strength[0], sets: 3, reps: 15 });
                            exercises.push({ ...EXERCISE_LIBRARY.strength[2], sets: 3, duration: '45s' });
                        }

                        // Check equipment availability for specific targets
                        const hasWatch = equipment.available.includes('Montre GPS');
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
                    objective: sportObjectives.objective,
                    level: sportObjectives.level,
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



    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
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
                <div className="space-y-6">
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight">1. Sélection des Athlètes</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {athletes.map(athlete => (
                            <Card
                                key={athlete.id}
                                onClick={() => toggleAthlete(athlete.id)}
                                className={cn(
                                    "cursor-pointer transition-all border-2 active:scale-95",
                                    selectedAthletes.includes(athlete.id) ? "border-emerald-500 bg-emerald-500/5 shadow-2xl shadow-emerald-500/10" : "border-slate-800 hover:border-slate-700 bg-slate-900/50"
                                )}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center font-black text-white">
                                        {athlete.avatar}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white uppercase">{athlete.name}</h4>
                                        <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">ID: {athlete.id}</span>
                                    </div>
                                    {selectedAthletes.includes(athlete.id) && <CheckCircle2 className="ml-auto text-emerald-500" />}
                                </div>
                            </Card>
                        ))}
                    </div>
                    <div className="flex justify-end">
                        <button
                            onClick={() => setStep(2)}
                            disabled={selectedAthletes.length === 0}
                            className="px-8 py-3 bg-white text-slate-950 font-black rounded-xl uppercase tracking-widest hover:scale-105 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            Commencer l'Anamnese
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
                                                Assigné à: {plan.athleteIds.map(id => athletes.find(a => a.id === id)?.name).join(', ')} • {plan.meta.total_weeks} Semaines
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right hidden md:block">
                                                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Créé le</p>
                                                <p className="text-xs text-slate-400 font-bold">{format(new Date(plan.createdAt), 'dd MMMM yyyy')}</p>
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
                <div className="space-y-12 animate-in zoom-in-95 duration-700">
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
                                        {generatedPlan.chartData.filter(d => d.isDeload).map((d, i) => (
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
