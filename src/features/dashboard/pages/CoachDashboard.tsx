import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader } from '@/shared/components/ui/Card';
import {
    Users, Activity, CheckCircle2,
    Clock, TrendingUp, AlertCircle,
    Calendar as CalendarIcon, MoreVertical,
    ChevronRight, ArrowUpRight, Target, Info,
    Video, UserPlus, Mail, Search, ChevronLeft, ChevronRight as ChevronRightIcon, Tag
} from 'lucide-react';
import { useLanguage } from '@/shared/context/LanguageContext';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { useTraining } from '@/features/planner/contexts/TrainingContext';
import { supabase } from '@/core/services/supabase';
import { logger } from '@/core/utils/security';
import { cn } from '@/core/utils/cn';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { CoachTechnicalForm } from '@/features/dashboard/components/CoachTechnicalForm';
import { UserProfile } from '@/features/auth/types';
import { TechnicalAssessmentData, AthleteWithStats } from '../types';

export function CoachDashboard() {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const { currentUser, getAthletesForCoach, inviteAthlete } = useAuthStore();
    const { workouts } = useTraining();

    const [showInviteModal, setShowInviteModal] = useState(false);
    const [selectedAthleteForTech, setSelectedAthleteForTech] = useState<UserProfile | null>(null);
    const [inviteStep, setInviteStep] = useState(1);
    const [inviteData, setInviteData] = useState({
        email: '',
        name: '',
        sport: '',
        objective: '',
        formStatus: 'optimal',
        suggestedPlan: 'p1',
        availableDays: [1, 2, 3, 4, 5]
    });

    const [athletes, setAthletes] = useState<AthleteWithStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [revenue, setRevenue] = useState(0);
    const [compliance, setCompliance] = useState(0);
    const [pendingReviews, setPendingReviews] = useState(0);

    useEffect(() => {
        const loadDashboardData = async () => {
            setLoading(true);
            try {
                // Load athletes
                if (currentUser?.id) {
                    const coachId = currentUser.id;
                    const athletesData = await getAthletesForCoach(coachId);
                    setAthletes(athletesData || []);

                    // Calculate revenue (last 30 days)
                    if (coachId) {
                        // Corrected version: You cannot use rpc result directly in .eq()
                        // First get the subscription IDs
                        const { data: subIds } = await supabase.rpc('get_coach_subscriptions', { coach_id: coachId });

                        if (subIds && subIds.length > 0) {
                            const { data: payments } = await supabase
                                .from('payments')
                                .select('coach_payout_cents')
                                .in('subscription_id', subIds)
                                .gte('paid_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
                                .eq('status', 'SUCCEEDED');

                            const totalRevenue = payments?.reduce((sum, p) => sum + (p.coach_payout_cents || 0), 0) || 0;
                            setRevenue(totalRevenue / 100);
                        }

                        // Calculate compliance (sessions completed vs planned)
                        const { data: sessions } = await supabase
                            .from('training_sessions')
                            .select('status, session_data')
                            .in('athlete_id', athletesData.map(a => a.id))
                            .gte('scheduled_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

                        if (sessions) {
                            const completed = sessions.filter(s => s.status === 'COMPLETED').length || 0;
                            const total = sessions.length || 1;
                            setCompliance(Math.round((completed / total) * 100));

                            // Count pending reviews (sessions completed but not reviewed)
                            const pending = sessions.filter(s => s.status === 'COMPLETED' && !s.session_data?.reviewed).length || 0;
                            setPendingReviews(pending);
                        }
                    }
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

    // Dynamic stats based on real data
    const stats = [
        {
            label: t('kpi_athletes'),
            value: loading ? '...' : athletes.length,
            icon: Users,
            color: 'text-emerald-400',
            desc: t('kpi_athletes'),
            action: () => navigate('/athletes')
        },
        {
            label: t('kpi_compliance'),
            value: loading ? '...' : `${compliance}%`,
            icon: Activity,
            color: 'text-indigo-400',
            desc: t('kpi_compliance_desc')
        },
        {
            label: t('kpi_pending'),
            value: loading ? '...' : pendingReviews,
            icon: Clock,
            color: 'text-amber-400',
            desc: t('kpi_pending_desc'),
            action: () => navigate('/calendar')
        },
        {
            label: t('kpi_revenue'),
            value: loading ? '...' : `€${revenue.toFixed(0)}`,
            icon: TrendingUp,
            color: 'text-emerald-400',
            desc: t('kpi_revenue'),
            action: () => navigate('/invoices')
        },
    ];

    const missedWorkouts = [
        { id: 1, athlete: 'Emma Wilson', workout: 'Threshold Intervals', daysAgo: '1d ago', avatar: 'E' },
        { id: 2, athlete: 'Alex Morgan', workout: 'Long Aerobic Run', daysAgo: '3h ago', avatar: 'A' },
    ];

    const meetings = [
        { id: 1, athlete: 'Alex Morgan', time: '10:00 AM', type: 'Macro-cycle Review', duration: '30m' },
        { id: 2, athlete: 'Emma Wilson', time: '02:30 PM', type: 'Injury Follow-up', duration: '15m' },
        { id: 3, athlete: 'James Miller', time: '04:00 PM', type: 'Season Planning', duration: '45m' },
    ];

    const chartData = [
        { name: 'Mon', load: 45 },
        { name: 'Tue', load: 52 },
        { name: 'Wed', load: 48 },
        { name: 'Thu', load: 61 },
        { name: 'Fri', load: 55 },
        { name: 'Sat', load: 72 },
        { name: 'Sun', load: 30 },
    ];

    const handleInviteSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser?.id) return;

        inviteAthlete(inviteData.email);
        alert(`Professional invite sent to ${inviteData.email}. Onboarding data pre-filled.`);
        setShowInviteModal(false);
        setInviteStep(1);
        setInviteData({
            email: '',
            name: '',
            sport: '',
            objective: '',
            formStatus: 'optimal',
            suggestedPlan: 'p1',
            availableDays: [1, 2, 3, 4, 5]
        });
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-1000">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter">
                        Coach <span className="text-emerald-400">Control</span>
                    </h1>
                    <p className="text-slate-500 mt-1 font-bold uppercase tracking-widest text-[10px]">Command Center & Decision Support</p>
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
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">System Online</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <Card
                        key={i}
                        onClick={stat.action}
                        className={cn(
                            "group hover:border-emerald-500/30 transition-all relative overflow-hidden bg-slate-900 shadow-2xl",
                            stat.action && "cursor-pointer active:scale-95"
                        )}
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="bg-emerald-500/10 p-1.5 rounded-lg tooltip-trigger group/tooltip relative">
                                <Info size={14} className="text-emerald-500" />
                                <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-slate-950 border border-slate-800 rounded-xl text-[9px] font-bold text-slate-400 uppercase tracking-widest invisible group-hover/tooltip:visible opacity-0 group-hover/tooltip:opacity-100 transition-all z-50">
                                    {stat.desc}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className={cn("p-3 rounded-2xl bg-slate-950 border border-slate-800", stat.color)}>
                                <stat.icon size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{stat.label}</p>
                                <h3 className="text-2xl font-black text-white mt-1 uppercase tracking-tighter">{stat.value}</h3>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Weekly Meetings Calendar */}
                <Card className="lg:col-span-1 bg-slate-950 border-slate-800 shadow-3xl">
                    <CardHeader
                        title={t('weekly_meetings')}
                        icon={<CalendarIcon className="text-indigo-400" size={20} />}
                    />
                    <div className="space-y-4 pt-6">
                        <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mb-4">Scheduled for Today</p>
                        {meetings.map((m) => (
                            <div key={m.id} className="group p-4 bg-slate-900/50 border border-slate-800 rounded-2xl flex items-center justify-between hover:border-indigo-500/30 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center font-black text-xs text-white uppercase group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                        {m.time.split(':')[0]}h
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-black text-white uppercase tracking-tight">{m.athlete}</h4>
                                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">{m.type} • {m.duration}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setSelectedAthleteForTech({ full_name: m.athlete, email: '' })}
                                        className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg text-[8px] font-black uppercase tracking-widest border border-emerald-500/20 transition-all flex items-center gap-2"
                                    >
                                        <Target size={12} /> Assessment
                                    </button>
                                    <button className="p-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-500 hover:text-indigo-400 hover:border-indigo-500/50 transition-all">
                                        <Video size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                        <button className="w-full mt-4 py-3 bg-slate-900 border border-slate-800 text-slate-500 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:text-white hover:border-slate-700 transition-all">
                            View Full Calendar
                        </button>
                    </div>
                </Card>

                {/* Load Curve Progress */}
                <Card className="lg:col-span-2 bg-slate-950 border-slate-800 shadow-3xl">
                    <CardHeader title="Load Intensity Overview" icon={<Activity className="text-emerald-400" size={20} />} />
                    <div className="h-[300px] w-full pt-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    stroke="#475569"
                                    fontSize={10}
                                    fontWeight="bold"
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    stroke="#475569"
                                    fontSize={10}
                                    fontWeight="bold"
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '12px' }}
                                    itemStyle={{ fontSize: '10px', color: '#10b981', fontWeight: 'bold', textTransform: 'uppercase' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="load"
                                    stroke="#10b981"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorLoad)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Performance Alerts (Missed Workouts) */}
                <Card className="bg-slate-950 border-rose-500/10 shadow-3xl">
                    <CardHeader
                        title={t('missed_workout_alert')}
                        icon={<AlertCircle className="text-rose-500" size={20} />}
                    />
                    <div className="space-y-4 pt-6">
                        {missedWorkouts.map(alert => (
                            <div key={alert.id} className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-2xl flex items-center justify-between group hover:bg-rose-500/10 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-rose-500 flex items-center justify-center text-slate-950 font-black text-lg">
                                        {alert.avatar}
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-black text-white uppercase tracking-tight">{alert.athlete}</h4>
                                        <p className="text-[10px] text-rose-500/80 font-bold uppercase tracking-widest">{alert.workout}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-2">{alert.daysAgo}</p>
                                    <button className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-rose-400 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all">
                                        Intervene
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Recent Platform Notifications */}
                <Card className="bg-slate-950 border-slate-800 shadow-3xl">
                    <CardHeader title="System Pulse" icon={<Clock className="text-slate-500" size={20} />} />
                    <div className="space-y-4 pt-6">
                        {[
                            { text: 'Emma Wilson shared a new session recording.', time: '12m ago', icon: <CheckCircle2 className="text-emerald-500" /> },
                            { text: 'New subscription: Alex Morgan (Premium Performance)', time: '45m ago', icon: <TrendingUp className="text-emerald-400" /> },
                            { text: 'Garmin Cloud Sync completed for 12 athletes. ', time: '1h ago', icon: <Activity className="text-blue-500" /> },
                            { text: 'James Miller updated his season objective.', time: '2h ago', icon: <Target className="text-indigo-500" /> },
                        ].map((n, i) => (
                            <div key={i} className="flex gap-4 p-4 hover:bg-slate-900/50 rounded-2xl transition-all cursor-default group">
                                <div className="mt-1">{n.icon}</div>
                                <div>
                                    <p className="text-[11px] text-white font-medium uppercase tracking-tight group-hover:text-emerald-400 transition-colors">{n.text}</p>
                                    <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mt-1">{n.time}</p>
                                </div>
                            </div>
                        ))}
                        <button
                            onClick={() => navigate('/pricing')}
                            className="w-full mt-4 py-4 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-500/20 transition-all flex items-center justify-center gap-2"
                        >
                            <Tag size={14} /> Manage My Pricing & Offers
                        </button>
                    </div>
                </Card>
            </div>

            {/* Advanced Invite Modal */}
            {showInviteModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-black/80 animate-in fade-in duration-300">
                    <Card className="w-full max-w-lg border-emerald-500/20 shadow-2xl animate-in zoom-in-95 duration-500 bg-slate-950 p-8">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h2 className="text-2xl font-black text-white uppercase tracking-tighter">{t('invite_athlete')}</h2>
                                <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest mt-1">Onboarding Orchestration phase {inviteStep}/2</p>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                                <UserPlus size={24} />
                            </div>
                        </div>

                        <form onSubmit={handleInviteSubmit} className="space-y-6">
                            {inviteStep === 1 && (
                                <div className="space-y-6 animate-in slide-in-from-right-10 duration-500">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Athlete Identity</label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <input
                                                type="text"
                                                placeholder="Full Name"
                                                value={inviteData.name}
                                                onChange={e => setInviteData(p => ({ ...p, name: e.target.value }))}
                                                className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-4 text-white text-xs font-bold"
                                            />
                                            <input
                                                type="email"
                                                required
                                                placeholder="athlete.email@domain.com"
                                                value={inviteData.email}
                                                onChange={e => setInviteData(p => ({ ...p, email: e.target.value }))}
                                                className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-4 text-white text-xs font-bold"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Primary Sport</label>
                                        <select
                                            value={inviteData.sport}
                                            onChange={e => setInviteData(p => ({ ...p, sport: e.target.value }))}
                                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-4 text-white text-xs font-black uppercase tracking-widest"
                                        >
                                            <option value="">Select Category...</option>
                                            <option value="Running">Running</option>
                                            <option value="Cycling">Cycling</option>
                                            <option value="Swimming">Swimming</option>
                                            <option value="Triathlon">Triathlon</option>
                                        </select>
                                    </div>
                                </div>
                            )}

                            {inviteStep === 2 && (
                                <div className="space-y-6 animate-in slide-in-from-right-10 duration-500">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Performance Objective (Manual Entry)</label>
                                        <textarea
                                            placeholder="e.g. Ironman 70.3 Nice, Sub 1:20 Half Marathon..."
                                            value={inviteData.objective}
                                            onChange={e => setInviteData(p => ({ ...p, objective: e.target.value }))}
                                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-4 text-white text-xs font-medium h-24"
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Suggested Subscription Plan</label>
                                        <div className="grid grid-cols-1 gap-2">
                                            {[
                                                { id: 'p1', name: 'Basic Coaching', price: '49€' },
                                                { id: 'p2', name: 'Premium Performance', price: '99€' },
                                                { id: 'p3', name: 'Elite Architect', price: '249€' }
                                            ].map(plan => (
                                                <button
                                                    key={plan.id}
                                                    type="button"
                                                    onClick={() => setInviteData(p => ({ ...p, suggestedPlan: plan.id }))}
                                                    className={cn(
                                                        "flex items-center justify-between p-4 rounded-2xl border-2 transition-all",
                                                        inviteData.suggestedPlan === plan.id ? "border-emerald-500 bg-emerald-500/5" : "border-slate-900 bg-slate-900/50 hover:bg-slate-900"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={cn("w-2 h-2 rounded-full", inviteData.suggestedPlan === plan.id ? "bg-emerald-500" : "bg-slate-700")} />
                                                        <span className="text-[10px] font-black text-white uppercase tracking-tight">{plan.name}</span>
                                                    </div>
                                                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{plan.price}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Initial Form Status</label>
                                        <div className="flex gap-2">
                                            {['recovering', 'optimal', 'peak'].map(s => (
                                                <button
                                                    key={s}
                                                    type="button"
                                                    onClick={() => setInviteData(p => ({ ...p, formStatus: s }))}
                                                    className={cn(
                                                        "flex-1 py-3 rounded-xl border-2 font-black uppercase tracking-tighter text-[9px] transition-all",
                                                        inviteData.formStatus === s ? "border-emerald-500 bg-emerald-500/5 text-white" : "border-slate-800 text-slate-600"
                                                    )}
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-4 pt-6">
                                {inviteStep === 1 ? (
                                    <button
                                        type="button"
                                        onClick={() => setShowInviteModal(false)}
                                        className="flex-1 py-4 text-xs font-black text-slate-500 hover:text-white uppercase tracking-widest transition-all"
                                    >
                                        Abort
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setInviteStep(1)}
                                        className="flex-1 py-4 bg-slate-800 text-white rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2"
                                    >
                                        <ChevronLeft size={16} /> Back
                                    </button>
                                )}

                                {inviteStep === 1 ? (
                                    <button
                                        type="button"
                                        onClick={() => setInviteStep(2)}
                                        disabled={!inviteData.email}
                                        className="flex-2 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 disabled:opacity-30"
                                    >
                                        Parameters <ChevronRightIcon size={16} />
                                    </button>
                                ) : (
                                    <button
                                        type="submit"
                                        className="flex-2 px-12 py-4 bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                                    >
                                        Deploy Invitation <CheckCircle2 size={16} />
                                    </button>
                                )}
                            </div>
                        </form>
                    </Card>
                </div>
            )}
            {/* Technical Assessment Modal */}
            {selectedAthleteForTech && (
                <CoachTechnicalForm
                    athlete={selectedAthleteForTech}
                    onClose={() => setSelectedAthleteForTech(null)}
                    onSave={(data: TechnicalAssessmentData) => {
                        logger.log('Technical Data Saved:', data);
                    }}
                />
            )}
        </div>
    );
}
