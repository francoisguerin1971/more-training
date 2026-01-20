import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader } from '@/shared/components/ui/Card';
import {
    Users, Activity, CheckCircle2,
    Clock, TrendingUp, AlertCircle,
    Calendar as CalendarIcon,
    ArrowUpRight, Target,
    Video, UserPlus, Ghost, ChevronRightIcon, ChevronLeft, Search, Tag,
    Sun, Cloud, CloudRain, CloudLightning, ShieldAlert, PlusCircle, Trash2, AtSign, Hash, Check, X
} from 'lucide-react';
import { useLanguage } from '@/shared/context/LanguageContext';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { useTraining } from '@/features/planner/contexts/TrainingContext';
import { supabase } from '@/core/services/supabase';
import { logger } from '@/core/utils/security';
import { cn } from '@/core/utils/cn';
import { format, formatDistanceToNow, formatDistance } from 'date-fns';
import { fr, enUS, es, it, de, ca } from 'date-fns/locale';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CoachTechnicalForm } from '@/features/dashboard/components/CoachTechnicalForm';
import { UserProfile } from '@/features/auth/types';
import { TechnicalAssessmentData, AthleteWithStats } from '../types';
import { toast } from 'sonner';
import { InfoTooltip } from '@/shared/components/ui/InfoTooltip';

// Mock Data for "Heroes vs Ghosts" and Business Intel
// In prod, these would come from complex DB queries or Edge Functions
interface ComplianceStat {
    id: string;
    name: string;
    avatar: string;
    compliance: number;
    trend: 'up' | 'down' | 'stable';
    lastActive: string;
    plan: 'basic' | 'pro' | 'elite';
    avgWeeklyHours: number;
}

