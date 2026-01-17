import React, { useState, useEffect } from 'react';
import { Card } from '@/shared/components/ui/Card';
import { Video, MapPin, ChevronRight, CheckCircle2, AlertTriangle, CreditCard, MessageSquare, ChevronLeft, Calendar as CalendarIcon, Clock, X, Info } from 'lucide-react';
import { useAuthStore } from '@/features/auth/stores/authStore';
import { useLanguage } from '@/shared/context/LanguageContext';
import { cn } from '@/shared/lib/utils';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, isPast, isWeekend, addMinutes, startOfWeek, endOfWeek, differenceInMonths } from 'date-fns';
import { fr, es, ca, enUS, it, de } from 'date-fns/locale';

export function Appointments() {
    const { t, language } = useLanguage();
    const { currentUser, getCoachesForAthlete } = useAuthStore();

    // Locales
    const locales: Record<string, any> = { fr, es, ca, en: enUS, it, de };
    const currentLocale = locales[language] || enUS;

    // State
    const [coaches, setCoaches] = useState<any[]>([]);
    const [selectedCoach, setSelectedCoach] = useState<any>(null);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

    // Booking Form State
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [sessionType, setSessionType] = useState('video');
    const [comment, setComment] = useState('');
    const [bookingPhase, setBookingPhase] = useState<'selection' | 'success'>('selection');
    const [showInfo, setShowInfo] = useState(true);

    // Simulated Billing Logic
    const activePlan = currentUser?.profile_data?.activePlan;
    const isBillable = !activePlan || (activePlan.consultationsRemaining || 0) <= 0;
    const sessionCost = 45;

    // Coach Settings
    const bookingSettings = selectedCoach?.booking_settings || { modes: ['video', 'presencial'], duration: 60, buffer: 0, maxMonths: 3 };

    useEffect(() => {
        const fetchCoaches = async () => {
            if (!currentUser) return;
            const data = await getCoachesForAthlete(currentUser.id);
            if (Array.isArray(data)) {
                setCoaches(data);
                if (data.length > 0) setSelectedCoach(data[0]);
            }
        };
        fetchCoaches();
    }, [currentUser]);

    // Calendar Generation
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    const weekDays = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

    // Time Slots (Mock) - In real app, generate based on duration + buffer
    const timeSlots = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"];

    // Navigation Limits
    const minDate = startOfMonth(new Date());
    const maxDate = addMonths(minDate, (bookingSettings.maxMonths || 3) - 1);
    const canGoPrev = currentMonth > minDate;
    const canGoNext = startOfMonth(currentMonth) < maxDate;

    const handleDateClick = (date: Date) => {
        if (isPast(date) && !isToday(date)) return;
        if (isWeekend(date)) return; // Mock unavailability

        setSelectedDate(date);
        setIsBookingModalOpen(true);
        setBookingPhase('selection');
        setSelectedTime(null);
        setComment('');

        // Reset session type if current selection is not allowed by new coach
        if (bookingSettings.modes.length > 0 && !bookingSettings.modes.includes(sessionType)) {
            setSessionType(bookingSettings.modes[0]);
        }
    };

    const handleConfirmBooking = () => {
        setBookingPhase('success');
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-700 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-6">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tighter uppercase">{t('weekly_meetings')}</h1>
                    <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-1">{t('appointments_subtitle')}</p>
                </div>
            </div>

            {/* Info Card (Dismissible) */}
            {showInfo && (
                <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-2xl flex items-start gap-4 relative animate-in slide-in-from-top-4 duration-500">
                    <div className="bg-indigo-500/20 p-2 rounded-xl text-indigo-400 shrink-0">
                        <Info size={20} />
                    </div>
                    <div className="pr-8">
                        <h3 className="text-indigo-400 font-bold uppercase text-xs tracking-widest mb-1">{t('booking_instructions_title')}</h3>
                        <p className="text-slate-300 text-sm leading-relaxed">{t('booking_instructions_text')}</p>
                    </div>
                    <button onClick={() => setShowInfo(false)} className="absolute top-2 right-2 p-2 hover:bg-indigo-500/20 rounded-xl text-indigo-400/50 hover:text-indigo-400 transition-colors">
                        <X size={16} />
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* LEFT COLUMN: Coaches */}
                <div className="lg:col-span-3 space-y-6">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t('select_coach')}</p>
                    <div className="space-y-4">
                        {coaches.map(coach => (
                            <div
                                key={coach.id}
                                onClick={() => setSelectedCoach(coach)}
                                className={cn(
                                    "p-4 rounded-3xl border transition-all cursor-pointer flex flex-col gap-4 relative overflow-hidden group",
                                    selectedCoach?.id === coach.id
                                        ? "bg-slate-900 border-emerald-500 shadow-xl shadow-emerald-500/10"
                                        : "bg-slate-900/50 border-slate-800 hover:border-slate-700 opacity-70 hover:opacity-100"
                                )}
                            >
                                {selectedCoach?.id === coach.id && (
                                    <div className="absolute top-0 right-0 p-3">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]"></div>
                                    </div>
                                )}
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg transition-transform group-hover:scale-105",
                                        selectedCoach?.id === coach.id ? "bg-slate-800 text-white" : "bg-slate-950 text-slate-500"
                                    )}>
                                        {coach.avatar}
                                    </div>
                                    <div>
                                        <h3 className={cn(
                                            "font-black uppercase text-sm tracking-tight",
                                            selectedCoach?.id === coach.id ? "text-white" : "text-slate-400"
                                        )}>{coach.name}</h3>
                                        <p className="text-[10px] text-emerald-500 font-bold uppercase mt-1">{coach.specialty}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* RIGHT COLUMN: Calendar */}
                <div className="lg:col-span-9">
                    <Card className="bg-slate-950/50 border-slate-800 p-6 md:p-8">
                        {/* Calendar Header */}
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
                                    {format(currentMonth, 'MMMM yyyy', { locale: currentLocale })}
                                </h2>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => canGoPrev && setCurrentMonth(subMonths(currentMonth, 1))}
                                        disabled={!canGoPrev}
                                        className={cn(
                                            "p-2 rounded-xl transition-colors",
                                            canGoPrev ? "hover:bg-slate-900 text-slate-400 hover:text-white" : "text-slate-700 cursor-not-allowed"
                                        )}
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                    <button
                                        onClick={() => canGoNext && setCurrentMonth(addMonths(currentMonth, 1))}
                                        disabled={!canGoNext}
                                        className={cn(
                                            "p-2 rounded-xl transition-colors",
                                            canGoNext ? "hover:bg-slate-900 text-slate-400 hover:text-white" : "text-slate-700 cursor-not-allowed"
                                        )}
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7 gap-px bg-slate-800/50 rounded-2xl overflow-hidden border border-slate-800">
                            {weekDays.map(day => (
                                <div key={day} className="bg-slate-900 py-3 text-center">
                                    <span className="text-[10px] font-black text-slate-500 uppercase">{day}</span>
                                </div>
                            ))}

                            {calendarDays.map((day, idx) => {
                                const isCurrentMonth = isSameMonth(day, currentMonth);
                                const isDayToday = isToday(day);
                                const isPastDay = isPast(day) && !isDayToday;
                                const isWeekendDay = isWeekend(day);
                                const isAvailable = !isPastDay && !isWeekendDay && isCurrentMonth;

                                return (
                                    <div
                                        key={day.toISOString()}
                                        onClick={() => isAvailable && handleDateClick(day)}
                                        className={cn(
                                            "min-h-[100px] p-2 flex flex-col justify-between transition-all relative group",
                                            isCurrentMonth ? "bg-slate-900" : "bg-slate-950",
                                            !isAvailable && "opacity-50 cursor-not-allowed bg-slate-950/80",
                                            isAvailable && "hover:bg-slate-800 cursor-pointer hover:shadow-inner",
                                            isDayToday && "bg-slate-900 ring-1 ring-inset ring-emerald-500/50"
                                        )}
                                    >
                                        <span className={cn(
                                            "text-sm font-bold ml-1 mt-1 w-7 h-7 flex items-center justify-center rounded-full",
                                            isDayToday ? "bg-emerald-500 text-slate-950" : "text-slate-400 group-hover:text-white"
                                        )}>
                                            {format(day, 'd')}
                                        </span>

                                        {isAvailable && (
                                            <div className="self-end mr-1 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <div className="bg-emerald-500/20 text-emerald-400 text-[8px] font-black px-2 py-0.5 rounded-md uppercase border border-emerald-500/30">
                                                    Dispo
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                </div>
            </div>

            {/* BOOKING MODAL */}
            {isBookingModalOpen && selectedDate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <Card className="max-w-4xl w-full bg-slate-900 border-slate-800 p-0 overflow-hidden shadow-2xl relative">
                        <button
                            onClick={() => setIsBookingModalOpen(false)}
                            className="absolute top-4 right-4 p-2 bg-slate-950 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors z-10"
                        >
                            <X size={20} />
                        </button>

                        <div className="grid grid-cols-1 md:grid-cols-12 min-h-[500px]">
                            {/* Modal Sidebar: Recap */}
                            <div className="md:col-span-4 bg-slate-950 p-8 border-r border-slate-800 flex flex-col">
                                <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-6">{t('booking_billing_warning_title')}</h3>

                                <div className="space-y-6 flex-1">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-xl">
                                            {selectedCoach?.avatar}
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase">{t('selected_coach_label')}</p>
                                            <p className="text-white font-bold">{selectedCoach?.name}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center text-emerald-400">
                                            <CalendarIcon size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase">{t('date_format')}</p>
                                            <p className="text-white font-bold capitalize">{format(selectedDate, 'EEEE d MMMM', { locale: currentLocale })}</p>
                                        </div>
                                    </div>

                                    {/* Duration Info (Simplified) */}
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center text-indigo-400">
                                            <Clock size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase">{t('session_duration_label')}</p>
                                            <p className="text-white font-bold capitalize">
                                                {/* Hidden Buffer logic for athlete view */}
                                                {bookingSettings.duration} min
                                            </p>
                                        </div>
                                    </div>

                                    {bookingPhase === 'selection' && (
                                        <div className={cn(
                                            "p-4 rounded-2xl border flex flex-col gap-2 mt-auto",
                                            isBillable ? "bg-amber-500/5 border-amber-500/20" : "bg-emerald-500/5 border-emerald-500/20"
                                        )}>
                                            <div className="flex items-center gap-2">
                                                {isBillable ? <AlertTriangle size={16} className="text-amber-500" /> : <CheckCircle2 size={16} className="text-emerald-500" />}
                                                <span className={cn(
                                                    "text-xs font-black uppercase",
                                                    isBillable ? "text-amber-500" : "text-emerald-500"
                                                )}>
                                                    {isBillable ? "Hors Forfait" : "Inclus"}
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-slate-400 leading-tight">
                                                {isBillable ? t('booking_billing_paid') : t('booking_billing_included')}
                                            </p>
                                            {isBillable && <p className="text-sm font-black text-white">{sessionCost}€</p>}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Modal Content */}
                            <div className="md:col-span-8 p-8 bg-slate-900 relative">
                                {bookingPhase === 'success' ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center animate-in zoom-in duration-300">
                                        <div className="w-20 h-20 bg-emerald-500 rounded-3xl flex items-center justify-center text-slate-950 mb-6 shadow-2xl shadow-emerald-500/20">
                                            <CheckCircle2 size={40} />
                                        </div>
                                        <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">{t('booking_confirmed')}</h2>
                                        <p className="text-slate-400 max-w-xs mx-auto mb-8">
                                            {t('booking_details', {
                                                coach: selectedCoach?.name,
                                                date: format(selectedDate, 'dd/MM'),
                                                time: selectedTime
                                            })}
                                        </p>
                                        <button
                                            onClick={() => setIsBookingModalOpen(false)}
                                            className="px-8 py-3 bg-slate-950 border border-slate-800 hover:bg-slate-800 text-white rounded-xl font-bold uppercase text-xs tracking-widest transition-all"
                                        >
                                            {t('close')}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-8 h-full flex flex-col">
                                        {/* 1. Time Selection */}
                                        <div className="space-y-4">
                                            <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                                <Clock size={14} /> {t('schedule')}
                                            </h4>
                                            <div className="grid grid-cols-4 gap-3">
                                                {timeSlots.map(time => (
                                                    <button
                                                        key={time}
                                                        onClick={() => setSelectedTime(time)}
                                                        className={cn(
                                                            "py-3 rounded-xl border text-sm font-bold transition-all",
                                                            selectedTime === time
                                                                ? "bg-emerald-500 text-slate-950 border-emerald-500 font-black shadow-lg shadow-emerald-500/20"
                                                                : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white"
                                                        )}
                                                    >
                                                        {time}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* 2. Options */}
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                                    <Video size={14} /> {t('session_mode')}
                                                </h4>
                                                <div className="flex gap-2">
                                                    {bookingSettings.modes.includes('video') && (
                                                        <button
                                                            onClick={() => setSessionType('video')}
                                                            className={cn(
                                                                "flex-1 py-3 px-2 rounded-xl border text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-2",
                                                                sessionType === 'video' ? "bg-indigo-500/10 border-indigo-500/50 text-indigo-400" : "bg-slate-950 border-slate-800 text-slate-500"
                                                            )}
                                                        >
                                                            <Video size={14} /> {t('session_video')}
                                                        </button>
                                                    )}
                                                    {bookingSettings.modes.includes('presencial') && (
                                                        <button
                                                            onClick={() => setSessionType('presencial')}
                                                            className={cn(
                                                                "flex-1 py-3 px-2 rounded-xl border text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-2",
                                                                sessionType === 'presencial' ? "bg-amber-500/10 border-amber-500/50 text-amber-400" : "bg-slate-950 border-slate-800 text-slate-500"
                                                            )}
                                                        >
                                                            <MapPin size={14} /> {t('session_presencial')}
                                                        </button>
                                                    )}
                                                    {bookingSettings.modes.length === 0 && (
                                                        <p className="text-xs text-slate-500 italic">No modes available</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* 3. Comment */}
                                        <div className="space-y-4 flex-1">
                                            <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                                <MessageSquare size={14} /> {t('booking_comment_label')}
                                            </h4>
                                            <textarea
                                                value={comment}
                                                onChange={(e) => setComment(e.target.value)}
                                                className="w-full h-full min-h-[100px] bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-emerald-500/50 resize-none"
                                                placeholder="Message pour le coach..."
                                            />
                                        </div>

                                        {/* Action */}
                                        <button
                                            onClick={handleConfirmBooking}
                                            disabled={!selectedTime}
                                            className={cn(
                                                "w-full py-4 rounded-xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-xl transition-all",
                                                !selectedTime ? "opacity-50 cursor-not-allowed bg-slate-800 text-slate-500" :
                                                    isBillable
                                                        ? "bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20"
                                                        : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20"
                                            )}
                                        >
                                            {isBillable ? <CreditCard size={16} /> : <CheckCircle2 size={16} />}
                                            {isBillable ? t('confirm_and_pay') : t('confirm_utilize_credit')}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
