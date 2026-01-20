import React, { useState } from 'react';
import { Card } from '@/shared/components/ui/Card';
import { startOfWeek, addDays, format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, addMinutes, differenceInMinutes } from 'date-fns';
import { fr, es, ca, enUS } from 'date-fns/locale';
import { useLanguage } from '@/shared/context/LanguageContext';
import { useTraining } from '@/features/planner/contexts/TrainingContext';
import { useAuthStore } from '@/features/auth/stores/authStore';
import {
    ChevronLeft, ChevronRight, Activity, Zap, Sparkles, Calendar as CalendarIcon, List,
    Moon, Trophy, Plus, Mail, BookOpen, Clock, X, Bell, Edit, Trash2, Users, Target, Sun, CheckCircle, XCircle, Video,
    Cloud, CloudRain, CloudLightning, ShieldAlert
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { SessionDetailModal } from '@/shared/components/common/SessionDetailModal';
import { Workout, PersonalEvent, PersonalEventType } from '@/shared/types';
import { toast } from 'sonner';

export function AthleteCalendar() {
    const { language, t } = useLanguage();
    const { workouts, personalEvents, addPersonalEvent, updatePersonalEvent, deletePersonalEvent, acceptWorkout, respondToPersonalEvent, respondToWorkout } = useTraining();

    const locales: Record<string, any> = { fr, es, ca, en: enUS };
    const currentLocale = locales[language] || enUS;
    const { currentUser, loading } = useAuthStore();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState('month'); // 'week', 'month', 'quarter', 'year'
    const [selectedSession, setSelectedSession] = useState<Workout | null>(null);
    const [showEventModal, setShowEventModal] = useState(false);
    const [selectedDayForEvent, setSelectedDayForEvent] = useState<Date | null>(null);
    const [selectedPersonalEvent, setSelectedPersonalEvent] = useState<PersonalEvent | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [eventType, setEventType] = useState<PersonalEventType>('workout');
    const [isAllDay, setIsAllDay] = useState(false);

    if (loading) {
        return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading...</div>;
    }

    if (!currentUser) {
        return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Please log in.</div>;
    }

    const getInterval = (date: Date, mode: string) => {
        if (mode === 'week') return { start: startOfWeek(date, { weekStartsOn: 1 }), end: addDays(startOfWeek(date, { weekStartsOn: 1 }), 6) };
        if (mode === 'month') return { start: startOfMonth(date), end: endOfMonth(date) };
        if (mode === 'quarter') return { start: startOfMonth(date), end: endOfMonth(addDays(date, 90)) };
        if (mode === 'year') return { start: startOfMonth(new Date(date.getFullYear(), 0, 1)), end: endOfMonth(new Date(date.getFullYear(), 11, 31)) };
        return { start: startOfMonth(date), end: endOfMonth(date) };
    };

    const getEventTypeConfig = (type: PersonalEventType) => {
        const configs: Record<PersonalEventType, { icon: any, color: string, bg: string, border: string }> = {
            rdv: { icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
            workout: { icon: Zap, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
            competition: { icon: Trophy, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
            vacation: { icon: Sun, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/30' },
            busy: { icon: ShieldAlert, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30' },
            other: { icon: CalendarIcon, color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/30' }
        };
        return configs[type] || configs.other;
    };

    // V4: Weather Simulation
    const getWeatherIcon = (date: Date) => {
        const day = date.getDate();
        if (day % 4 === 0) return <CloudRain size={10} className="text-indigo-400" />;
        if (day % 3 === 0) return <Cloud size={10} className="text-slate-400" />;
        if (day % 5 === 0) return <CloudLightning size={10} className="text-amber-400" />;
        return <Sun size={10} className="text-amber-400" />;
    };

    // V4: Data-Driven Compliance Logic
    const getComplianceLevel = (plannedLoad: number, actualLoad?: number) => {
        if (!actualLoad) return 'pending';
        const ratio = actualLoad / plannedLoad;
        if (ratio >= 0.9 && ratio <= 1.1) return 'high';
        if (ratio >= 0.7) return 'moderate';
        return 'low';
    };

    const { start: startDate, end: endDate } = getInterval(currentDate, viewMode);
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    const athleteWorkouts = workouts.filter(w => w.athleteId === currentUser.id);
    const vacations = currentUser?.profile_data?.vacations || [];

    const loadData = days.map(day => {
        const workout = athleteWorkouts.find(w => isSameDay(new Date(w.date), day));
        return {
            date: format(day, 'MMM dd', { locale: currentLocale }),
            programmed: Math.sin(day.getTime() / (1000 * 60 * 60 * 24 * 7)) * 200 + 400,
            realized: workout && (workout.status === 'completed' || workout.status === 'COMPLETED') ? (workout.actualLoad || workout.plannedLoad || 300) : (workout ? 0 : null),
            rpe: workout && (workout.status === 'completed' || workout.status === 'COMPLETED') ? (workout.rpe || 6) * 60 : (workout ? 0 : null)
        };
    });

    const handleRequestNotificationPermission = async () => {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                toast.success('Notifications accepted');
            }
        }
    };

    const scheduleMockNotification = (event: PersonalEvent) => {
        const reminderMinutes = event.reminderBefore || 0;
        const now = new Date();
        const eventStart = new Date(event.start);
        const diff = differenceInMinutes(eventStart, now);

        if (diff > reminderMinutes && event.notificationTypes?.includes('push')) {
            toast.info(`Push notification scheduled ${reminderMinutes}min before: ${event.title}`);
            // In a real app, this would use a service worker or backend scheduling
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter">{t('schedule')}</h1>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">{t('sync_schedule_note')}</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
                        {['week', 'month', 'quarter', 'year'].map(mode => (
                            <button
                                key={mode}
                                onClick={() => setViewMode(mode)}
                                className={cn(
                                    "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all",
                                    viewMode === mode ? "bg-emerald-500 text-slate-950" : "text-slate-500 hover:text-white"
                                )}
                            >
                                {t(`view_${mode}`)}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl p-1">
                        <button onClick={() => setCurrentDate(addDays(currentDate, viewMode === 'week' ? -7 : (viewMode === 'month' ? -30 : (viewMode === 'year' ? -365 : -90))))} className="p-2 text-slate-400 hover:text-white"><ChevronLeft size={18} /></button>
                        <span className="px-3 text-[10px] font-black text-white uppercase tracking-widest min-w-[120px] text-center">
                            {format(currentDate, viewMode === 'week' ? 'MMM yyyy' : 'yyyy', { locale: currentLocale })}
                            {viewMode === 'month' && format(currentDate, ' MMM', { locale: currentLocale })}
                        </span>
                        <button onClick={() => setCurrentDate(addDays(currentDate, viewMode === 'week' ? 7 : (viewMode === 'month' ? 30 : (viewMode === 'year' ? 365 : 90))))} className="p-2 text-slate-400 hover:text-white"><ChevronRight size={18} /></button>
                    </div>
                </div>
            </div>

            <Card className="h-28 p-0 overflow-hidden relative border-emerald-500/10 bg-slate-900/40">
                <div className="absolute inset-x-0 bottom-0 h-full opacity-60">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={loadData}>
                            <defs>
                                <linearGradient id="colorActualCal" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorRPECal" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <Area type="monotone" dataKey="programmed" stroke="#475569" fill="transparent" strokeWidth={1} strokeDasharray="6 4" />
                            <Area type="monotone" dataKey="rpe" stroke="#f59e0b" fill="url(#colorRPECal)" fillOpacity={0.1} strokeWidth={2} connectNulls />
                            <Area type="monotone" dataKey="realized" stroke="#10b981" fill="url(#colorActualCal)" fillOpacity={0.2} strokeWidth={3} connectNulls />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
                <div className="relative z-10 p-4 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-4 mb-1">
                            <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">{t('macro_cycle_trend')}</p>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-0.5 bg-slate-500 border-t border-dashed border-slate-400"></div>
                                    <span className="text-[8px] text-slate-500 font-bold uppercase">{t('planned_curve')}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                    <span className="text-[8px] text-emerald-500 font-bold uppercase">{t('actual_curve')}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                                    <span className="text-[8px] text-amber-500 font-bold uppercase">{t('rpe_curve')}</span>
                                </div>
                            </div>
                        </div>
                        <h3 className="text-white font-bold">{t('planned_periodization_curve')}</h3>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] text-slate-500 font-bold uppercase">{t('current_phase')}</p>
                        <span className="text-xs bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded-md font-bold uppercase border border-emerald-500/20">{t('volume_accumulation')}</span>
                    </div>
                </div>
            </Card>

            <div className={cn(
                "grid gap-2",
                viewMode === 'week' ? "grid-cols-7" :
                    viewMode === 'month' ? "grid-cols-2 md:grid-cols-4 lg:grid-cols-7" :
                        viewMode === 'quarter' ? "grid-cols-4 md:grid-cols-7 lg:grid-cols-10" :
                            "grid-cols-7 md:grid-cols-14 lg:grid-cols-21"
            )}>
                {days.map((day, idx) => {
                    const dayWorkouts = athleteWorkouts.filter(w => isSameDay(new Date(w.date), day));
                    const dayEvents = personalEvents
                        .filter(e => isSameDay(new Date(e.start), day))
                        .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

                    const isToday = isSameDay(day, new Date());
                    const isMonthStart = day.getDate() === 1;
                    const isOnVacation = vacations.some((v: any) => {
                        const start = new Date(v.start);
                        const end = new Date(v.end);
                        return day >= start && day <= end;
                    });

                    return (
                        <div key={idx} className={cn(
                            "min-h-[140px] p-2 rounded-xl border transition-all flex flex-col group relative overflow-hidden",
                            isToday ? "bg-emerald-500/5 border-emerald-500/30 ring-1 ring-emerald-500/20" : "bg-slate-900/50 border-slate-800 hover:border-slate-700",
                            isOnVacation && "bg-amber-500/5 border-amber-500/20",
                            viewMode === 'year' && "min-h-[60px] p-1.5",
                            isMonthStart && (viewMode === 'quarter' || viewMode === 'year') && "ring-1 ring-slate-700"
                        )}>
                            {isMonthStart && (viewMode === 'quarter' || viewMode === 'year') && (
                                <div className="absolute top-0 left-0 right-0 py-0.5 px-2 bg-slate-800 border-b border-slate-700">
                                    <span className="text-[7px] font-black uppercase text-emerald-400 tracking-[0.2em]">
                                        {format(day, 'MMMM', { locale: currentLocale })}
                                    </span>
                                </div>
                            )}
                            <div className={cn("flex justify-between items-start mb-1", isMonthStart && (viewMode === 'quarter' || viewMode === 'year') && "mt-5")}>
                                <div className="flex flex-col items-center gap-1.5">
                                    <span className={cn("text-[8px] font-black uppercase tracking-tighter", isToday ? "text-emerald-400" : (isOnVacation ? "text-amber-500" : "text-slate-500"))}>
                                        {format(day, 'EEE', { locale: currentLocale })}
                                    </span>
                                    <div className="group/weather relative cursor-help">
                                        {getWeatherIcon(day)}
                                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-800 text-white text-[7px] font-black px-2 py-1 rounded opacity-0 group-hover/weather:opacity-100 transition-all uppercase tracking-widest whitespace-nowrap shadow-2xl z-50 pointer-events-none">
                                            {t('weather_forecast')}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedDayForEvent(day);
                                            setIsEditing(false);
                                            setEventType('workout');
                                            setIsAllDay(false);
                                            setSelectedPersonalEvent(null);
                                            setShowEventModal(true);
                                        }}
                                        className="opacity-50 group-hover:opacity-100 p-1.5 bg-slate-800/50 hover:bg-emerald-500 rounded-lg transition-all text-white shadow-lg border border-white/5"
                                        title={t('add_event')}
                                    >
                                        <Plus size={12} strokeWidth={3} />
                                    </button>
                                    <span className={cn("text-xs font-black", isToday ? "text-emerald-400" : "text-white")}>{format(day, 'dd')}</span>
                                </div>
                            </div>

                            <div className="flex-1 space-y-2 relative z-10">
                                {dayWorkouts.map(workout => (
                                    <div key={workout.id} onClick={() => setSelectedSession(workout)} className={cn(
                                        "p-2 rounded-xl text-[10px] font-bold border leading-tight transition-all cursor-pointer relative group/workout overflow-hidden",
                                        (workout.status === 'completed' || workout.status === 'COMPLETED') ? "bg-slate-950/50 border-emerald-500/20 text-emerald-400 hover:border-emerald-500/50" :
                                            workout.status === 'PENDING_ACCEPTANCE' ? "bg-amber-500/10 border-amber-500/30 text-amber-500 hover:border-amber-500/50 border-dashed" :
                                                "bg-slate-950 border-indigo-500/20 text-indigo-300 hover:border-indigo-500/50"
                                    )}>
                                        <div className="flex items-center justify-between gap-1 mb-1">
                                            <div className="flex items-center gap-1 min-w-0">
                                                {(workout.status === 'completed' || workout.status === 'COMPLETED') ? <Zap size={8} className="text-emerald-400" /> : <Activity size={8} className={workout.status === 'PENDING_ACCEPTANCE' ? "text-amber-500" : "text-indigo-400"} />}
                                                <span className="truncate uppercase text-[8px]">{workout.title}</span>
                                            </div>
                                            {(workout.status === 'completed' || workout.status === 'COMPLETED') && (
                                                <div className="flex gap-0.5 flex-shrink-0">
                                                    {(() => {
                                                        const compliance = getComplianceLevel(workout.plannedLoad || 400, workout.actualLoad);
                                                        return (
                                                            <>
                                                                <div className={cn("w-1 h-1 rounded-full", compliance === 'high' ? "bg-emerald-500" : "bg-slate-700")} />
                                                                <div className={cn("w-1 h-1 rounded-full", compliance === 'moderate' ? "bg-amber-500" : "bg-slate-700")} />
                                                                <div className={cn("w-1 h-1 rounded-full", compliance === 'low' ? "bg-rose-500" : "bg-slate-700")} />
                                                            </>
                                                        );
                                                    })()}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between gap-1">
                                            {(workout.actualLoad || workout.plannedLoad) && <span className="opacity-60 text-[7px]">{workout.actualLoad || workout.plannedLoad} {t('ua')}</span>}
                                            {workout.status === 'PENDING_ACCEPTANCE' && <span className="text-[6px] font-black bg-amber-500/20 px-1 rounded uppercase">Pending</span>}
                                            <Sparkles size={10} className="text-slate-600 group-hover/workout:text-emerald-400/50 transition-colors" />
                                        </div>
                                    </div>
                                ))}

                                {dayEvents.map(event => {
                                    const config = getEventTypeConfig(event.type);
                                    const Icon = config.icon;
                                    return (
                                        <div key={event.id} onClick={() => setSelectedPersonalEvent(event)} className={cn(
                                            "p-2 rounded-xl border transition-all cursor-pointer flex flex-col gap-1",
                                            config.bg,
                                            config.border,
                                            event.status === 'pending' ? "border-dashed border-opacity-60 bg-opacity-20" : "border-opacity-40",
                                            "hover:border-opacity-100"
                                        )}>
                                            <div className="flex items-center justify-between gap-1 overflow-hidden">
                                                <div className="flex items-center gap-2 overflow-hidden">
                                                    <Icon size={8} className={config.color} />
                                                    <span className={cn("truncate uppercase text-[8px] font-black leading-none", config.color)}>{event.title}</span>
                                                </div>
                                                {event.status === 'pending' && <div className="p-0.5 bg-amber-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.5)]"></div>}
                                            </div>
                                            <div className="flex items-center gap-1 text-[7px] text-slate-500 font-bold">
                                                <Clock size={6} />
                                                <span>{format(new Date(event.start), 'HH:mm')} - {format(new Date(event.end), 'HH:mm')}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            {selectedSession && <SessionDetailModal session={selectedSession} onClose={() => setSelectedSession(null)} />}

            {/* Combined Add/Edit Event Modal */}
            {showEventModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-black/80 animate-in fade-in duration-300">
                    <Card className="w-full max-w-md border-emerald-500/30 shadow-2xl bg-slate-950 p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
                                {isEditing ? <Edit className="text-emerald-400" /> : <Plus className="text-emerald-400" />} {isEditing ? t('edit_event') : t('add_event')}
                            </h3>
                            <button onClick={() => setShowEventModal(false)} className="text-slate-500 hover:text-white transition-colors p-2 hover:bg-slate-900 rounded-xl"><X size={20} /></button>
                        </div>

                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget as HTMLFormElement);
                            const isAllDayVal = formData.get('is_all_day') === 'on';
                            const startTime = formData.get('start_time') as string;
                            const duration = Number(formData.get('duration'));
                            const notificationTypes = formData.getAll('notif_type') as ('email' | 'push')[];
                            const type = formData.get('type') as PersonalEventType;

                            const baseDate = isEditing && selectedPersonalEvent ? new Date(selectedPersonalEvent.start) : new Date(selectedDayForEvent!);

                            if (!isAllDayVal) {
                                const [hours, minutes] = startTime.split(':').map(Number);
                                baseDate.setHours(hours, minutes, 0, 0);
                            } else {
                                baseDate.setHours(0, 0, 0, 0);
                            }

                            const endDate = isAllDayVal ? addDays(baseDate, 1) : addMinutes(baseDate, duration);

                            const eventData = {
                                athleteId: currentUser.id,
                                title: formData.get('title') as string,
                                type,
                                comment: formData.get('comment') as string,
                                start: baseDate.toISOString(),
                                end: endDate.toISOString(),
                                isAllDay: isAllDayVal,
                                reminderBefore: Number(formData.get('reminder')),
                                notificationTypes,
                                allowWorkouts: formData.get('allowWorkouts') === 'on',
                                allowCompetitions: formData.get('allowCompetitions') === 'on',
                                allowRDV: formData.get('allowRDV') === 'on',
                            };

                            if (isEditing && selectedPersonalEvent) {
                                await updatePersonalEvent(selectedPersonalEvent.id, eventData);
                                toast.success('Event updated');
                            } else {
                                await addPersonalEvent(eventData);
                                toast.success('Event created');
                            }

                            if (notificationTypes.includes('push')) {
                                handleRequestNotificationPermission();
                            }

                            setShowEventModal(false);
                            setSelectedPersonalEvent(null);
                        }} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('event_title')}</label>
                                    <input name="title" required defaultValue={selectedPersonalEvent?.title} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white font-bold h-12 outline-none focus:border-emerald-500/50 transition-colors" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('event_type')}</label>
                                    <select
                                        name="type"
                                        required
                                        value={eventType}
                                        onChange={(e) => setEventType(e.target.value as PersonalEventType)}
                                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white font-bold h-12 outline-none focus:border-emerald-500/50 transition-colors uppercase text-[10px]"
                                    >
                                        <option value="workout">{t('type_workout')}</option>
                                        <option value="competition">{t('type_competition')}</option>
                                        <option value="rdv">{t('type_rdv')}</option>
                                        <option value="vacation">{t('type_vacation')}</option>
                                        <option value="busy">{t('athlete_unavailable')}</option>
                                        <option value="other">{t('type_other')}</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 p-3 bg-slate-900/50 border border-slate-800 rounded-xl">
                                <label className="flex items-center gap-3 cursor-pointer group w-full">
                                    <input
                                        type="checkbox"
                                        name="is_all_day"
                                        checked={isAllDay}
                                        onChange={(e) => setIsAllDay(e.target.checked)}
                                        className="rounded border-slate-700 bg-slate-900 checked:bg-emerald-500"
                                    />
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('all_day')}</span>
                                </label>
                            </div>

                            {!isAllDay && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('start_time')}</label>
                                        <input type="time" name="start_time" required defaultValue={selectedPersonalEvent ? format(new Date(selectedPersonalEvent.start), 'HH:mm') : "08:00"} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white font-bold h-12 outline-none focus:border-emerald-500/50 transition-colors" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('duration')} (min)</label>
                                        <input type="number" name="duration" required defaultValue={selectedPersonalEvent ? differenceInMinutes(new Date(selectedPersonalEvent.end), new Date(selectedPersonalEvent.start)) : "60"} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white font-bold h-12 outline-none focus:border-emerald-500/50 transition-colors" />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('comment')}</label>
                                <textarea name="comment" defaultValue={selectedPersonalEvent?.comment} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white font-bold h-24 outline-none focus:border-emerald-500/50 transition-colors" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('notification_type')}</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <label className="flex items-center gap-3 p-3 bg-slate-900/50 border border-slate-800 rounded-xl cursor-pointer hover:bg-slate-900 transition-colors">
                                        <input type="checkbox" name="notif_type" value="email" defaultChecked={selectedPersonalEvent?.notificationTypes?.includes('email')} className="rounded border-slate-700 bg-slate-900 checked:bg-emerald-500" />
                                        <div className="flex items-center gap-2">
                                            <Mail size={14} className="text-slate-400" />
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('email_notification')}</span>
                                        </div>
                                    </label>
                                    <label className="flex items-center gap-3 p-3 bg-slate-900/50 border border-slate-800 rounded-xl cursor-pointer hover:bg-slate-900 transition-colors">
                                        <input type="checkbox" name="notif_type" value="push" defaultChecked={selectedPersonalEvent?.notificationTypes?.includes('push')} className="rounded border-slate-700 bg-slate-900 checked:bg-emerald-500" />
                                        <div className="flex items-center gap-2">
                                            <Bell size={14} className="text-slate-400" />
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('push_notification')}</span>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t('reminder')}</label>
                                <div className="flex items-center gap-2">
                                    <input type="number" name="reminder" defaultValue={selectedPersonalEvent?.reminderBefore || 30} className="w-24 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-white font-bold h-10 outline-none focus:border-emerald-500/50 transition-colors" />
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t('minutes_before')}</span>
                                </div>
                            </div>

                            <div className="space-y-3 p-4 bg-slate-900/50 border border-slate-800 rounded-2xl">
                                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2">{t('activity_permissions')}</p>
                                <p className="text-[8px] font-bold text-slate-500 uppercase tracking-wider mb-2">{t('allow_activities_during_event')}</p>
                                <div className="grid grid-cols-1 gap-2">
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <input type="checkbox" name="allowWorkouts" defaultChecked={selectedPersonalEvent?.allowWorkouts} className="rounded border-slate-700 bg-slate-900 checked:bg-emerald-500" />
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('allow_workouts')}</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <input type="checkbox" name="allowCompetitions" defaultChecked={selectedPersonalEvent?.allowCompetitions} className="rounded border-slate-700 bg-slate-900 checked:bg-emerald-500" />
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('allow_competitions')}</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <input type="checkbox" name="allowRDV" defaultChecked={selectedPersonalEvent?.allowRDV} className="rounded border-slate-700 bg-slate-900 checked:bg-emerald-500" />
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('allow_rdv')}</span>
                                    </label>
                                </div>
                            </div>

                            <button type="submit" className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-emerald-900/20">
                                {isEditing ? t('confirm_changes') : t('confirm')}
                            </button>
                        </form>
                    </Card>
                </div>
            )}

            {/* Event View/Actions Modal */}
            {selectedPersonalEvent && !showEventModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-black/80 animate-in fade-in duration-300">
                    <Card className="w-full max-w-sm border-emerald-500/30 shadow-2xl bg-slate-950 p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-black text-white uppercase tracking-tighter">{selectedPersonalEvent.title}</h3>
                            <div className="flex gap-2">
                                <button onClick={() => {
                                    setIsEditing(true);
                                    setEventType(selectedPersonalEvent.type);
                                    setIsAllDay(!!selectedPersonalEvent.isAllDay);
                                    setShowEventModal(true);
                                }} className="text-slate-500 hover:text-emerald-400 transition-colors p-2 hover:bg-slate-900 rounded-xl">
                                    <Edit size={18} />
                                </button>
                                <button onClick={() => setSelectedPersonalEvent(null)} className="text-slate-500 hover:text-white transition-colors p-2 hover:bg-slate-900 rounded-xl">
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        {selectedPersonalEvent.status === 'pending' && (
                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 space-y-3">
                                <div className="flex items-center gap-2">
                                    <Bell size={14} className="text-amber-500" />
                                    <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">{t('new_proposition_notif')}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={async () => { await respondToPersonalEvent(selectedPersonalEvent.id, 'accept'); setSelectedPersonalEvent(null); }}
                                        className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all shadow-lg flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle size={14} /> {t('accept')}
                                    </button>
                                    <button
                                        onClick={async () => { await respondToPersonalEvent(selectedPersonalEvent.id, 'refuse'); setSelectedPersonalEvent(null); }}
                                        className="flex-1 py-3 bg-slate-800 hover:bg-rose-500/10 border border-slate-700 hover:border-rose-500/50 text-slate-400 hover:text-rose-500 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all flex items-center justify-center gap-2"
                                    >
                                        <XCircle size={14} /> {t('refuse')}
                                    </button>
                                </div>
                            </div>
                        )}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-3 text-slate-400">
                                    <CalendarIcon size={16} />
                                    <span className="text-xs font-black uppercase tracking-widest">{format(new Date(selectedPersonalEvent.start), 'PPP', { locale: currentLocale })}</span>
                                </div>
                                <div className="flex items-center gap-3 text-emerald-400">
                                    <Clock size={16} />
                                    <span className="text-xs font-black uppercase tracking-widest">
                                        {format(new Date(selectedPersonalEvent.start), 'HH:mm')} - {format(new Date(selectedPersonalEvent.end), 'HH:mm')}
                                    </span>
                                </div>
                                {selectedPersonalEvent.location && (
                                    <div className="flex items-center gap-3 text-indigo-400">
                                        {selectedPersonalEvent.location === 'physical' ? <Users size={16} /> : <Video size={16} />}
                                        <span className="text-xs font-black uppercase tracking-widest">
                                            {selectedPersonalEvent.location === 'physical' ? t('physical') : t('virtual')}
                                        </span>
                                    </div>
                                )}
                            </div>
                            {selectedPersonalEvent.comment && <p className="text-sm text-slate-300 bg-slate-900 p-4 rounded-xl border border-slate-800 leading-relaxed font-bold">{selectedPersonalEvent.comment}</p>}

                            <div className="flex flex-wrap gap-2">
                                {selectedPersonalEvent.notificationTypes?.map(type => (
                                    <div key={type} className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 rounded-lg text-[10px] font-black text-emerald-400 uppercase tracking-widest border border-emerald-500/20">
                                        {type === 'email' ? <Mail size={12} /> : <Bell size={12} />} {type} reminder ({selectedPersonalEvent.reminderBefore}min)
                                    </div>
                                ))}
                            </div>

                            <button onClick={async () => { await deletePersonalEvent(selectedPersonalEvent.id); setSelectedPersonalEvent(null); toast.error('Event deleted'); }} className="w-full py-3 border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all flex items-center justify-center gap-2">
                                <Trash2 size={14} /> {t('delete_event')}
                            </button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