export function CoachDashboard() {
    const navigate = useNavigate();
    const { t, language } = useLanguage();
    const { currentUser, setShowInviteModal, getAthletesForCoach } = useAuthStore();
    const { workouts } = useTraining();

    const [selectedAthleteForTech, setSelectedAthleteForTech] = useState<UserProfile | null>(null);
    const [athletes, setAthletes] = useState<AthleteWithStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [revenue, setRevenue] = useState(0);
    const [complianceGlobal, setComplianceGlobal] = useState(0);
    const [cancellationRate, setCancellationRate] = useState(0);
    const [activeAthletesCount, setActiveAthletesCount] = useState(0);
    const [missedWorkouts, setMissedWorkouts] = useState<any[]>([]);
    const [meetings, setMeetings] = useState<any[]>([]);

    // Advanced Stats States
    const [heroes, setHeroes] = useState<ComplianceStat[]>([]);
    const [ghosts, setGhosts] = useState<ComplianceStat[]>([]);
    const [opportunities, setOpportunities] = useState<{ type: 'upsell' | 'downsell', athlete: ComplianceStat }[]>([]);

    const dateLocale = language === 'fr' ? fr : language === 'es' ? es : language === 'it' ? it : language === 'de' ? de : language === 'ca' ? ca : enUS;

    useEffect(() => {
        const loadDashboardData = async () => {
            setLoading(true);
            try {
                if (currentUser?.id) {
                    const coachId = currentUser.id;

                    const athletesData = await getAthletesForCoach(coachId);

                    setAthletes(athletesData || []);
                    setActiveAthletesCount(athletesData?.length || 0);

                    // 1. Revenue
                    const { data: payments } = await supabase
                        .from('payments')
                        .select('coach_payout_cents')
                        .gte('paid_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
                        .eq('status', 'SUCCEEDED');

                    const totalRevenue = payments?.reduce((sum, p) => sum + (p.coach_payout_cents || 0), 0) || 0;
                    setRevenue(totalRevenue / 100);

                    // 2. Global Compliance & Cancellation
                    const { data: sessions } = await supabase
                        .from('training_sessions')
                        .select('id, status, session_data, athlete_id, title, scheduled_date')
                        .gte('scheduled_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // Last 30 days

                    if (sessions && athletesData.length > 0) {
                        const relevantSessions = sessions.filter(s => athletesData.some(a => a.id === s.athlete_id));

                        const completed = relevantSessions.filter(s => s.status === 'COMPLETED').length;
                        const cancelled = relevantSessions.filter(s => s.status === 'MISSED' || s.status === 'SKIPPED').length;
                        const total = relevantSessions.length || 1;

                        setComplianceGlobal(Math.round((completed / total) * 100));
                        setCancellationRate(Math.round((cancelled / total) * 100));

                        // 3. Generate Derived Stats (Heroes, Ghosts, Opportunities)
                        // In a real app, we would query per-athlete stats. Here we simulate logic based on available data + randomization for demo.
                        const enrichedAthletes: ComplianceStat[] = athletesData.map(a => {
                            // Simulate individual stats
                            const personalSessions = relevantSessions.filter(s => s.athlete_id === a.id);
                            const pCompleted = personalSessions.filter(s => s.status === 'COMPLETED').length;
                            const pTotal = personalSessions.length || 1;
                            const pCompliance = Math.round((pCompleted / pTotal) * 100) || (Math.random() > 0.5 ? 95 : 45); // Fallback for demo

                            return {
                                id: a.id,
                                name: a.name,
                                avatar: a.avatar || 'A',
                                compliance: pCompliance,
                                trend: pCompliance > 80 ? 'up' : 'down',
                                lastActive: '2d ago',
                                plan: 'pro',
                                avgWeeklyHours: Math.floor(Math.random() * 10) + 2
                            };
                        });

                        setHeroes(enrichedAthletes.filter(a => a.compliance >= 90).slice(0, 3));
                        setGhosts(enrichedAthletes.filter(a => a.compliance < 50).slice(0, 3));

                        // Business Logic
                        const opps: { type: 'upsell' | 'downsell', athlete: ComplianceStat }[] = [];
                        enrichedAthletes.forEach(a => {
                            if (a.avgWeeklyHours > 8) opps.push({ type: 'upsell', athlete: a });
                            else if (a.compliance < 40) opps.push({ type: 'downsell', athlete: a });
                        });
                        setOpportunities(opps.slice(0, 4));
                    }

                    // Load Meetings (Existing logic)
                    const { data: appointments } = await supabase
                        .from('appointments')
                        .select('*')
                        .eq('coach_id', coachId)
                        .gte('start_time', new Date().toISOString())
                        .order('start_time', { ascending: true })
                        .limit(5);

                    if (appointments) {
                        setMeetings(appointments.map(a => ({
                            id: a.id,
                            athlete: athletesData.find(ath => ath.id === a.athlete_id)?.name || 'Athlete',
                            time: format(new Date(a.start_time), 'HH:mm'),
                            rawDate: new Date(a.start_time),
                            type: a.title,
                            duration: formatDistance(new Date(a.start_time), new Date(a.end_time), { locale: dateLocale })
                        })));
                    }

                    // V4: Simulation Functions
                    const getWeatherIcon = (date: Date) => {
                        const day = date.getDate();
                        if (day % 4 === 0) return <CloudRain size={10} className="text-indigo-400" />;
                        if (day % 3 === 0) return <Cloud size={10} className="text-slate-400" />;
                        if (day % 5 === 0) return <CloudLightning size={10} className="text-amber-400" />;
                        return <Sun size={10} className="text-amber-400" />;
                    };

                    const getComplianceLevel = (compliance: number) => {
                        if (compliance >= 90) return 'high';
                        if (compliance >= 70) return 'moderate';
                        return 'low';
                    };

                    (window as any).getCoachWeatherIcon = getWeatherIcon;
                    (window as any).getCoachComplianceLevel = getComplianceLevel;

                }
            } catch (err) {
                logger.error('Error loading dashboard data:', err);
            } finally {
                setLoading(false);
            }
        };

        if (currentUser) {
            loadDashboardData();
        }
    }, [currentUser, getAthletesForCoach]);


    const stats = [
        {
            label: t('kpi_athletes'),
            value: activeAthletesCount,
            icon: Users,
            color: 'text-emerald-400',
            desc: t('active_vs_ghost_tooltip'),
            action: () => navigate('/athletes')
        },
        {
            label: t('compliance_rate'),
            value: `${complianceGlobal}%`,
            icon: Activity,
            color: 'text-indigo-400',
            desc: t('compliance_tooltip')
        },
        {
            label: t('cancellation_rate'),
            value: `${cancellationRate}%`,
            icon: AlertCircle,
            color: 'text-amber-400',
            desc: t('cancellation_tooltip'),
            action: () => navigate('/calendar')
        },
        {
            label: t('kpi_revenue'),
            value: `€${revenue.toFixed(0)}`,
            icon: TrendingUp,
            color: 'text-emerald-400',
            desc: t('kpi_revenue'),
            action: () => navigate('/invoices')
        },
    ];

    const loadChartData = [
        { name: 'Mon', load: 45 }, { name: 'Tue', load: 52 },
        { name: 'Wed', load: 48 }, { name: 'Thu', load: 61 },
        { name: 'Fri', load: 55 }, { name: 'Sat', load: 72 },
        { name: 'Sun', load: 30 },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-1000">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter">
                        Coach <span className="text-emerald-400">Control</span>
                    </h1>
                    <p className="text-slate-500 mt-1 font-bold uppercase tracking-widest text-[10px]">{t('command_center')}</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => setShowInviteModal(true)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all shadow-xl shadow-emerald-500/10"
                    >
                        <UserPlus size={16} /> {t('invite_athlete')}
                    </button>
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">{t('system_online')}</span>
                    </div>
                </div>
            </div>

            {/* Row 1: High Level KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <Card
                        key={i}
                        onClick={stat.action}
                        className={cn(
                            "group hover:border-emerald-500/30 transition-all relative bg-slate-900 shadow-2xl overflow-visible",
                            stat.action && "cursor-pointer active:scale-95"
                        )}
                    >
                        <div className="absolute top-4 right-4 z-[50]">
                            <InfoTooltip content={stat.desc} />
                        </div>
                        <div className="flex items-start gap-4">
                            <div className={cn("p-3 rounded-2xl bg-slate-950 border border-slate-800", stat.color)}>
                                <stat.icon size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{stat.label}</p>
                                <h3 className="text-2xl font-black text-white mt-1 uppercase tracking-tighter">{loading ? '...' : stat.value}</h3>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Row 2: Charts & Meetings */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-1 bg-slate-950 border-slate-800 shadow-3xl">
                    <CardHeader
                        title={t('weekly_meetings')}
                        icon={<CalendarIcon className="text-indigo-400" size={20} />}
                        action={<InfoTooltip content={t('info_upcoming_sessions')} />}
                    />
                    <div className="space-y-4 pt-6">
                        {meetings.length > 0 ? meetings.map((m) => (
                            <div key={m.id} className="group p-4 bg-slate-900/50 border border-slate-800 rounded-2xl flex items-center justify-between hover:border-indigo-500/30 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center font-black text-xs text-white uppercase">
                                        {m.time.split(':')[0]}h
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-xs font-black text-white uppercase tracking-tight">{m.athlete}</h4>
                                            {(window as any).getCoachWeatherIcon && (window as any).getCoachWeatherIcon(m.rawDate)}
                                        </div>
                                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">{m.type}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedAthleteForTech(athletes.find(a => a.name === m.athlete) || null)}
                                    className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-emerald-500/20"
                                >
                                    <Target size={12} />
                                </button>
                            </div>
                        )) : (
                            <div className="py-12 flex flex-col items-center justify-center text-slate-600 border border-dashed border-slate-800 rounded-3xl">
                                <CalendarIcon size={24} className="mb-2 opacity-20" />
                                <p className="text-[10px] font-black uppercase tracking-widest">No meetings today</p>
                            </div>
                        )}
                        <button
                            onClick={() => navigate('/calendar')}
                            className="w-full mt-4 py-3 bg-slate-900 border border-slate-800 text-slate-500 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:text-white"
                        >
                            {t('view_calendar')}
                        </button>
                    </div>
                </Card>

                <Card className="lg:col-span-2 bg-slate-950 border-slate-800 shadow-3xl">
                    <CardHeader
                        title={t('load_overview')}
                        icon={<Activity className="text-emerald-400" size={20} />}
                        action={<InfoTooltip content={t('info_macro_cycle')} />}
                    />
                    <div className="h-[300px] w-full pt-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={loadChartData}>
                                <defs>
                                    <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis dataKey="name" stroke="#475569" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} />
                                <YAxis stroke="#475569" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '12px' }} itemStyle={{ fontSize: '10px', color: '#10b981', fontWeight: 'bold' }} />
                                <Area type="monotone" dataKey="load" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorLoad)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            {/* Row 3: Leaderboards (Heroes vs Ghosts) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Heroes */}
                <Card className="bg-slate-950 border-emerald-500/10 shadow-3xl">
                    <CardHeader
                        title={t('heroes_leaderboard')}
                        icon={<Target className="text-emerald-400" size={20} />}
                        action={<InfoTooltip content={t('heroes_tooltip')} />}
                    />
                    <div className="space-y-3 pt-4">
                        {heroes.length > 0 ? heroes.map((h, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-slate-900/40 rounded-xl border border-slate-800/50">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-black text-xs text-slate-950">
                                        {i + 1}
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold text-white uppercase">{h.name}</h4>
                                        <div className="flex items-center gap-2">
                                            <p className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest">{h.compliance}% {t('compliance_label')}</p>
                                            <div className="flex gap-0.5">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
                                                <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                                                <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-emerald-400">
                                    <TrendingUp size={16} />
                                </div>
                            </div>
                        )) : (
                            <p className="text-xs text-slate-500 italic p-4 text-center">{t('no_heroes_yet')}</p>
                        )}
                    </div>
                </Card>

                {/* Ghosts */}
                <Card className="bg-slate-950 border-rose-500/10 shadow-3xl">
                    <CardHeader
                        title={t('ghosts_leaderboard')}
                        icon={<Ghost className="text-rose-400" size={20} />}
                        action={<InfoTooltip content={t('ghosts_tooltip')} />}
                    />
                    <div className="space-y-3 pt-4">
                        {ghosts.length > 0 ? ghosts.map((g, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-rose-500/5 rounded-xl border border-rose-500/10">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center font-black text-xs text-rose-400">
                                        !
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold text-white uppercase">{g.name}</h4>
                                        <div className="flex items-center gap-2">
                                            <p className="text-[9px] text-rose-400 font-bold uppercase tracking-widest">{g.compliance}% - {t('last_active_label')} {g.lastActive}</p>
                                            <div className="flex gap-0.5">
                                                <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                                                <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                                                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_5px_rgba(244,63,94,0.5)]" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <button className="px-3 py-1 bg-rose-500 text-white rounded text-[8px] font-black uppercase hover:bg-rose-600">
                                    {t('ping_action')}
                                </button>
                            </div>
                        )) : (
                            <p className="text-xs text-slate-500 italic p-4 text-center">{t('everyone_active')}</p>
                        )}
                    </div>
                </Card>
            </div>

            {/* Row 4: Business Intelligence */}
            <Card className="bg-gradient-to-br from-slate-900 to-slate-950 border-indigo-500/20 shadow-3xl">
                <CardHeader
                    title={t('business_opportunities')}
                    icon={<TrendingUp className="text-indigo-400" size={20} />}
                    action={<InfoTooltip content={t('business_tooltip')} />}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
                    {opportunities.map((op, i) => (
                        <div key={i} className={cn(
                            "p-4 rounded-2xl border flex flex-col justify-between h-full transition-all hover:scale-105",
                            op.type === 'upsell' ? "bg-emerald-500/5 border-emerald-500/20" : "bg-amber-500/5 border-amber-500/20"
                        )}>
                            <div>
                                <div className="flex justify-between items-start mb-3">
                                    <span className={cn(
                                        "px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest",
                                        op.type === 'upsell' ? "bg-emerald-500 text-slate-950" : "bg-amber-500 text-slate-950"
                                    )}>
                                        {op.type === 'upsell' ? t('upsell_opportunity') : t('downsell_opportunity')}
                                    </span>
                                    <ArrowUpRight size={14} className="opacity-50" />
                                </div>
                                <h4 className="text-sm font-black text-white uppercase mb-1">{op.athlete.name}</h4>
                                <p className="text-[10px] text-slate-400 font-medium leading-tight mb-4">
                                    {op.type === 'upsell' ? t('upsell_desc') : t('downsell_desc')}
                                </p>
                            </div>
                            <button className="w-full py-2 bg-slate-950 border border-slate-800 rounded-lg text-[9px] font-black uppercase text-white hover:bg-slate-800">
                                {t('opportunity_action')}
                            </button>
                        </div>
                    ))}
                    {opportunities.length === 0 && (
                        <div className="col-span-4 py-8 text-center text-slate-500 text-xs italic">
                            {t('ai_analyzing')}
                        </div>
                    )}
                </div>
            </Card>

            {/* Technical Assessment Modal */}
            {selectedAthleteForTech && (
                <CoachTechnicalForm
                    athlete={selectedAthleteForTech}
                    onClose={() => setSelectedAthleteForTech(null)}
                    onSave={async (data: TechnicalAssessmentData) => {
                        try {
                            const { error } = await supabase
                                .from('technical_assessments')
                                .insert([{
                                    coach_id: currentUser?.id,
                                    athlete_id: selectedAthleteForTech.id,
                                    form_status: data.formStatus,
                                    fatigue: data.fatigue,
                                    motivation: data.motivation,
                                    focus: data.focus
                                }]);

                            if (error) {
                                logger.error('Error saving technical assessment:', error);
                                toast.error('Failed to save assessment');
                            } else {
                                toast.success('Assessment saved successfully');
                                setSelectedAthleteForTech(null);
                            }
                        } catch (err) {
                            logger.error('Exception saving technical assessment:', err);
                            toast.error('An error occurred');
                        }
                    }}
                />
            )}
        </div>
    );
}

