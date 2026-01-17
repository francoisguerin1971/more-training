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
import { useTraining } from '@/features/planner/contexts/TrainingContext';
import { useAuthStore } from '@/features/auth/stores/authStore';
import {
    ChevronLeft, ChevronRight, Activity, Zap,
    Sparkles, LayoutGrid, List, TrendingUp, Moon, Clock,
    X, Video, MapPin, Calendar as CalendarIcon, User
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

export function CoachCalendar() {
    const { language, t } = useLanguage();
    const { workouts, addWorkout, addPersonalEvent } = useTraining();
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

    React.useEffect(() => {
        if (currentUser) {
            getAthletesForCoach(currentUser.id).then(setAthletes);
        }
    }, [currentUser, getAthletesForCoach]);

    if (!currentUser) return null;

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
    const days = eachDayOfInterval(range);

    // Mock Load Curve Data based on range
    const loadCurveData = days.map((day, i) => ({
        day: format(day, 'MMM dd', { locale: currentLocale }),
        load: Math.sin(i / (days.length / 4)) * 300 + 400
    }));

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter">{t('smart_planner')}</h1>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Multi-scale Periodization Control</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
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
                            <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">Global Load Prediction</p>
                            <h3 className="text-white font-bold uppercase tracking-tight">Periodization Trend</h3>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="text-right">
                            <p className="text-[10px] text-slate-500 font-bold uppercase">Average Load</p>
                            <p className="text-xl font-black text-white">452 AU</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-slate-500 font-bold uppercase">Planned Volume</p>
                            <p className="text-xl font-black text-emerald-400">High</p>
                        </div>
                    </div>
                </div>
            </Card>

            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto scrollbar-hide">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md">
                                <th className="p-4 text-left w-48 sticky left-0 bg-slate-900 z-20">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('athletes')}</span>
                                </th>
                                {days.map((day, i) => {
                                    const isMonthStart = day.getDate() === 1;
                                    return (
                                        <th key={i} className={cn(
                                            "p-4 min-w-[120px] text-center border-l border-slate-800/50 relative",
                                            isSameDay(day, new Date()) && "bg-emerald-500/5",
                                            isMonthStart && (viewMode === 'quarter' || viewMode === 'year') && "border-l-2 border-l-emerald-500/50"
                                        )}>
                                            {isMonthStart && (viewMode === 'quarter' || viewMode === 'year') && (
                                                <div className="absolute top-0 left-0 right-0 bg-emerald-500/10 py-0.5">
                                                    <span className="text-[7px] font-black text-emerald-400 uppercase tracking-widest leading-none">
                                                        {format(day, 'MMMM', { locale: currentLocale })}
                                                    </span>
                                                </div>
                                            )}
                                            <p className={cn(
                                                "text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1",
                                                isMonthStart && (viewMode === 'quarter' || viewMode === 'year') && "mt-2"
                                            )}>
                                                {format(day, 'eee', { locale: currentLocale })}
                                            </p>
                                            <p className={cn(
                                                "text-sm font-black",
                                                isSameDay(day, new Date()) ? "text-emerald-400" : "text-white"
                                            )}>{format(day, 'dd', { locale: currentLocale })}</p>
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {athletes.map((athlete: any) => (
                                <tr key={athlete.id} className="border-b border-slate-800/50 group hover:bg-slate-800/30 transition-colors">
                                    <td className="p-4 sticky left-0 bg-slate-900 group-hover:bg-slate-800/30 z-20 shadow-xl">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-[10px] font-black text-white border border-slate-700 shadow-md">
                                                {athlete.avatar}
                                            </div>
                                            <span className="text-xs font-bold text-slate-300 truncate uppercase tracking-tight">{athlete.name.split(' ')[0]}</span>
                                        </div>
                                    </td>
                                    {days.map((day, dIdx) => {
                                        const dayWorkout = workouts.find(w => w.athleteId === athlete.id && isSameDay(new Date(w.date), day) && w.coachId === currentUser.id);
                                        const athleteVacations = (athlete as any).profile?.vacations || [];
                                        const isOnVacation = athleteVacations.some((v: any) => {
                                            const start = new Date(v.start);
                                            const end = new Date(v.end);
                                            return day >= start && day <= end;
                                        });
                                        const isPending = dayWorkout?.status === 'PENDING_ACCEPTANCE';

                                        const isMonthStart = day.getDate() === 1;
                                        return (
                                            <td key={dIdx} className={cn(
                                                "p-2 border-l border-slate-800/50 h-28 relative",
                                                isSameDay(day, new Date()) && "bg-emerald-500/5",
                                                isOnVacation && "bg-amber-500/5",
                                                isMonthStart && (viewMode === 'quarter' || viewMode === 'year') && "border-l-2 border-l-emerald-500/30"
                                            )}>
                                                {isOnVacation && (
                                                    <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                                                        <Moon size={32} className="text-amber-500" />
                                                    </div>
                                                )}

                                                {dayWorkout ? (
                                                    <div className={cn(
                                                        "h-full p-2 rounded-xl border flex flex-col justify-between group/workout transition-all scale-95 hover:scale-100 cursor-pointer shadow-lg",
                                                        dayWorkout.status === 'completed' || dayWorkout.status === 'COMPLETED'
                                                            ? "bg-emerald-500/5 border-emerald-500/20"
                                                            : isPending
                                                                ? "bg-amber-500/10 border-amber-500/30 border-dashed"
                                                                : "bg-slate-950 border-slate-800 hover:border-indigo-500/50"
                                                    )}>
                                                        <div>
                                                            <div className="flex items-center gap-1 mb-1">
                                                                <Activity size={10} className={dayWorkout.status === 'completed' || dayWorkout.status === 'COMPLETED' ? "text-emerald-400" : (isPending ? "text-amber-500" : "text-indigo-400")} />
                                                                <span className={cn(
                                                                    "text-[10px] font-black truncate uppercase",
                                                                    isPending ? "text-amber-500" : "text-white"
                                                                )}>{dayWorkout.title}</span>
                                                            </div>
                                                            <p className="text-[8px] text-slate-500 line-clamp-2 uppercase font-bold leading-tight">{dayWorkout.description}</p>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <div className="flex items-center gap-1">
                                                                <span className="text-[9px] font-black text-emerald-500/80">{(dayWorkout as any).plannedLoad || (dayWorkout as any).load} AU</span>
                                                                {isPending && <Clock size={8} className="text-amber-500" />}
                                                            </div>
                                                            {(dayWorkout as any).visualType && <Sparkles size={8} className="text-emerald-400/50" />}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => {
                                                                if (isOnVacation) {
                                                                    toast.warning(`${t('athlete_on_vacation')}`, { description: t('vacation_approval_needed') });
                                                                }
                                                                setSelectedAthleteForProposal(athlete);
                                                                setSelectedDayForProposal(day);
                                                                setShowProposalModal(true);
                                                            }}
                                                            className={cn(
                                                                "w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center transition-all border border-slate-700",
                                                                isOnVacation ? "text-amber-500 hover:bg-amber-500/10" : "text-slate-600 hover:text-emerald-400 hover:bg-emerald-500/10"
                                                            )}
                                                        >
                                                            {isOnVacation ? <Clock size={16} /> : <Zap size={16} />}
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

            <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl flex items-center justify-between shadow-xl">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">High Compliance ({">"}90%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full"></div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Pending Sync</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em]">Intuitive Drag & Drop Planner active</p>
                    {(athletes || []).slice(0, 3).map((a) => (
                        <div key={a.id} className="w-6 h-6 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-[8px] font-bold text-white shadow-lg">
                            {a.name?.charAt(0) || 'A'}
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
