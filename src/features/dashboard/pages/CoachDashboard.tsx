import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader } from '@/shared/components/ui/Card';
import {
    Users, Activity, CheckCircle2,
    Clock, TrendingUp, AlertCircle,
    Calendar as CalendarIcon,
    ArrowUpRight, Target,
    Video, UserPlus, Ghost, ChevronRightIcon, ChevronLeft, Search, Tag,
    Sun, Cloud, CloudRain, CloudLightning, ShieldAlert, PlusCircle, Trash2, AtSign, Hash, Check, X, RefreshCw, Bell
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
import { TrainingScienceService } from '@/features/planner/services/TrainingScienceService';
import { UserProfile } from '@/features/auth/types';
import { TechnicalAssessmentData, AthleteWithStats } from '../types';
import { toast } from 'sonner';
import { InfoTooltip } from '@/shared/components/ui/InfoTooltip';
import { CheckinReminderModal } from '@/features/dashboard/components/CheckinReminderModal';
import { SEO } from '@/shared/components/common/SEO';

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
    const [requestingAll, setRequestingAll] = useState(false);
    const [remindedAthleteIds, setRemindedAthleteIds] = useState<Set<string>>(new Set());
    const [opportunities, setOpportunities] = useState<{ type: 'upsell' | 'downsell', athlete: ComplianceStat }[]>([]);
    const [showReminderModal, setShowReminderModal] = useState(false);

    const dateLocale = language === 'fr' ? fr : language === 'es' ? es : language === 'it' ? it : language === 'de' ? de : language === 'ca' ? ca : enUS;

    useEffect(() => {
        const loadDashboardData = async () => {
            setLoading(true);
            try {
                const coachId = currentUser?.id;
                let athletesData = [];

                if (coachId) {
                    athletesData = await getAthletesForCoach(coachId);
                }

                if (!athletesData || athletesData.length === 0) {
                    // DEMO MODE
                    const demoAthletes = [
                        { id: 'mock-1', name: 'Alex Mercer', avatar: 'AM', compliance: 96, avgWeeklyHours: 12 },
                        { id: 'mock-2', name: 'Sarah Connor', avatar: 'SC', compliance: 45, avgWeeklyHours: 4 },
                        { id: 'mock-3', name: 'Marcus Fenix', avatar: 'MF', compliance: 82, avgWeeklyHours: 8 },
                        { id: 'mock-4', name: 'Lara Croft', avatar: 'LC', compliance: 98, avgWeeklyHours: 15 },
                        { id: 'mock-5', name: 'Bruce Wayne', avatar: 'BW', compliance: 75, avgWeeklyHours: 10 }
                    ];

                    setAthletes(demoAthletes as any);
                    setActiveAthletesCount(5);
                    setRevenue(1250);
                    setComplianceGlobal(88);
                    setCancellationRate(4);

                    const enriched: ComplianceStat[] = demoAthletes.map(a => ({
                        id: a.id,
                        name: a.name,
                        avatar: a.avatar,
                        compliance: a.compliance,
                        trend: (a.compliance > 80 ? 'up' : 'down') as 'up' | 'down',
                        lastActive: '2d ago',
                        plan: 'pro' as const,
                        avgWeeklyHours: a.avgWeeklyHours
                    }));

                    setHeroes(enriched.filter(a => a.compliance >= 90).slice(0, 3));
                    setGhosts(enriched.filter(a => a.compliance < 50).slice(0, 3));

                    const opps: { type: 'upsell' | 'downsell', athlete: ComplianceStat }[] = [];
                    enriched.forEach(a => {
                        if (a.avgWeeklyHours > 8) opps.push({ type: 'upsell', athlete: a });
                        else if (a.compliance < 40) opps.push({ type: 'downsell', athlete: a });
                    });
                    setOpportunities(opps);
                } else {
                    setAthletes(athletesData);
                    setActiveAthletesCount(athletesData.length);

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
                        .gte('scheduled_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

                    if (sessions) {
                        const relevantSessions = sessions.filter(s => athletesData.some((a: any) => a.id === s.athlete_id));
                        const completed = relevantSessions.filter(s => s.status === 'COMPLETED').length;
                        const cancelled = relevantSessions.filter(s => s.status === 'MISSED' || s.status === 'SKIPPED').length;
                        const total = relevantSessions.length || 1;

                        setComplianceGlobal(Math.round((completed / total) * 100));
                        setCancellationRate(Math.round((cancelled / total) * 100));

                        const enrichedAthletes: ComplianceStat[] = athletesData.map((a: any) => {
                            const personalSessions = relevantSessions.filter(s => s.athlete_id === a.id);
                            const pCompleted = personalSessions.filter(s => s.status === 'COMPLETED').length;
                            const pTotal = personalSessions.length || 1;
                            const pCompliance = Math.round((pCompleted / pTotal) * 100) || (Math.random() > 0.5 ? 95 : 45);

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

                        const opps: { type: 'upsell' | 'downsell', athlete: ComplianceStat }[] = [];
                        enrichedAthletes.forEach(a => {
                            if (a.avgWeeklyHours > 8) opps.push({ type: 'upsell', athlete: a });
                            else if (a.compliance < 40) opps.push({ type: 'downsell', athlete: a });
                        });
                        setOpportunities(opps.slice(0, 4));
                    }
                }

                // Load Meetings
                if (coachId) {
                    const { data: appointments } = await supabase
                        .from('appointments')
                        .select(`
                            *,
                            athlete:athlete_id (id, full_name, first_name, last_name, pseudo)
                        `)
                        .eq('coach_id', coachId)
                        .gte('start_time', new Date().toISOString())
                        .order('start_time', { ascending: true })
                        .limit(5);

                    if (appointments) {
                        setMeetings(appointments.map(a => {
                            let athleteName = a.client_name;

                            if (!athleteName && a.athlete) {
                                athleteName = a.athlete.first_name && a.athlete.last_name
                                    ? `${a.athlete.first_name} ${a.athlete.last_name}`
                                    : (a.athlete.full_name || a.athlete.pseudo);
                            }

                            if (!athleteName) {
                                // Fallback to pre-fetched athletes list if join failed for some reason
                                athleteName = athletesData.find((ath: any) => ath.id === a.athlete_id)?.name;
                            }

                            return {
                                id: a.id,
                                athlete: athleteName || t('athlete'),
                                time: format(new Date(a.start_time), 'HH:mm'),
                                rawDate: new Date(a.start_time),
                                type: a.title,
                                duration: formatDistance(new Date(a.start_time), new Date(a.end_time), { locale: dateLocale }),
                                isExternal: !a.athlete_id,
                                athleteId: a.athlete_id
                            };
                        }));
                    }
                }
            } catch (err) {
                logger.error('Error loading dashboard data:', err);
            } finally {
                setLoading(false);
            }
        };

        loadDashboardData();
    }, [currentUser?.id, getAthletesForCoach]);


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
        { name: 'Mon', avg: 45, high: 65, low: 20 },
        { name: 'Tue', avg: 52, high: 75, low: 25 },
        { name: 'Wed', avg: 48, high: 68, low: 15 },
        { name: 'Thu', avg: 61, high: 85, low: 35 },
        { name: 'Fri', avg: 55, high: 80, low: 30 },
        { name: 'Sat', avg: 72, high: 95, low: 40 },
        { name: 'Sun', avg: 30, high: 45, low: 10 },
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-700 pb-20">
            <SEO
                titleKey="seo_coach_dashboard_title"
                descriptionKey="seo_coach_dashboard_desc"
                jsonLd={{
                    "@context": "https://schema.org",
                    "@type": "WebPage",
                    "name": t('seo_coach_dashboard_title'),
                    "description": t('seo_coach_dashboard_desc')
                }}
            />
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-6">
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
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowReminderModal(true)}
                            disabled={requestingAll || (ghosts.length > 0 && ghosts.every(g => remindedAthleteIds.has(g.id)))}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all shadow-xl shadow-indigo-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {requestingAll ? <RefreshCw className="animate-spin" size={16} /> : <Bell size={16} />}
                            {t('request_all_checkins')}
                        </button>
                        <InfoTooltip content={t('request_all_checkins_tooltip')} />
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
                                            {m.isExternal && (
                                                <span className="text-[8px] px-1.5 py-0.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded uppercase font-black tracking-widest">Ext</span>
                                            )}
                                            {(window as any).getCoachWeatherIcon && (window as any).getCoachWeatherIcon(m.rawDate)}
                                        </div>
                                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">{m.type}</p>
                                    </div>
                                </div>
                                {!m.isExternal && (
                                    <button
                                        onClick={() => setSelectedAthleteForTech(athletes.find(a => a.name === m.athlete) || null)}
                                        className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-emerald-500/20"
                                    >
                                        <Target size={12} />
                                    </button>
                                )}
                            </div>
                        )) : (
                            <div className="py-12 flex flex-col items-center justify-center text-slate-600 border border-dashed border-slate-800 rounded-3xl">
                                <CalendarIcon size={24} className="mb-2 opacity-20" />
                                <p className="text-[10px] font-black uppercase tracking-widest">{t('no_meetings')}</p>
                            </div>
                        )}
                        <button
                            onClick={() => navigate('/calendar')}
                            className="w-full mt-4 py-3 bg-slate-900 border border-slate-800 text-slate-500 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:text-white"
                        >
                            {t('view_full_calendar')}
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
                                    <linearGradient id="colorHigh" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis dataKey="name" stroke="#475569" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} />
                                <YAxis stroke="#475569" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '12px' }}
                                    itemStyle={{ fontSize: '10px', fontWeight: 'bold' }}
                                    labelStyle={{ color: '#94a3b8', fontSize: '10px', marginBottom: '4px' }}
                                />
                                <Area type="monotone" dataKey="high" stroke="#f43f5e" strokeWidth={1} strokeDasharray="4 4" fill="url(#colorHigh)" name={t('high_intensity_group') || 'Top 20% (Risque)'} />
                                <Area type="monotone" dataKey="low" stroke="#475569" strokeWidth={1} strokeDasharray="4 4" fill="transparent" name={t('low_intensity_group') || 'Base 20% (Inactifs)'} />
                                <Area type="monotone" dataKey="avg" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorAvg)" name={t('average_group') || 'Moyenne Groupe'} />
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
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => {
                                            const newReminders = new Set(remindedAthleteIds);
                                            newReminders.add(g.id);
                                            setRemindedAthleteIds(newReminders);

                                            toast.success(t('request_sent_title'), {
                                                description: `Rappel envoyé à ${g.name}`
                                            });
                                        }}
                                        disabled={remindedAthleteIds.has(g.id)}
                                        className="px-3 py-1 bg-rose-500 text-white rounded text-[8px] font-black uppercase hover:bg-rose-600 flex items-center gap-1 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
                                    >
                                        {remindedAthleteIds.has(g.id) ? <Check size={10} /> : <Bell size={10} />}
                                        {t('request_checkin')}
                                    </button>
                                    <InfoTooltip content={t('request_checkin_tooltip')} />
                                </div>
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
            {
                selectedAthleteForTech && (
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
                )
            }

            <CheckinReminderModal
                isOpen={showReminderModal}
                onClose={() => setShowReminderModal(false)}
                athletes={ghosts}
                remindedIds={remindedAthleteIds}
                onSendReminders={(selectedIds) => {
                    setRequestingAll(true);
                    const newReminders = new Set(remindedAthleteIds);
                    selectedIds.forEach(id => newReminders.add(id));
                    setRemindedAthleteIds(newReminders);

                    setTimeout(() => {
                        setRequestingAll(false);
                        toast.success(t('request_sent_title'), {
                            description: selectedIds.length > 1
                                ? t('request_all_checkins_sent_desc')
                                : `${t('request_sent_title')} - ${athletes.find(a => a.id === selectedIds[0])?.name}`
                        });
                    }, 1000);
                }}
            />

        </div >
    );
}
