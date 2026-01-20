import React, { useState } from 'react';
import { Card } from '@/shared/components/ui/Card';
import {
    startOfWeek, addDays, format, isSameDay,
    startOfMonth, endOfMonth, eachDayOfInterval,
    startOfQuarter, endOfQuarter,
    startOfYear, endOfYear, addMinutes
} from 'date-fns';
import { fr, es, ca, enUS } from 'date-fns/locale';
import { useLanguage } from '@/shared/context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { useTraining } from '@/features/planner/contexts/TrainingContext';
import { useAuthStore } from '@/features/auth/stores/authStore';
import {
    ChevronLeft, ChevronRight, Activity, Zap,
    Sparkles, LayoutGrid, List, TrendingUp, Moon, Clock,
    X, Video, MapPin, Calendar as CalendarIcon, User,
    Plus, Check, CheckCircle2, MessageSquare, Brain, FileEdit, CreditCard,
    Search, Filter, ChevronDown, Shield, ShieldAlert, Eye, EyeOff,
    Sun, Cloud, CloudRain, CloudLightning
} from 'lucide-react';
import { isWithinInterval } from 'date-fns';
import { cn } from '@/shared/lib/utils';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

export function CoachCalendar() {
    const navigate = useNavigate();
    const { language, t } = useLanguage();
    const { workouts: contextWorkouts, addWorkout, addPersonalEvent } = useTraining();
    const { currentUser, getAthletesForCoach } = useAuthStore();

    const locales: Record<string, any> = { fr, es, ca, en: enUS };
    const currentLocale = locales[language] || enUS;

    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState('week'); // 'week', 'month', 'quarter', 'year'
    const [athletes, setAthletes] = useState<any[]>([]);
    const [selectedAthleteForProposal, setSelectedAthleteForProposal] = useState<any>(null);
    const [selectedDayForProposal, setSelectedDayForProposal] = useState<Date | null>(null);
    const [showProposalModal, setShowProposalModal] = useState(false);
    const [proposalType, setProposalType] = useState<'workout' | 'rdv'>('workout');
    const [proposalFormat, setProposalFormat] = useState<'physical' | 'virtual'>('physical');

    const [workouts, setWorkouts] = useState<any[]>([]);

    const [selectedClub, setSelectedClub] = useState<string>('all');
    const [selectedAthletes, setSelectedAthletes] = useState<string[]>([]);
    const [clubSearch, setClubSearch] = useState("");
    const [isClubMenuOpen, setIsClubMenuOpen] = useState(false);

    const clubs = [
        { id: 'all', label: t('planner_filter_all') },
        { id: 'tri_paris', label: t('club_tri_paris') },
        { id: 'trail_ventoux', label: t('club_trail_ventoux') },
        { id: 'vtt_provence', label: 'VTT Provence Club' },
        { id: 'lyon_run', label: 'Lyon Running Squad' },
        { id: 'nice_tri', label: 'Nice Triathlon Team' },
        { id: 'bordeaux_trail', label: 'Bordeaux Trail Association' },
        // ... simulate more for scale testing
        ...Array.from({ length: 45 }).map((_, i) => ({
            id: `club-${i}`,
            label: `Club de Performance ${i + 1}`
        }))
    ];

    const filteredClubs = clubs.filter(c =>
        c.label.toLowerCase().includes(clubSearch.toLowerCase())
    );

    React.useEffect(() => {
        const loadCoachData = async () => {
            if (!currentUser) return;

            const fetchedAthletes = await getAthletesForCoach(currentUser.id);

            // DEMO MODE: If no data or demo user, inject examples
            if (fetchedAthletes.length === 0 || currentUser.id === 'demo-pro-id') {
                const demoAthletes = [
                    {
                        id: 'demo-ath-1',
                        name: 'Thomas Durand',
                        avatar: 'TD',
                        avatar_url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&h=100&fit=crop',
                        clubId: 'tri_paris',
                        profile: { goal: 'Marathon de Paris' }
                    },
                    {
                        id: 'demo-ath-2',
                        name: 'Sarah Lefebvre',
                        avatar: 'SL',
                        avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
                        clubId: 'trail_ventoux',
                        profile: {
                            goal: 'Trail du Mont Ventoux',
                            vacations: [{
                                id: 'vac-1',
                                start: addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 3).toISOString(),
                                end: addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 5).toISOString()
                            }],
                            availability: [
                                { date: addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 2).toISOString(), type: 'busy' }
                            ]
                        }
                    },
                    {
                        id: 'demo-ath-3',
                        name: 'Marc Simon',
                        avatar: 'MS',
                        avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
                        clubId: 'lyon_run',
                        profile: {
                            goal: 'Ironman Nice',
                            availability: [
                                { date: addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 4).toISOString(), type: 'busy' }
                            ]
                        }
                    },
                ];
                setAthletes(demoAthletes);

                // Inject Mock Workouts for the week
                const baseDay = startOfWeek(new Date(), { weekStartsOn: 1 });
                const demoWorkouts = [
                    {
                        id: 'w1',
                        athleteId: 'demo-ath-1',
                        coachId: currentUser.id,
                        date: addDays(baseDay, 0).toISOString(),
                        title: 'Endurance Fondamentale',
                        description: '45min à 70% FCM',
                        status: 'completed',
                        plannedLoad: 250
                    },
                    {
                        id: 'w2',
                        athleteId: 'demo-ath-1',
                        coachId: currentUser.id,
                        date: addDays(baseDay, 2).toISOString(),
                        title: 'Fractionné Court',
                        description: '10x 30/30 en côte',
                        status: 'planned',
                        plannedLoad: 450
                    },
                    {
                        id: 'w3',
                        athleteId: 'demo-ath-3',
                        coachId: currentUser.id,
                        date: addDays(baseDay, 1).toISOString(),
                        title: 'Renforcement Musculaire',
                        description: 'Circuit training corps complet',
                        status: 'PENDING_ACCEPTANCE',
                        plannedLoad: 180
                    }
                ];
                setWorkouts(demoWorkouts);
            } else {
                setAthletes(fetchedAthletes);
                // In real mode, we use the workouts from context
                setWorkouts(contextWorkouts);
            }
        };

        loadCoachData();
    }, [currentUser, getAthletesForCoach, contextWorkouts]);

    const filteredAthletes = athletes.filter(a =>
        selectedClub === 'all' || a.clubId === selectedClub
    );

    if (!currentUser) return null;

    // V4: Weather Simulation
    const getWeatherIcon = (date: Date) => {
        const day = date.getDate();
        if (day % 4 === 0) return <CloudRain size={10} className="text-indigo-400" />;
        if (day % 3 === 0) return <Cloud size={10} className="text-slate-400" />;
        if (day % 5 === 0) return <CloudLightning size={10} className="text-amber-400" />;
        return <Sun size={10} className="text-amber-400" />;
    };

    // V4: Data-Driven Compliance Logic
    const getComplianceLevel = (athleteId: string, plannedLoad: number, actualLoad?: number) => {
        if (!actualLoad) return 'pending';
        const ratio = actualLoad / plannedLoad;
        if (ratio >= 0.9 && ratio <= 1.1) return 'high';
        if (ratio >= 0.7) return 'moderate';
        return 'low';
    };

    const getRange = () => {
        switch (viewMode) {
            case 'week': return { start: startOfWeek(currentDate, { weekStartsOn: 1 }), end: addDays(startOfWeek(currentDate, { weekStartsOn: 1 }), 6) };
            case 'month': return { start: startOfMonth(currentDate), end: endOfMonth(currentDate) };
            case 'quarter': return { start: startOfQuarter(currentDate), end: endOfQuarter(currentDate) };
            case 'year': return { start: startOfYear(currentDate), end: endOfYear(currentDate) };
            default: return { start: startOfWeek(currentDate, { weekStartsOn: 1 }), end: addDays(startOfWeek(currentDate, { weekStartsOn: 1 }), 6) };
        }
    };

    const range = getRange();
    const days = eachDayOfInterval({
        start: startOfWeek(currentDate, { weekStartsOn: 1 }),
        end: addDays(startOfWeek(currentDate, { weekStartsOn: 1 }), 6)
    });

    // PMC Individual Load Curve Data (Fitness, Fatigue, Form)
    const loadCurveData = days.map((day, i) => {
        const fitness = 60 + Math.sin(i / 5) * 20 + Math.random() * 5;
        const fatigue = 40 + Math.cos(i / 5) * 30 + Math.random() * 10;
        return {
            name: format(day, 'MMM dd', { locale: currentLocale }),
            fitness: parseFloat(fitness.toFixed(1)),
            fatigue: parseFloat(fatigue.toFixed(1)),
            form: parseFloat((fitness - fatigue).toFixed(1))
        };
    });

    const toggleAthleteSelection = (id: string) => {
        setSelectedAthletes(prev =>
            prev.includes(id) ? prev.filter(aId => aId !== id) : [...prev, id]
        );
    };

    const toggleAllAthletes = () => {
        if (selectedAthletes.length === filteredAthletes.length && filteredAthletes.length > 0) {
            setSelectedAthletes([]);
        } else {
            setSelectedAthletes(filteredAthletes.map(a => a.id));
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <CalendarIcon size={24} />
                    </div>
                    <div>
                        <div>
                            <h1 className="text-3xl font-black text-white uppercase tracking-tighter">{t('smart_planner')}</h1>
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">{t('load_prediction_title')}</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Scalable Club Filter Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setIsClubMenuOpen(!isClubMenuOpen)}
                            className="flex items-center gap-2 bg-slate-900 px-4 py-2.5 rounded-xl border border-slate-800 hover:border-emerald-500/30 transition-all group"
                        >
                            <Filter size={14} className="text-slate-500 group-hover:text-emerald-400" />
                            <span className="text-[10px] font-black text-white uppercase tracking-widest min-w-[120px] text-left">
                                {clubs.find(c => c.id === selectedClub)?.label || "Sélectionner Club"}
                            </span>
                            <ChevronDown size={14} className={cn("text-slate-500 transition-transform", isClubMenuOpen && "rotate-180")} />
                        </button>

                        {isClubMenuOpen && (
                            <div className="absolute top-full mt-2 left-0 w-64 bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl z-[100] p-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="relative mb-2">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={12} />
                                    <input
                                        autoFocus
                                        type="text"
                                        placeholder={t('rechercher_club')}
                                        value={clubSearch}
                                        onChange={(e) => setClubSearch(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-8 pr-4 text-[10px] text-white focus:outline-none focus:border-emerald-500/50"
                                    />
                                </div>
                                <div className="max-h-60 overflow-y-auto custom-scrollbar">
                                    {filteredClubs.length > 0 ? filteredClubs.map(club => (
                                        <button
                                            key={club.id}
                                            onClick={() => {
                                                setSelectedClub(club.id);
                                                setIsClubMenuOpen(false);
                                            }}
                                            className={cn(
                                                "w-full text-left px-3 py-2 rounded-lg text-[9px] font-bold uppercase transition-all mb-1 last:mb-0",
                                                selectedClub === club.id
                                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                                            )}
                                        >
                                            {club.label}
                                        </button>
                                    )) : (
                                        <div className="py-4 text-center text-slate-500 text-[10px] uppercase font-bold">{t('no_club_found')}</div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
                        {['week', 'month', 'quarter', 'year'].map((mode) => (
                            <button
                                key={mode}
                                onClick={() => setViewMode(mode)}
                                className={cn(
                                    "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all",
                                    viewMode === mode ? "bg-emerald-500 text-slate-950 shadow-lg" : "text-slate-500 hover:text-white"
                                )}
                            >
                                {t(`view_${mode}`)}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-xl p-1">
                        <button
                            onClick={() => setCurrentDate(addDays(currentDate, viewMode === 'week' ? -7 : -30))}
                            className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <span className="px-4 text-[10px] font-black text-white uppercase tracking-widest min-w-[120px] text-center">
                            {format(range.start, 'MMM dd', { locale: currentLocale })} - {format(range.end, 'MMM dd, yyyy', { locale: currentLocale })}
                        </span>
                        <button
                            onClick={() => setCurrentDate(addDays(currentDate, viewMode === 'week' ? 7 : 30))}
                            className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Global Load Curve Overview */}
            <Card className="h-28 p-0 overflow-hidden relative border-emerald-500/10 bg-slate-900/40">
                <div className="absolute inset-0 z-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={loadCurveData}>
                            <Area type="monotone" dataKey="load" stroke="#10b981" fill="#10b981" fillOpacity={0.05} strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
                <div className="relative z-10 p-4 flex items-center justify-between pointer-events-none">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400 border border-emerald-500/20">
                            <TrendingUp size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">{t('load_prediction_title')}</p>
                            <h3 className="text-white font-bold uppercase tracking-tight">{t('periodization_trend')}</h3>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="text-right">
                            <p className="text-[10px] text-slate-500 font-bold uppercase">{t('kpi_average_load')}</p>
                            <p className="text-xl font-black text-white">452 AU</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-slate-500 font-bold uppercase">{t('kpi_planned_volume')}</p>
                            <p className="text-xl font-black text-emerald-400">{t('level_high')}</p>
                        </div>
                    </div>
                </div>
            </Card>

            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto scrollbar-hide">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md">
                                <th className="p-4 text-left min-w-[240px] sticky left-0 bg-slate-900 z-30">
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={toggleAllAthletes}
                                            className={cn(
                                                "w-5 h-5 rounded-md border flex items-center justify-center transition-all",
                                                selectedAthletes.length === filteredAthletes.length && filteredAthletes.length > 0
                                                    ? "bg-emerald-500 border-emerald-500 text-slate-950"
                                                    : "border-slate-800 hover:border-slate-600 bg-slate-900"
                                            )}
                                        >
                                            {selectedAthletes.length === filteredAthletes.length && filteredAthletes.length > 0 && <Check size={12} strokeWidth={4} />}
                                            {selectedAthletes.length > 0 && selectedAthletes.length < filteredAthletes.length && <div className="w-2 h-0.5 bg-emerald-500 rounded-full" />}
                                        </button>
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('athletes')}</span>
                                    </div>
                                </th>
                                {days.map((day, i) => {
                                    const isMonthStart = day.getDate() === 1;
                                    return (
                                        <th key={i} className="p-3 text-center border-l border-slate-800/50 min-w-[120px]">
                                            <div className="flex flex-col items-center gap-1">
                                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{format(day, 'EEE', { locale: currentLocale })}</span>
                                                <span className={cn(
                                                    "text-sm font-black w-8 h-8 flex items-center justify-center rounded-xl transition-all",
                                                    isSameDay(day, new Date()) ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20" : "text-white"
                                                )}>{format(day, 'd')}</span>
                                                <div className="mt-1 group/weather relative cursor-help">
                                                    {getWeatherIcon(day)}
                                                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-800 text-white text-[7px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-all uppercase tracking-widest whitespace-nowrap shadow-2xl z-50">
                                                        {t('weather_forecast')}
                                                    </span>
                                                </div>
                                            </div>
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAthletes.map((athlete: any) => (
                                <tr key={athlete.id} className={cn(
                                    "border-b border-slate-800/50 group hover:bg-slate-800/20 transition-all",
                                    selectedAthletes.includes(athlete.id) && "bg-emerald-500/5"
                                )}>
                                    <td className={cn(
                                        "p-4 sticky left-0 z-20 shadow-[4px_0_10px_rgba(0,0,0,0.3)] transition-colors",
                                        selectedAthletes.includes(athlete.id) ? "bg-slate-800" : "bg-slate-900"
                                    )}>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => toggleAthleteSelection(athlete.id)}
                                                className={cn(
                                                    "w-5 h-5 rounded-md border flex items-center justify-center transition-all flex-shrink-0",
                                                    selectedAthletes.includes(athlete.id)
                                                        ? "bg-emerald-500 border-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20"
                                                        : "border-slate-800 hover:border-slate-600 bg-slate-800"
                                                )}
                                            >
                                                {selectedAthletes.includes(athlete.id) && <Check size={12} strokeWidth={4} />}
                                            </button>
                                            <div className="relative flex-shrink-0">
                                                <div
                                                    className="w-10 h-10 rounded-xl overflow-hidden border-2 border-slate-800 shadow-xl cursor-pointer hover:border-emerald-500/50 transition-all"
                                                    onClick={() => toggleAthleteSelection(athlete.id)}
                                                >
                                                    {athlete.avatar_url ? (
                                                        <img src={athlete.avatar_url} alt={athlete.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full bg-slate-800 flex items-center justify-center text-xs font-black text-emerald-400">
                                                            {athlete.avatar}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-xs font-black text-white truncate uppercase tracking-tight">{athlete.name}</p>
                                                    <span className={cn(
                                                        "text-[7px] px-1.5 py-0.5 rounded-full font-black uppercase tracking-wider border",
                                                        athlete.id === '1' ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" :
                                                            athlete.id === '2' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                                                "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                                    )}>
                                                        {athlete.id === '1' ? t('phase_base') : athlete.id === '2' ? t('phase_build') : t('phase_peak')}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <div className="w-24 h-8 bg-slate-950/50 rounded-md border border-slate-800/50 overflow-hidden relative">
                                                        <ResponsiveContainer width="100%" height="100%">
                                                            <AreaChart data={loadCurveData.slice(0, 14)}>
                                                                <Area
                                                                    type="monotone"
                                                                    dataKey="fitness"
                                                                    stroke="#10b981"
                                                                    fill="#10b981"
                                                                    fillOpacity={0.1}
                                                                    strokeWidth={1.5}
                                                                />
                                                                <Area
                                                                    type="monotone"
                                                                    dataKey="fatigue"
                                                                    stroke="#f43f5e"
                                                                    fill="#f43f5e"
                                                                    fillOpacity={0.05}
                                                                    strokeWidth={1}
                                                                />
                                                                <Area
                                                                    type="monotone"
                                                                    dataKey="form"
                                                                    stroke="#fbbf24"
                                                                    fill="#fbbf24"
                                                                    fillOpacity={0.05}
                                                                    strokeWidth={1}
                                                                />
                                                            </AreaChart>
                                                        </ResponsiveContainer>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <div className="flex items-center gap-1.5 group/compliance cursor-help">
                                                            <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest">{t('fit_score')} {athlete.id === 'demo-ath-1' ? '92' : '88'}</span>
                                                            <div className="flex gap-0.5">
                                                                {(() => {
                                                                    const compliance = getComplianceLevel(athlete.id, 400, athlete.id === 'demo-ath-1' ? 380 : 250);
                                                                    return (
                                                                        <>
                                                                            <div className={cn("w-1.5 h-1.5 rounded-full", compliance === 'high' ? "bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]" : "bg-slate-800")} />
                                                                            <div className={cn("w-1.5 h-1.5 rounded-full", compliance === 'moderate' ? "bg-amber-500 shadow-[0_0_5px_rgba(245,158,11,0.5)]" : "bg-slate-800")} />
                                                                            <div className={cn("w-1.5 h-1.5 rounded-full", compliance === 'low' ? "bg-rose-500 shadow-[0_0_5px_rgba(244,63,94,0.5)]" : "bg-slate-800")} />
                                                                        </>
                                                                    );
                                                                })()}
                                                            </div>
                                                            <span className="absolute -top-10 left-0 bg-slate-900 border border-slate-800 text-white text-[7px] font-black px-2 py-1.5 rounded-lg opacity-0 group-hover/compliance:opacity-100 transition-all uppercase tracking-widest whitespace-nowrap shadow-2xl z-50">
                                                                {t('compliance_calculated')}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    {days.map((day, dIdx) => {
                                        const dayWorkout = workouts.find(w =>
                                            w.athleteId === athlete.id &&
                                            isSameDay(new Date(w.date), day)
                                        );
                                        const athleteVacations = (athlete as any).profile?.vacations || [];
                                        const athleteAvailability = (athlete as any).profile?.availability || [];

                                        const isOnVacation = athleteVacations.some((v: any) =>
                                            isWithinInterval(day, { start: new Date(v.start), end: new Date(v.end) })
                                        );

                                        const isBusy = athleteAvailability.some((a: any) =>
                                            isSameDay(new Date(a.date), day) && a.type === 'busy'
                                        );

                                        const isToday = isSameDay(day, new Date());
                                        const isPending = dayWorkout?.status === 'PENDING_ACCEPTANCE';

                                        // Privacy Logic: Show only coaching-relevant events
                                        const eventType = (dayWorkout as any)?.type || (dayWorkout?.title ? 'workout' : 'other');
                                        const isCoachingEvent = ['workout', 'competition', 'vacation', 'appointment'].includes(eventType);
                                        const visibleWorkout = isCoachingEvent ? dayWorkout : null;

                                        return (
                                            <td key={dIdx} className={cn(
                                                "p-2 border-l border-slate-800/30 min-w-[120px] transition-all relative overflow-hidden",
                                                isToday && "bg-emerald-500/5",
                                                isOnVacation && "bg-amber-500/5 pattern-stripes-slate-100"
                                            )}>
                                                {visibleWorkout ? (
                                                    <div className={cn(
                                                        "p-3 rounded-2xl h-full flex flex-col justify-between transition-all border group/card cursor-pointer",
                                                        isPending
                                                            ? "bg-slate-900 border-amber-500/30 hover:border-amber-500/50"
                                                            : "bg-slate-800 border-slate-700 hover:border-emerald-500/30 hover:bg-slate-700/80"
                                                    )}>
                                                        <div className="mb-2">
                                                            <div className="flex items-center gap-1.5 mb-1 text-[8px] font-bold uppercase tracking-wider">
                                                                <Zap size={8} className={isPending ? "text-amber-500" : "text-emerald-500"} />
                                                                <span className={isPending ? "text-amber-500" : "text-slate-400"}>Running</span>
                                                            </div>
                                                            <div className="flex items-center justify-between gap-1">
                                                                <span className={cn(
                                                                    "text-[10px] font-black truncate uppercase tracking-tighter",
                                                                    isPending ? "text-amber-500" : "text-white"
                                                                )}>{dayWorkout.title}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex justify-between items-end">
                                                            <div className="flex items-center gap-1">
                                                                <span className="text-[9px] font-black text-emerald-500/80 uppercase">{(dayWorkout as any).plannedLoad || 250} AU</span>
                                                            </div>
                                                            {isPending && <Clock size={10} className="text-amber-500 animate-pulse" />}
                                                        </div>
                                                    </div>
                                                ) : isOnVacation ? (
                                                    <div className="h-full flex flex-col items-center justify-center opacity-40 hover:opacity-100 transition-opacity gap-1">
                                                        <Moon size={14} className="text-amber-400" />
                                                        <span className="text-[7px] font-black text-amber-500 uppercase tracking-widest">{t('type_vacation')}</span>
                                                    </div>
                                                ) : isBusy ? (
                                                    <div className="h-full bg-slate-950/50 flex flex-col items-center justify-center relative overflow-hidden group/busy">
                                                        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#f43f5e_1px,transparent_1px)] [background-size:4px_4px]"></div>
                                                        <ShieldAlert size={14} className="text-rose-500/50 mb-1" />
                                                        <span className="text-[7px] font-black text-rose-500/50 uppercase tracking-widest text-center px-2">{t('athlete_unavailable')}</span>
                                                    </div>
                                                ) : (
                                                    <div className="h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedAthleteForProposal(athlete);
                                                                setSelectedDayForProposal(day);
                                                                setShowProposalModal(true);
                                                            }}
                                                            className="p-2 bg-emerald-500/10 text-emerald-500 rounded-full hover:bg-emerald-500 hover:text-slate-950 transition-all"
                                                        >
                                                            <Plus size={16} strokeWidth={3} />
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Floating Action Bar */}
            {selectedAthletes.length > 0 && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[150] animate-in slide-in-from-bottom-10 duration-500">
                    <div className="bg-[#0A0C14]/90 backdrop-blur-2xl border border-white/10 rounded-full p-2 px-3 flex items-center gap-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 rounded-full border border-emerald-500/30">
                            <CheckCircle2 size={14} className="text-emerald-400" />
                            <span className="text-[11px] font-black text-white">{selectedAthletes.length}</span>
                        </div>

                        <div className="w-[1px] h-6 bg-white/10 mx-1"></div>

                        {/* Daily Memo Feature */}
                        <div className="flex items-center gap-3 px-4 py-2 bg-indigo-500/10 rounded-full border border-indigo-500/20 group hover:border-indigo-500/40 transition-all flex-1 min-w-[200px]">
                            <div className="p-2 bg-indigo-500 rounded-full text-white shadow-lg shadow-indigo-500/30">
                                <FileEdit size={12} />
                            </div>
                            <input
                                type="text"
                                placeholder={t('daily_memo_placeholder')}
                                className="bg-transparent border-none text-[10px] text-white focus:ring-0 placeholder:text-slate-500 w-full font-bold"
                            />
                        </div>

                        <div className="w-[1px] h-6 bg-white/10 mx-1"></div>

                        <div className="flex items-center gap-1">
                            <button className="p-3 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-all group relative">
                                <MessageSquare size={18} />
                                <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-800 text-white text-[8px] font-black px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all uppercase tracking-widest whitespace-nowrap shadow-2xl">{t('action_message')}</span>
                            </button>
                            <button
                                onClick={() => navigate(`/planner/ai?athleteId=${selectedAthletes[0]}`)}
                                className="p-3 hover:bg-white/5 rounded-full text-indigo-400 hover:text-indigo-300 transition-all group relative"
                            >
                                <Brain size={18} />
                                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[8px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest whitespace-nowrap">{t('action_plan_ai')}</span>
                            </button>
                            <button className="p-3 hover:bg-white/5 rounded-full text-emerald-400 hover:text-emerald-300 transition-all group relative">
                                <FileEdit size={18} />
                                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[8px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest whitespace-nowrap">{t('action_plan_manual')}</span>
                            </button>
                            <button className="p-3 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-all group relative">
                                <CalendarIcon size={18} />
                                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[8px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest whitespace-nowrap">{t('action_calendar')}</span>
                            </button>
                            <button className="p-3 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-all group relative">
                                <Activity size={18} />
                                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[8px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest whitespace-nowrap">{t('assessment_title')}</span>
                            </button>
                            <button className="p-3 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-all group relative">
                                <CreditCard size={18} />
                                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[8px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest whitespace-nowrap">{t('action_billing')}</span>
                            </button>
                        </div>

                        <div className="w-[1px] h-6 bg-white/10 mx-1"></div>

                        <button
                            onClick={() => setSelectedAthletes([])}
                            className="p-3 hover:bg-red-500/10 rounded-full text-slate-500 hover:text-red-400 transition-all"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>
            )}

            <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl flex items-center justify-between shadow-xl">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{t('legend_high_compliance')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full"></div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{t('legend_pending_sync')}</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em]">{t('planner_status_active')}</p>
                    {filteredAthletes.slice(0, 3).map((a) => (
                        <div key={a.id} className="w-8 h-8 rounded-xl bg-slate-800 border-2 border-slate-900 overflow-hidden shadow-lg transform hover:-translate-y-1 transition-transform cursor-pointer">
                            {a.avatar_url ? (
                                <img src={a.avatar_url} alt={a.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-[10px] font-black text-white">
                                    {a.avatar}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Proposal Modal */}
            {showProposalModal && selectedAthleteForProposal && selectedDayForProposal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-black/80 animate-in fade-in duration-300">
                    <Card className="w-full max-w-lg border-emerald-500/30 shadow-2xl bg-slate-950 p-6 space-y-6">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                            <div>
                                <h3 className="text-xl font-black text-white uppercase tracking-tighter">
                                    {proposalType === 'workout' ? t('propose_workout') : t('propose_rdv')}
                                </h3>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                                    {t('athletes')}: {selectedAthleteForProposal.name} • {format(selectedDayForProposal, 'PPP', { locale: currentLocale })}
                                </p>
                            </div>
                            <button onClick={() => setShowProposalModal(false)} className="text-slate-500 hover:text-white transition-colors p-2 hover:bg-slate-900 rounded-xl">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget as HTMLFormElement);
                            const time = formData.get('time') as string;
                            const [hours, minutes] = time.split(':').map(Number);
                            const start = new Date(selectedDayForProposal);
                            start.setHours(hours, minutes, 0, 0);

                            if (proposalType === 'workout') {
                                await addWorkout({
                                    athleteId: selectedAthleteForProposal.id,
                                    coachId: currentUser.id,
                                    title: formData.get('title') as string,
                                    description: formData.get('description') as string,
                                    date: start.toISOString(),
                                    type: 'run', // Default for now
                                    duration: Number(formData.get('duration')),
                                    status: 'PENDING_ACCEPTANCE',
                                    exercises: []
                                });
                                toast.success(t('workout_suggested'));
                            } else {
                                await addPersonalEvent({
                                    athleteId: selectedAthleteForProposal.id,
                                    coachId: currentUser.id,
                                    title: formData.get('title') as string,
                                    type: 'rdv',
                                    comment: formData.get('description') as string,
                                    start: start.toISOString(),
                                    end: addMinutes(start, Number(formData.get('duration'))).toISOString(),
                                    status: 'pending',
                                    location: proposalFormat,
                                    notificationTypes: ['email', 'push']
                                });
                                toast.success(t('session_suggested'));
                            }

                            setShowProposalModal(false);
                            setSelectedAthleteForProposal(null);
                            setSelectedDayForProposal(null);
                        }} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('event_title')}</label>
                                <input name="title" required placeholder="Ex: Analyse de foulée" className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white font-bold h-12 outline-none focus:border-emerald-500/50 transition-colors" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('event_type')}</label>
                                    <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
                                        <button
                                            type="button"
                                            onClick={() => setProposalType('workout')}
                                            className={cn(
                                                "flex-1 py-2 rounded-lg text-[9px] font-black uppercase transition-all",
                                                proposalType === 'workout' ? "bg-emerald-500 text-slate-950" : "text-slate-500 hover:text-white"
                                            )}
                                        >
                                            <Zap size={12} className="inline mr-1" /> {t('type_workout')}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setProposalType('rdv')}
                                            className={cn(
                                                "flex-1 py-2 rounded-lg text-[9px] font-black uppercase transition-all",
                                                proposalType === 'rdv' ? "bg-emerald-500 text-slate-950" : "text-slate-500 hover:text-white"
                                            )}
                                        >
                                            <User size={12} className="inline mr-1" /> {t('type_rdv')}
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('start_time')}</label>
                                    <input type="time" name="time" required defaultValue="10:00" className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white font-bold h-12 outline-none focus:border-emerald-500/50 transition-colors" />
                                </div>
                            </div>

                            {proposalType === 'rdv' && (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('location')}</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setProposalFormat('physical')}
                                            className={cn(
                                                "p-3 rounded-xl border transition-all flex items-center gap-3",
                                                proposalFormat === 'physical' ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400" : "bg-slate-900 border-slate-800 text-slate-500 hover:text-white"
                                            )}
                                        >
                                            <MapPin size={16} />
                                            <span className="text-[10px] font-black uppercase">{t('physical')}</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setProposalFormat('virtual')}
                                            className={cn(
                                                "p-3 rounded-xl border transition-all flex items-center gap-3",
                                                proposalFormat === 'virtual' ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400" : "bg-slate-900 border-slate-800 text-slate-500 hover:text-white"
                                            )}
                                        >
                                            <Video size={16} />
                                            <span className="text-[10px] font-black uppercase">{t('virtual')}</span>
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('duration')} (min)</label>
                                <input type="number" name="duration" defaultValue="60" required className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white font-bold h-12 outline-none focus:border-emerald-500/50 transition-colors" />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('comment')}</label>
                                <textarea name="description" placeholder="Objectifs de la séance..." className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white font-bold h-24 outline-none focus:border-emerald-500/50 transition-colors" />
                            </div>

                            <button type="submit" className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-emerald-900/20">
                                {t('confirm')}
                            </button>
                        </form>
                    </Card>
                </div>
            )}
        </div >
    );
}
